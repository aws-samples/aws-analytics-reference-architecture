// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PreBundledPysparkJobExecutable } from '../common/pre-bundled-pyspark-job-executable';
import { CloudWatchEncryptionMode, GlueVersion, JobBookmarksEncryptionMode, PythonVersion, S3EncryptionMode, SecurityConfiguration, WorkerType } from '@aws-cdk/aws-glue-alpha';
import { PreparedDataset } from './prepared-dataset';
import { Construct } from 'constructs';
import { ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket, Location } from 'aws-cdk-lib/aws-s3';
import { AraBucket } from '../ara-bucket';
import { SynchronousGlueJob } from '../synchronous-glue-job';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Aws, Duration } from 'aws-cdk-lib';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { SingletonKey } from '../singleton-kms-key';


/**
 * The properties for the Bring Your Own Data generator
 */
export interface CustomDatasetProps {
  /**
   * The S3 location of the input data
   */
  readonly s3Location: Location;
  /**
   * The format of the input data
   */
  readonly inputFormat: CustomDatasetInputFormat;
  /**
   * The datetime column to use for data generation as the time reference
   */
  readonly datetimeColumn: string;
  /**
   * The datetime columns to use for data generation
   */
  readonly datetimeColumnsToAdjust: string[];
  /**
   * The interval to partition data and optimize the data generation in Minutes
   */
  readonly partitionRange: Duration;
  /**
   * Approximate data size (in GB) of the custom dataset. 
   * @default - The Glue job responsible for preparing the data uses autoscaling with a maximum of 100 workers
   */
  readonly approximateDataSize?: number;
}

export enum CustomDatasetInputFormat {
  CSV = 'csv',
  PARQUET = 'parquet',
  JSON = 'json',
}

/**
 * A CustomDataset is a dataset that you need to prepare for the [BatchReplayer](@link BatchReplayer) to generate data.
 * The dataset is transformed into a [PreparedDataset](@link PreparedDataset) by a Glue Job that runs synchronously during the CDK deploy.
 * The Glue job is sized based on the approximate size of the input data or uses autoscaling (max 100) if no data size is provided.
 * 
 * The Glue job is applying the following transformations to the input dataset:
 * 1. Read the input dataset based on its format. Currently, it supports data in CSV, JSON and Parquet
 * 2. Group rows into tumbling windows based on the partition range parameter provided. 
 * The partition range should be adapted to the data volume and the total dataset time range
 * 3. Convert dates from MM-dd-yyyy HH:mm:ss.SSS to MM-dd-yyyyTHH:mm:ss.SSSZ format and remove null values
 * 4. Write data into the output bucket partitioned by the tumbling window time. 
 * For example, one partition for every 5 minutes. 
 * 5. Generate a manifest file based on the previous output to be used by the BatchReplayer for generating data
 * 
 * The CloudWatch log group is stored as an object parameter to help check any error with the Glue job.
 * 
 * Usage example:
 * ```typescript
 * import { CustomDataset, CustomDatasetInputFormat } from './data-generator/custom-dataset';
 * 
 * const app = new App();
 * const stack = new Stack(app, 'CustomDatasetStack');
 * 
 * const custom = new CustomDataset(stack, 'CustomDataset', {
 *   s3Location: {
 *     bucketName: 'aws-analytics-reference-architecture',
 *     objectKey: 'datasets/custom',
 *   },
 *   inputFormat: CustomDatasetInputFormat.CSV,
 *   datetimeColumn: 'tpep_pickup_datetime',
 *   datetimeColumnsToAdjust: ['tpep_pickup_datetime'],
 *   partitionRange: Duration.minutes(5),
 *   approximateDataSize: 1,
 * });
 * 
 * new CfnOutput(this, 'LogGroupName', {
 *   exportName: 'logGroupName,
 *   value: custom.glueJobLogGroup,
 * });
 * ```
 * 
 * An example of a custom dataset that can be processed by this construct is available in s3://aws-analytics-reference-architecture/datasets/custom
 */
export class CustomDataset extends Construct {

  /**
   * The prepared dataset generated from the custom dataset
   */
  readonly preparedDataset: PreparedDataset;
  /**
   * The location of the logs to analyze potential errors in the Glue job
   */
  readonly glueJobLogGroup: string;

  /**
   * Constructs a new instance of a CustomDataset construct that extends a PreparedDataset
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {CustomDatasetProps} props the CustomDataset [properties]{@link CustomDatasetProps}
   */
  constructor(scope: Construct, id: string, props: CustomDatasetProps) {
    
    super(scope, id);

    // the source bucket to read data from
    const sourceBucket = Bucket.fromBucketAttributes(scope, 'InputBucket', {
      bucketName: props.s3Location.bucketName,
    })

    // the sink bucket used by the Glue job to write the prepared dataset
    const outputBucket = AraBucket.getOrCreate(scope, {
      bucketName: 'custom-dataset',
      serverAccessLogsPrefix: 'custom-dataset',
    });

    const glueRole = new Role(scope, 'CustomDatasetRole', {
      assumedBy: new ServicePrincipal('glue.amazonaws.com'),
      // add inline policy to encrypt logs
      inlinePolicies: {
        SecurityConfig: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                "logs:AssociateKmsKey"
              ],
              resources: [
                `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws-glue/jobs/*`
              ],
            })
          ]
        })
      }
    });
  
    // grant permissions on the eS3 buckets to the glue job role
    sourceBucket.grantRead(glueRole, props.s3Location.objectKey + '*');
    outputBucket.grantReadWrite(glueRole, props.s3Location.objectKey + '*');

    // the SSM parameter used to stored the output of the Glue job
    const ssm = new StringParameter(this, 'JobOutputParameter', {
      stringValue: 'minDatetime',    
    });
    ssm.grantWrite(glueRole);

    glueRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'));

    // create a KMS key for the Glue security configureation
    const glueKey =  SingletonKey.getOrCreate(scope, 'DefaultKmsKey')
    
    // We add a resource policy so the key can be used in Cloudwatch logs
    glueKey.addToResourcePolicy(new PolicyStatement({
      principals: [
        new ServicePrincipal(`logs.${Aws.REGION}.amazonaws.com`)
      ],
      actions: [
        "kms:Encrypt*",
        "kms:Decrypt*",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:Describe*"
      ],
      resources: ["*"],
      conditions: { ArnLike: { "kms:EncryptionContext:aws:logs:arn": `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:*` } },
    }))

    // the Glue job security configuration following best practices
    const conf = new SecurityConfiguration(this, 'SecurityConfiguration', {
      securityConfigurationName: id,
      cloudWatchEncryption: {
        mode: CloudWatchEncryptionMode.KMS,
        kmsKey: glueKey,
      },
      jobBookmarksEncryption: {
        mode: JobBookmarksEncryptionMode.CLIENT_SIDE_KMS,
        kmsKey: glueKey,
      },
      s3Encryption: {
        mode: S3EncryptionMode.S3_MANAGED,
      }
    });

    // calculate the size of the Glue job based on input data size (1 + 1 DPU per 2GB)
    var workerNum = 9;
    if (props.approximateDataSize !== undefined && props.approximateDataSize > 16){
      workerNum = Math.ceil(props.approximateDataSize / 2) + 1;
    }

    // Glue job to prepare the dataset
    const glueJob = new SynchronousGlueJob(scope, 'CustomDatasetJob', {
      executable: PreBundledPysparkJobExecutable.pythonEtl({
        glueVersion: GlueVersion.V3_0,
        pythonVersion: PythonVersion.THREE,
        codePath: 'data-generator/resources/glue/custom-dataset/script.py',
      }),
      defaultArguments: {
        '--s3_input_path': `s3://${props.s3Location.bucketName}/${props.s3Location.objectKey}`,
        '--s3_output_path': `s3://${outputBucket.bucketName}/${props.s3Location.objectKey}`,
        '--input_format': props.inputFormat,
        '--datetime_column': props.datetimeColumn,
        '--partition_range': props.partitionRange.toMinutes().toString(),
        '--ssm_parameter': ssm.parameterName,
        '--enable-auto-scaling': 'true',
      },
      role: glueRole,
      workerCount: props.approximateDataSize ? workerNum : 100,
      workerType: WorkerType.G_1X,
      continuousLogging:{
        enabled: true,
      },
      securityConfiguration: conf,
    });

    this.glueJobLogGroup = glueJob.glueJobLogStream;

    // Get the offset value calculated in the SynchronousGlueJob
    // We cannot rely on the SSM parameter resource created previously because the offset is generated during deploy time
    const getParameter = new AwsCustomResource(this, 'GetParameter', {
      onCreate: {
        service: 'SSM',
        action: 'getParameter',
        parameters: {
          Name: ssm.parameterName,          
        },
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [ssm.parameterArn],
      })
    });
    // Add a dependency on the synchronous glue job to only get the value after processing
    getParameter.node.addDependency(glueJob);

    // Create a prepared dataset based on the output of the Glue job
    this.preparedDataset = new PreparedDataset({
      location: {
        bucketName: outputBucket.bucketName,
        objectKey: props.s3Location.objectKey,
      },
      offset: getParameter.getResponseField('Parameter.Value'),
      manifestLocation: {
        bucketName: outputBucket.bucketName,
        objectKey: props.s3Location.objectKey+'-manifest.csv',
      },
      dateTimeColumnToFilter: props.datetimeColumn,
      dateTimeColumnsToAdjust: props.datetimeColumnsToAdjust,
    });
  }
}


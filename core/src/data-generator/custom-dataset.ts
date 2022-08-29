// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PreBundledPysparkJobExecutable } from '../common/pre-bundled-pyspark-job-executable';
import { GlueVersion, PythonVersion, WorkerType } from '@aws-cdk/aws-glue-alpha';
import { PreparedDataset } from './prepared-dataset';
import { Construct } from 'constructs';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket, Location } from 'aws-cdk-lib/aws-s3';
import { AraBucket } from '../ara-bucket';
import { SynchronousGlueJob } from '../synchronous-glue-job';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Duration } from 'aws-cdk-lib';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';


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
 * 3. Write data into the output bucket partitioned by the tumbling window time. For example, one partition for every 5 minutes
 * 4. Generate a manifest file based on the previous output to be used by the BatchReplayer for generating data
 */
export class CustomDataset extends Construct {

  /**
   * The prepared dataset generated from the custom dataset
   */
   readonly preparedDataset: PreparedDataset;

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
    });

    const glueRole = new Role(scope, 'CustomDatasetRole', {
      assumedBy: new ServicePrincipal('glue.amazonaws.com'),
    });
    sourceBucket.grantRead(glueRole, props.s3Location.objectKey + '*');
    outputBucket.grantReadWrite(glueRole, props.s3Location.objectKey + '*');

    // the SSM parameter used to stored the output of the Glue job
    const ssm = new StringParameter(this, 'JobOutputParameter', {
      stringValue: 'minDatetime',    
    });
    ssm.grantWrite(glueRole);

    glueRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'));

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
    });

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


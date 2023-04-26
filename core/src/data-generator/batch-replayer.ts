// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Aws, aws_ec2, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { JsonPath, LogLevel, Map, StateMachine, 
         TaskInput, INextable, IChainable } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { PreparedDataset } from './prepared-dataset';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import {
  prepareAuroraTarget,
  prepareDdbTarget,
  prepareRdsTarget,
  prepareRedshiftTarget,
  prepareS3Target,
  IS3Sink,
  DbSink,
  DynamoDbSink,
} from './batch-replayer-helpers';

/**
 * The properties for the BatchReplayer construct
 */
export interface BatchReplayerProps {

  /**
   * The [PreparedDataset]{@link PreparedDataset} used to replay data
   */
  readonly dataset: PreparedDataset;
  /**
   * The frequency of the replay
   * @default - The BatchReplayer is triggered every 60 seconds
   */
  readonly frequency?: Duration;
  /**
   * Parameters to write to S3 target
   */
  readonly s3Props?: IS3Sink;
  /**
   * Parameters to write to DynamoDB target
   */
  readonly ddbProps?: DynamoDbSink;
  /**
   * Parameters to write to Redshift target
   */
  readonly redshiftProps?: DbSink;
  /**
   * Parameters to write to Aurora target
   */
  readonly auroraProps?: DbSink;
  /**
   * Parameters to write to RDS target
   */
  readonly rdsProps?: DbSink;
  /**
   * Security group for the WriteInBatch Lambda function
   */
  readonly secGroup?: ISecurityGroup;
  /**
   * VPC for the WriteInBatch Lambda function
   */
  readonly vpc?: IVpc;
  /**
   * Additional StupFunction Tasks to run sequentially after the BatchReplayer finishes
   * @default - The BatchReplayer do not have additional Tasks
   * 
   * The expected input for the first Task in this sequence is:
   * 
   * input = [
   *  {
   *    "processedRecords": Int,
   *    "outputPaths": String [],
   *    "startTimeinIso": String,
   *    "endTimeinIso": String
   *  }
   * ]
   * 
   * Each element in input represents the output of each lambda iterator that replays the data.
   * 
   * param: processedRecods -> Number of records processed
   * param: ouputPaths -> List of files created in S3 
   *  **  eg. "s3://<sinkBucket name>/<s3ObjectKeySink prefix, if any>/<dataset name>/ingestion_start=<timestamp>/ingestion_end=<timestamp>/<s3 filename>.csv",

   * param: startTimeinIso -> Start Timestamp on original dataset
   * param: endTimeinIso -> End Timestamp on original dataset
   * 
   * *outputPaths* can be used to extract and aggregate new partitions on data and 
   * trigger additional Tasks.
   */
  readonly additionalStepFunctionTasks?: IChainable [];
}

/**
 * Replay the data in the given PartitionedDataset.
 *
 * It will dump files into the target based on the given `frequency`.
 * The computation is in a Step Function with two Lambda steps.
 *
 * 1. resources/lambdas/find-file-paths
 * Read the manifest file and output a list of S3 file paths within that batch time range
 *
 * 2. resources/lambdas/write-in-batch
 * Take a file path, filter only records within given time range, adjust the time with offset to
 * make it looks like just being generated. Then write the output to the target
 *
 * Usage example:
 * ```typescript
 *
 * const myBucket = new Bucket(stack, "MyBucket")
 *
 * let myProps: IS3Sink = {
 *  sinkBucket: myBucket,
 *  sinkObjectKey: 'some-prefix',
 *  outputFileMaxSizeInBytes: 10000000,
 * }
 *
 * new BatchReplayer(stack, "WebSalesReplayer", {
 *   dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
 *   s3Props: myProps,
 *   frequency: 120,
 * });
 * ```
 *
 * :warning: **If the Bucket is encrypted with KMS, the Key must be managed by this stack.
 */
export class BatchReplayer extends Construct {

  /**
   * Dataset used for replay
   */
  public readonly dataset: PreparedDataset;

  /**
   * Frequency (in Seconds) of the replaying. The batch job will start
   * for every given frequency and replay the data in that period
   */
  public readonly frequency: number;
  /**
   * Parameters to write to S3 target
   */
  public readonly s3Props?: IS3Sink;
  /**
   * Parameters to write to DynamoDB target
   */
  public readonly ddbProps?: DynamoDbSink;
  /**
   * Parameters to write to Redshift target
   */
  public readonly redshiftProps?: DbSink;
  /**
   * Parameters to write to Aurora target
   */
  public readonly auroraProps?: DbSink;
  /**
   * Parameters to write to RDS target
   */
  public readonly rdsProps?: DbSink;
  /**
   * Security group for the WriteInBatch Lambda function
   */
  public readonly secGroup?: ISecurityGroup;
  /**
   * VPC for the WriteInBatch Lambda function
   */
  public readonly vpc?: IVpc;

  /**
   * Optional Sequence of additional Tasks to append at the end of the Step Function
   * that replays data that will execute after data has been replayed
   */
  public readonly additionalStepFunctionTasks?: IChainable [];


  /**
   * Constructs a new instance of the BatchReplayer construct
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {BatchReplayerProps} props the BatchReplayer [properties]{@link BatchReplayerProps}
   */
  constructor(scope: Construct, id: string, props: BatchReplayerProps) {
    super(scope, id);

    this.dataset = props.dataset;
    this.frequency = props.frequency?.toSeconds() || 60;
    this.additionalStepFunctionTasks = props.additionalStepFunctionTasks;

    // Properties for S3 target
    if (props.s3Props) {
      this.s3Props = props.s3Props;
      if (!this.s3Props.outputFileMaxSizeInBytes) {
        this.s3Props.outputFileMaxSizeInBytes = 100 * 1024 * 1024; //Default to 100 MB
      }
    }
    const manifestBucketName = this.dataset.manifestLocation.bucketName;
    const manifestObjectKey = this.dataset.manifestLocation.objectKey;
    const dataBucketName = this.dataset.location.bucketName;
    const dataObjectKey = this.dataset.location.objectKey;

    // Properties for DynamoDB target
    this.ddbProps = props.ddbProps ? props.ddbProps : undefined;
    // Properties for Redshift target
    this.redshiftProps = (props.redshiftProps && props.secGroup && props.vpc) ? props.redshiftProps : undefined;
    // Properties for Aurora target
    this.auroraProps = (props.auroraProps && props.secGroup && props.vpc) ? props.auroraProps : undefined;
    // Properties for RDS target
    this.rdsProps = (props.rdsProps && props.secGroup && props.vpc) ? props.rdsProps : undefined;

    const dataWranglerLayer = LayerVersion.fromLayerVersionArn(this, 'PandasLayer', `arn:aws:lambda:${Aws.REGION}:336392948345:layer:AWSDataWrangler-Python39:1`);

    const findFilePathsFnPolicy = [
      new PolicyStatement({
        actions: [
          's3:GetObject',
          's3:ListBucket',
        ],
        resources: [
          `arn:aws:s3:::${dataBucketName}/${dataObjectKey}/*`,
          `arn:aws:s3:::${dataBucketName}/${dataObjectKey}-manifest.csv`,
          `arn:aws:s3:::${dataBucketName}`,
        ],
      }),
    ];

    /**
     * Find all paths within the time range from the manifest file
     */
    const findFilePathsFn = new PreBundledFunction(this, 'FindFilePath', {
      memorySize: 1024,
      codePath: 'data-generator/resources/lambdas/find-file-paths',
      runtime: Runtime.PYTHON_3_9,
      handler: 'find-file-paths.handler',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.minutes(15),
      layers: [dataWranglerLayer],
      lambdaPolicyStatements: findFilePathsFnPolicy,
    });

    const findFilePathsFnTask = new LambdaInvoke(this, 'FindFilePathFnTask', {
      lambdaFunction: findFilePathsFn,
      payload: TaskInput.fromObject({
        frequency: this.frequency,
        manifestFileBucket: manifestBucketName,
        manifestFileKey: manifestObjectKey,
        triggerTime: JsonPath.stringAt('$$.Execution.Input.time'),
        offset: this.dataset.offset,
      }),
      // Retry on 500 error on invocation with an interval of 2 sec with back-off rate 2, for 6 times
      retryOnServiceExceptions: true,
      outputPath: '$.Payload',
    });

    const writeInBatchFnPolicy = [];

    let taskInputObj = {
      // Array from the last step to be mapped
      outputFileIndex: JsonPath.stringAt('$.index'),
      filePath: JsonPath.stringAt('$.filePath'),

      // For calculating the start/end time
      frequency: this.frequency,
      triggerTime: JsonPath.stringAt('$$.Execution.Input.time'),
      offset: this.dataset.offset,

      // For file processing
      dateTimeColumnToFilter: this.dataset.dateTimeColumnToFilter,
      dateTimeColumnsToAdjust: this.dataset.dateTimeColumnsToAdjust,
    };

    // S3 target is selected
    if (this.s3Props) {
      // Used to force S3 bucket auto cleaning after deletion of this
      this.node.addDependency(this.s3Props.sinkBucket);

      this.s3Props.sinkObjectKey = this.s3Props.sinkObjectKey ?
        `${this.s3Props.sinkObjectKey}/${this.dataset.tableName}` : this.dataset.tableName;

      const { policy, taskInputParams } = prepareS3Target(this.s3Props, dataBucketName, dataObjectKey);
      writeInBatchFnPolicy.push(policy);
      taskInputObj = Object.assign(taskInputObj, taskInputParams);
    }

    // DynamoDB target is selected
    if (this.ddbProps) {
      const { policy, taskInputParams } = prepareDdbTarget(this.ddbProps);
      writeInBatchFnPolicy.push(policy);
      taskInputObj = Object.assign(taskInputObj, taskInputParams);
    }

    /**
     * Redshift, Aurora and RDS databases require the Lambda to have VPC access.
     */
    if (this.secGroup && this.vpc) {

      // Lambda requires these actions to have access to all resources in order to connect to a VPC
      writeInBatchFnPolicy.push(
        new PolicyStatement({
          actions: [
            'ec2:CreateNetworkInterface',
            'ec2:DescribeNetworkInterfaces',
            'ec2:DeleteNetworkInterface',
          ],
          resources: ['*'],
        }),
      );

      // Redshift target is selected
      if (this.redshiftProps) {
        const { policy, taskInputParams } = prepareRedshiftTarget(this.redshiftProps);
        writeInBatchFnPolicy.push(policy);
        taskInputObj = Object.assign(taskInputObj, taskInputParams);
      }
      // Aurora target is selected
      if (this.auroraProps) {
        const { policy, taskInputParams } = prepareAuroraTarget(this.auroraProps);
        writeInBatchFnPolicy.push(policy);
        taskInputObj = Object.assign(taskInputObj, taskInputParams);
      }
      // RDS target is selected
      if (this.rdsProps) {
        const { policy, taskInputParams } = prepareRdsTarget(this.rdsProps);
        writeInBatchFnPolicy.push(policy);
        taskInputObj = Object.assign(taskInputObj, taskInputParams);
      }
    }

    /**
     * Rewrite data
     */
    const writeInBatchFn = new PreBundledFunction(this, 'WriteInBatch', {
      memorySize: 3008,
      codePath: 'data-generator/resources/lambdas/write-in-batch',
      runtime: Runtime.PYTHON_3_9,
      handler: 'write-in-batch.handler',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.minutes(15),
      layers: [dataWranglerLayer],
      lambdaPolicyStatements: writeInBatchFnPolicy,
      vpc: this.vpc ? this.vpc : undefined,
      vpcSubnets: this.vpc ? this.vpc.selectSubnets({
        subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
      }) : undefined,
      securityGroups: this.secGroup ? [this.secGroup] : undefined,
    });

    if (this.s3Props) {
      // grant permissions to write to the bucket and to use the KMS key
      this.s3Props.sinkBucket.grantWrite(writeInBatchFn, `${this.s3Props.sinkObjectKey}/*`);
    }

    const writeInBatchFnTask = new LambdaInvoke(this, 'WriteInBatchFnTask', {
      lambdaFunction: writeInBatchFn,
      payload: TaskInput.fromObject(taskInputObj),
      // Retry on 500 error on invocation with an interval of 2 sec with back-off rate 2, for 6 times
      retryOnServiceExceptions: true,
      outputPath: '$.Payload',
    });

    // Use "Map" step to write each filePath parallelly
    const writeInBatchMapTask = new Map(this, 'WriteInBatchMapTask', {
      itemsPath: JsonPath.stringAt('$.filePaths'),
      parameters: {
        index: JsonPath.stringAt('$$.Map.Item.Index'),
        filePath: JsonPath.stringAt('$$.Map.Item.Value'),
      },
    });
    writeInBatchMapTask.iterator(writeInBatchFnTask);

    // Overarching Step Function StateMachine
    const batchReplayStepFn = new StateMachine(this, 'BatchReplayStepFn', {
      definition: this.chainStepFunctionTasks(
          findFilePathsFnTask.next(writeInBatchMapTask)
        ),
      timeout: Duration.minutes(20),
      logs: {
        destination: new LogGroup(this, 'LogGroup', {
          retention: RetentionDays.ONE_WEEK,
          logGroupName: `/aws/batch-replayer/${this.dataset.tableName}`,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        level: LogLevel.ALL,
      },
    });

    new Rule(this, 'BatchReplayStepFnTrigger', {
      schedule: Schedule.cron({ minute: `0/${Math.ceil(this.frequency / 60)}` }),
      targets: [new SfnStateMachine(batchReplayStepFn, {})],
    });
  }

  private chainStepFunctionTasks(requiredTasks: IChainable & INextable) {
  
    let base = requiredTasks;

    if (this.additionalStepFunctionTasks) {
    
      this.additionalStepFunctionTasks.forEach(newTask => {
        base = base.next(newTask)
      });
    }
    return base;
  }

}

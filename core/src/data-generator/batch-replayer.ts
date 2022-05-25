// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Aws, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { JsonPath, LogLevel, Map, StateMachine, TaskInput } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { PreparedDataset } from '../datasets/prepared-dataset';

/**
 * The properties for the BatchReplayer construct
 */
export interface BatchReplayerProps {

  /**
   * The [PreparedDataset]{@link PreparedDataset} used to replay data
   */
  readonly dataset: PreparedDataset;
  /**
   * The frequency of the replay in seconds
   * @default - The BatchReplayer is triggered every 60 seconds
   */
  readonly frequency?: number;
  /**
   * The S3 Bucket sink where the BatchReplayer writes data.
   * :warnning: **If the Bucket is encrypted with KMS, the Key must be managed by this stack.
   */
  readonly sinkBucket: Bucket;
  /**
   * The S3 object key sink where the BatchReplayer writes data.
   * @default - No object key is used and the BatchReplayer writes the dataset in s3://<BUCKET_NAME>/<TABLE_NAME>
   */
  readonly sinkObjectKey?: string;
  /**
   * The maximum file size in Bytes written by the BatchReplayer
   * @default - The BatchReplayer writes 100MB files maximum
   */
  readonly outputFileMaxSizeInBytes?: number;
}

/**
 * Replay the data in the given PartitionedDataset.
 *
 * It will dump files into the `sinkBucket` based on the given `frequency`.
 * The computation is in a Step Function with two Lambda steps.
 *
 * 1. resources/lambdas/find-file-paths
 * Read the manifest file and output a list of S3 file paths within that batch time range
 *
 * 2. resources/lambdas/write-in-batch
 * Take a file path, filter only records within given time range, adjust the the time with offset to
 * make it looks like just being generated. Then write the output to the `sinkBucket`
 *
 * Usage example:
 * ```typescript
 *
 * const myBucket = new Bucket(stack, "MyBucket")
 *
 * new BatchReplayer(stack, "WebSalesReplayer", {
 *   dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
 *   s3BucketSink: myBucket
 *   s3ObjectKeySink: 'some-prefix',
 *   frequency: 120,
 *   outputFileMaxSizeInBytes: 10000000,
 * });
 * ```
 *
 * :warnning: **If the Bucket is encrypted with KMS, the Key must be managed by this stack.
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
   * Sink bucket where the batch replayer will put data in
   */
  public readonly sinkBucket: Bucket;

  /**
   * Sink object key where the batch replayer will put data in
   */
  public readonly sinkObjectKey?: string;

  /**
   * Maximum file size for each output file. If the output batch file is,
   * larger than that, it will be splitted into multiple files that fit this size.
   *
   * Default to 100MB (max value)
   */
  public readonly outputFileMaxSizeInBytes?: number;

  /**
   * Constructs a new instance of the BatchReplayer construct
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {BatchReplayerProps} props the BatchReplayer [properties]{@link BatchReplayerProps}
   */
  constructor(scope: Construct, id: string, props: BatchReplayerProps) {
    super(scope, id);

    this.dataset = props.dataset;
    this.frequency = props.frequency || 60;
    this.sinkBucket = props.sinkBucket;
    this.sinkObjectKey = props.sinkObjectKey;
    this.outputFileMaxSizeInBytes = props.outputFileMaxSizeInBytes || 100 * 1024 * 1024; //Default to 100 MB

    const dataWranglerLayer = LayerVersion.fromLayerVersionArn(this, 'PandasLayer', `arn:aws:lambda:${Aws.REGION}:336392948345:layer:AWSDataWrangler-Python39:1`);

    const manifestBucketName = this.dataset.manifestLocation.bucketName;
    const manifestObjectKey = this.dataset.manifestLocation.objectKey;
    const dataBucketName = this.dataset.location.bucketName;
    const dataObjectKey = this.dataset.location.objectKey;

    const findFilePathsFnPolicy = [
      new PolicyStatement({
        actions: [
          's3:GetObject',
          's3:ListBucket',
        ],
        resources: [
          `arn:aws:s3:::${dataBucketName}/${dataObjectKey}/*`,
          `arn:aws:s3:::${dataBucketName}`,
        ],
      }),
    ];

    /**
     * Find all paths within the time range from the manifest file
     */
    const findFilePathsFn = new PreBundledFunction(this, 'FindFilePath', {
      name: 'FindFilePathsFn',
      memorySize: 1024,
      codePath: 'data-generator/resources/lambdas/find-file-paths',
      runtime: Runtime.PYTHON_3_9,
      handler: 'find-file-paths.handler',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.minutes(15),
      lambdaLayers: [dataWranglerLayer],
      lambdaPolicyStatements: findFilePathsFnPolicy,
    });

    const findFilePathsFnTask = new LambdaInvoke(this, 'FindFilePathFnTask', {
      lambdaFunction: findFilePathsFn,
      payload: TaskInput.fromObject({
        frequency: this.frequency,
        manifestFileBucket: manifestBucketName,
        manifestFileKey: manifestObjectKey,
        triggerTime: JsonPath.stringAt('$$.Execution.Input.time'),
        offset: '' + this.dataset.offset,
      }),
      // Retry on 500 error on invocation with an interval of 2 sec with back-off rate 2, for 6 times
      retryOnServiceExceptions: true,
      outputPath: '$.Payload',
    });

    const writeInBatchFnPolicy = [
      new PolicyStatement({
        actions: [
          's3:GetObject',
          's3:ListBucket',
        ],
        resources: [
          `arn:aws:s3:::${dataBucketName}/${dataObjectKey}/*`,
          `arn:aws:s3:::${dataBucketName}`,
        ],
      }),
    ];

    /**
     * Rewrite data
     */
    const writeInBatchFn = new PreBundledFunction(this, 'WriteInBatch', {
      name: 'WriteInBatchFn',
      memorySize: 1024 * 5,
      codePath: 'data-generator/resources/lambdas/write-in-batch',
      runtime: Runtime.PYTHON_3_9,
      handler: 'write-in-batch.handler',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.minutes(15),
      lambdaLayers: [dataWranglerLayer],
      lambdaPolicyStatements: writeInBatchFnPolicy,
    });

    // grant permissions to write to the bucket and to use the KMS key
    const putPattern = this.sinkObjectKey ? `${this.sinkObjectKey}/*` : undefined;
    this.sinkBucket.grantWrite(writeInBatchFn, putPattern);

    const sinkPath = this.sinkObjectKey ? `${this.sinkObjectKey}/${this.dataset.tableName}` : this.dataset.tableName;
    const writeInBatchFnTask = new LambdaInvoke(this, 'WriteInBatchFnTask', {
      lambdaFunction: writeInBatchFn,
      payload: TaskInput.fromObject({
        // Array from the last step to be mapped
        outputFileIndex: JsonPath.stringAt('$.index'),
        filePath: JsonPath.stringAt('$.filePath'),

        // For calculating the start/end time
        frequency: this.frequency,
        triggerTime: JsonPath.stringAt('$$.Execution.Input.time'),
        offset: '' + this.dataset.offset,

        // For file processing
        dateTimeColumnToFilter: this.dataset.dateTimeColumnToFilter,
        dateTimeColumnsToAdjust: this.dataset.dateTimeColumnsToAdjust,
        sinkPath: this.sinkBucket.s3UrlForObject(sinkPath),
        outputFileMaxSizeInBytes: 20480,
      }),
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
      definition: findFilePathsFnTask.next(writeInBatchMapTask),
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
      schedule: Schedule.cron({ minute: `0/${Math.ceil(this.frequency/60)}` }),
      targets: [new SfnStateMachine(batchReplayStepFn, {})],
    });
  }

}

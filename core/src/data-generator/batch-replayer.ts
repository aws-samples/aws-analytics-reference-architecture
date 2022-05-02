// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// import * as lambda from "@aws-cdk/aws-lambda";
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { SfnStateMachine } from '@aws-cdk/aws-events-targets';
import { PolicyStatement } from '@aws-cdk/aws-iam';
// import path = require("path");
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Bucket, Location } from '@aws-cdk/aws-s3';
import { JsonPath, Map, StateMachine, TaskInput } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { Aws, Construct, Duration } from '@aws-cdk/core';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { PreparedDataset } from '../datasets/prepared-dataset';

export interface BatchReplayerProps {
  readonly dataset: PreparedDataset;
  readonly frequency?: number;
  readonly s3LocationSink: Location;
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
  public readonly s3LocationSink: Location;
  
  /**
   * Maximum file size for each output file. If the output batch file is,
   * larger than that, it will be splitted into multiple files that fit this size.
   *
   * Default to 100MB (max value)
   */
  public readonly outputFileMaxSizeInBytes?: number;
  
  constructor(scope: Construct, id: string, props: BatchReplayerProps) {
    super(scope, id);
    
    this.dataset = props.dataset;
    this.frequency = props.frequency || 60;
    this.s3LocationSink = props.s3LocationSink;
    this.outputFileMaxSizeInBytes = props.outputFileMaxSizeInBytes || 100 * 1024 * 1024; //Default to 100 MB

    const dataWranglerLayer = LayerVersion.fromLayerVersionArn(this, 'PandasLayer', `arn:aws:lambda:${Aws.REGION}:336392948345:layer:AWSDataWrangler-Python38:6`);

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
      name: 'findFilePathsFn',
      memorySize: 1024,
      codePath: 'data-generator/resources/lambdas/find-file-paths',
      runtime: Runtime.PYTHON_3_8,
      handler: 'find-file-paths.handler',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.minutes(15),
      lambdaLayers: [dataWranglerLayer],
      lambdaPolicyStatements: findFilePathsFnPolicy,
    });
    
    const findFilePathsFnTask = new LambdaInvoke(this, 'findFilePathFnTask', {
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
      name: 'writeInBatchFn',
      memorySize: 1024 * 5,
      codePath: 'data-generator/resources/lambdas/write-in-batch',
      runtime: Runtime.PYTHON_3_8,
      handler: 'write-in-batch.handler',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.minutes(15),
      lambdaLayers: [dataWranglerLayer],
      lambdaPolicyStatements: writeInBatchFnPolicy,
    });

    const sinkBucket = Bucket.fromBucketName(this, 'SinkBucket', props.s3LocationSink.bucketName);
    sinkBucket.grantPut(writeInBatchFn);
    
    const writeInBatchFnTask = new LambdaInvoke(this, 'writeInBatchFnTask', {
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
        sinkPath: sinkBucket.s3UrlForObject(`${this.dataset.tableName}`),
        outputFileMaxSizeInBytes: 20480,
      }),
      // Retry on 500 error on invocation with an interval of 2 sec with back-off rate 2, for 6 times
      retryOnServiceExceptions: true,
      outputPath: '$.Payload',
    });
    
    // Use "Map" step to write each filePath parallelly
    const writeInBatchMapTask = new Map(this, 'writeInBatchMapTask', {
      itemsPath: JsonPath.stringAt('$.filePaths'),
      parameters: {
        index: JsonPath.stringAt('$$.Map.Item.Index'),
        filePath: JsonPath.stringAt('$$.Map.Item.Value'),
      },
    });
    writeInBatchMapTask.iterator(writeInBatchFnTask);
    
    // Overarching Step Function StateMachine
    const batchReplayStepFn = new StateMachine(this, 'batchReplayStepFn', {
      definition: findFilePathsFnTask.next(writeInBatchMapTask),
      timeout: Duration.minutes(20),
    });
    
    new Rule(this, 'batchReplayStepFnTrigger', {
      schedule: Schedule.cron({ minute: `0/${Math.ceil(this.frequency/60)}` }),
      targets: [new SfnStateMachine(batchReplayStepFn, {})],
    });
  }
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct, Duration } from "@aws-cdk/core";
import { RetentionDays } from "@aws-cdk/aws-logs";
import { LambdaInvoke } from "@aws-cdk/aws-stepfunctions-tasks";
import { JsonPath, Map, StateMachine, TaskInput } from "@aws-cdk/aws-stepfunctions";
import * as lambda from "@aws-cdk/aws-lambda";
import { SfnStateMachine } from "@aws-cdk/aws-events-targets";
import { Rule, Schedule } from "@aws-cdk/aws-events";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import path = require("path");
import { Bucket } from "@aws-cdk/aws-s3";
import { PartitionedDataset } from "../datasets/partitioned-dataset";

export interface BatchReplayerProps {
  readonly dataset: PartitionedDataset;
  readonly frequency?: number;
  readonly sinkBucket: Bucket;
}

export class BatchReplayer extends Construct {

  /**
   * Dataset used for replay
   */
  public readonly dataset: PartitionedDataset;

  /**
   * Frequency (in Seconds) of the replaying. The batch job will start
   * for every given frequency and replay the data in that period
   */
  public readonly frequency: number;

  /**
   * Sink bucket where the batch replayer will put data in
   */
  public readonly sinkBucket: Bucket;

  constructor(scope: Construct, id: string, props: BatchReplayerProps) {
    super(scope, id);

    this.dataset = props.dataset;
    this.frequency = props.frequency || 60;
    this.sinkBucket = props.sinkBucket;
    

    /**
     * Find all paths within the time range from the manifest file
     */
    const findFilePathsFn = new lambda.DockerImageFunction(this, "findFilePathFn", {
      memorySize: 1024,
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../lib/data-generator/resources/lambdas/find-file-paths')),
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.minutes(15),
    });

    // Grant access to read S3
    const { bucketName, objectKey } = this.dataset.manifestLocation;
    findFilePathsFn.role?.attachInlinePolicy(
      new Policy(this, 'read-manifest-file-policy', {
        statements: [
          new PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [
              `arn:aws:s3:::${bucketName}/${objectKey}`
            ],
          }),
        ],
      }),
    );

    const findFilePathsFnTask = new LambdaInvoke(this, "findFilePathFnTask", {
      lambdaFunction: findFilePathsFn,
      payload: TaskInput.fromObject({
        frequency: props.frequency,
        manifestFileBucket: this.dataset.manifestLocation?.bucketName,
        manifestFileKey: this.dataset.manifestLocation?.objectKey,
        triggerTime: JsonPath.stringAt('$$.Execution.Input.time'),
        offset: '' + this.dataset.offset,
      }),
      // Retry on 500 error on invocation with an interval of 2 sec with back-off rate 2, for 6 times
      retryOnServiceExceptions: true,
      outputPath: "$.Payload",
    });


    /**
     * Write data in batch step
     */
    const writeInBatchFn = new lambda.DockerImageFunction(this, "writeInBatchFn", {
      memorySize: 1024 * 5,
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../lib/data-generator/resources/lambdas/write-in-batch')),
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.minutes(15),
    });

    // Grant access to all s3 file in the dataset bucket
    writeInBatchFn.role?.attachInlinePolicy(
      new Policy(this, 'read-dataset-buckets-policy', {
        statements: [
          new PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [
              `arn:aws:s3:::${this.dataset.location.bucketName}*`
            ],
          }),
        ],
      }),
    );
    this.sinkBucket.grantPut(writeInBatchFn);

    const writeInBatchFnTask = new LambdaInvoke(this, "writeInBatchFnTask", {
      lambdaFunction: writeInBatchFn,
      payload: TaskInput.fromObject({
        // Array from the last step to be mapped
        outputFileIndex: JsonPath.stringAt('$.index'),
        filePath: JsonPath.stringAt('$.filePath'),
        
        // For calculating the start/end time
        frequency: props.frequency,
        triggerTime: JsonPath.stringAt('$$.Execution.Input.time'),
        offset: '' + this.dataset.offset,
        
        // For file processing
        dateTimeColumnToFilter: this.dataset.dateTimeColumnToFilter,
        dateTimeColumnsToAdjust: this.dataset.dateTimeColumnsToAdjust,
        sinkPath: this.sinkBucket.s3UrlForObject(`${this.dataset.tableName}`),
      }),
      // Retry on 500 error on invocation with an interval of 2 sec with back-off rate 2, for 6 times
      retryOnServiceExceptions: true,
      outputPath: "$.Payload",
    });

    /**
     * Use "Map" step to write each filePath parallelly
     */
    const writeInBatchMapTask = new Map(this, "writeInBatchMapTask", {
      itemsPath: JsonPath.stringAt('$.filePaths'),
      parameters: {
        index: JsonPath.stringAt('$$.Map.Item.Index'),
        filePath: JsonPath.stringAt('$$.Map.Item.Value'),
      }
    });
    writeInBatchMapTask.iterator(writeInBatchFnTask);

    /**
     * Overarching Step Function StateMachine
     */
    const batchReplayStepFn = new StateMachine(this, "batchReplayStepFn", {
      definition: findFilePathsFnTask.next(writeInBatchMapTask),
      timeout: Duration.minutes(20),
    });

    new Rule(this, 'batchReplayStepFnTrigger', {
      schedule: Schedule.cron({ minute: `0/${Math.ceil(this.frequency/60)}` }),
      targets: [new SfnStateMachine(batchReplayStepFn, {})],
    });
  }

}

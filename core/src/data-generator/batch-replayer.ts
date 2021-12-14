// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct, Duration } from "@aws-cdk/core";
import { RetentionDays } from "@aws-cdk/aws-logs";
import { LambdaInvoke } from "@aws-cdk/aws-stepfunctions-tasks";
import { JsonPath, StateMachine, TaskInput } from "@aws-cdk/aws-stepfunctions";
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
    

    // Aggregate all data in the given frequency, prepend header, and write to S3
    const batchReplayFn = new lambda.DockerImageFunction(this, "batchReplayFnV2", {
      memorySize: 1024 * 5,
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../lib/data-generator/resources/lambdas/batch-replayer')),
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.minutes(15),
    });

    // Grant access to read S3
    batchReplayFn.role?.attachInlinePolicy(
      new Policy(this, 'list-buckets-policy', {
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

    this.sinkBucket.grantPut(batchReplayFn);

    const batchReplayFnTask = new LambdaInvoke(this, "batchReplayFnTask", {
      lambdaFunction: batchReplayFn,
      payload: TaskInput.fromObject({
        frequency: props.frequency,
        manifestFileBucket: this.dataset.manifestLocation?.bucketName,
        manifestFileKey: this.dataset.manifestLocation?.objectKey,
        triggerTime: JsonPath.stringAt('$.time'),
        offset: '' + this.dataset.offset,
        dateTimeColumnsToAdjust: this.dataset.dateTimeColumnsToAdjust,
        sinkPath: this.sinkBucket.s3UrlForObject(`data_generator/${this.dataset.tableName}`),
      }),
      // Retry on 500 error on invocation with an interval of 2 sec with back-off rate 2, for 6 times
      retryOnServiceExceptions: true,
      outputPath: "$.Payload",
    });

    const batchReplayStepFn = new StateMachine(this, "batchReplayStepFn", {
      definition: batchReplayFnTask,
      timeout: Duration.minutes(20),
    });

    new Rule(this, 'batchReplayStepFnTrigger', {
      schedule: Schedule.cron({ minute: `0/${Math.ceil(this.frequency/60)}` }),
      targets: [new SfnStateMachine(batchReplayStepFn, {})],
    });
  }

}

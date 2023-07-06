// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests BatchReplayer
 *
 * @group unit/best-practice/batch-replayer
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { App, Aspects, Duration, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { BatchReplayer, PreparedDataset } from '../../../src';
import { S3Sink } from '../../../lib';

const mockApp = new App();

const batchReplayerStack = new Stack(mockApp, 'BatchReplayer');
const sinkBucket = new Bucket(batchReplayerStack, 'SinkBucket');
// Instantiate a DataGenerator
const s3Props: S3Sink = { sinkBucket: sinkBucket, sinkObjectKey: 'test' };
const batchReplayer = new BatchReplayer(batchReplayerStack, 'TestBatchReplayer', {
  dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  frequency: Duration.seconds(120),
  s3Props: s3Props,
});

Aspects.of(batchReplayer).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LambdaExecutionRolePolicyTestBatchReplayerFindFilePath/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The IAM policy needs access to all objects in the source dataset' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LogRetentionLambdaExecutionRolePolicyTestBatchReplayerFindFilePath/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The Lambda execution role for log retention needs * access' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LogRetentionLambdaExecutionRoleTestBatchReplayerFindFilePath/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The Lambda execution role for log retention needs * access' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LambdaExecutionRolePolicyTestBatchReplayerWriteInBatch/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The IAM policy needs access to all objects in the sink location' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LambdaExecutionRoleTestBatchReplayerWriteInBatch/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The IAM policy needs access to all objects in the sink location' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LogRetentionLambdaExecutionRolePolicyTestBatchReplayerWriteInBatch/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The Lambda execution role for log retention needs * access' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/BatchReplayStepFn/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function doesn\'t need X-ray' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/FindFilePath/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/WriteInBatch/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/BatchReplayStepFn/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The Step Function default policy is using *' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(batchReplayerStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(batchReplayerStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests BatchReplayer
 *
 * @group unit/best-practice/batch-replayer
 */

import { Annotations, Match } from '@aws-cdk/assertions';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { BatchReplayer, PreparedDataset } from '../../../src';

const mockApp = new App();

const batchReplayerStack = new Stack(mockApp, 'BatchReplayer');
const sinkBucket = new Bucket(batchReplayerStack, 'SinkBucket');
// Instantiate a DataGenerator
const batchReplayer = new BatchReplayer(batchReplayerStack, 'TestBatchReplayer', {
  dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  frequency: 120,
  sinkBucket: sinkBucket ,
  sinkObjectKey: 'test',
});

Aspects.of(batchReplayer).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LambdaExecutionRolePolicyFindFilePathsFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The IAM policy needs access to all objects in the source dataset' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LogRetentionLambdaExecutionRolePolicyFindFilePathsFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The Lambda execution role for log retention needs * access' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LogRetentionLambdaExecutionRoleFindFilePathsFn/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The Lambda execution role for log retention needs * access' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LambdaExecutionRolePolicyWriteInBatchFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The IAM policy needs access to all objects in the sink location' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LambdaExecutionRoleWriteInBatchFn/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The IAM policy needs access to all objects in the sink location' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/LogRetentionLambdaExecutionRolePolicyWriteInBatchFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The Lambda execution role for log retention needs * access' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  batchReplayerStack,
  'BatchReplayer/TestBatchReplayer/BatchReplayStepFn/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function doesn\'t need X-ray' }],
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

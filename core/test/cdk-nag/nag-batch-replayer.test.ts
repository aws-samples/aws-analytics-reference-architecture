// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests BatchReplayer
*
* @group best-practice/batch-replayer
*/

import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { BatchReplayer } from '../../src';
import { PreparedDataset } from '../../src';

const mockApp = new App();

const batchReplayerStack = new Stack(mockApp, 'BatchReplayer');
// Instantiate a DataGenerator
const batchReplayer = new BatchReplayer(batchReplayerStack, "TestBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  frequency: 120,
  s3LocationSink: {
    bucketName: 'test',
    objectKey: 'test',
  },
});

Aspects.of(batchReplayer).add(new AwsSolutionsChecks());

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

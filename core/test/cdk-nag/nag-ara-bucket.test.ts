// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests AraBucket
*
* @group best-practice/ara-bucket
*/


import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { AraBucket } from '../../src/common/ara-bucket';

const mockApp = new App();

const araBucketStack = new Stack(mockApp, 'AraBucket');

// Instantiate DataLakeStorage Construct with custom Props
new AraBucket(araBucketStack, {
  bucketName: 'test',
  serverAccessLogsPrefix: 'test',
});

Aspects.of(araBucketStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  araBucketStack,
  'AraBucket/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'The S3 bucket used for access logs can\'t have access log enabled' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(araBucketStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(araBucketStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});

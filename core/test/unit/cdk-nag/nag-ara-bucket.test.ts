// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests AraBucket
 *
 * @group unit/best-practice/ara-bucket
 */


import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Aspects, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { AraBucket } from '../../../src/ara-bucket';

const mockApp = new App();

const araBucketStack = new Stack(mockApp, 'AraBucket');

// Instantiate DataLakeStorage Construct with custom Props
AraBucket.getOrCreate(araBucketStack, {
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
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(araBucketStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

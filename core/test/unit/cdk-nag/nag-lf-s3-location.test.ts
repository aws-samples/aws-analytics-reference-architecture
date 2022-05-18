// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeStorage
 *
 * @group unit/best-practice/lf-s3-location
 */

import { Annotations, Match } from '@aws-cdk/assertions';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { LakeformationS3Location } from '../../../src/lf-s3-location';

const mockApp = new App();

const lfS3LocationStack = new Stack(mockApp, 'LfS3LocationStack');
const bucket = new Bucket(lfS3LocationStack, 'Bucket');

// Instantiate LakeFormationS3Location Construct
new LakeformationS3Location(lfS3LocationStack, 'LfS3Location', {
  s3Bucket: bucket,
  s3ObjectKey: 'test',
});

Aspects.of(lfS3LocationStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  lfS3LocationStack,
  'LfS3LocationStack/LfS3Location/LFS3AccessRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The S3 location role needs access to all the objects under the prefix' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  lfS3LocationStack,
  'LfS3LocationStack/Bucket/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'The S3 Bucket is used for testing the Construct only' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  lfS3LocationStack,
  'LfS3LocationStack/Bucket/Resource',
  [{ id: 'AwsSolutions-S2', reason: 'The S3 Bucket is used for testing the Construct only' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  lfS3LocationStack,
  'LfS3LocationStack/Bucket/Resource',
  [{ id: 'AwsSolutions-S3', reason: 'The S3 Bucket is used for testing the Construct only' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  lfS3LocationStack,
  'LfS3LocationStack/Bucket/Resource',
  [{ id: 'AwsSolutions-S10', reason: 'The S3 Bucket is used for testing the Construct only' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(lfS3LocationStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(lfS3LocationStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});


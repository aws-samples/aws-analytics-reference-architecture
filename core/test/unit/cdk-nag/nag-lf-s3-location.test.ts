// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeStorage
 *
 * @group unit/best-practice/lf-s3-location
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { App, Aspects, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { LakeFormationS3Location } from '../../../src/lake-formation';
import { Key } from 'aws-cdk-lib/aws-kms';

const mockApp = new App();

const lfS3LocationStack = new Stack(mockApp, 'LfS3LocationStack');
const key = new Key(lfS3LocationStack,'Key');
const bucket = new Bucket(lfS3LocationStack, 'Bucket', {
  encryption: BucketEncryption.KMS,
  encryptionKey: key,
});

// Instantiate LakeFormationS3Location Construct
new LakeFormationS3Location(lfS3LocationStack, 'S3Location', {
  s3Location: {
    bucketName: bucket.bucketName,
    objectKey: 'test'
  },
  kmsKeyId: key.keyId,
});

Aspects.of(lfS3LocationStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  lfS3LocationStack,
  'LfS3LocationStack/S3Location/LFS3AccessRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The S3 location role needs access to all the objects under the prefix. GenerateData* is a shortcut' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  lfS3LocationStack,
  'LfS3LocationStack/Key/Resource',
  [{ id: 'AwsSolutions-KMS5', reason: 'The KMS Key is not in the scope of the test' }],
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


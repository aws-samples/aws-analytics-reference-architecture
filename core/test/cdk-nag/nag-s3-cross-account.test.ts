// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests S3CrossAccount
 *
 * @group best-practice/s3-cross-account
 */


import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack, RemovalPolicy, Aws } from '@aws-cdk/core';
import { Key } from '@aws-cdk/aws-kms';
import { Bucket } from '@aws-cdk/aws-s3';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { S3CrossAccount } from '../../src/s3-cross-account';

const mockApp = new App();

const s3CrossAccountStack = new Stack(mockApp, 'S3CrossAccount');

const myKey = new Key(s3CrossAccountStack, 'MyKey', {
  removalPolicy: RemovalPolicy.DESTROY,
});
const myBucket = new Bucket(s3CrossAccountStack, 'MyBucket', {
  encryptionKey: myKey,
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

new S3CrossAccount(s3CrossAccountStack, 'MyS3CrossAccount', {
  bucket: myBucket,
  objectKey: 'test',
  key: myKey,
  accountID: Aws.ACCOUNT_ID,
});

Aspects.of(s3CrossAccountStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  s3CrossAccountStack,
  'S3CrossAccount/MyKey/Resource',
  [{ id: 'AwsSolutions-KMS5', reason: 'The key is not part of the tested resources' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  s3CrossAccountStack,
  'S3CrossAccount/MyBucket/Resource',
  [
    { id: 'AwsSolutions-S1', reason: 'The bucket access log is outside the scope of the S3CrossAccount' },
    { id: 'AwsSolutions-S2', reason: 'The bucket public access is outside the scope of the S3CrossAccount' },
    { id: 'AwsSolutions-S10', reason: 'The bucket SSL is outside the scope of the S3CrossAccount' },
  ],
);

NagSuppressions.addResourceSuppressionsByPath(
  s3CrossAccountStack,
  'S3CrossAccount/MyBucket/Policy/Resource',
  [
    { id: 'AwsSolutions-S10', reason: 'The bucket SSL is outside the scope of the S3CrossAccount' },
  ],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(s3CrossAccountStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(s3CrossAccountStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});
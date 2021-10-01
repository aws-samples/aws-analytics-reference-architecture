// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Stack } from '@aws-cdk/core';
import { SingletonBucket } from '../src/singleton-bucket';
import '@aws-cdk/assert/jest';

test('SingleBucket', () => {

  const singletonBucketStack = new Stack();

  // Instantiate 2 LogBucket Constructs
  SingletonBucket.getOrCreate(singletonBucketStack, 'test');
  SingletonBucket.getOrCreate(singletonBucketStack, 'test');


  // Test if LogBucket is a singleton
  expect(singletonBucketStack).toCountResources('AWS::S3::Bucket', 1);

  expect(singletonBucketStack).toHaveResource('AWS::S3::Bucket', {
    BucketName: {
      'Fn::Join': [
        '',
        [
          'ara-test-',
          {
            Ref: 'AWS::AccountId',
          },
        ],
      ],
    },
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'aws:kms',
          },
        },
      ],
    },
  });
});
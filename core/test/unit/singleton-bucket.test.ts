// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Singleton Bucket
 *
 * @group unit/signleton/bucket
 */

import { Stack } from 'aws-cdk-lib';
import { SingletonBucket } from '../../src/singleton-bucket';
import { Template } from 'aws-cdk-lib/assertions';

test('SingleBucket', () => {

  const singletonBucketStack = new Stack();

  // Instantiate 2 LogBucket Constructs
  SingletonBucket.getOrCreate(singletonBucketStack, 'test');
  SingletonBucket.getOrCreate(singletonBucketStack, 'test');

  const template = Template.fromStack(singletonBucketStack);

  // Test if LogBucket is a singleton
  template.resourceCountIs('AWS::S3::Bucket', 1);

  template.hasResourceProperties('AWS::S3::Bucket', {
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
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests data lake storage
 *
 * @group unit/datalake/storage
 */

import { Stack } from 'aws-cdk-lib';
import { DataLakeStorage } from '../../src/data-lake-storage';
import { Template } from 'aws-cdk-lib/assertions';

test('dataLakeStorage', () => {

  const dataLakeStorageStack = new Stack();

  // Instantiate DataLakeStorage Construct with custom Props
  new DataLakeStorage(dataLakeStorageStack, 'DataLakeStorageTest', {
    rawInfrequentAccessDelay: 90,
    rawArchiveDelay: 180,
    cleanInfrequentAccessDelay: 180,
    cleanArchiveDelay: 360,
    transformInfrequentAccessDelay: 180,
    transformArchiveDelay: 360,
  });

  const template = Template.fromStack(dataLakeStorageStack);
  // Test if the stack has 3 S3 Buckets
  template.resourceCountIs('AWS::S3::Bucket', 3);

  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: {
      'Fn::Join': [
        '',
        [
          'ara-raw-',
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
    LifecycleConfiguration: {
      Rules: [
        {
          Status: 'Enabled',
          Transitions: [
            {
              StorageClass: 'STANDARD_IA',
              TransitionInDays: 90,
            },
            {
              StorageClass: 'GLACIER',
              TransitionInDays: 180,
            },
          ],
        },
      ],
    },
  });

  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: {
      'Fn::Join': [
        '',
        [
          'ara-clean-',
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
    LifecycleConfiguration: {
      Rules: [
        {
          Status: 'Enabled',
          Transitions: [
            {
              StorageClass: 'STANDARD_IA',
              TransitionInDays: 180,
            },
            {
              StorageClass: 'GLACIER',
              TransitionInDays: 360,
            },
          ],
        },
      ],
    },
  });

  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: {
      'Fn::Join': [
        '',
        [
          'ara-transform-',
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
    LifecycleConfiguration: {
      Rules: [
        {
          Status: 'Enabled',
          Transitions: [
            {
              StorageClass: 'STANDARD_IA',
              TransitionInDays: 180,
            },
            {
              StorageClass: 'GLACIER',
              TransitionInDays: 360,
            },
          ],
        },
      ],
    },
  });
});
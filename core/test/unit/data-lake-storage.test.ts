// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests data lake storage
 *
 * @group unit/datalake/storage
 */

import { Stack } from '@aws-cdk/core';
import { DataLakeStorage } from '../../src/data-lake-storage';
import '@aws-cdk/assert/jest';

test('dataLakeStorage', () => {

  const dataLakeStorageStack = new Stack();

  // Instantiate DataLakeStorage Construct with custom Props
  new DataLakeStorage(dataLakeStorageStack, 'DataLakeStorageTest', {
    rawInfrequentAccessDelay: 1,
    rawArchiveDelay: 2,
    cleanInfrequentAccessDelay: 1,
    cleanArchiveDelay: 2,
    transformInfrequentAccessDelay: 1,
    transformArchiveDelay: 2,
  });

  // Test if the stack has 3 S3 Buckets
  expect(dataLakeStorageStack).toCountResources('AWS::S3::Bucket', 3);

  expect(dataLakeStorageStack).toHaveResource('AWS::S3::Bucket', {
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
              TransitionInDays: 1,
            },
            {
              StorageClass: 'GLACIER',
              TransitionInDays: 2,
            },
          ],
        },
      ],
    },
  });

  expect(dataLakeStorageStack).toHaveResource('AWS::S3::Bucket', {
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
              TransitionInDays: 1,
            },
            {
              StorageClass: 'GLACIER',
              TransitionInDays: 2,
            },
          ],
        },
      ],
    },
  });

  expect(dataLakeStorageStack).toHaveResource('AWS::S3::Bucket', {
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
              TransitionInDays: 1,
            },
            {
              StorageClass: 'GLACIER',
              TransitionInDays: 2,
            },
          ],
        },
      ],
    },
  });
});
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests data lake storage
 *
 * @group unit/datalake/datalakestorage
 */

import { Stack } from '@aws-cdk/core';
import { DataLakeStorage } from '../../src/data-lake-storage';
import '@aws-cdk/assert/jest';
import { Match, Template } from '@aws-cdk/assertions';

describe('DataLakeStorage', () => {


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
  
  // Raw, Clean, Transform and AccessLog buckets
  test('DataLakeStorage should provision 4 buckets', () => {
    template.resourceCountIs('AWS::S3::Bucket', 4);
  });

  test('DataLakeStorage should create the proper raw bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', 
      Match.objectLike({
        BucketName: {
          'Fn::Join': [
            '',
            [
              'raw-',
              {
                Ref: 'AWS::AccountId',
              },
              '-',
              {
                Ref: 'AWS::Region',
              },
            ],
          ],
        },
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              BucketKeyEnabled: true,
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'aws:kms',
                KMSMasterKeyID: Match.anyValue(),
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
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        LoggingConfiguration: {
          DestinationBucketName: Match.anyValue(),
          LogFilePrefix: 'raw-bucket',
        }
      })
    )
  });

  test('DataLakeStorage should create the proper clean bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', 
      Match.objectLike({
        BucketName: {
          'Fn::Join': [
            '',
            [
              'clean-',
              {
                Ref: 'AWS::AccountId',
              },
              '-',
              {
                Ref: 'AWS::Region',
              },
            ],
          ],
        },
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              BucketKeyEnabled: true,
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'aws:kms',
                KMSMasterKeyID: Match.anyValue(),
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
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        LoggingConfiguration: {
          DestinationBucketName: Match.anyValue(),
          LogFilePrefix: 'clean-bucket',
        }
      })
    )
  });

  test('DataLakeStorage should create the proper transform bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', 
      Match.objectLike({
        BucketName: {
          'Fn::Join': [
            '',
            [
              'transform-',
              {
                Ref: 'AWS::AccountId',
              },
              '-',
              {
                Ref: 'AWS::Region',
              },
            ],
          ],
        },
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              BucketKeyEnabled: true,
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'aws:kms',
                KMSMasterKeyID: Match.anyValue(),
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
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        LoggingConfiguration: {
          DestinationBucketName: Match.anyValue(),
          LogFilePrefix: 'transform-bucket',
        }
      })
    )
  });
})
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests AraBucket construct
 *
 * @group unit/common/arabucket
 */

import { Stack } from '@aws-cdk/core';
import { AraBucket } from '../../../src/common/ara-bucket';
import '@aws-cdk/assert/jest';
import { Match, Template } from '@aws-cdk/assertions';

describe ('AraBucket', () => {
  const AraBucketStack = new Stack();

  // Instantiate 2 Bucket Constructs
  AraBucket.getOrCreate(AraBucketStack, { 
    bucketName: 'test',
    serverAccessLogsPrefix: 'test',
  });
  AraBucket.getOrCreate(AraBucketStack, { 
    bucketName: 'test',
    serverAccessLogsPrefix: 'test',
  });

  const template = Template.fromStack(AraBucketStack);

  test('AraBucket is a singleton for a given name', () => {
    template.resourceCountIs('AWS::S3::Bucket', 2);
  });

  test('AraBucket has the right bucket configuration', () => {
    template.hasResourceProperties('AWS::S3::Bucket',
      Match.objectLike({
        BucketName: {
          'Fn::Join': [
            '',
            [
              'test-',
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
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        LoggingConfiguration: {
          DestinationBucketName: Match.anyValue(),
          LogFilePrefix: 'test',
        },
        LifecycleConfiguration: {
          Rules: [
            {
              AbortIncompleteMultipartUpload: {
                DaysAfterInitiation: 1,
              },
              Status: "Enabled",
            },
          ], 
        }, 
      })
    );
  });
});
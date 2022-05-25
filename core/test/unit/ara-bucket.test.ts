// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests AraBucket construct
 *
 * @group unit/ara-bucket
 */

import {Stack} from 'aws-cdk-lib';
import {AraBucket} from '../../src/ara-bucket';

import {Match, Template} from 'aws-cdk-lib/assertions';
import {BucketEncryption} from "aws-cdk-lib/aws-s3";

describe ('AraBucket', () => {
  const AraBucketStack = new Stack();

  // Instantiate 2 Bucket Constructs
  AraBucket.getOrCreate(AraBucketStack, {
    bucketName: 'test',
    serverAccessLogsPrefix: 'test',
    encryption: BucketEncryption.KMS,
  });
  AraBucket.getOrCreate(AraBucketStack, {
    bucketName: 'test',
    serverAccessLogsPrefix: 'test',
  });

  const template = Template.fromStack(AraBucketStack);

  test('AraBucket is a singleton for a given name but an S3 access log bucket is created', () => {
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
              Status: 'Enabled',
            },
          ],
        },
      }),
    );
  });
});

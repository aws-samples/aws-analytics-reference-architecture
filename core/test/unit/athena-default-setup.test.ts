// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Athena Default Setup
 *
 * @group unit/athena/default-setup
 */

import { Stack } from '@aws-cdk/core';
import { AthenaDefaultSetup } from '../../src/athena-default-setup';
import '@aws-cdk/assert/jest';


test('Athena default setup create the result bucket', () => {

  const athenaDefaultSetupStack = new Stack();
  // Instantiate an AthenaDefaultSetup
  new AthenaDefaultSetup(athenaDefaultSetupStack, 'athenaDefault');

  // Test if a bucket is created for results
  expect(athenaDefaultSetupStack).toCountResources('AWS::S3::Bucket', 1);

  // Test if the Amazon S3 Bucket for the result is correct
  expect(athenaDefaultSetupStack).toHaveResource('AWS::S3::Bucket', {
    BucketName: {
      'Fn::Join': [
        '',
        [
          'ara-log-',
          {
            Ref: 'AWS::AccountId',
          },
        ],
      ],
    },
  });

  // Test if the Amazon Athena Workgroup is correct
  expect(athenaDefaultSetupStack).toHaveResource('AWS::Athena::WorkGroup', {
    Name: 'default',
    WorkGroupConfiguration: {
      PublishCloudWatchMetricsEnabled: false,
      ResultConfiguration: {
        OutputLocation: {
          'Fn::Join': [
            '',
            [
              's3://',
              {
                Ref: 'logBucket1FE17E85',
              },
              '/athena-console-results',
            ],
          ],
        },
      },
    },
  });
});

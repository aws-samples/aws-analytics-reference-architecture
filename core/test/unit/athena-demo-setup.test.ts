// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Athena Demo Setup
 *
 * @group unit/athena-demo-setup
 */

import { Stack } from '@aws-cdk/core';
import { AthenaDemoSetup } from '../../src/athena-demo-setup';
import '@aws-cdk/assert/jest';
import { Match, Template } from '@aws-cdk/assertions';


describe ('AthenaDemoSetup', () => {

  const athenaDemoSetupStack = new Stack();
  // Instantiate an AthenaDemoSetup
  new AthenaDemoSetup(athenaDemoSetupStack, 'AthenaDefault');

  const template = Template.fromStack(athenaDemoSetupStack);

  test('Athena demo setup creates the proper result bucket', () => {

    // Test if a bucket is created for results
    template.resourceCountIs('AWS::S3::Bucket', 2);

    // Test if the Amazon S3 Bucket for the result is correct
    template.hasResourceProperties('AWS::S3::Bucket', 
      Match.objectLike({
        BucketName: {
          'Fn::Join': [
            '',
            [
              'athena-logs-',
              {
                Ref: 'AWS::AccountId',
              },
              '-',
              {
                Ref: 'AWS::Region',
              },
            ],
          ],
        }
      })
    );
  });

  test('Athena Demo Setup creates the proper Athena workgroup', () => {

    // Test if the Amazon Athena Workgroup is correct
    template.hasResourceProperties('AWS::Athena::WorkGroup', 
      Match.objectLike({
        Name: 'demo',
        WorkGroupConfiguration: {
          PublishCloudWatchMetricsEnabled: false,
          ResultConfiguration: {
            OutputLocation: {
              'Fn::Join': [
                '',
                [
                  's3://',
                  {
                    Ref: Match.anyValue(),
                  },
                  '/athena-console-results',
                ],
              ],
            },
          },
        },
      })
    );
  });
});

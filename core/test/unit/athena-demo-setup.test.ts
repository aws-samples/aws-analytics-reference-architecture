// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Athena Demo Setup
 *
 * @group unit/athena-demo-setup
 */

import { Stack } from 'aws-cdk-lib';
import { AthenaDemoSetup } from '../../src/athena-demo-setup';

import { Match, Template } from 'aws-cdk-lib/assertions';


describe ('AthenaDemoSetup', () => {

  const athenaDemoSetupStack = new Stack();
  // Instantiate an AthenaDemoSetup with default name
  new AthenaDemoSetup(athenaDemoSetupStack, 'AthenaDefault', {});
  // Instantiate an AthenaDemoSetup with custom name
  new AthenaDemoSetup(athenaDemoSetupStack, 'NamedAthenaDefault', {workgroupName: 'custom-name'});
  const template = Template.fromStack(athenaDemoSetupStack);

  test('Athena demo setup creates the proper result bucket', () => {

    // Test if buckets are created for results (+1 for access logs)
    template.resourceCountIs('AWS::S3::Bucket', 3);

    // Test if the Amazon S3 Bucket for the result is correct
    template.hasResourceProperties('AWS::S3::Bucket',
      Match.objectLike({
        BucketName: {
          'Fn::Join': [
            '',
            [
              'demo-athena-logs-',
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
      }),
    );
  });

  // Test if the Amazon S3 Bucket for the result is correct
  template.hasResourceProperties('AWS::S3::Bucket',
    Match.objectLike({
      BucketName: {
        'Fn::Join': [
          '',
          [
            'custom-name-athena-logs-',
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
    }),
  );

  test('Athena Demo Setup creates the proper Athena workgroup', () => {

    // Test if the Amazon Athena Workgroup is correct
    template.hasResourceProperties('AWS::Athena::WorkGroup',
      Match.objectLike({
        Name: 'demo',
        WorkGroupConfiguration: {
          RequesterPaysEnabled: true,
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
      }),
    );

    // Test if the Amazon Athena Workgroup is correct
    template.hasResourceProperties('AWS::Athena::WorkGroup',
      Match.objectLike({
        Name: 'custom-name',
        WorkGroupConfiguration: {
          RequesterPaysEnabled: true,
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
      }),
    );
  });
});

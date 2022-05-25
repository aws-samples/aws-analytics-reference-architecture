// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests singleton glue default role
 *
 * @group unit/glue-default-role
 */

import { Stack } from 'aws-cdk-lib';
import { GlueDefaultRole } from '../../src/glue-default-role';
import { Template, Match } from 'aws-cdk-lib/assertions';

test('SingletonGlueDefaultRole', () => {

  const glueDefaultRoleStack = new Stack();

  // Instantiate 2 SingletonGlueDefaultRole Constructs
  GlueDefaultRole.getOrCreate(glueDefaultRoleStack);
  GlueDefaultRole.getOrCreate(glueDefaultRoleStack);

  const template = Template.fromStack(glueDefaultRoleStack);

  // Test if SingletonGlueDefaultRole is a singleton
  template.resourceCountIs('AWS::IAM::Role', 1);

  // Test the created Amazon IAM Role
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'glue.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    ManagedPolicyArns: [
      {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':iam::aws:policy/service-role/AWSGlueServiceRole',
          ],
        ],
      },
    ],
    Policies: [
      {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith(
            [{
              Action: [
                's3:ListBucket',
                's3:*Object*',
                's3:AbortMultipartUpload',
                's3:ListBucketMultipartUploads',
                's3:ListMultipartUploadParts',
              ],
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      Ref: 'AWS::Partition',
                    },
                    ':s3:::*/*',
                  ],
                ],
              },
            },
            {
              Action: 'lakeformation:GetDataAccess',
              Effect: 'Allow',
              Resource: '*',
            }]),
        }),
        PolicyName: 'DataAccess',
      },
    ],
  });
});
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests signleton glue default role
 *
 * @group unit/singleton/glue-default-role
 */

import * as assertCDK from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { SingletonGlueDefaultRole } from '../../src/singleton-glue-default-role';
import '@aws-cdk/assert/jest';

test('SingletonGlueDefaultRole', () => {

  const singletonGlueDefaultRoleStack = new Stack();

  // Instantiate 2 SingletonGlueDefaultRole Constructs
  SingletonGlueDefaultRole.getOrCreate(singletonGlueDefaultRoleStack);
  SingletonGlueDefaultRole.getOrCreate(singletonGlueDefaultRoleStack);


  // Test if SingletonGlueDefaultRole is a singleton
  expect(singletonGlueDefaultRoleStack).toCountResources('AWS::IAM::Role', 1);

  // Test the created Amazon IAM Role
  expect(singletonGlueDefaultRoleStack).toHaveResource('AWS::IAM::Role', {
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
        PolicyDocument: assertCDK.objectLike({
          Statement: assertCDK.arrayWith(
            {
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
            }),
        }),
        PolicyName: 'DataAccess',
      },
    ],
  });
});
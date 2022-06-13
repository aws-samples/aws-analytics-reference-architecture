// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests LakeformationS3Location
 *
 * @group unit/lakeformation/s3-location
 */

import { LakeformationS3Location } from '../../src/lf-s3-location';

import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Key } from 'aws-cdk-lib/aws-kms';

describe('LakeFormationS3Location test', () => {

  const lfS3Stack = new Stack();  
  const bucket = new Bucket(lfS3Stack, 'Bucket');
  const key = new Key(lfS3Stack, 'Key');
  new LakeformationS3Location(lfS3Stack, 'S3Location', {
    s3Bucket: bucket,
    s3ObjectKey: 'test',
    kmsKey: key,
  });
  
  const template = Template.fromStack(lfS3Stack);

  test('S3Location should create the proper Lake Formation CfnResource', () => {
    template.hasResourceProperties('AWS::LakeFormation::Resource',
      Match.objectLike({
        UseServiceLinkedRole: false,
        RoleArn: Match.anyValue(),
        ResourceArn: Match.objectLike({
          "Fn::Join": [
            "",
            [
              Match.anyValue(),
              "/test/*"
            ]
          ]
        }),
      })
    );
  });

  test('S3Location should create the proper IAM role with S3 permissions', () => {
    template.hasResourceProperties('AWS::IAM::Policy', 
      Match.objectLike({
        PolicyDocument: {
          Statement: Match.arrayWith([
            {
              Action: [
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*",
                "s3:DeleteObject*",
                "s3:PutObject",
                "s3:PutObjectLegalHold",
                "s3:PutObjectRetention",
                "s3:PutObjectTagging",
                "s3:PutObjectVersionTagging",
                "s3:Abort*"
              ],
              Effect: 'Allow',
              Resource: Match.arrayWith([
                {
                  "Fn::Join": [
                    "",
                    [
                      Match.anyValue(),
                      "/test/*"
                    ]
                  ]
                },
                {
                  "Fn::GetAtt": [
                    Match.anyValue(),
                    "Arn"
                  ]
                }
              ])
            },
            {
              Action: [
                'kms:Encrypt*',
                'kms:Decrypt*',
                'kms:ReEncrypt*',
                'kms:GenerateDataKey*',
                'kms:Describe*',
              ],
              Effect: 'Allow',
              Resource:  {
                "Fn::GetAtt": [
                  Match.anyValue(),
                  "Arn"
                ]
              }
            }
          ])
        }
      })
    );
  });

  test('S3Location should create the proper IAM role', () => {
    template.hasResourceProperties('AWS::IAM::Role', 
      Match.objectLike({
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            {
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "lakeformation.amazonaws.com"
              },
            }
          ])
        }
      })
    );
  });
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests LakeformationS3Location
 *
 * @group unit/lakeformation/s3-location
 */

import { LakeFormationS3Location } from '../../src/lake-formation';

import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Key } from 'aws-cdk-lib/aws-kms';

describe('LakeFormationS3Location test', () => {

  const lfS3Stack = new Stack();  
  const key = new Key(lfS3Stack, 'Key');
  const bucket = new Bucket(lfS3Stack, 'Bucket', {
    encryptionKey: key,
  });
  new LakeFormationS3Location(lfS3Stack, 'S3Location', {
    s3Location: {
      bucketName: bucket.bucketName,
      objectKey: 'test'
    },
    kmsKeyId: key.keyId,
    accountId: '123456789010',
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
              "arn:",
              {
                "Ref": "AWS::Partition"
              },
              ":s3:::",
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
                      "arn:",
                      {
                        "Ref": "AWS::Partition"
                      },
                      ":s3:::",
                      Match.anyValue(),
                      "/test/*"
                    ]
                  ]
                },
                {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        "Ref": "AWS::Partition"
                      },
                      ":s3:::",
                      Match.anyValue(),
                    ]
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
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":kms:",
                    {
                      "Ref": "AWS::Region"
                    },
                    ":123456789010:key/",
                    Match.anyValue(),
                  ]
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

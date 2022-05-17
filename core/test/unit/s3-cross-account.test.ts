// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests S3CrossAccount
 *
 * @group unit/lakeformation/s3crossaccount
 */

import { S3CrossAccount } from '../../src/s3-cross-account';
import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Bucket } from 'aws-cdk-lib/aws-s3';
 
describe('S3CrossAccount test', () => {
 
  const s3CrossAccountStack = new Stack();  
  
  const accountId = '111111111111';
  const myKey = new Key(s3CrossAccountStack, 'MyKey');
  const myBucket = new Bucket(s3CrossAccountStack, 'MyBucket', {
    encryptionKey: myKey,
  });
   
  new S3CrossAccount(s3CrossAccountStack, 'MyS3CrossAccount', {
    bucket: myBucket,
    objectKey: 'test',
    key: myKey,
    accountID: accountId,
  });

  const template = Template.fromStack(s3CrossAccountStack);
 
  test('S3CrossAccount should create the right number of resources', () => {
    template.resourceCountIs('AWS::S3::BucketPolicy', 1);
  });

  test('S3CrossAccount should create the right bucket policy', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', 
      Match.objectLike({
        PolicyDocument: {
          Statement: Match.arrayWith([
            {
              Action: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
                's3:ListBucketMultipartUploads',
                's3:ListMultipartUploadParts',
                's3:AbortMultipartUpload',
                's3:ListBucket',
              ],
              Effect: 'Allow',
              Principal: {
                AWS: Match.objectLike({
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        "Ref": "AWS::Partition"
                      },
                      `:iam::${accountId}:root`
                    ]
                  ]
                }),
              },
              Resource:Match.arrayEquals([
                {
                  "Fn::Join": [
                    "",
                    [
                      {
                        "Fn::GetAtt": [
                          Match.anyValue(),
                          "Arn"
                        ]
                      },
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
          ])
        }
      })
    );
  });

  test('S3CrossAccount should create the right KMS key policy', () => {
    template.hasResourceProperties('AWS::KMS::Key', 
      Match.objectLike({
        KeyPolicy: {
          Statement: Match.arrayWith([
            {
              Action: 'kms:Decrypt',
              Effect: 'Allow',
              Principal: {
                AWS: Match.objectLike({
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        "Ref": "AWS::Partition"
                      },
                      `:iam::${accountId}:root`
                    ]
                  ]
                }),
              },
              Resource: '*',
            },
          ])
        }
      })
    );
  });
});
 
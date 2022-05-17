// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests LakeformationS3Location
 *
 * @group unit/lakeformation/s3location
 */

import { LakeformationS3Location } from '../../src/lf-s3-location';
import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

describe('LakeFormationS3Location test', () => {

  const lfS3Stack = new Stack();  
 
  new LakeformationS3Location(lfS3Stack, 'S3Location', { 
     s3Location: {
       bucketName: 'test',
       objectKey: 'test',
     }
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
              ":s3:::test/test"
            ]
          ]
        }),
      })
    );
  });

  test('S3Location should create the proper IAM role', () => {
    template.hasResourceProperties('AWS::IAM::Policy', 
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
              Resource: Match.arrayEquals([
                {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        "Ref": "AWS::Partition"
                      },
                      ":s3:::test/test/*"
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
                      ":s3:::test"
                    ]
                  ]
                }
              ])
            },
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

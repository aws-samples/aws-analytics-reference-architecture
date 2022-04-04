// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests LakeformationS3Location
 *
 * @group unit/lakeformation/s3location
 */

import { LakeformationS3Location } from '../../src/lf-s3-location';
import '@aws-cdk/assert/jest';
import { Stack } from '@aws-cdk/core';
import { Match, Template } from '@aws-cdk/assertions';

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
    template.resourceCountIs('AWS::IAM::Role', 1);
  });
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * Tests LakeformationS3Location
 *
 * @group unit/feature/lf-s3-location
 */

// import * as cdk from '@aws-cdk/core';
 // import * from '@types/jest';
 //import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
 //import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
 import { LakeformationS3Location } from '../../src/lf-s3-location';
 import '@aws-cdk/assert/jest';
 import { Stack } from '@aws-cdk/core';

  test('LakeformationS3Location construct', () => {

  const lfS3Stack = new Stack();  
 
  new LakeformationS3Location(lfS3Stack, 'CustomExample', 
   { 
     s3bucket: {
       bucketName: 'test',
       objectKey: 'test',
     }
   }
   );
  

  // Check if the Stack has a Role
 //expect(lfS3Stack).toContain('LFS3AccessRole');
  expect(lfS3Stack).toHaveResource('AWS::IAM::Role');

  // TODO: check the role has AmazonSSMManagedInstanceCore managed policy
});
 

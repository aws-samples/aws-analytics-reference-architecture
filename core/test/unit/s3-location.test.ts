// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Stack } from '@aws-cdk/core';
import {LakeformationS3Location } from '../src/lf-s3-location';
import '@aws-cdk/assert/jest';

test('example construct', () => {

  const lfS3Stack = new Stack();

  // Instantiate Example Construct with custom Props
  new LakeformationS3Location(lfS3Stack, 'CustomExample', 
  { 
    s3bucket: {
      bucketName: 'test',
      objectKey: 'test',
    }
  }
  );


  // Test if the stack has S3 Buckets
  expect(lfS3Stack).toHaveResource('AWS::S3::Bucket');

  expect(lfS3Stack).toHaveResource('AWS::IAM::Role');


});
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeStorage
 *
 * @group integ/data-lake/storage
 */

import * as cdk from '@aws-cdk/core';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { DataLakeStorage } from '../../src/data-lake-storage';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'DataLakeStorageE2eTest');

const dataLakeStorage = new DataLakeStorage(stack, 'MyDataLakeStorage');

new cdk.CfnOutput(stack, 'rawBucketName', {
  value: dataLakeStorage.rawBucket.bucketName,
  exportName: 'rawBucketName',
});

new cdk.CfnOutput(stack, 'cleanBucketName', {
  value: dataLakeStorage.cleanBucket.bucketName,
  exportName: 'cleanBucketName',
});

new cdk.CfnOutput(stack, 'transformBucketName', {
  value: dataLakeStorage.transformBucket.bucketName,
  exportName: 'transformBucketName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);
    
    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      profile: process.env.AWS_PROFILE,
    });
    const cloudFormation = new CloudFormationDeployments({ sdkProvider });
    
    // WHEN
    const deployResult = await cloudFormation.deployStack({
      stack: stackArtifact,
    });
    
    // THEN
    expect(deployResult.outputs.rawBucketName).toContain('raw-');
    expect(deployResult.outputs.cleanBucketName).toContain('clean-');
    expect(deployResult.outputs.transformBucketName).toContain('transform-');

  }, 9000000);
});

afterAll(async () => {
  const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);
  
  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    profile: process.env.AWS_PROFILE,
  });
  const cloudFormation = new CloudFormationDeployments({ sdkProvider });
  
  await cloudFormation.destroyStack({
    stack: stackArtifact,
  });
});

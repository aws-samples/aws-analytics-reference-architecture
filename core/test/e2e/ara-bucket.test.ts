// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests AraBucket
*
* @group integ/common/ara-bucket
*/

import * as cdk from '@aws-cdk/core';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { AraBucket } from '../../src/common/ara-bucket';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'AraBucketE2eTest');

const araBucket = new AraBucket(stack, { bucketName: 'my-ara-bucket'});

new cdk.CfnOutput(stack, 'BucketName', {
  value: araBucket.bucketName,
  exportName: 'bucketName',
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
    expect(deployResult.outputs.BucketName).toContain(`my-ara-bucket-`);    
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

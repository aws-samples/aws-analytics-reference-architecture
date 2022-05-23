// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests AthenaDemoSetup
*
* @group integ/athena-demo-setup
*/

import * as cdk from '@aws-cdk/core';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { AthenaDemoSetup } from '../../src/athena-demo-setup';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'AthenaDemoSetupE2eTest');

const athenaSetup = new AthenaDemoSetup(stack, 'AthenaSetup');

new cdk.CfnOutput(stack, 'ResultsBucketName', {
  value: athenaSetup.resultBucket.bucketName,
  exportName: 'ResultsBucketName',
});

new cdk.CfnOutput(stack, 'AthenaWorkgroupName', {
  value: athenaSetup.athenaWorkgroup.name,
  exportName: 'AthenaWorkgroupName',
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
    expect(deployResult.outputs.AthenaWorkgroupName).toEqual('demo');
    expect(deployResult.outputs.ResultsBucketName).toContain('athena-logs');

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

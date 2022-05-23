// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests EmrEksCluster
 *
 * @group integ/emr-eks-cluster
 */

import * as cdk from 'aws-cdk-lib';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { EmrEksCluster } from '../../src/emr-eks-platform';

jest.setTimeout(2000000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'EmrEksClustereE2eTest');

const emrEksCluster = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/gromav',
});

new cdk.CfnOutput(stack, 'EmrEksAdminRoleOutput', {
  value: emrEksCluster.eksCluster.adminRole.roleArn,
  exportName: 'emrEksAdminRole',
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
    expect(deployResult.outputs.emrEksAdminRole).toEqual('arn:aws:iam::123445678912:role/gromav');

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

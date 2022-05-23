// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Ec2SssmRole
 *
 * @group integ/ec2-ssm-role
 */

import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { Ec2SsmRole } from '../../src/ec2-ssm-role';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'Ec2SsmRoleE2eTest');

new Ec2SsmRole(stack, 'Ec2SsmRole', {
  assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
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
    /*const deployResult = */await cloudFormation.deployStack({
      stack: stackArtifact,
    });
    
    // THEN
    expect(true);

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

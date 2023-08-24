// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CdkDeployer
 *
 * @group integ/cdk-deployer
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './utils/TestStack';

import { CdkDeployer, DeploymentType } from '../../src/common/cdk-deployer';

jest.setTimeout(20000000);
// GIVEN
const testStack = new TestStack('CdkDeployerE2eTest');
const { stack } = testStack;

const cdkDeployerStack = new CdkDeployer(stack, {
  deploymentType: DeploymentType.CLICK_TO_DEPLOY,
  githubRepository: 'aws-samples/aws-analytics-reference-architecture',
  cdkAppLocation: 'refarch/aws-native',
  stackName: 'ara',
  gitBranch: 'main',
  cdkParameters: {
    QuickSightUsername: {
      default: '<MY_USER>',
      type: 'String',
    },
    QuickSightIdentityRegion: {
      default: 'us-east-1',
      type: 'String',
    },
  },
});

new cdk.CfnOutput(cdkDeployerStack, 'CodeBuildStatus', {
  value: cdkDeployerStack.deployResult,
  exportName: 'CodeBuildStatus',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.CodeBuildStatus).toEqual('SUCCESS');
  }, 20000000);
});

afterAll(async () => {
  await testStack.destroy();
});

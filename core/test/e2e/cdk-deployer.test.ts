// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests CdkDeployer
*
* @group integ/cdk-deployer
*/

import * as cdk from 'aws-cdk-lib';
import { deployStack } from './utils';

import { CdkDeployer } from '../../src/common/cdk-deployer';

jest.setTimeout(10000000);
// GIVEN
const integTestApp = new cdk.App();

const cdkDeployerStack = new CdkDeployer(integTestApp, 'CdkDeployerE2ETest', {
  githubRepository: 'aws-samples/aws-analytics-reference-architecture',
  cdkAppLocation: 'refarch/aws-native',
  cdkParameters: {
    QuickSightUsername: {
      default: 'gromav',
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
    const deployResult = await deployStack(integTestApp, cdkDeployerStack, true, false);
    
    // THEN
    expect(deployResult.outputs.CodeBuildStatus).toEqual('IN_PROGRESS');
    
  }, 10000000);
});

afterAll(async () => {
  //await destroyStack(integTestApp, cdkDeployerStack);
});
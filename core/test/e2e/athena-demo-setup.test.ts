// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests AthenaDemoSetup
*
* @group integ/athena-demo-setup
*/

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';

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
    const deployResult = await deployStack(integTestApp, stack);

    
    // THEN
    expect(deployResult.outputs.AthenaWorkgroupName).toEqual(`demo`);
    expect(deployResult.outputs.ResultsBucketName).toContain(`athena-logs`);    

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

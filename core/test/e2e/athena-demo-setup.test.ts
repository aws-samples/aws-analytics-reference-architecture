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

const athenaSetup = new AthenaDemoSetup(stack, 'AthenaSetup', {});
const athenaSetup2 = new AthenaDemoSetup(stack, 'AthenaSetup2', {workgroupName: 'custom'});

new cdk.CfnOutput(stack, 'ResultsBucketName', {
  value: athenaSetup.resultBucket.bucketName,
  exportName: 'ResultsBucketName',
});

new cdk.CfnOutput(stack, 'AthenaWorkgroupName', {
  value: athenaSetup.athenaWorkgroup.name,
  exportName: 'AthenaWorkgroupName',
});

new cdk.CfnOutput(stack, 'AthenaWorkgroupName2', {
  value: athenaSetup2.athenaWorkgroup.name,
  exportName: 'AthenaWorkgroupName2',
});

new cdk.CfnOutput(stack, 'ResultsBucketName2', {
  value: athenaSetup2.resultBucket.bucketName,
  exportName: 'ResultsBucketName2',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    const deployResult = await deployStack(integTestApp, stack);

    
    // THEN
    expect(deployResult.outputs.AthenaWorkgroupName).toEqual('demo');
    expect(deployResult.outputs.AthenaWorkgroupName2).toEqual('custom');
    expect(deployResult.outputs.ResultsBucketName).toContain('demo-athena-logs');
    expect(deployResult.outputs.ResultsBucketName2).toContain('custom-athena-logs');

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests CentralGovernance
*
* @group integ/central-governance
*/

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';

import { CentralGovernance } from '../../src/data-mesh';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'CentralGovernanceE2eTest');


new cdk.CfnOutput(stack, 'BucketName', {
  value: '',
  exportName: 'bucketName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await deployStack(integTestApp, stack);

    // THEN
    expect(deployResult.outputs.BucketName).toContain('my-ara-bucket-');
  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

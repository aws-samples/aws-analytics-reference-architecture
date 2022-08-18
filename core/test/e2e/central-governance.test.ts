// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests CentralGovernance
*
* @group integ/central-governance
*/

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';

import { CentralGovernance } from '../../src';

jest.setTimeout(600000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'CentralGovernanceE2eTest');

const central = new CentralGovernance(stack, 'CentralGovernance');

new cdk.CfnOutput(stack, 'EventBusName', {
  value: central.eventBus.eventBusName,
  exportName: 'eventBusName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await deployStack(integTestApp, stack);

    // THEN
    expect(deployResult.outputs.EventBusName).toContain('central');
  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

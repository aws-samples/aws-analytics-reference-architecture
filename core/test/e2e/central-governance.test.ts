// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CentralGovernance
 *
 * @group integ/central-governance
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './TestStack';

import { CentralGovernance } from '../../src';

jest.setTimeout(600000);
// GIVEN
const testStack = new TestStack('CentralGovernanceE2eTest');
const { stack } = testStack;

const central = new CentralGovernance(stack, 'CentralGovernance');

new cdk.CfnOutput(stack, 'EventBusName', {
  value: central.eventBus.eventBusName,
  exportName: 'eventBusName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.EventBusName).toContain('central');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

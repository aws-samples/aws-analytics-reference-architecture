// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests GlueDemoRole
 *
 * @group integ/glue-demo-role
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './utils/TestStack';

import { GlueDemoRole } from '../../src/glue-demo-role';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('GlueDemoRoleE2eTest');
const { stack } = testStack;

const glueDemoRole = GlueDemoRole.getOrCreate(stack);

new cdk.CfnOutput(stack, 'GlueDemoRoleName', {
  value: glueDemoRole.iamRole.roleName,
  exportName: 'glueDemoRoleName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.GlueDemoRoleName).toContain('GlueDemoRole');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

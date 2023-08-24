// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Ec2SssmRole
 *
 * @group integ/ec2-ssm-role
 */

import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { TestStack } from './utils/TestStack';

import { Ec2SsmRole } from '../../src/ec2-ssm-role';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('Ec2SsmRoleE2eTest');
const { stack } = testStack;

new Ec2SsmRole(stack, 'Ec2SsmRole', {
  assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    await testStack.deploy();

    // THEN
    expect(true);
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

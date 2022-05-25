// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Ec2SssmRole
 *
 * @group integ/ec2-ssm-role
 */

import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';

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
    await deployStack(integTestApp, stack);
    
    // THEN
    expect(true);

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

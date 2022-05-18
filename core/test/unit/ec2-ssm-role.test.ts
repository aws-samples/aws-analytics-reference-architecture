// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests ec2 ssm role
 *
 * @group unit/ec2-ssm-role
 */

import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { Stack } from '@aws-cdk/core';
import { Ec2SsmRole } from '../../src/ec2-ssm-role';
import '@aws-cdk/assert/jest';

test('Ec2SsmRole construct', () => {

  const ec2SsmRoleStack = new Stack();

  // Instantiate Ec2SsmRole Construct
  new Ec2SsmRole(ec2SsmRoleStack, 'Ec2SsmRole', { assumedBy: new ServicePrincipal('ec2.amazonaws.com') });

  // Check if the Stack has a Role
  expect(ec2SsmRoleStack).toHaveResource('AWS::IAM::Role');

  // TODO: check the role has AmazonSSMManagedInstanceCore managed policy
});
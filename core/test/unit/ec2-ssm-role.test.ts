// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests ec2 ssm role
 *
 * @group unit/other/ec2-ssm-role
 */

import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';
import { Ec2SsmRole } from '../../src/ec2-ssm-role';
import { Template } from 'aws-cdk-lib/assertions';

test('Ec2SsmRole construct', () => {

  const ec2SsmRoleStack = new Stack();

  // Instantiate Ec2SsmRole Construct
  new Ec2SsmRole(ec2SsmRoleStack, 'Ec2SsmRole', { assumedBy: new ServicePrincipal('ec2.amazonaws.com') });

  const template = Template.fromStack(ec2SsmRoleStack);
  // Check if the Stack has a Role
  template.hasResource('AWS::IAM::Role', 1);

  // TODO: check the role has AmazonSSMManagedInstanceCore managed policy
});
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Ec2SsmRole
 *
 * @group best-practice/ec2-ssm-role
 */

import { Annotations, Match } from '@aws-cdk/assertions';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { Ec2SsmRole } from '../../src/ec2-ssm-role';

const mockApp = new App();

const ec2SsmRoleStack = new Stack(mockApp, 'ec2-ssm-role');

// Instantiate Ec2SsmRole Construct
new Ec2SsmRole(ec2SsmRoleStack, 'Ec2SsmRole', { assumedBy: new ServicePrincipal('ec2.amazonaws.com') });

Aspects.of(ec2SsmRoleStack).add(new AwsSolutionsChecks({ verbose: true }));

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(ec2SsmRoleStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(ec2SsmRoleStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});

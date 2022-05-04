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
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { Ec2SsmRole } from '../../src/ec2-ssm-role';

const mockApp = new App();

const ec2SsmRoleStack = new Stack(mockApp, 'ec2-ssm-role');

// Instantiate Ec2SsmRole Construct
new Ec2SsmRole(ec2SsmRoleStack, 'Ec2SsmRole', { assumedBy: new ServicePrincipal('ec2.amazonaws.com') });

Aspects.of(ec2SsmRoleStack).add(new AwsSolutionsChecks({ verbose: true }));

NagSuppressions.addResourceSuppressionsByPath(
  ec2SsmRoleStack,
  'ec2-ssm-role/Ec2SsmRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'The purpose of the construct is to use an AWS Managed Policy' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(ec2SsmRoleStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(ec2SsmRoleStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});

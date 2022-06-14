// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests LfAdminRole
 *
 * @group unit/best-practice/lf-admin-role
 */

import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { LfAdminRole } from '../../../src/data-mesh';

const mockApp = new App();

const lfAdminRoleStack = new Stack(mockApp, 'lfAdminRoleStack');

new LfAdminRole(lfAdminRoleStack, 'lfAdminRole', {
  assumedBy: new CompositePrincipal(
    new ServicePrincipal('glue.amazonaws.com'),
    new ServicePrincipal('lakeformation.amazonaws.com'),
    new ServicePrincipal('states.amazonaws.com'),
  ),
});

Aspects.of(lfAdminRoleStack).add(new AwsSolutionsChecks({ verbose: true }));

NagSuppressions.addResourceSuppressionsByPath(
  lfAdminRoleStack,
  'lfAdminRoleStack/lfAdminRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'The purpose of the construct is to use an AWS Managed Policy' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(lfAdminRoleStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(lfAdminRoleStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

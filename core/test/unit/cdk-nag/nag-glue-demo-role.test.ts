// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeStorage
 *
 * @group unit/best-practice/glue-default-role
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Aspects, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { GlueDemoRole } from '../../../src/glue-demo-role';

const mockApp = new App();

const glueDemoRoleStack = new Stack(mockApp, 'GlueDemoRoleStack');

// Instantiate GlueDemoRole Construct
GlueDemoRole.getOrCreate(glueDemoRoleStack);

Aspects.of(glueDemoRoleStack).add(new AwsSolutionsChecks());

// Suppressing the warning that the S3 location role needs access to all the objects under the prefix.
NagSuppressions.addResourceSuppressionsByPath(
  glueDemoRoleStack,
  'GlueDemoRoleStack/GlueDemoRole/GlueDemoRole/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The role needs wide access to S3' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  glueDemoRoleStack,
  'GlueDemoRoleStack/GlueDemoRole/GlueDemoRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'The role uses AWSGlueServiceRole managed policy as a default policy for using Glue' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(glueDemoRoleStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(glueDemoRoleStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});


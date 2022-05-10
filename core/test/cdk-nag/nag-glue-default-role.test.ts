// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeStorage
 *
 * @group best-practice/glue-default-role
 */

import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { GlueDefaultRole } from '../../src/glue-default-role';

const mockApp = new App();

const glueDefaultRoleStack = new Stack(mockApp, 'GlueDefaultRoleStack');

// Instantiate SingletonGlueDefaultRole Construct
GlueDefaultRole.getOrCreate(glueDefaultRoleStack);

Aspects.of(glueDefaultRoleStack).add(new AwsSolutionsChecks());

// Suppressing the warning that the S3 location role needs access to all the objects under the prefix.
NagSuppressions.addResourceSuppressionsByPath(
   glueDefaultRoleStack,
   'GlueDefaultRoleStack/GlueDefaultRole/GlueDefaultRole/Resource',
   [{ id: 'AwsSolutions-IAM5', reason: 'The role needs wide access to S3' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  glueDefaultRoleStack,
  'GlueDefaultRoleStack/GlueDefaultRole/GlueDefaultRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'The role uses AWSGlueServiceRole managed policy as a default policy for using Glue' }],
);
  
test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(glueDefaultRoleStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});
  
test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(glueDefaultRoleStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});
  
  
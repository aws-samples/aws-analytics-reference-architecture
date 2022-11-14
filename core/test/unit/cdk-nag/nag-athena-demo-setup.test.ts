// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests AthenaDemoSetup
 *
 * @group unit/best-practice/athena-demo-setup
 */


import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Aspects, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { AthenaDemoSetup } from '../../../src/athena-demo-setup';

const mockApp = new App();

const athenaDemoSetupStack = new Stack(mockApp, 'athena-demo-setup');
// Instantiate an AthenaDemoSetup
new AthenaDemoSetup(athenaDemoSetupStack, 'athenaDemo', {});

Aspects.of(athenaDemoSetupStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  athenaDemoSetupStack,
  'athena-demo-setup/athenaDemo/athenaDemoWorkgroup',
  [{ id: 'AwsSolutions-ATH1', reason: 'Not setting up an encryption key since this the default athena workgroup' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  athenaDemoSetupStack,
  'athena-demo-setup/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  athenaDemoSetupStack,
  'athena-demo-setup/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'the bucket used to log S3 access cannot have access logs enabled' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(athenaDemoSetupStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(athenaDemoSetupStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

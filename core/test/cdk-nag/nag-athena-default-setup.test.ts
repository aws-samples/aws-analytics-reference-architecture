/**
 * Tests athena-default
 *
 * @group best-practice/athena-setup-default
 */


import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { AthenaDefaultSetup } from '../../src';

const mockApp = new App();

const athenaDefaultSetupStack = new Stack(mockApp, 'athena-default-setup');
// Instantiate an AthenaDefaultSetup
new AthenaDefaultSetup(athenaDefaultSetupStack, 'athenaDefault');

Aspects.of(athenaDefaultSetupStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  athenaDefaultSetupStack,
  'athena-default-setup/athenaDefault/athenaDefaultWorkgroup',
  [{ id: 'AwsSolutions-ATH1', reason: 'Not setting up an encryption key since this the default athena workgroup' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  athenaDefaultSetupStack,
  'athena-default-setup/ara-s3accesslogsBucket/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(athenaDefaultSetupStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(athenaDefaultSetupStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SynchronousAthenaQuery
 *
 * @group best-practice/synchronous-athena-query
 */


import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { SynchronousAthenaQuery } from '../../src';
// eslint-disable-next-line import/no-extraneous-dependencies

const mockApp = new App();

const synchronousAthenaStack = new Stack(mockApp, 'synchronous-athena-query');
// Instantiate a CrawlerStartWait custom resource
new SynchronousAthenaQuery(synchronousAthenaStack, 'SynchronousAthenaQueryTes', {
  statement: 'SELECT * FROM test.test;',
  resultPath: {
    bucketName: 'log',
    objectKey: 'query-result',
  },
});

Aspects.of(synchronousAthenaStack).add(new AwsSolutionsChecks());


NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/lambdaExecutionRolePolicyara-synchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/lambdaExecutionRolePolicysynchronousAthenaQueryCRP/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time ' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/logRetentionLambdaExecutionRolePolicyara-synchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/lambdaExecutionRolePolicyara-synchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/logRetentionLambdaExcutionRoleara-synchronousAthenaCrStart/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/logRetentionLambdaExecutionRolePolicyara-synchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/lambdaExcutionRoleCRsynchronousAthenaQueryCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

/*NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/synchronousAthenaQueryCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/synchronousAthenaQueryCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);*/

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(synchronousAthenaStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(synchronousAthenaStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});

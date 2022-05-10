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
new SynchronousAthenaQuery(synchronousAthenaStack, 'SynchronousAthenaQueryTest', {
  statement: 'SELECT * FROM test.test;',
  resultPath: {
    bucketName: 'log',
    objectKey: 'query-result',
  },
});

Aspects.of(synchronousAthenaStack).add(new AwsSolutionsChecks());


NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LambdaExecutionRolePolicySynchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LambdaExecutionRolePolicySynchronousAthenaQueryCRP/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time ' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LogRetentionLambdaExecutionRolePolicySynchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LambdaExecutionRolePolicySynchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LogRetentionLambdaExecutionRoleSynchronousAthenaCrStart/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LogRetentionLambdaExecutionRolePolicySynchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LambdaExecutionRoleCRSynchronousAthenaQueryCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/SynchronousAthenaQueryCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/SynchronousAthenaQueryCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(synchronousAthenaStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(synchronousAthenaStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

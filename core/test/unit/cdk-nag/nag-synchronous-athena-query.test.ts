// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SynchronousAthenaQuery
 *
 * @group unit/best-practice/synchronous-athena-query
 */


import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { SynchronousAthenaQuery } from '../../../src';
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


Aspects.of(synchronousAthenaStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LambdaExecutionRolePolicySynchronousAthenaQueryTestStartFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LogRetentionLambdaExecutionRolePolicySynchronousAthenaQueryTestWaitFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LambdaExecutionRolePolicySynchronousAthenaQueryTestWaitFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LogRetentionLambdaExecutionRoleSynchronousAthenaQueryTestStartFn/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/LogRetentionLambdaExecutionRolePolicySynchronousAthenaQueryTestStartFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card needed for the proper execution' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/framework-onTimeout/ServiceRole',
  [{ id: 'AwsSolutions-IAM4', reason: 'CDK does not provide an interface to modify the AWS managed policy' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/framework-onTimeout/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card needed for the proper execution' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/framework-isComplete/ServiceRole',
  [{ id: 'AwsSolutions-IAM4', reason: 'CDK does not provide an intenface to modify the AWS managed policy' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/framework-isComplete/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card needed for the proper execution' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/framework-onEvent/ServiceRole',
  [{ id: 'AwsSolutions-IAM4', reason: 'CDK does not provide an intenface to modify the AWS managed policy' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card needed for the proper execution' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/framework-onEvent/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/framework-isComplete/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTest/customresourceprovider/framework-onTimeout/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
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

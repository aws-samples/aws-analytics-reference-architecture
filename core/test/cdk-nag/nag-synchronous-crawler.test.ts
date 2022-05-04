// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SynchronousCrawler
 *
 * @group best-practice/synchronous-crawler
 */

import { App, Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { SynchronousCrawler } from '../../src';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@aws-cdk/assert/jest';
import { Annotations, Match } from '@aws-cdk/assertions';

const mockApp = new App();

const crawlerStartWaitStack = new Stack(mockApp, 'synchronous-crawler');

// Instantiate a CrawlerStartWait custom resource
new SynchronousCrawler(crawlerStartWaitStack, 'CrawlerStartWaitTest', {
  crawlerName: 'test-crawler',
});

Aspects.of(crawlerStartWaitStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/LambdaExecutionRolePolicySynchronousCrawlerStartFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card for log stream, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/LogRetentionLambdaExecutionRolePolicySynchronousCrawlerStartFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/LogRetentionLambdaExcutionRoleSynchronousCrawlerStartFn/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for mutating log retention, log name is know only at runtime, cannot scope it down' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/LambdaExecutionRolePolicySynchronousCrawlerWaitFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card for log stream, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/LogRetentionLambdaExecutionRolePolicySynchronousCrawlerWaitFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/LambdaExecutionRolePolicySynchronousCrawlerCRP/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card for log stream, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/LambdaExecutionRoleCRSynchronousCrawlerCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/LambdaExecutionRoleCRSynchronousCrawlerCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/SynchronousCrawlerCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(crawlerStartWaitStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(crawlerStartWaitStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});

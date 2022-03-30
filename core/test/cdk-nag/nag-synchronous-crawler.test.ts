// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests sync-crawler
 *
 * @group best-practice/sync-crawler
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
  'synchronous-crawler/CrawlerStartWaitTest/lambdaExecutionRolePolicyara-SynchronousCrawlerStartFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card for log stream, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/logRetentionLambdaExecutionRolePolicyara-SynchronousCrawlerStartFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/logRetentionLambdaExcutionRoleara-SynchronousCrawlerStartFn/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for mutating log retention, log name is know only at runtime, cannot scope it down' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/lambdaExecutionRolePolicyara-SynchronousCrawlerWaitFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card for log stream, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/logRetentionLambdaExecutionRolePolicyara-SynchronousCrawlerWaitFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/lambdaExecutionRolePolicysynchronousCrawlerCRP/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card for log stream, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/lambdaExcutionRoleCRsynchronousCrawlerCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/lambdaExcutionRoleCRsynchronousCrawlerCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
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

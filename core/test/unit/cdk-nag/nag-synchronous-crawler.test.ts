// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SynchronousCrawler
 *
 * @group unit/best-practice/synchronous-crawler
 */

import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { SynchronousCrawler } from '../../../src';
// eslint-disable-next-line import/no-extraneous-dependencies


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
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card needed for the proper execution it is inject by Provider CDK construct' }],
);


NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-onEvent/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-onEvent/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Managed policy used by construct cannot change it' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/LogRetentionLambdaExecutionRoleSynchronousCrawlerStartFn/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-onEvent/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Managed policy used by construct cannot change it' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-onTimeout/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Managed policy used by construct cannot change it' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-onTimeout/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card needed for the proper execution it is inject by Provider CDK construct' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-isComplete/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card needed for the proper execution it is inject by Provider CDK construct' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card needed for the proper execution it is inject by Provider CDK construct' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-isComplete/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Managed policy used by construct cannot change it' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-isComplete/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-onTimeout/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  crawlerStartWaitStack,
  'synchronous-crawler/CrawlerStartWaitTest/synchronousCrawlerCRP/framework-onEvent/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(crawlerStartWaitStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(crawlerStartWaitStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

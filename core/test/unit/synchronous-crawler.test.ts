// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests synchroneous crawler
 *
 * @group unit/other/synchroneous-crawler
 */

import { Stack } from '@aws-cdk/core';
import { SynchronousCrawler } from '../../src/synchronous-crawler';
import '@aws-cdk/assert/jest';

test('CrawlerStartWait', () => {
  const crawlerStartWaitStack = new Stack();
  // Instantiate a CrawlerStartWait custom resource
  new SynchronousCrawler(crawlerStartWaitStack, 'CrawlerStartWaitTest', {
    crawlerName: 'test-crawler',
  });

  expect(crawlerStartWaitStack).toHaveResource('AWS::IAM::Role');

  expect(crawlerStartWaitStack).toCountResources('AWS::Lambda::Function', 6);

  expect(crawlerStartWaitStack).toHaveResource('AWS::CloudFormation::CustomResource');

});
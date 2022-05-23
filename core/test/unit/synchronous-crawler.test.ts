// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests synchroneous crawler
 *
 * @group unit/other/synchroneous-crawler
 */

import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SynchronousCrawler } from '../../src/synchronous-crawler';

test('CrawlerStartWait', () => {
  const crawlerStartWaitStack = new Stack();
  // Instantiate a CrawlerStartWait custom resource
  new SynchronousCrawler(crawlerStartWaitStack, 'CrawlerStartWaitTest', {
    crawlerName: 'test-crawler',
  });

  const template = Template.fromStack(crawlerStartWaitStack);

  template.resourceCountIs('AWS::IAM::Role', 8);

  template.resourceCountIs('AWS::Lambda::Function', 6);

  template.resourceCountIs('AWS::CloudFormation::CustomResource', 1);

});

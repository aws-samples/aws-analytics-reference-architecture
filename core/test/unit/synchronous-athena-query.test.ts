// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests synchroneous Athena query
 *
 * @group unit/athena/synchroneous-query
 */

import { Stack } from 'aws-cdk-lib';
import { SynchronousAthenaQuery } from '../../src/synchronous-athena-query';
import { Template } from 'aws-cdk-lib/assertions';

test('CrawlerStartWait', () => {
  const synchronousAthenaStack = new Stack();
  // Instantiate a CrawlerStartWait custom resource
  new SynchronousAthenaQuery(synchronousAthenaStack, 'SynchronousAthenaQueryTes', {
    statement: 'SELECT * FROM test.test;',
    resultPath: {
      bucketName: 'log',
      objectKey: 'query-result',
    },
  });

  const template = Template.fromStack(synchronousAthenaStack);

  template.resourceCountIs('AWS::IAM::Role', 8);

  template.resourceCountIs('AWS::Lambda::Function', 6);

  template.resourceCountIs('AWS::CloudFormation::CustomResource', 1);

  // TODO: add testing

});
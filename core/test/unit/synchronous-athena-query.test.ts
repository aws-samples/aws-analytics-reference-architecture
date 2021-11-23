// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests synchroneous Athena query
 *
 * @group unit/athena/synchroneous-query
 */

import { Stack } from '@aws-cdk/core';
import { SynchronousAthenaQuery } from '../../src/synchronous-athena-query';
import '@aws-cdk/assert/jest';

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

  expect(synchronousAthenaStack).toHaveResource('AWS::IAM::Role');

  expect(synchronousAthenaStack).toCountResources('AWS::Lambda::Function', 6);

  expect(synchronousAthenaStack).toHaveResource('AWS::CloudFormation::CustomResource');

  // TODO: add testing

});
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Stack } from '@aws-cdk/core';
import { SynchronousAthenaQuery } from '../src/synchronous-athena-query';
import '@aws-cdk/assert/jest';

test('CrawlerStartWait', () => {
  const synchronousAthenaStack = new Stack();
  // Instantiate a CrawlerStartWait custom resource
  new SynchronousAthenaQuery(synchronousAthenaStack, 'SynchronousAthenaQueryTes', {
    statement: 'SELECT * FROM test.test;',
    resultPath: '',
  });

  expect(synchronousAthenaStack).toHaveResource('AWS::IAM::Role');

  expect(synchronousAthenaStack).toCountResources('AWS::Lambda::Function', 6);

  expect(synchronousAthenaStack).toHaveResource('AWS::CloudFormation::CustomResource');

});
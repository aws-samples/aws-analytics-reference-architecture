// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests singleton glue database
 *
 * @group unit/singleton-glue-database
 */

import { Stack } from '@aws-cdk/core';
import { SingletonGlueDatabase } from '../../src/singleton-glue-database';
import '@aws-cdk/assert/jest';

test('SingleBucket', () => {

  const singletonGlueDatabaseStack = new Stack();

  // Instantiate 2 LogBucket Constructs
  SingletonGlueDatabase.getOrCreate(singletonGlueDatabaseStack, 'test');
  SingletonGlueDatabase.getOrCreate(singletonGlueDatabaseStack, 'test');


  // Test if LogBucket is a singleton
  expect(singletonGlueDatabaseStack).toCountResources('AWS::Glue::Database', 1);

  expect(singletonGlueDatabaseStack).toHaveResource('AWS::Glue::Database', {
    CatalogId: {
      Ref: 'AWS::AccountId',
    },
    DatabaseInput: {
      Name: 'test',
    },
  });
});
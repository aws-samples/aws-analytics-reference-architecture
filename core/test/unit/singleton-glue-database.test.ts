// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests singleton glue database
 *
 * @group unit/other/singleton-glue-database
 */

import { Stack } from 'aws-cdk-lib';
import { SingletonGlueDatabase } from '../../src/singleton-glue-database';
import { Template } from 'aws-cdk-lib/assertions';

test('SingleBucket', () => {

  const singletonGlueDatabaseStack = new Stack();

  // Instantiate 2 LogBucket Constructs
  SingletonGlueDatabase.getOrCreate(singletonGlueDatabaseStack, 'test');
  SingletonGlueDatabase.getOrCreate(singletonGlueDatabaseStack, 'test');

  const template = Template.fromStack(singletonGlueDatabaseStack);

  // Test if LogBucket is a singleton
  template.resourceCountIs('AWS::Glue::Database', 1);

  template.hasResourceProperties('AWS::Glue::Database', {
    CatalogId: {
      Ref: 'AWS::AccountId',
    },
    DatabaseInput: {
      Name: 'test',
    },
  });
});
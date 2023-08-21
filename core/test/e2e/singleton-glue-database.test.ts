// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SingletonGlueDatabase
 *
 * @group integ/singleton-glue-database
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './TestStack';

import { SingletonGlueDatabase } from '../../src/singleton-glue-database';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('SingletonGlueDatabaseE2eTest');
const { stack } = testStack;

const singletonGlueDatabase = SingletonGlueDatabase.getOrCreate(stack, 'singleton_database_test');

new cdk.CfnOutput(stack, 'SingletonGlueDatabaseName', {
  value: singletonGlueDatabase.databaseName,
  exportName: 'singletonGlueDatabaseName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.SingletonGlueDatabaseName).toContain('singleton_database_test');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeCatalog
 *
 * @group integ/data-lake/catalog
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './utils/TestStack';

import { DataLakeCatalog } from '../../src/data-lake-catalog';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('DataLakeCatalogE2eTest');
const { stack } = testStack;

const dataLakeCatalog = new DataLakeCatalog(stack, 'DataLakeCatalog');

new cdk.CfnOutput(stack, 'RawDatabaseName', {
  value: dataLakeCatalog.rawDatabase.databaseName,
  exportName: 'rawDatabaseName',
});

new cdk.CfnOutput(stack, 'CleanDatabaseName', {
  value: dataLakeCatalog.cleanDatabase.databaseName,
  exportName: 'cleanDatabaseName',
});

new cdk.CfnOutput(stack, 'TransformDatabaseName', {
  value: dataLakeCatalog.transformDatabase.databaseName,
  exportName: 'transformDatabaseName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.RawDatabaseName).toContain('raw');
    expect(deployResult.CleanDatabaseName).toContain('clean');
    expect(deployResult.TransformDatabaseName).toContain('transform');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

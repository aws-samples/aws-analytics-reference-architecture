// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeCatalog
 *
 * @group integ/data-lake/catalog
 */

 import * as cdk from 'aws-cdk-lib';
 import { deployStack, destroyStack } from './utils';

 import { DataLakeCatalog } from '../../src/data-lake-catalog';
 
 jest.setTimeout(100000);
 // GIVEN
 const integTestApp = new cdk.App();
 const stack = new cdk.Stack(integTestApp, 'DataLakeCatalogE2eTest');
 
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
     const deployResult = await deployStack(integTestApp, stack);
     
     // THEN
     expect(deployResult.outputs.RawDatabaseName).toContain('raw');
     expect(deployResult.outputs.CleanDatabaseName).toContain('clean');
     expect(deployResult.outputs.TransformDatabaseName).toContain('transform');
 
   }, 9000000);
 });
 
 afterAll(async () => {
  await destroyStack(integTestApp, stack);
 });
 
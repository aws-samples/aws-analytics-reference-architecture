// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests GlueDefaultRole
 *
 * @group integ/glue-default-role
 */

 import * as cdk from 'aws-cdk-lib';
 import { deployStack, destroyStack } from './utils';

 import { GlueDefaultRole } from '../../src/glue-default-role';
 
 jest.setTimeout(100000);
 // GIVEN
 const integTestApp = new cdk.App();
 const stack = new cdk.Stack(integTestApp, 'GlueDefaultRoleE2eTest');
 
 const glueDefaultRole = GlueDefaultRole.getOrCreate(stack);

 new cdk.CfnOutput(stack, 'GlueDefaultRoleName', {
   value: glueDefaultRole.iamRole.roleName,
   exportName: 'glueDefaultRoleName',
 });
 
 describe('deploy succeed', () => {
   it('can be deploy succcessfully', async () => {
     // GIVEN
     const deployResult = await deployStack(integTestApp, stack);
     
     // THEN
     expect(deployResult.outputs.GlueDefaultRoleName).toContain('GlueDefaultRole');
 
   }, 9000000);
 });
 
 afterAll(async () => {
  await destroyStack(integTestApp, stack);
 });
 
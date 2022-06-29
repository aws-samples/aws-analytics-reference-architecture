// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests GlueDemoRole
 *
 * @group integ/glue-demo-role
 */

 import * as cdk from 'aws-cdk-lib';
 import { deployStack, destroyStack } from './utils';

 import { GlueDemoRole } from '../../src/glue-demo-role';
 
 jest.setTimeout(100000);
 // GIVEN
 const integTestApp = new cdk.App();
 const stack = new cdk.Stack(integTestApp, 'GlueDemoRoleE2eTest');
 
 const glueDemoRole = GlueDemoRole.getOrCreate(stack);

 new cdk.CfnOutput(stack, 'GlueDemoRoleName', {
   value: glueDemoRole.iamRole.roleName,
   exportName: 'glueDemoRoleName',
 });
 
 describe('deploy succeed', () => {
   it('can be deploy succcessfully', async () => {
     // GIVEN
     const deployResult = await deployStack(integTestApp, stack);
     
     // THEN
     expect(deployResult.outputs.GlueDemoRoleName).toContain('GlueDemoRole');
 
   }, 9000000);
 });
 
 afterAll(async () => {
  await destroyStack(integTestApp, stack);
 });
 
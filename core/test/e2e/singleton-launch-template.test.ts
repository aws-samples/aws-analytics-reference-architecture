// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SingletonLaunchTemplate
 *
 * @group integ/singleton-launch-template
 */

 import * as cdk from 'aws-cdk-lib';
 import { deployStack, destroyStack } from './utils';

 import { SingletonCfnLaunchTemplate } from '../../src/singleton-launch-template';
 
 jest.setTimeout(100000);
 // GIVEN
 const integTestApp = new cdk.App();
 const stack = new cdk.Stack(integTestApp, 'SingletonCfnLaunchTemplateE2eTest');
 
 const singletonLaunchTemplate = SingletonCfnLaunchTemplate.getOrCreate(stack, 'singleton-launch-template', '');
 
 new cdk.CfnOutput(stack, 'SingletonLaunchTemplateName', {
   value: singletonLaunchTemplate.launchTemplateName || '',
   exportName: 'singletonLaunchTemplateName',
 });
 
 describe('deploy succeed', () => {
   it('can be deploy succcessfully', async () => {
     // GIVEN
     const deployResult = await deployStack(integTestApp, stack);
     
     // THEN
     expect(deployResult.outputs.SingletonLaunchTemplateName).toEqual('singleton-launch-template');
 
   }, 9000000);
 });
 
 afterAll(async () => {
  await destroyStack(integTestApp, stack);
 });
 
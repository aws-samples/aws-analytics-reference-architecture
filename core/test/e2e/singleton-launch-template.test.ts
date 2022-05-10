// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SingletonLaunchTemplate
 *
 * @group integ/singleton-launch-template
 */

 import * as cdk from '@aws-cdk/core';
 import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
 import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
 
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
     const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);
     
     const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
       profile: process.env.AWS_PROFILE,
     });
     const cloudFormation = new CloudFormationDeployments({ sdkProvider });
     
     // WHEN
     const deployResult = await cloudFormation.deployStack({
       stack: stackArtifact,
     });
     
     // THEN
     expect(deployResult.outputs.SingletonLaunchTemplateName).toEqual('singleton-launch-template');
 
   }, 9000000);
 });
 
 afterAll(async () => {
   const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);
   
   const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
     profile: process.env.AWS_PROFILE,
   });
   const cloudFormation = new CloudFormationDeployments({ sdkProvider });
   
   await cloudFormation.destroyStack({
     stack: stackArtifact,
   });
 });
 
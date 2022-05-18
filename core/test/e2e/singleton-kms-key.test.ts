// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SingletonGlueDatabase
 *
 * @group integ/singleton-kms-key
 */

 import * as cdk from '@aws-cdk/core';
 import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
 import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
 
 import { SingletonKey } from '../../src/singleton-kms-key';
 
 jest.setTimeout(100000);
 // GIVEN
 const integTestApp = new cdk.App();
 const stack = new cdk.Stack(integTestApp, 'SingletonKeyE2eTest');
 
 const singletonKey = SingletonKey.getOrCreate(stack, 'singleton_key_test');
 
 new cdk.CfnOutput(stack, 'SingletonKeyId', {
   value: singletonKey.keyId,
   exportName: 'singletonKeyId',
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
     expect(deployResult.outputs.SingletonKeyId).toHaveLength(36);
 
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
 
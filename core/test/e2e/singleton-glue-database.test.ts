// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SingletonGlueDatabase
 *
 * @group integ/singleton-glue-database
 */

 import * as cdk from '@aws-cdk/core';
 import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
 import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
 
 import { SingletonGlueDatabase } from '../../src/singleton-glue-database';
 
 jest.setTimeout(100000);
 // GIVEN
 const integTestApp = new cdk.App();
 const stack = new cdk.Stack(integTestApp, 'SingletonGlueDatabaseE2eTest');
 
 const singletonGlueDatabase = SingletonGlueDatabase.getOrCreate(stack, 'singleton_database_test');
 
 new cdk.CfnOutput(stack, 'SingletonGlueDatabaseName', {
   value: singletonGlueDatabase.databaseName,
   exportName: 'singletonGlueDatabaseName',
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
     expect(deployResult.outputs.SingletonGlueDatabaseName).toContain('singleton_database_test');
 
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
 
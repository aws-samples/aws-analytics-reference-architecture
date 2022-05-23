// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests GlueDefaultRole
 *
 * @group integ/glue-default-role
 */

 import * as cdk from 'aws-cdk-lib';
 import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
 import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
 
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
     expect(deployResult.outputs.GlueDefaultRoleName).toContain('GlueDefaultRole');
 
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
 
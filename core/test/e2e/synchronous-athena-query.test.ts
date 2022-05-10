// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SynchronousAthenaQuery
 *
 * @group integ/synchronous-athena-query
 */

 import { Bucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
 import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
 import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
 
 import { SynchronousAthenaQuery } from '../../src/synchronous-athena-query';
 
 jest.setTimeout(100000);
 // GIVEN
 const integTestApp = new cdk.App();
 const stack = new cdk.Stack(integTestApp, 'SynchronousAthenaQueryE2eTest');
 
 const resultsBucket = new Bucket(stack, 'ResultsBucket');

 const synchronousAthenaQuery = new SynchronousAthenaQuery(stack, 'SynchronousAthenaQuery', {
    statement: 'SELECT * FROM sampledb.elb_logs limit 10;',
    resultPath: {
      bucketName: resultsBucket.bucketName,
      objectKey: 'query-results',
    },
  });
 
 new cdk.CfnOutput(stack, 'SynchronousAthenaQueryResource', {
   value: synchronousAthenaQuery.toString(),
   exportName: 'SynchronousAthenaQueryResource',
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
    /*const deployResult =*/ await cloudFormation.deployStack({
       stack: stackArtifact,
     });
     
     // THEN
     expect(true);
 
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
 
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeStorage
 *
 * @group integ/lakeformation/s3-cross-account
 */

import { Key } from '@aws-cdk/aws-kms';
import { Bucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
import { S3CrossAccount } from '../../src/s3-cross-account';
 
jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'S3CrossAccountE2eTest');

const myKey = new Key(stack, 'MyKey', {
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
const myBucket = new Bucket(stack, 'MyBucket', {
    encryptionKey: myKey,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
});

new S3CrossAccount(stack, 'MyS3CrossAccount', {
  s3Bucket: myBucket,
  s3ObjectKey: 'test',
  accountId: cdk.Aws.ACCOUNT_ID,
});

new cdk.CfnOutput(stack, 'BucketPolicy', {
  value: myBucket.policy ? myBucket.policy.document.statementCount.toString() : '1',
  exportName: 'bucketPolicy',
});

new cdk.CfnOutput(stack, 'KeyPolicy', {
  value: myKey.keyId,
  exportName: 's3CrossAccountKeyId',
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
    expect(deployResult.outputs.BucketPolicy).toContain('2');
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

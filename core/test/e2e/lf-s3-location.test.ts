// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests LakeformationS3Location
*
* @group integ/lakeformation/s3-location
*/

import { Key } from 'aws-cdk-lib/aws-kms';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
import { LakeformationS3Location } from '../../src/lf-s3-location';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'LakeformationS3LocationE2eTest');

const myKey = new Key(stack, 'MyKey', {
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
const myBucket = new Bucket(stack, 'MyBucket', {
  encryptionKey: myKey,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const s3Location = new LakeformationS3Location(stack, 'S3Location', {
  s3Bucket: myBucket,
  s3ObjectKey: 'test',
});

new cdk.CfnOutput(stack, 'BucketPolicy', {
  value: s3Location.dataAccessRole.assumeRolePolicy?
    s3Location.dataAccessRole.assumeRolePolicy.statementCount.toString() : '0',
  exportName: 'role',
});

new cdk.CfnOutput(stack, 'KeyPolicy', {
  value: myKey.keyId,
  exportName: 's3LocationKeyId',
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
    expect(deployResult.outputs.BucketPolicy).toContain('1');
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

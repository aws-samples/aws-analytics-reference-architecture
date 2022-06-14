/*
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/!**
 * Tests EmrEksCluster
 *
 * @group integ/notebook-platform
 *!/

import * as cdk from 'aws-cdk-lib';
import { ArnFormat, Aws } from 'aws-cdk-lib';
import { ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { NotebookPlatform, StudioAuthMode } from '../../src';
import { EmrEksCluster } from '../../src/emr-eks-platform';

jest.setTimeout(2000000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'notebookPlatformE2eTest');

const emrEksCluster = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/gromav',
});

const notebookPlatform = new NotebookPlatform(stack, 'platform-notebook', {
  emrEks: emrEksCluster,
  eksNamespace: 'notebookspace',
  studioName: 'testNotebook',
  studioAuthMode: StudioAuthMode.IAM,
});


const policy1 = new ManagedPolicy(stack, 'MyPolicy1', {
  statements: [
    new PolicyStatement({
      resources: ['*'],
      actions: ['s3:*'],
    }),
    new PolicyStatement({
      resources: [
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'logs',
          resource: '*',
          arnFormat: ArnFormat.NO_RESOURCE_NAME,
        }),
      ],
      actions: [
        'logs:*',
      ],
    }),
  ],
});

notebookPlatform.addUser([{
  identityName: 'janeDoe',
  notebookManagedEndpoints: [
    {
      emrOnEksVersion: 'emr-6.4.0-latest',
      executionPolicy: policy1,
    },
  ],
}]);

new cdk.CfnOutput(stack, 'EmrEksAdminRoleOutput', {
  value: emrEksCluster.eksCluster.adminRole.roleArn,
  exportName: 'emrEksAdminRole',
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
    expect(deployResult.outputs.emrEksAdminRole).toEqual('arn:aws:iam::123445678912:role/gromav');

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
*/

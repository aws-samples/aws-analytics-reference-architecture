// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests EmrEksCluster
 *
 * @group integ/notebook-platform
 */

import { ArnFormat, Aws, aws_iam, CfnOutput } from 'aws-cdk-lib';

import { TestStack } from './utils/TestStack';
import { NotebookPlatform, StudioAuthMode } from '../../src';
import { Autoscaler, EmrEksCluster } from '../../src/emr-eks-platform';
import { EmrVersion } from '../../src/emr-eks-platform/emr-eks-cluster';

jest.setTimeout(2000000);
// GIVEN
const testStack = new TestStack('notebookPlatformE2eTest');
const { stack } = testStack;

const emrEksCluster = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/gromav',
  autoscaling: Autoscaler.CLUSTER_AUTOSCALER,
});

const notebookPlatform = new NotebookPlatform(stack, 'platform-notebook', {
  emrEks: emrEksCluster,
  eksNamespace: 'notebookspace',
  studioName: 'testNotebook',
  studioAuthMode: StudioAuthMode.IAM,
});

const policy1 = new aws_iam.ManagedPolicy(stack, 'MyPolicy1', {
  statements: [
    new aws_iam.PolicyStatement({
      resources: ['*'],
      actions: ['s3:*'],
    }),
    new aws_iam.PolicyStatement({
      resources: [
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'logs',
          resource: '*',
          arnFormat: ArnFormat.NO_RESOURCE_NAME,
        }),
      ],
      actions: ['logs:*'],
    }),
  ],
});

notebookPlatform.addUser([
  {
    identityName: 'janeDoe',
    notebookManagedEndpoints: [
      {
        managedEndpointName: 'endpoint',
        emrOnEksVersion: EmrVersion.V6_4,
        executionPolicy: policy1,
      },
    ],
  },
]);

new CfnOutput(stack, 'EmrEksAdminRoleOutput', {
  value: emrEksCluster.eksCluster.adminRole.roleArn,
  exportName: 'emrEksAdminRole',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.emrEksAdminRole).toEqual('arn:aws:iam::123445678912:role/gromav');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

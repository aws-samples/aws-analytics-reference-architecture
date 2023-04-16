// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests EmrEksCluster
 *
 * @group integ/emr-eks/notebook-platform
 */

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';

import { Autoscaler, EmrEksCluster } from '../../src/emr-eks-platform';
import { NotebookPlatform, StudioAuthMode } from '../../src/notebook-platform';

jest.setTimeout(2000000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'EmrEksClustereE2eTest');

const emrEksCluster = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/my-role',
  autoscaling: Autoscaler.CLUSTER_AUTOSCALER,
});

new NotebookPlatform(stack, 'dataplatformIAMAuth', {
    emrEks: emrEksCluster,
    studioName: 'e2estudio',
    studioAuthMode: StudioAuthMode.IAM,
    eksNamespace: 'dataplatformiamauth',
  });

new cdk.CfnOutput(stack, 'EmrEksAdminRoleOutput', {
  value: emrEksCluster.eksCluster.adminRole.roleArn,
  exportName: 'emrEksAdminRole',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await deployStack(integTestApp, stack);
    
    // THEN
    expect(deployResult.outputs.emrEksAdminRole).toEqual('arn:aws:iam::123445678912:role/my-role');

    expect(deployResult.outputs.e2estudio).toMatch(/^https:\/\/.*/);

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
}, 9000000);

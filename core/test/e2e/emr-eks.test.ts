// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests EmrEksCluster
 *
 * @group integ/emr-eks-cluster
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './TestStack';

import { Autoscaler, EmrEksCluster } from '../../src/emr-eks-platform';

jest.setTimeout(2000000);
// GIVEN
const testStack = new TestStack('EmrEksClustereE2eTest');
const { stack } = testStack;

const emrEksCluster = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/my-role',
  autoscaling: Autoscaler.CLUSTER_AUTOSCALER,
});

new cdk.CfnOutput(stack, 'EmrEksAdminRoleOutput', {
  value: emrEksCluster.eksCluster.adminRole.roleArn,
  exportName: 'emrEksAdminRole',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.emrEksAdminRole).toEqual('arn:aws:iam::123445678912:role/my-role');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
}, 9000000);

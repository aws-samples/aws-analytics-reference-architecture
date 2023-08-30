// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Opensearch Cluster
 *
 * @group integ/opensearch-cluster
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './utils/TestStack';

import { OpensearchCluster } from '../../src';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('OpensearchClusterE2eTest');
const { stack } = testStack;

const accessRole = new cdk.aws_iam.Role(stack, 'AccessRole', {
  roleName: 'pipeline',
  assumedBy: new cdk.aws_iam.ServicePrincipal('ec2.amazonaws.com'),
});

OpensearchCluster.getOrCreate(stack, {
  accessRoles: [accessRole],
  adminUsername: 'admin',
  usernames: ['userA', 'userB'],
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    console.log('==============');
    console.log(JSON.stringify(deployResult, null, 2));
    console.log('==============');

    // THEN
    expect(true);
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

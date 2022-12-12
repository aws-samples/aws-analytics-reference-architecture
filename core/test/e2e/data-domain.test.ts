// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests DataDomain
*
* @group integ/data-domain
*/

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';

import { DataDomain } from '../../src';

jest.setTimeout(600000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'DataDomainE2eTest');

const domain = new DataDomain(stack, 'DataDomain', {
  domainName: 'test',
  centralAccountId: '123445678912',
  crawlerWorkflow: true,
});

new cdk.CfnOutput(stack, 'BucketName', {
  value: domain.dataLake.cleanBucket.bucketName,
  exportName: 'bucketName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await deployStack(integTestApp, stack);

    // THEN
    expect(deployResult.outputs.BucketName).toContain('clean-');
  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

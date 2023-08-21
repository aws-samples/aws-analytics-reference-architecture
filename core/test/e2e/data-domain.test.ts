// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomain
 *
 * @group integ/data-domain
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './TestStack';

import { DataDomain } from '../../src';

jest.setTimeout(600000);
// GIVEN
const testStack = new TestStack('DataDomainE2eTest');
const { stack } = testStack;

const domain = new DataDomain(stack, 'DataDomain', {
  domainName: 'test',
  centralAccountId: '1234567891011',
  crawlerWorkflow: true,
});

new cdk.CfnOutput(stack, 'BucketName', {
  value: domain.dataLake.cleanBucket.bucketName,
  exportName: 'bucketName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.BucketName).toContain('clean-');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

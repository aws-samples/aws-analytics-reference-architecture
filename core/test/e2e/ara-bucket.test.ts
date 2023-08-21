// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests AraBucket
 *
 * @group integ/ara-bucket
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './TestStack';

import { AraBucket } from '../../src/ara-bucket';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('AraBucketE2eTest');
const { stack } = testStack;

const araBucket = AraBucket.getOrCreate(stack, {
  bucketName: 'my-ara-bucket',
  serverAccessLogsPrefix: 'test',
});

new cdk.CfnOutput(stack, 'BucketName', {
  value: araBucket.bucketName,
  exportName: 'bucketName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.BucketName).toContain('my-ara-bucket-');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

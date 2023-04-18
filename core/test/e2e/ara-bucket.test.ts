// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests AraBucket
*
* @group integ/ara-bucket
*/

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';

import { AraBucket } from '../../src/ara-bucket';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'AraBucketE2eTest');

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
    const deployResult = await deployStack(integTestApp, stack);

    // THEN
    expect(deployResult.outputs.BucketName).toContain('my-ara-bucket-');
  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

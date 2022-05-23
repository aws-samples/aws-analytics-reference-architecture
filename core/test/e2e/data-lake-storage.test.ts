// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * Tests DataLakeStorage
 *
 * @group integ/data-lake/data-lake-storage
 */

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';
import { DataLakeStorage } from '../../src/data-lake-storage';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'DataLakeStorageE2eTest');

const dataLakeStorage = new DataLakeStorage(stack, 'MyDataLakeStorage');

new cdk.CfnOutput(stack, 'rawBucketName', {
  value: dataLakeStorage.rawBucket.bucketName,
  exportName: 'rawBucketName',
});

new cdk.CfnOutput(stack, 'cleanBucketName', {
  value: dataLakeStorage.cleanBucket.bucketName,
  exportName: 'cleanBucketName',
});

new cdk.CfnOutput(stack, 'transformBucketName', {
  value: dataLakeStorage.transformBucket.bucketName,
  exportName: 'transformBucketName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // WHEN
    const deployResult = await deployStack(integTestApp, stack);
    
    // THEN
    expect(deployResult.outputs.rawBucketName).toContain('ara-raw-');
    expect(deployResult.outputs.cleanBucketName).toContain('ara-clean-');
    expect(deployResult.outputs.transformBucketName).toContain('ara-transform-');

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * Tests DataLakeStorage
 *
 * @group integ/data-lake/data-lake-storage
 */

import * as cdk from 'aws-cdk-lib';
import { DataLakeStorage } from '../../src';
import { TestStack } from './TestStack';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('DataLakeStorageE2eTest');
const { stack } = testStack;

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
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.rawBucketName).toContain('raw-');
    expect(deployResult.cleanBucketName).toContain('clean-');
    expect(deployResult.transformBucketName).toContain('transform-');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

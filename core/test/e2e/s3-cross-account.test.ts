// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * Tests DataLakeStorage
 *
 * @group integ/lakeformation/s3crossaccount
 */

import { Key } from 'aws-cdk-lib/aws-kms';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';
import { S3CrossAccount } from '../../src/s3-cross-account';
 
jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'S3CrossAccountE2eTest');

const myKey = new Key(stack, 'MyKey', {
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
const myBucket = new Bucket(stack, 'MyBucket', {
    encryptionKey: myKey,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
});

new S3CrossAccount(stack, 'MyS3CrossAccount', {
  s3Bucket: myBucket,
  s3ObjectKey: 'test',
  accountId: cdk.Aws.ACCOUNT_ID,
});

new cdk.CfnOutput(stack, 'BucketPolicy', {
  value: myBucket.policy ? myBucket.policy.document.statementCount.toString() : '1',
  exportName: 'bucketPolicy',
});

new cdk.CfnOutput(stack, 'KeyPolicy', {
  value: myKey.keyId,
  exportName: 'keyId',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // WHEN
    const deployResult = await deployStack(integTestApp, stack);

    // THEN
    expect(deployResult.outputs.BucketPolicy).toContain('2');
  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

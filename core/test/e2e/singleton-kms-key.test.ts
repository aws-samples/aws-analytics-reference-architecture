// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SingletonGlueDatabase
 *
 * @group integ/singleton-kms-key
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './utils/TestStack';

import { SingletonKey } from '../../src/singleton-kms-key';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('SingletonKeyE2eTest');
const { stack } = testStack;

const singletonKey = SingletonKey.getOrCreate(stack, 'singleton_key_test');

new cdk.CfnOutput(stack, 'SingletonKeyId', {
  value: singletonKey.keyId,
  exportName: 'singletonKeyId',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.SingletonKeyId).toHaveLength(36);
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SingletonLaunchTemplate
 *
 * @group integ/singleton-launch-template
 */

import * as cdk from 'aws-cdk-lib';
import { TestStack } from './TestStack';

import { SingletonCfnLaunchTemplate } from '../../src/singleton-launch-template';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('SingletonCfnLaunchTemplateE2eTest');
const { stack } = testStack;

const singletonLaunchTemplate = SingletonCfnLaunchTemplate.getOrCreate(
  stack,
  'singleton-launch-template',
  ''
);

new cdk.CfnOutput(stack, 'SingletonLaunchTemplateName', {
  value: singletonLaunchTemplate.launchTemplateName || '',
  exportName: 'singletonLaunchTemplateName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.SingletonLaunchTemplateName).toEqual('singleton-launch-template');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

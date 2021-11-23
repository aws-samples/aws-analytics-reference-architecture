// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests singleton launch template
 *
 * @group unit/singleton/launch-template
 */

import { Stack } from '@aws-cdk/core';
import { SingletonCfnLaunchTemplate } from '../../src/singleton-launch-template';
import '@aws-cdk/assert/jest';

test('SingletonCfnLaunchTemplate', () => {

  const singletonCfnLaunchTemplateStack = new Stack();

  // Instantiate 2 LogBucket Constructs
  SingletonCfnLaunchTemplate.getOrCreate(singletonCfnLaunchTemplateStack, 'testName', 'testData');
  SingletonCfnLaunchTemplate.getOrCreate(singletonCfnLaunchTemplateStack, 'testName', 'testData');


  // Test if LogBucket is a singleton
  expect(singletonCfnLaunchTemplateStack).toCountResources('AWS::EC2::LaunchTemplate', 1);

  expect(singletonCfnLaunchTemplateStack).toHaveResource('AWS::EC2::LaunchTemplate', {
    LaunchTemplateName: 'testName',
    LaunchTemplateData: {
      UserData: 'testData',
    },
  });
});
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests singleton launch template
 *
 * @group unit/singleton/launch-template
 */

import { Stack } from 'aws-cdk-lib';
import { SingletonCfnLaunchTemplate } from '../../src/singleton-launch-template';
import { Template } from 'aws-cdk-lib/assertions';

test('SingletonCfnLaunchTemplate', () => {

  const singletonCfnLaunchTemplateStack = new Stack();

  // Instantiate 2 LogBucket Constructs
  SingletonCfnLaunchTemplate.getOrCreate(singletonCfnLaunchTemplateStack, 'testName', 'testData');
  SingletonCfnLaunchTemplate.getOrCreate(singletonCfnLaunchTemplateStack, 'testName', 'testData');

  const template = Template.fromStack(singletonCfnLaunchTemplateStack);

  // Test if LogBucket is a singleton
  template.resourceCountIs('AWS::EC2::LaunchTemplate', 1);

  template.hasResourceProperties('AWS::EC2::LaunchTemplate', {
    LaunchTemplateName: 'testName',
    LaunchTemplateData: {
      UserData: 'testData',
    },
  });
});
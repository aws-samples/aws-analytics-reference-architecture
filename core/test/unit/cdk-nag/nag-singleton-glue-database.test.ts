// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SingletonGlueDatabase
 *
 * @group unit/best-practice/singleton-glue-database
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Aspects, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { SingletonCfnLaunchTemplate } from '../../../src/singleton-launch-template';

const mockApp = new App();

const singletonLaunchTemplate = new Stack(mockApp, 'SingletonLaunchTemplate');

// Instantiate SingletonKey Construct
SingletonCfnLaunchTemplate.getOrCreate(singletonLaunchTemplate, 'test', 'test');

Aspects.of(singletonLaunchTemplate).add(new AwsSolutionsChecks());

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(singletonLaunchTemplate).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(singletonLaunchTemplate).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});


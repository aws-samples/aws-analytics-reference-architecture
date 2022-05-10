// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeStorage
 *
 * @group best-practice/singleton-kms-key
 */

import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { SingletonKey } from '../../src/singleton-kms-key';

const mockApp = new App();

const singletonKeyStack = new Stack(mockApp, 'SingletonKmsKeyStack');

// Instantiate SingletonKey Construct
SingletonKey.getOrCreate(singletonKeyStack, 'test');

Aspects.of(singletonKeyStack).add(new AwsSolutionsChecks());
  
test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(singletonKeyStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});
  
test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(singletonKeyStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});
  
  
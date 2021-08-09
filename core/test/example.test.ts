// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Stack } from '@aws-cdk/core';
import { Example } from '../src/example';
import '@aws-cdk/assert/jest';

test('example construct', () => {

  const exampleStack = new Stack();

  // Instantiate Example Construct with custom Props
  new Example(exampleStack, 'CustomExample', { name: 'message', value: 'hello!' });
  // Instantiate Example Construct without Props for getting default parameters
  new Example(exampleStack, 'DefaultExample', {});

  // Test if CfnOutput is similar to custom Props provided
  expect(exampleStack).toHaveOutput({ exportName: 'message', outputValue: 'hello!' });
  // Test if CfnOutput is similar to default parameters
  expect(exampleStack).toHaveOutput({ exportName: 'defaultMessage', outputValue: 'defaultValue!' });
});
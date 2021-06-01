import * as cdk from '@aws-cdk/core';
import { Example } from '../src/example';
import '@aws-cdk/assert/jest';

test('example construct', () => {

  const exampleStack = new cdk.Stack();

  // Instantiate Example Construct with customer Props
  new Example(exampleStack, 'CustomExample', { name: 'message', value: 'hello!' });
  // Instantiate Example Construct without Props for getting default parameters
  new Example(exampleStack, 'DefaultExample', {});

  // Test if CfnOutput is similar to customer Props provided
  expect(exampleStack).toHaveOutput({ exportName: 'message', outputValue: 'hello!' });
  // Test if CfnOutput is similar to default parameters
  expect(exampleStack).toHaveOutput({ exportName: 'defaultMessage', outputValue: 'defaultValue!' });
});
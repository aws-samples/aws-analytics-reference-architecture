// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Test example
 *
 * @group unit/other/test-example
 */

import { Stack } from 'aws-cdk-lib';
import { Example } from '../../src';
import { Template, Match } from 'aws-cdk-lib/assertions';
test('example construct', () => {
  const exampleStack = new Stack();

  const outputName = 'message';
  const outputValue = 'hello!';
  // Instantiate Example Construct with custom Props
  new Example(exampleStack, 'CustomExample', { name: outputName, value: outputValue });
  // Instantiate Example Construct without Props for getting default parameters
  new Example(exampleStack, 'DefaultExample', {});

  const template = Template.fromStack(exampleStack);
  // Test if CfnOutput is similar to custom Props provided
  template.hasOutput(
    '*',
    Match.objectEquals({
      Value: outputValue,
      Export: {
        Name: outputName,
      },
    })
  );
  // Test if CfnOutput is similar to default parameters
  template.hasOutput(
    '*',
    Match.objectEquals({
      Value: 'defaultValue!',
      Export: {
        Name: 'defaultMessage',
      },
    })
  );
});

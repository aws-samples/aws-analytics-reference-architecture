// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Test example
 *
 * @group integ/other/test-example
 */

import { App, Stack } from '@aws-cdk/core';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { Example } from '../../src/example';

// GIVEN
const expectedTestMessageOutput = 'Hello, World!';

const integTestApp = new App();
const stack = new Stack(integTestApp, 'ExampleIntegTest');

new Example(stack, 'example', { value: expectedTestMessageOutput });

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      profile: process.env.AWS_PROFILE,
    });
    const cloudFormation = new CloudFormationDeployments({ sdkProvider });

    // WHEN
    const deployResult = await cloudFormation.deployStack({
      stack: stackArtifact,
    });

    // THEN
    expect(Object.values(deployResult.outputs)[0]).toEqual(expectedTestMessageOutput);
  }, 9000000);
});

afterAll(async () => {
  if (!process.env.DISABLE_TEARDOWN) {
    const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      profile: process.env.AWS_PROFILE,
    });
    const cloudFormation = new CloudFormationDeployments({ sdkProvider });

    await cloudFormation.destroyStack({
      stack: stackArtifact,
    });
  }
}, 9000000);

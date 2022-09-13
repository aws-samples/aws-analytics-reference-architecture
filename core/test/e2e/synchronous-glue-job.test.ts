// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SynchronousGlueJob
 *
 * @group integ/synchronous-glue-job
 */

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';
import { Code, GlueVersion, JobExecutable, PythonVersion } from '@aws-cdk/aws-glue-alpha';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

import { SynchronousGlueJob } from '../../src/synchronous-glue-job';
import path from 'path';

jest.setTimeout(300000);

//GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'SynchronousGlueJobE2eTest');

const glueRole = new Role(stack, 'GlueJobRole', {
    assumedBy: new ServicePrincipal('glue.amazonaws.com'),
});

new SynchronousGlueJob(stack, 'MyJob', {
  executable: JobExecutable.pythonShell({
    glueVersion: GlueVersion.V1_0,
    pythonVersion: PythonVersion.THREE,
    script: Code.fromAsset(path.join(__dirname, '../resources/glue-script/synchronous-glue-job-script.py')),
  }),
  role: glueRole,
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    await deployStack(integTestApp, stack);
    
    // THEN
    expect(true);

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});
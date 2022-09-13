// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SynchronousGlueJob
 *
 * @group unit/best-practice/synchronous-glue-job
 */

import { Code, GlueVersion, JobExecutable, PythonVersion } from '@aws-cdk/aws-glue-alpha';
import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { SynchronousGlueJob } from '../../../src';
import * as path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies


const mockApp = new App();

const synchronousGlueJobStack = new Stack(mockApp, 'SynchronousGlueJob');

// Instantiate a SynchronousGlueJob custom resource
new SynchronousGlueJob(synchronousGlueJobStack, 'MyJob', {
  executable: JobExecutable.pythonShell({
    glueVersion: GlueVersion.V1_0,
    pythonVersion: PythonVersion.THREE,
    script: Code.fromAsset(path.join(__dirname, '../../resources/glue-script/synchronous-glue-job-script.py')),
  }),
});

Aspects.of(synchronousGlueJobStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/SynchronousGlueJob/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used by default service role when no role is provided to L2 construct' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/SynchronousGlueJob/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Managed policy used by Glue when no role is provided to L2 construct' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Default permissions from the CDK Custom Resource Provider framework on the waiter State Machine' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/framework-onTimeout/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Default runtime version used by the CDK Custom Resource Provider framework' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/framework-isComplete/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Default runtime version used by the CDK Custom Resource Provider framework' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/framework-onEvent/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Default runtime version used by the CDK Custom Resource Provider framework' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/framework-onTimeout/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Default permissions from the CDK Custom Resource Provider framework on the timeout service role' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Default permissions from the CDK Custom Resource Provider framework on the onEvent service role' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/framework-isComplete/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Default permissions from the CDK Custom Resource Provider framework on the isComplete service role' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/framework-onTimeout/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Managed policy used by the CDK Custom Resource Provider framework on the timeout service role' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/framework-isComplete/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Managed policy used by the CDK Custom Resource Provider framework on the isComplete service role' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/SynchronousGlueJobCRP/framework-onEvent/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Managed policy used by the CDK Custom Resource Provider framework on the onEvent service role' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/LogRetentionLambdaExecutionRolePolicyMyJobWaitFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Default permissions from the CDK Custom Resource Provider framework in the policy for log retention' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/LambdaExecutionRolePolicyMyJobWaitFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Using tags to scope down the policy on jobs created by the SynchronousGlueJob construct. Wildcard permissions also used by CDK Custom Resource Framework for log' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/LogRetentionLambdaExecutionRoleMyJobStartFn/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Default permissions from the CDK Custom Resource Provider framework in the policy for log retention' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/LogRetentionLambdaExecutionRolePolicyMyJobStartFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Default permissions from the CDK Custom Resource Provider framework in the policy for log retention' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/MyJob/LambdaExecutionRolePolicyMyJobStartFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Using tags to scope down the policy on jobs created by the SynchronousGlueJob construct' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/SynchronousGlueJob/Resource',
  [{ id: 'AwsSolutions-GL3', reason: 'Glue job properties for security configuration is out of scope of the construct (passed by construct consumer)' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousGlueJobStack,
  'SynchronousGlueJob/SynchronousGlueJob/Resource',
  [{ id: 'AwsSolutions-GL1', reason: 'Glue job properties for security configuration is out of scope of the construct (passed by construct consumer)' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(synchronousGlueJobStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(synchronousGlueJobStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

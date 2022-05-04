// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataGenerator
 *
 * @group best-practice/data-generator
 */

import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataGenerator } from '../../src';
import { Dataset } from '../../src';

const mockApp = new App();

const dataGeneratorStack = new Stack(mockApp, 'data-generator');
// Instantiate a DataGenerator
const predefinedGenerator = new DataGenerator(dataGeneratorStack, 'PredefinedGenerator', {
  sinkArn: 'arn:aws:s3:::test-bucket',
  dataset: Dataset.RETAIL_100GB_STORE_SALE,
});

Aspects.of(predefinedGenerator).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateSourceTable/LambdaExecutionRolePolicySynchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for cloudwatch log policy which cannot be scoped down further' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateSourceTable/LogRetentionLambdaExecutionRolePolicySynchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for the lambda logs, cannot be scoped down further due to not knowing the lambda name at build compile time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateSourceTable/LogRetentionLambdaExecutionRoleSynchronousAthenaCrStart/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for the put log retention, cannot be scoped down further due to not knowing the lambda name at build compile time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateSourceTable/LambdaExecutionRolePolicySynchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/DataGenerator/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for S3 path and for glue database' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/LogRetentionLambdaExecutionRolePolicyDataGeneratorFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy scoped down, log group not know at compile time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/LambdaExecutionRolePolicyDataGeneratorFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for PutLogEvents, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateTargetTable/LambdaExecutionRolePolicySynchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for PutLogEvents, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateSourceTable/LambdaExecutionRolePolicySynchronousAthenaQueryCRP/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateSourceTable/LogRetentionLambdaExecutionRolePolicySynchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateTargetTable/LogRetentionLambdaExecutionRolePolicySynchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateTargetTable/LambdaExecutionRolePolicySynchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for PutLogEvents, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateTargetTable/LambdaExecutionRolePolicySynchronousAthenaQueryCRP/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateTargetTable/LogRetentionLambdaExecutionRolePolicySynchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateSourceTable/LambdaExecutionRoleCRSynchronousAthenaQueryCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateSourceTable/SynchronousAthenaQueryCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateTargetTable/SynchronousAthenaQueryCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/PredefinedGenerator/CreateTargetTable/LambdaExecutionRoleCRSynchronousAthenaQueryCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataGeneratorStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataGeneratorStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

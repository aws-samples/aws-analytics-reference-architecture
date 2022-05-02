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
const predefinedGenerator = new DataGenerator(dataGeneratorStack, 'predefinedGenerator', {
  sinkArn: 'arn:aws:s3:::test-bucket',
  dataset: Dataset.RETAIL_100GB_STORE_SALE,
});

Aspects.of(predefinedGenerator).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createSourceTable/lambdaExecutionRolePolicyara-synchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for cloudwatch log policy which cannot be scoped down further' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createSourceTable/logRetentionLambdaExecutionRolePolicyara-synchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for the lambda logs, cannot be scoped down further due to not knowing the lambda name at build compile time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createSourceTable/logRetentionLambdaExcutionRoleara-synchronousAthenaCrStart/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for the put log retention, cannot be scoped down further due to not knowing the lambda name at build compile time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createSourceTable/lambdaExecutionRolePolicyara-synchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/dataGenerator/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for S3 path and for glue database' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/logRetentionLambdaExecutionRolePolicyara-DataGeneratorFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy scoped down, log group not know at compile time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/lambdaExecutionRolePolicyara-DataGeneratorFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for PutLogEvents, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createTargetTable/lambdaExecutionRolePolicyara-synchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for PutLogEvents, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createSourceTable/lambdaExecutionRolePolicysynchronousAthenaQueryCRP/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createSourceTable/logRetentionLambdaExecutionRolePolicyara-synchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createTargetTable/logRetentionLambdaExecutionRolePolicyara-synchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createTargetTable/lambdaExecutionRolePolicyara-synchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for PutLogEvents, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createTargetTable/lambdaExecutionRolePolicysynchronousAthenaQueryCRP/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createTargetTable/logRetentionLambdaExecutionRolePolicyara-synchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used for creating cloudwatch log group and putevent, which is only known once lambda is executed' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createSourceTable/lambdaExcutionRoleCRsynchronousAthenaQueryCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createSourceTable/synchronousAthenaQueryCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createTargetTable/synchronousAthenaQueryCRP/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataGeneratorStack,
  'data-generator/predefinedGenerator/createTargetTable/lambdaExcutionRoleCRsynchronousAthenaQueryCRP/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card is used for resource created at run time. This is created by CDK.' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataGeneratorStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataGeneratorStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});

import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataGenerator } from '../data-generator';
import { Dataset } from '../datasets';

const mockApp = new App();

const dataGeneratorStack = new Stack(mockApp, 'data-generator');
// Instantiate a DataGenerator
const predefinedGenerator = new DataGenerator(dataGeneratorStack, 'predefinedGenerator', {
  sinkArn: 'arn:aws:s3:::test-bucket',
  dataset: Dataset.RETAIL_1GB_STORE_SALE,
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

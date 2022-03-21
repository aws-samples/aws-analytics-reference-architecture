import { App, Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { SynchronousAthenaQuery } from '../synchronous-athena-query';
// eslint-disable-next-line import/no-extraneous-dependencies

const mockApp = new App();

const synchronousAthenaStack = new Stack(mockApp, 'synchronous-athena-query');
// Instantiate a CrawlerStartWait custom resource
new SynchronousAthenaQuery(synchronousAthenaStack, 'SynchronousAthenaQueryTes', {
  statement: 'SELECT * FROM test.test;',
  resultPath: {
    bucketName: 'log',
    objectKey: 'query-result',
  },
});

Aspects.of(synchronousAthenaStack).add(new AwsSolutionsChecks());


NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/lambdaExecutionRolePolicyara-synchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/lambdaExecutionRolePolicysynchronousAthenaQueryCRP/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time ' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/logRetentionLambdaExecutionRolePolicyara-synchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/lambdaExecutionRolePolicyara-synchronousAthenaCrWait/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/logRetentionLambdaExcutionRoleara-synchronousAthenaCrStart/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  synchronousAthenaStack,
  'synchronous-athena-query/SynchronousAthenaQueryTes/logRetentionLambdaExecutionRolePolicyara-synchronousAthenaCrStart/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

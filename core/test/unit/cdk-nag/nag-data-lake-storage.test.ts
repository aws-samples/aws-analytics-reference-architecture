/**
 * Tests data-generator
 *
 * @group unit/best-practice/data-lake-storage
 */

import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataLakeStorage } from '../../../src/data-lake-storage';

const mockApp = new App();

const dataLakeStorageStack = new Stack(mockApp, 'data-lake-storage');

// Instantiate DataLakeStorage Construct with custom Props
new DataLakeStorage(dataLakeStorageStack, 'DataLakeStorageTest', {
  rawInfrequentAccessDelay: 1,
  rawArchiveDelay: 2,
  cleanInfrequentAccessDelay: 1,
  cleanArchiveDelay: 2,
  transformInfrequentAccessDelay: 1,
  transformArchiveDelay: 2,
});


Aspects.of(dataLakeStorageStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeStorageStack,
  'data-lake-storage/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'This bucket is used for s3 server access log' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataLakeStorageStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataLakeStorageStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});


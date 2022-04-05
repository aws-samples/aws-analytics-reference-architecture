// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeStorage
 *
 * @group best-practice/data-lake-storage
 */

import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataLakeStorage } from '../../src/data-lake-storage';

const mockApp = new App();

const dataLakeStorageStack = new Stack(mockApp, 'data-lake-storage');

// Instantiate DataLakeStorage Construct with custom Props
new DataLakeStorage(dataLakeStorageStack, 'DataLakeStorageTest', {
  rawInfrequentAccessDelay: 90,
  rawArchiveDelay: 180,
  cleanInfrequentAccessDelay: 180,
  cleanArchiveDelay: 360,
  transformInfrequentAccessDelay: 180,
  transformArchiveDelay: 360,
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


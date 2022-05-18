// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeExporter
 *
 * @group best-practice/data-lake/exporter
 */


import { Annotations, Match } from '@aws-cdk/assertions';
import { Database, DataFormat, Table } from '@aws-cdk/aws-glue';
import { Stream } from '@aws-cdk/aws-kinesis';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataLakeExporter } from '../../src/data-lake-exporter';

const mockApp = new App();

const dataLakeExporterStack = new Stack(mockApp, 'data-lake-exporter');

const stream = new Stream(dataLakeExporterStack, 'testStream');
const db = new Database(dataLakeExporterStack, 'testDB', { databaseName: 'test_db' });
const table = new Table(dataLakeExporterStack, 'testTable', {
  database: db,
  tableName: 'test_table',
  dataFormat: DataFormat.JSON,
  columns: [
    {
      name: 'a',
      type: {
        isPrimitive: true,
        inputString: 'STRING',
      },
    },
  ],
});
const bucket = new Bucket(dataLakeExporterStack, 'Bucket')

new DataLakeExporter(dataLakeExporterStack, 'testExporter', {
  sinkBucket: bucket,
  sourceKinesisDataStream: stream,
  sourceGlueDatabase: db,
  sourceGlueTable: table,
});

Aspects.of(dataLakeExporterStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/testTable/Bucket/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'S3 Bucket imported cannot modify its properties, it is set by the user' },
    { id: 'AwsSolutions-S2', reason: 'S3 Bucket imported cannot modify its properties, it is set by the user' },
    { id: 'AwsSolutions-S3', reason: 'S3 Bucket imported cannot modify its properties, it is set by the user' },
    { id: 'AwsSolutions-S10', reason: 'S3 Bucket imported cannot modify its properties, it is set by the user' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/testStream/Resource',
  [{ id: 'AwsSolutions-KDS3', reason: 'This is for demo and PoC purpose only, to reduce the cost encryption is not with CMK is not used' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/testExporter/managedPolicyKinesisFirehose/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'wild card needed for the putting object on the given path' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/testExporter/dataLakeExporterRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Using grantRead and grantWrite methods on S3 Bucket, Kinesis Data Stream and Glue Table generate widlcard permissions' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/testExporter/dataLakeExporter',
  [{ id: 'AwsSolutions-KDF1', reason: 'Kinesis Firehose does not support encryption when used with KDS integration' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/Bucket/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'The S3 Bucket is used for testing the Construct only' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/Bucket/Resource',
  [{ id: 'AwsSolutions-S2', reason: 'The S3 Bucket is used for testing the Construct only' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/Bucket/Resource',
  [{ id: 'AwsSolutions-S3', reason: 'The S3 Bucket is used for testing the Construct only' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/Bucket/Resource',
  [{ id: 'AwsSolutions-S10', reason: 'The S3 Bucket is used for testing the Construct only' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataLakeExporterStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataLakeExporterStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

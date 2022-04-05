/**
 * Tests data-exporter
 *
 * @group best-practice/data-lake-exporter
 */


import { Annotations, Match } from '@aws-cdk/assertions';
import { Database, DataFormat, Table } from '@aws-cdk/aws-glue';
import { Stream } from '@aws-cdk/aws-kinesis';
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


new DataLakeExporter(dataLakeExporterStack, 'testExporter', {
  sinkLocation: {
    bucketName: 'test',
    objectKey: 'test',
  },
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
  'data-lake-exporter/testExporter/dataLakeExporterRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wild card used at the object level, to allow access to the bucket' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataLakeExporterStack,
  'data-lake-exporter/testStream/Resource',
  [{ id: 'AwsSolutions-KDS3', reason: 'This is for demo and PoC purpose only, to reduce the cost encryption is not with CMK is not used' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataLakeExporterStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataLakeExporterStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});

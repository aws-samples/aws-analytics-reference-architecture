import { Database, DataFormat, Table } from '@aws-cdk/aws-glue';
import { Stream } from '@aws-cdk/aws-kinesis';
import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { DataLakeExporter } from '../data-lake-exporter';

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

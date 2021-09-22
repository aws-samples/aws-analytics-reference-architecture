import { Stream } from '@aws-cdk/aws-kinesis';
import { Stack } from '@aws-cdk/core';
import { DataLakeExporter } from '../src/data-lake-exporter';
import '@aws-cdk/assert/jest';
import { Database, DataFormat, Table } from '@aws-cdk/aws-glue';

test('dataLakeExporter', () => {
  const dataLakeExporterStack = new Stack();

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

  // TODO: add tests (refer to data-lake-storage.test.ts)

});

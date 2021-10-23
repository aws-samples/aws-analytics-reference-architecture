import { Stream } from '@aws-cdk/aws-kinesis';
import { Stack } from '@aws-cdk/core';
import { DataLakeExporter } from '../src/data-lake-exporter';
import '@aws-cdk/assert/jest';
import { Database, DataFormat, Table } from '@aws-cdk/aws-glue';
import { RetentionDays } from '@aws-cdk/aws-logs';
import {
  SynthUtils,
} from '@aws-cdk/assert';


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
  // Test if the stack has S3 Buckets
  expect(dataLakeExporterStack).toHaveResource('AWS::S3::Bucket');

  // Test if stack has log group
  expect(dataLakeExporterStack).toHaveResourceLike('AWS::Logs::LogGroup', {
    LogGroupName: '/data-lake-exporter/',
    RetentionInDays: RetentionDays.ONE_DAY,
  });

  //Test stack for firehose stream
  expect(dataLakeExporterStack).toHaveResourceLike('AWS::KinesisFirehose::DeliveryStream', {
    ExtendedS3DestinationConfiguration: {
      BufferingHints: {
        IntervalInSeconds: 900,
        SizeInMBs: 128,
      },
    },
  });

  expect(SynthUtils.toCloudFormation(dataLakeExporterStack)).toMatchSnapshot();

});

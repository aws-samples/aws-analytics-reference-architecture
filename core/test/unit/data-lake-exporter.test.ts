// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Datalake Exporter
 *
 * @group unit/datalake/exporter
 */

import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Stack } from 'aws-cdk-lib';
import { DataLakeExporter } from '../../src/data-lake-exporter';
import { Database, DataFormat, Table } from '@aws-cdk/aws-glue-alpha';
import { Template } from 'aws-cdk-lib/assertions';
import { Stream } from 'aws-cdk-lib/aws-kinesis';


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
  const bucket = new Bucket(dataLakeExporterStack, 'Bucket')

  new DataLakeExporter(dataLakeExporterStack, 'testExporter', {
    sinkBucket: bucket,
    sinkObjectKey: 'test',
    sourceKinesisDataStream: stream,
    sourceGlueDatabase: db,
    sourceGlueTable: table,
  });

  const template = Template.fromStack(dataLakeExporterStack);

  // TODO: add tests (refer to data-lake-storage.test.ts)
  // Test if the stack has S3 Buckets
  template.hasResource('AWS::S3::Bucket', 1);

  // Test if stack has log group
  template.hasResourceProperties('AWS::Logs::LogGroup', {
    LogGroupName: '/aws/data-lake-exporter/',
    RetentionInDays: RetentionDays.ONE_WEEK,
  });

  //Test stack for firehose stream
  template.hasResourceProperties('AWS::KinesisFirehose::DeliveryStream', {
    ExtendedS3DestinationConfiguration: {
      BufferingHints: {
        IntervalInSeconds: 900,
        SizeInMBs: 128,
      },
    },
  });

  expect(template).toMatchSnapshot();
});

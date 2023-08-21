// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeExporter
 *
 * @group integ/data-lake/exporter
 */

import { Database, DataFormat, Table } from '@aws-cdk/aws-glue-alpha';
import { Stream } from 'aws-cdk-lib/aws-kinesis';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';
import { TestStack } from './TestStack';

import { DataLakeExporter } from '../../src/data-lake-exporter';
import { LakeFormationAdmin } from '../../src/lake-formation';

jest.setTimeout(100000);
// GIVEN
const testStack = new TestStack('DataLakeExporterE2eTest');
const { stack } = testStack;

LakeFormationAdmin.addCdkExecRole(stack, 'DataLakeExporterLfAdmin');

const sinkBucket = new Bucket(stack, 'SinkBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});
const sourceGlueDatabase = new Database(stack, 'SourceDatabase', {
  databaseName: 'data_lake_exporter_test',
});
const sourceGlueTable = new Table(stack, 'SourceTable', {
  tableName: 'data_lake_exporter_test',
  database: sourceGlueDatabase,
  columns: [
    {
      name: 'test',
      type: {
        isPrimitive: true,
        inputString: 'STRING',
      },
    },
  ],
  dataFormat: DataFormat.JSON,
});
const sourceKinesisStream = new Stream(stack, 'SourceStream');

new DataLakeExporter(stack, 'DataLakeExporter', {
  sinkBucket: sinkBucket,
  sourceGlueDatabase: sourceGlueDatabase,
  sourceGlueTable: sourceGlueTable,
  sourceKinesisDataStream: sourceKinesisStream,
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    await testStack.deploy();

    // THEN
    expect(true);
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
});

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
import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { DataLakeExporter } from '../../src/data-lake-exporter';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'DataLakeExporterE2eTest');

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
    const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      profile: process.env.AWS_PROFILE,
    });
    const cloudFormation = new CloudFormationDeployments({ sdkProvider });

    // WHEN
    /*const deployResult = */await cloudFormation.deployStack({
      stack: stackArtifact,
      rollback: false,
    });

    // THEN
    expect(true);

  }, 9000000);
});

afterAll(async () => {
  const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    profile: process.env.AWS_PROFILE,
  });
  const cloudFormation = new CloudFormationDeployments({ sdkProvider });

  await cloudFormation.destroyStack({
    stack: stackArtifact,
  });
});

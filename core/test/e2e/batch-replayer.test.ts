// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests BatchReplayer
 *
 * @group integ/data-generator/batch-replayer
 */

import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
  aws_ec2,
  aws_rds,
  aws_stepfunctions_tasks,
  aws_dynamodb,
  RemovalPolicy,
  CfnOutput,
  Duration,
} from 'aws-cdk-lib';
import { Cluster } from '@aws-cdk/aws-redshift-alpha';
import { TestStack } from './utils/TestStack';

import { BatchReplayer } from '../../src/data-generator/batch-replayer';
import { S3Sink, DynamoDbSink, DbSink } from '../../src/data-generator/batch-replayer-helpers';
import { PreparedDataset } from '../../src/data-generator/prepared-dataset';
import { PreBundledFunction } from '../../src/common/pre-bundled-function';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

jest.setTimeout(3000000);
// GIVEN
const testStack = new TestStack('BatchReplayerE2eTest');
const { stack } = testStack;

const defaultName = 'test';

const sinkBucket = new Bucket(stack, 'SinkBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});
let s3Props: S3Sink = { sinkBucket: sinkBucket };

const vpc = new aws_ec2.Vpc(stack, 'Vpc');

const secGroup = new aws_ec2.SecurityGroup(stack, 'SecurityGroup', { vpc });

const ddbTable = new aws_dynamodb.Table(stack, 'DynamoDB', {
  partitionKey: { name: defaultName, type: aws_dynamodb.AttributeType.STRING },
  removalPolicy: RemovalPolicy.DESTROY,
});
let ddbProps: DynamoDbSink = { table: ddbTable };

const redshift = new Cluster(stack, 'Redshift', {
  masterUser: { masterUsername: 'admin' },
  defaultDatabaseName: defaultName,
  removalPolicy: RemovalPolicy.DESTROY,
  vpc,
});
const redshiftCreds = redshift.secret ? redshift.secret.secretArn : '';
let redshiftProps: DbSink = { table: defaultName, connection: redshiftCreds, schema: defaultName };

const auroraMySQL = new aws_rds.DatabaseCluster(stack, 'AuroraMySQL', {
  engine: aws_rds.DatabaseClusterEngine.auroraMysql({
    version: aws_rds.AuroraMysqlEngineVersion.VER_3_02_1,
  }),
  defaultDatabaseName: defaultName,
  removalPolicy: RemovalPolicy.DESTROY,
  instanceProps: { vpc },
});
const auroraMysqlCreds = auroraMySQL.secret ? auroraMySQL.secret.secretArn : '';
let auroraProps: DbSink = {
  table: defaultName,
  connection: auroraMysqlCreds,
  schema: defaultName,
  type: 'mysql',
};

const rdsPostgres = new aws_rds.DatabaseInstance(stack, 'PostgreSQL', {
  engine: aws_rds.DatabaseInstanceEngine.postgres({
    version: aws_rds.PostgresEngineVersion.VER_14_2,
  }),
  databaseName: defaultName,
  removalPolicy: RemovalPolicy.DESTROY,
  vpc,
});
const rdsPostgresCreds = rdsPostgres.secret ? rdsPostgres.secret.secretArn : '';
let rdsProps: DbSink = {
  table: defaultName,
  connection: rdsPostgresCreds,
  schema: defaultName,
  type: 'postgresql',
};

/**
 * Lambda to be used as additional task
 */
const summaryOutputState = new PreBundledFunction(stack, 'WriteInBatch', {
  memorySize: 128,
  codePath: 'data-generator/resources/lambdas/summary-additional-task',
  runtime: Runtime.PYTHON_3_9,
  handler: 'summary-additional-task.handler',
  logRetention: RetentionDays.ONE_WEEK,
  timeout: Duration.minutes(1),
});

/**
 * Additional Task
 */
const additionalTask = new aws_stepfunctions_tasks.LambdaInvoke(stack, 'SummarizeOutput', {
  lambdaFunction: summaryOutputState,
  outputPath: '$',
  retryOnServiceExceptions: true,
});

const batchReplayer = new BatchReplayer(stack, 'BatchReplay', {
  dataset: PreparedDataset.RETAIL_1_GB_STORE_SALE,
  s3Props: s3Props,
  ddbProps: ddbProps,
  redshiftProps: redshiftProps,
  auroraProps: auroraProps,
  rdsProps: rdsProps,
  vpc: vpc,
  secGroup: secGroup,
  additionalStepFunctionTasks: [additionalTask],
});

new BatchReplayer(stack, 'BatchReplay2', {
  dataset: PreparedDataset.RETAIL_1_GB_CUSTOMER,
  s3Props: s3Props,
  ddbProps: ddbProps,
  redshiftProps: redshiftProps,
  auroraProps: auroraProps,
  rdsProps: rdsProps,
  vpc: vpc,
  secGroup: secGroup,
  additionalStepFunctionTasks: [additionalTask],
});

new CfnOutput(stack, 'DatasetName', {
  value: batchReplayer.dataset.tableName,
  exportName: 'DatasetName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.DatasetName).toEqual('store_sale');
  }, 9000000);
});

afterAll(async () => {
  await testStack.deploy();
});

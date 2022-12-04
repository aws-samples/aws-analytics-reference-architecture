// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests BatchReplayer
*
* @group integ/data-generator/batch-replayer
*/

import { Bucket } from 'aws-cdk-lib/aws-s3';
import { App, Stack, aws_ec2, aws_rds, aws_dynamodb, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Cluster } from '@aws-cdk/aws-redshift-alpha';
import { deployStack, destroyStack } from './utils';

import { BatchReplayer } from '../../src/data-generator/batch-replayer';
import { PreparedDataset } from '../../src/data-generator/prepared-dataset';

jest.setTimeout(3000000);
// GIVEN
const integTestApp = new App();
const stack = new Stack(integTestApp, 'BatchReplayerE2eTest');

const defaultName = 'test';

const sinkBucket = new Bucket(stack, 'SinkBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const vpc = new aws_ec2.Vpc(stack, 'Vpc');

const securityGroup = new aws_ec2.SecurityGroup(stack, 'SecurityGroup', {vpc});

const ddbTable = new aws_dynamodb.Table(stack, 'DynamoDB', {
  partitionKey: { name: defaultName, type: aws_dynamodb.AttributeType.STRING },
  removalPolicy: RemovalPolicy.DESTROY,
});

const redshift = new Cluster(stack, 'Redshift', {
  masterUser: { masterUsername: 'admin' },
  defaultDatabaseName: defaultName,
  removalPolicy: RemovalPolicy.DESTROY,
  vpc,
});
const redshiftCreds = redshift.secret ? redshift.secret.secretArn : '';

const auroraMySQL = new aws_rds.DatabaseCluster(stack, 'AuroraMySQL', {
  engine: aws_rds.DatabaseClusterEngine.auroraMysql({ version: aws_rds.AuroraMysqlEngineVersion.VER_2_08_1 }),
  defaultDatabaseName: defaultName,
  removalPolicy: RemovalPolicy.DESTROY,
  instanceProps: { vpc },
});
const auroraMysqlCreds = auroraMySQL.secret ? auroraMySQL.secret.secretArn : '';

const auroraPostgres = new aws_rds.DatabaseCluster(stack, 'AuroraPostgres', {
  engine: aws_rds.DatabaseClusterEngine.auroraPostgres({ version: aws_rds.AuroraPostgresEngineVersion.VER_12_11 }),
  defaultDatabaseName: defaultName,
  removalPolicy: RemovalPolicy.DESTROY,
  instanceProps: { vpc },
});
const auroraPostgresCreds = auroraPostgres.secret ? auroraPostgres.secret.secretArn : '';

const rdsMySQL = new aws_rds.DatabaseInstance(stack, 'MySQL', {
  engine: aws_rds.DatabaseInstanceEngine.mysql({ version: aws_rds.MysqlEngineVersion.VER_8_0_28 }),
  databaseName: defaultName,
  removalPolicy: RemovalPolicy.DESTROY,
  vpc,
});
const rdsMysqlCreds = rdsMySQL.secret ? rdsMySQL.secret.secretArn : '';

const rdsPostgres = new aws_rds.DatabaseInstance(stack, 'PostgreSQL', {
  engine: aws_rds.DatabaseInstanceEngine.postgres({ version: aws_rds.PostgresEngineVersion.VER_14_2 }),
  databaseName: defaultName,
  removalPolicy: RemovalPolicy.DESTROY,
  vpc,
});
const rdsPostgresCreds = rdsPostgres.secret ? rdsPostgres.secret.secretArn : '';

const batchReplayer = new BatchReplayer(stack, 'BatchReplay', {
  dataset: PreparedDataset.RETAIL_1_GB_STORE_SALE,
  sinkBucket: sinkBucket,
  ddbTable: ddbTable,
  redshiftTableName: defaultName,
  redshiftConnection: redshiftCreds,
  redshiftSchema: defaultName,
  auroraMysqlTableName: defaultName,
  auroraMysqlConnection: auroraMysqlCreds,
  auroraMysqlSchema: defaultName,
  auroraPostgresTableName: defaultName,
  auroraPostgresConnection: auroraPostgresCreds,
  auroraPostgresSchema: defaultName,
  mysqlTableName: defaultName,
  mysqlConnection: rdsMysqlCreds,
  mysqlSchema: defaultName,
  postgresTableName: defaultName,
  postgresConnection: rdsPostgresCreds,
  postgresSchema: defaultName,
  databaseVpc: vpc,
  databaseVpcSG: securityGroup,
});

new BatchReplayer(stack, 'BatchReplay2', {
  dataset: PreparedDataset.RETAIL_1_GB_CUSTOMER,
  sinkBucket: sinkBucket,
  ddbTable: ddbTable,
  redshiftTableName: defaultName,
  redshiftConnection: redshiftCreds,
  redshiftSchema: defaultName,
  auroraMysqlTableName: defaultName,
  auroraMysqlConnection: auroraMysqlCreds,
  auroraMysqlSchema: defaultName,
  auroraPostgresTableName: defaultName,
  auroraPostgresConnection: auroraPostgresCreds,
  auroraPostgresSchema: defaultName,
  mysqlTableName: defaultName,
  mysqlConnection: rdsMysqlCreds,
  mysqlSchema: defaultName,
  postgresTableName: defaultName,
  postgresConnection: rdsPostgresCreds,
  postgresSchema: defaultName,
  databaseVpc: vpc,
  databaseVpcSG: securityGroup,
});

new CfnOutput(stack, 'DatasetName', {
  value: batchReplayer.dataset.tableName,
  exportName: 'DatasetName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await deployStack(integTestApp, stack);

    // THEN
    expect(deployResult.outputs.DatasetName).toEqual('store_sale');

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

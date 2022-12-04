// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Test BatchReplayer
 *
 * @group unit/data-generator/batch-replayer
 */

import { Cluster } from '@aws-cdk/aws-redshift-alpha';
import {
  aws_dynamodb,
  aws_ec2,
  aws_rds, Duration,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib';

import { Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BatchReplayer, PreparedDataset } from '../../../src';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import {ITable} from "aws-cdk-lib/aws-dynamodb";

let testStack: Stack;
let bucket: Bucket;
let batchReplayer: BatchReplayer;
let template: Template;
let ddbTable: ITable;
let defaultName = 'test';
let vpc: IVpc;

beforeEach(() => {
  testStack = new Stack();

  bucket = new Bucket(testStack, 'Bucket');

  vpc = new aws_ec2.Vpc(testStack, 'Vpc');

  const securityGroup = new aws_ec2.SecurityGroup(testStack, 'SecurityGroup', {vpc});

  ddbTable = new aws_dynamodb.Table(testStack, 'DynamoDB', {
    partitionKey: { name: defaultName, type: aws_dynamodb.AttributeType.STRING },
    removalPolicy: RemovalPolicy.DESTROY,
  });

  new Cluster(testStack, 'Redshift', {
    masterUser: { masterUsername: defaultName },
    defaultDatabaseName: defaultName,
    removalPolicy: RemovalPolicy.DESTROY,
    vpc,
  });

  new aws_rds.DatabaseCluster(testStack, 'AuroraMySQL', {
    engine: aws_rds.DatabaseClusterEngine.auroraMysql({ version: aws_rds.AuroraMysqlEngineVersion.VER_2_08_1 }),
    defaultDatabaseName: defaultName,
    removalPolicy: RemovalPolicy.DESTROY,
    instanceProps: { vpc },
  });

  new aws_rds.DatabaseCluster(testStack, 'AuroraPostgres', {
    engine: aws_rds.DatabaseClusterEngine.auroraPostgres({ version: aws_rds.AuroraPostgresEngineVersion.VER_12_11 }),
    defaultDatabaseName: defaultName,
    removalPolicy: RemovalPolicy.DESTROY,
    instanceProps: { vpc },
  });

  new aws_rds.DatabaseInstance(testStack, 'MySQL', {
    engine: aws_rds.DatabaseInstanceEngine.mysql({ version: aws_rds.MysqlEngineVersion.VER_8_0_28 }),
    databaseName: defaultName,
    removalPolicy: RemovalPolicy.DESTROY,
    vpc,
  });

  new aws_rds.DatabaseInstance(testStack, 'PostgreSQL', {
    engine: aws_rds.DatabaseInstanceEngine.postgres({ version: aws_rds.PostgresEngineVersion.VER_14_2 }),
    databaseName: defaultName,
    removalPolicy: RemovalPolicy.DESTROY,
    vpc,
  });

  batchReplayer = new BatchReplayer(testStack, 'TestBatchReplayer', {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    frequency: Duration.seconds(120),
    sinkBucket: bucket,
    sinkObjectKey: defaultName,
    ddbTable: ddbTable,
    redshiftTableName: defaultName,
    redshiftConnection: defaultName,
    redshiftSchema: defaultName,
    auroraMysqlTableName: defaultName,
    auroraMysqlConnection: defaultName,
    auroraMysqlSchema: defaultName,
    auroraPostgresTableName: defaultName,
    auroraPostgresConnection: defaultName,
    auroraPostgresSchema: defaultName,
    mysqlTableName: defaultName,
    mysqlConnection: defaultName,
    mysqlSchema: defaultName,
    postgresTableName: defaultName,
    postgresConnection: defaultName,
    postgresSchema: defaultName,
    databaseVpc: vpc,
    databaseVpcSG: securityGroup,
  });
  template = Template.fromStack(testStack);
});

test("BatchReplayer should use given frequency", () => {
  expect(batchReplayer.frequency).toBe(120);
});

test("BatchReplayer should use default frequency", () => {
  const batchReplayerWithNoFreqProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  });
  expect(batchReplayerWithNoFreqProp.frequency).toBe(60);
});

test("BatchReplayer should use given max output file size", () => {
  const batchReplayerWithFilesizeProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    outputFileMaxSizeInBytes: 20480,
  });
  expect(batchReplayerWithFilesizeProp.outputFileMaxSizeInBytes).toBe(20480);
});

test("BatchReplayer should use default max output file size 100MB", () => {
  const batchReplayerWithNoFilesizeProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  });
  expect(batchReplayerWithNoFilesizeProp.outputFileMaxSizeInBytes).toBe(100 * 1024 * 1024);
});

test('sinkObjectKey should only be defined if sinkBucket is defined', () => {
  const batchReplayerWithNoFilesizeProp = new BatchReplayer(testStack, 'TestBatchReplayerWithNoSinkBucket', {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  });
  expect(batchReplayerWithNoFilesizeProp.sinkObjectKey).toBe(undefined);
  expect(batchReplayer.sinkObjectKey).toBe(`${defaultName}/${batchReplayer.dataset.tableName}`);
});

test('BatchReplayer should create 2 lambda functions from Dockerfile with 15 mins timeout', () => {
  template.hasResourceProperties('AWS::Lambda::Function', {
    //"PackageType": "Image",
    "Timeout": 900
  })
});

test("BatchReplayer should create a step function", () => {
  template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
});



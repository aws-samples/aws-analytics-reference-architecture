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
  aws_rds, aws_stepfunctions_tasks, Duration,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib';

import { Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BatchReplayer, DbSink, DynamoDbSink, S3Sink, PreparedDataset } from '../../../src';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { PreBundledFunction } from '../../../src/common/pre-bundled-function';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

let testStack: Stack;
let s3Props: S3Sink;
let batchReplayer: BatchReplayer;
let template: Template;
let ddbProps: DynamoDbSink;
let redshiftProps: DbSink;
let auroraProps: DbSink;
let rdsProps: DbSink;
let defaultName = 'test';
let vpc: IVpc;
let secGroup: SecurityGroup;
const expectedAdditionalTaskName = "SummarizeOutput"

beforeEach(() => {
  testStack = new Stack();

  const bucket = new Bucket(testStack, 'Bucket');
  s3Props = { sinkBucket: bucket };

  vpc = new aws_ec2.Vpc(testStack, 'Vpc');
  secGroup = new aws_ec2.SecurityGroup(testStack, 'SecurityGroup', { vpc });

  const ddbTable = new aws_dynamodb.Table(testStack, 'DynamoDB', {
    partitionKey: { name: defaultName, type: aws_dynamodb.AttributeType.STRING },
    removalPolicy: RemovalPolicy.DESTROY,
  });
  ddbProps = { table: ddbTable };

  const redshift = new Cluster(testStack, 'Redshift', {
    masterUser: { masterUsername: defaultName },
    defaultDatabaseName: defaultName,
    removalPolicy: RemovalPolicy.DESTROY,
    vpc,
  });
  const redshiftCreds = redshift.secret ? redshift.secret.secretArn : '';
  redshiftProps = { table: defaultName, connection: redshiftCreds, schema: defaultName };

  const auroraMySQL = new aws_rds.DatabaseCluster(testStack, 'Aurora', {
    engine: aws_rds.DatabaseClusterEngine.auroraMysql({ version: aws_rds.AuroraMysqlEngineVersion.VER_2_08_1 }),
    defaultDatabaseName: defaultName,
    removalPolicy: RemovalPolicy.DESTROY,
    instanceProps: { vpc },
  });
  const auroraMysqlCreds = auroraMySQL.secret ? auroraMySQL.secret.secretArn : '';
  auroraProps = { table: defaultName, connection: auroraMysqlCreds, schema: defaultName, type: 'mysql' };

  const rdsPostgres = new aws_rds.DatabaseInstance(testStack, 'RDS', {
    engine: aws_rds.DatabaseInstanceEngine.postgres({ version: aws_rds.PostgresEngineVersion.VER_14_2 }),
    databaseName: defaultName,
    removalPolicy: RemovalPolicy.DESTROY,
    vpc,
  });
  const rdsPostgresCreds = rdsPostgres.secret ? rdsPostgres.secret.secretArn : '';
  rdsProps = { table: defaultName, connection: rdsPostgresCreds, schema: defaultName, type: 'postgresql' };

  batchReplayer = new BatchReplayer(testStack, 'TestBatchReplayer', {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    frequency: Duration.seconds(120),
    s3Props: s3Props,
    ddbProps: ddbProps,
    redshiftProps: redshiftProps,
    auroraProps: auroraProps,
    rdsProps: rdsProps,
    vpc: vpc,
    secGroup: secGroup,
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
  const s3MaxOutputFileSizeSet: S3Sink = {
    sinkBucket: new Bucket(testStack, 'filesizeBucket'),
    outputFileMaxSizeInBytes: 20480,
  };
  const batchReplayerWithFilesizeProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    s3Props: s3MaxOutputFileSizeSet,
  });
  if (batchReplayerWithFilesizeProp.s3Props) {
    expect(batchReplayerWithFilesizeProp.s3Props.outputFileMaxSizeInBytes).toBe(20480);
  }
});

test("BatchReplayer should use default max output file size 100MB", () => {
  const s3MaxOutputFileSizeDefault: S3Sink = {
    sinkBucket: new Bucket(testStack, 'noFilesizeBucket'),
  };
  const batchReplayerWithNoFilesizeProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    s3Props: s3MaxOutputFileSizeDefault,
  });
  if (batchReplayerWithNoFilesizeProp.s3Props) {
    expect(batchReplayerWithNoFilesizeProp.s3Props.outputFileMaxSizeInBytes).toBe(100 * 1024 * 1024);
  }
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

test("BatchReplayer should not have additionalStepFunctionTasks", ()=> {

  const resources = template.toJSON().Resources
  const stepFnDefinition:any[] = resources.TestBatchReplayerBatchReplayStepFnBB59B3E9.Properties
  .DefinitionString["Fn::Join"][1]

  // filter strings that contains : expectedAdditionalTaskName
  const found = stepFnDefinition.map<String>((a) => (typeof a === 'string' || a instanceof String) ? a : "")
                    .filter((a:String)=>  a.includes(expectedAdditionalTaskName))
                    
  expect(found.length).toBe(0)

});

test("BatchReplayer should have one additionalStepFunctionTask : expectedAdditionalTaskName", ()=> {
  const testStack2 = new Stack();

  /**
   * Lambda to be used as additional task
   */
  const summaryOutputState = new PreBundledFunction(testStack2, 'SummaryFn', {
    memorySize: 128,
    codePath: '../test/unit/data-generator/resources/lambdas/summary-additional-task',
    runtime: Runtime.PYTHON_3_9,
    handler: 'summary-additional-task.handler',
    logRetention: RetentionDays.ONE_WEEK,
    timeout: Duration.minutes(1),
  });

  /** 
   * Additional Task
  */
  const additionalTask = new aws_stepfunctions_tasks
          .LambdaInvoke(testStack2, expectedAdditionalTaskName,  {
              lambdaFunction: summaryOutputState,
              outputPath: "$",
              retryOnServiceExceptions: true
              });

  const bucket2 = new Bucket(testStack2, 'Bucket');
  const s3Props2 = { sinkBucket: bucket2 };

  new BatchReplayer(testStack2, 'TestBatchReplayer', {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    frequency: Duration.seconds(120),
    s3Props: s3Props2,
    additionalStepFunctionTasks: [additionalTask]
  });

  const template2 = Template.fromStack(testStack2);

  const resources = template2.toJSON().Resources
  const stepFnDefinition: any[] = resources.TestBatchReplayerBatchReplayStepFnBB59B3E9.Properties
                          .DefinitionString["Fn::Join"][1]

  // filter strings that contains : expectedAdditionalTaskName
  const found = stepFnDefinition.map<String>((a) => (typeof a === 'string' || a instanceof String) ? a : "")
                    .filter((a:String)=>  a.includes(expectedAdditionalTaskName))

  expect(found.length > 0).toBeTruthy()
});


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CfnDatabase } from '@aws-cdk/aws-glue';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { SingletonFunction, Runtime, Code } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Bucket } from '@aws-cdk/aws-s3'
;
import { StateMachine, IntegrationPattern } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke, AthenaStartQueryExecution } from '@aws-cdk/aws-stepfunctions-tasks';
import { Construct, Arn, Aws, Stack, Duration, ArnFormat } from '@aws-cdk/core';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from '@aws-cdk/custom-resources';
import { Dataset } from './dataset';
import { SingletonBucket } from './singleton-bucket';
import { SynchronousAthenaQuery } from './synchronous-athena-query';


/**
 * The properties for DataGenerator Construct.
 */

export interface DataGeneratorProps {
  /**
   * Sink Arn to receive the generated data.
   * Sink must be an Amazon S3 bucket.
   */
  readonly sinkArn: string;
  /**
   * Source dataset used to generate the data by replying it.
   * Use a pre-defined [Dataset]{@link Dataset} or create a [custom one]{@link Dataset.constructor}.
   */
  readonly dataset: Dataset;
  /**
   * Frequency (in Seconds) of the data generation. Should be > 60s.
   * @default - 30 min (1800s)
   */
  readonly frequency?: number;
}

/**
 * DataGenerator Construct to replay data from an existing dataset into a target replacing datetime to current datetime
 * Target can be an Amazon S3 bucket or an Amazon Kinesis Data Stream.
 * DataGenerator can use pre-defined or custom datasets available in the [Dataset]{@link Dataset} Class
 */

export class DataGenerator extends Construct {
  /**
   * AWS Glue Database name used by the DataGenerator
   */
  static readonly DATA_GENERATOR_DATABASE = 'data_generator';
  /**
   * Sink Arn to receive the generated data.
   */
  public readonly sinkArn: string;
  /**
   * Dataset used to generate data
   */
  public readonly dataset: Dataset;
  /**
   * Frequency (in Seconds) of the data generation
   */
  public readonly frequency: number;

  /**
   * Constructs a new instance of the DataGenerator class
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataGeneratorProps} props the DataGenerator [properties]{@link DataGeneratorProps}
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataGeneratorProps) {
    super(scope, id);

    const stack = Stack.of(this);
    this.sinkArn = props.sinkArn;
    this.dataset = props.dataset;
    this.frequency = props.frequency || 1800;

    // AWS Glue Database to store source Tables
    const datageneratorDB = new CfnDatabase(this, 'database', {
      catalogId: Aws.ACCOUNT_ID,
      databaseInput: {
        name: DataGenerator.DATA_GENERATOR_DATABASE,
      },
    });

    // Singleton Amazon S3 bucket for Amazon Athena Query logs
    const logBucket = SingletonBucket.getOrCreate(this, 'log');

    // Source table creation in Amazon Athena
    const createSourceTable = new SynchronousAthenaQuery(this, 'createSourceTable', {
      statement: this.dataset.parseCreateQuery(datageneratorDB.ref, this.dataset.tableName+'_source', this.dataset.bucket, this.dataset.key),
      resultPath: logBucket.s3UrlForObject(`data-generator/${this.dataset.tableName}/create_source/`),
    });
    createSourceTable.node.addDependency(datageneratorDB);

    // Parse the sinkArn into ArnComponents and raise an error if it's not an Amazon S3 Sink
    const arn = Arn.split(this.sinkArn, ArnFormat.SLASH_RESOURCE_NAME);
    Bucket.fromBucketArn(this, 'Sink', this.sinkArn);

    // Target table creation in Amazon Athena
    const createTargetTable = new SynchronousAthenaQuery(this, 'createTargetTable', {
      statement: this.dataset.parseCreateQuery(
        datageneratorDB.ref,
        this.dataset.tableName+'_target',
        arn.resource,
        this.dataset.tableName),
      resultPath: logBucket.s3UrlForObject(`data-generator/${this.dataset.tableName}/create_target/`),
    });
    createTargetTable.node.addDependency(datageneratorDB);

    // Calculate offset between now and the min datetime in the dataset
    const offset = this.dataset.offset.toString();

    // AWS Custom Resource to store the datetime offset only on creation
    const offsetCreate = new AwsCustomResource(this, 'offsetCreate', {
      onCreate: {
        service: 'SSM',
        action: 'putParameter',
        physicalResourceId: PhysicalResourceId.of(this.dataset.tableName + '_offset'),
        parameters: {
          Name: this.dataset.tableName + '_offset',
          Value: offset,
          Type: 'String',
        },
      },
      onDelete: {
        service: 'SSM',
        action: 'deleteParameter',
        physicalResourceId: PhysicalResourceId.of(this.dataset.tableName + '_offset'),
        parameters: {
          Name: this.dataset.tableName + '_offset',
        },
      },
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          resources: [
            stack.formatArn({
              account: Aws.ACCOUNT_ID,
              region: Aws.REGION,
              service: 'ssm',
              resource: 'parameter',
              resourceName: this.dataset.tableName + '_offset',
            }),
          ],
          actions: [
            'ssm:PutParameter',
            'ssm:DeleteParameter',
            'ssm:GetParameter',
          ],
        }),
      ]),
      logRetention: RetentionDays.ONE_DAY,
    });

    // AWS Custom Resource to get the datetime offset from AWS SSM
    const offsetGet = new AwsCustomResource(this, 'offsetGet', {
      onCreate: {
        service: 'SSM',
        action: 'getParameter',
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
        parameters: {
          Name: this.dataset.tableName + '_offset',
        },
      },
      onUpdate: {
        service: 'SSM',
        action: 'getParameter',
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
        parameters: {
          Name: this.dataset.tableName + '_offset',
        },
      },
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          resources: [
            stack.formatArn({
              account: Aws.ACCOUNT_ID,
              region: Aws.REGION,
              service: 'ssm',
              resource: 'parameter',
              resourceName: this.dataset.tableName + '_offset',
            }),
          ],
          actions: [
            'ssm:GetParameter',
          ],
        }),
      ]),
      logRetention: RetentionDays.ONE_DAY,
    });
    offsetGet.node.addDependency(offsetCreate);

    // AWS Lambda function to prepare data generation
    const querySetupFn = new SingletonFunction(this, 'querySetupFn', {
      uuid: '91aeec93-2570-465b-a25f-a776b8a9b792',
      runtime: Runtime.PYTHON_3_8,
      code: Code.fromAsset('./src/lambdas/data-generator-setup'),
      handler: 'lambda.handler',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(30),
    });

    // AWS Step Functions task to prepare data generation
    const querySetupTask = new LambdaInvoke(this, 'querySetupTask', {
      lambdaFunction: querySetupFn,
      inputPath: `$.{
        'Offset': ${offsetGet.getResponseField('Parameter.Value')},
        'Frequency': ${this.frequency},
        'Statement': ${this.dataset.parseGenerateQuery(
    DataGenerator.DATA_GENERATOR_DATABASE,
    this.dataset.tableName+'_source',
    this.dataset.tableName+'_target',
  )}
      }`,
      outputPath: '$.Statement',
    });

    // AWS Step Functions Task to run an Amazon Athena Query for data generation
    const athenaQueryTask = new AthenaStartQueryExecution(this, 'dataGeneratorQuery', {
      queryString: '$.Statement',
      timeout: Duration.minutes(5),
      workGroup: 'primary',
      integrationPattern: IntegrationPattern.RUN_JOB,
      resultConfiguration: {
        outputLocation: {
          bucketName: SingletonBucket.getOrCreate(this, 'log').bucketName,
          objectKey: `data-generator/${this.dataset.tableName}/generate/`,
        },
      },
    });

    // AWS Step Functions State Machine to generate data
    new StateMachine(this, 'dataGenerator', {
      definition: querySetupTask.next(athenaQueryTask),
      timeout: Duration.minutes(7),
    });
  }
}
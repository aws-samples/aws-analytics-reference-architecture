// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Rule, Schedule } from '@aws-cdk/aws-events';
import { SfnStateMachine } from '@aws-cdk/aws-events-targets';
import { PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Runtime } from '@aws-cdk/aws-lambda';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Bucket } from '@aws-cdk/aws-s3';
import { StateMachine, IntegrationPattern, TaskInput, JsonPath, LogLevel } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke, AthenaStartQueryExecution } from '@aws-cdk/aws-stepfunctions-tasks';
import { Construct, Arn, Aws, Stack, Duration, ArnFormat, RemovalPolicy } from '@aws-cdk/core';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from '@aws-cdk/custom-resources';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { Dataset } from '../datasets/dataset';
import { AraBucket } from '../ara-bucket';
import { SingletonGlueDatabase } from '../singleton-glue-database';
import { SingletonKey } from '../singleton-kms-key';
import { SynchronousAthenaQuery } from '../synchronous-athena-query';


/**
 * The properties for DataGenerator Construct.
 *
 * This construct is deprecated in favor of the [BatchReplayer]{@link BatchReplayer} construct
 * @deprecated replaced by [BatchReplayer]{@link BatchReplayer}
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
 *
 * This construct is deprecated in favor of the [BatchReplayer]{@link BatchReplayer} construct
 * @deprecated replaced by [BatchReplayer]{@link BatchReplayer}
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
    const datageneratorDB = SingletonGlueDatabase.getOrCreate(this, DataGenerator.DATA_GENERATOR_DATABASE);

    // Singleton Amazon S3 bucket for Amazon Athena Query logs
    const logBucket = AraBucket.getOrCreate(this, {
      bucketName: 'athena-log',
      serverAccessLogsPrefix: 'athena-log-bucket',
    });

    // Source table creation in Amazon Athena
    const createSourceTable = new SynchronousAthenaQuery(this, 'CreateSourceTable', {
      statement: this.dataset.parseCreateSourceQuery(
        datageneratorDB.databaseName,
        this.dataset.tableName+'_source',
        this.dataset.location.bucketName,
        this.dataset.location.objectKey),
      resultPath: {
        bucketName: logBucket.bucketName,
        objectKey: `data_generator/${this.dataset.tableName}/create_source`,
      },
      executionRoleStatements: [
        new PolicyStatement({
          resources: [
            stack.formatArn({
              account: Aws.ACCOUNT_ID,
              region: Aws.REGION,
              service: 'glue',
              resource: 'table',
              resourceName: DataGenerator.DATA_GENERATOR_DATABASE + '/' + this.dataset.tableName + '_source',
            }),
            stack.formatArn({
              account: Aws.ACCOUNT_ID,
              region: Aws.REGION,
              service: 'glue',
              resource: 'catalog',
            }),
            stack.formatArn({
              account: Aws.ACCOUNT_ID,
              region: Aws.REGION,
              service: 'glue',
              resource: 'database',
              resourceName: DataGenerator.DATA_GENERATOR_DATABASE,
            }),
          ],
          actions: [
            'glue:CreateTable',
            'glue:GetTable',
          ],
        }),
      ],
    });
    createSourceTable.node.addDependency(datageneratorDB);

    // Parse the sinkArn into ArnComponents and raise an error if it's not an Amazon S3 Sink
    const arn = Arn.split(this.sinkArn, ArnFormat.SLASH_RESOURCE_NAME);
    Bucket.fromBucketArn(this, 'Sink', this.sinkArn);

    // Target table creation in Amazon Athena
    const createTargetTable = new SynchronousAthenaQuery(this, 'CreateTargetTable', {
      statement: this.dataset.parseCreateTargetQuery(
        datageneratorDB.databaseName,
        this.dataset.tableName+'_target',
        arn.resource,
        this.dataset.tableName),
      resultPath: {
        bucketName: logBucket.bucketName,
        objectKey: `data_generator/${this.dataset.tableName}/create_target`,
      },
      executionRoleStatements: [
        new PolicyStatement({
          resources: [
            stack.formatArn({
              account: Aws.ACCOUNT_ID,
              region: Aws.REGION,
              service: 'glue',
              resource: 'table',
              resourceName: DataGenerator.DATA_GENERATOR_DATABASE + '/' + this.dataset.tableName + '_target',
            }),
            stack.formatArn({
              account: Aws.ACCOUNT_ID,
              region: Aws.REGION,
              service: 'glue',
              resource: 'catalog',
            }),
            stack.formatArn({
              account: Aws.ACCOUNT_ID,
              region: Aws.REGION,
              service: 'glue',
              resource: 'database',
              resourceName: DataGenerator.DATA_GENERATOR_DATABASE,
            }),
          ],
          actions: [
            'glue:CreateTable',
            'glue:GetTable',
          ],
        }),
      ],
    });
    createTargetTable.node.addDependency(datageneratorDB);

    let offsetCreateCRRole: Role = new Role(this,
      'OffsetCreateCRRole', {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role used by lambda in createManagedEndpoint CR',
        roleName: 'ara-data-generator-offsetCreateCRRole',
      });

    // AWS Custom Resource to store the datetime offset only on creation
    const offsetCreate = new AwsCustomResource(this, 'OffsetCreate', {
      onCreate: {
        service: 'SSM',
        action: 'putParameter',
        physicalResourceId: PhysicalResourceId.of(this.dataset.tableName + '_offset'),
        parameters: {
          Name: this.dataset.tableName + '_offset',
          Value: this.dataset.offset.toString(),
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
      logRetention: RetentionDays.ONE_WEEK,
      role: offsetCreateCRRole,
    });


    let offsetGetCRRole: Role = new Role(this,
      'OffsetGetCRRole', {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role used by lambda in createManagedEndpoint CR',
        roleName: 'ara-data-generator-offsetGetCRRole',
      });

    // AWS Custom Resource to get the datetime offset from AWS SSM
    const offsetGet = new AwsCustomResource(this, 'OffsetGet', {
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
      logRetention: RetentionDays.ONE_WEEK,
      role: offsetGetCRRole,
    });
    offsetGet.node.addDependency(offsetCreate);

    // AWS Lambda function to prepare data generation
    const querySetupFn = new PreBundledFunction(this, 'QuerySetupFn', {
      runtime: Runtime.PYTHON_3_8,
      codePath: 'data-generator/resources/lambdas/setup',
      name: 'DataGeneratorFn',
      handler: 'lambda.handler',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(30),
    });

    // AWS Step Functions task to prepare data generation
    const querySetupTask = new LambdaInvoke(this, 'QuerySetupTask', {
      lambdaFunction: querySetupFn,
      payload: TaskInput.fromObject({
        Offset: offsetGet.getResponseField('Parameter.Value'),
        Frequency: this.frequency,
        Statement: this.dataset.parseGenerateQuery(
          DataGenerator.DATA_GENERATOR_DATABASE,
          this.dataset.tableName+'_source',
          this.dataset.tableName+'_target',
        ),
      },
      ),
      outputPath: '$.Payload',
    });

    // AWS Step Functions Task to run an Amazon Athena Query for data generation
    const athenaQueryTask = new AthenaStartQueryExecution(this, 'DataGeneratorQuery', {
      queryString: JsonPath.stringAt('$'),
      timeout: Duration.minutes(5),
      workGroup: 'primary',
      integrationPattern: IntegrationPattern.RUN_JOB,
      resultConfiguration: {
        outputLocation: {
          bucketName: logBucket.bucketName,
          objectKey: `data_generator/${this.dataset.tableName}/generate`,
        },
      },
      queryExecutionContext: {
        databaseName: DataGenerator.DATA_GENERATOR_DATABASE,
      },
    });

    // AWS Step Functions State Machine to generate data
    const generatorStepFunctions = new StateMachine(this, 'DataGenerator', {
      definition: querySetupTask.next(athenaQueryTask),
      timeout: Duration.minutes(7),
      logs: {
        destination: new LogGroup(this, 'GeneratorStepFunctionsLog', {
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.FIVE_MONTHS,
          encryptionKey: SingletonKey.getOrCreate(this, 'stackEncryptionKey'),
        }),
        includeExecutionData: false,
        level: LogLevel.ALL,
      },
      tracingEnabled: true,
    });

    // Add permissions for executing the INSERT INTO SELECT query
    generatorStepFunctions.addToRolePolicy(new PolicyStatement({
      resources: [
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'glue',
          resource: 'table',
          resourceName: DataGenerator.DATA_GENERATOR_DATABASE + '/' + this.dataset.tableName + '_target',
        }),
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'glue',
          resource: 'table',
          resourceName: DataGenerator.DATA_GENERATOR_DATABASE + '/' + this.dataset.tableName + '_source',
        }),
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'glue',
          resource: 'catalog',
        }),
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'glue',
          resource: 'database',
          resourceName: DataGenerator.DATA_GENERATOR_DATABASE,
        }),
      ],
      actions: [
        'glue:GetDatabase',
        'glue:GetTable',
      ],
    }));

    generatorStepFunctions.addToRolePolicy(new PolicyStatement({
      resources: [
        stack.formatArn({
          account: '',
          region: '',
          service: 's3',
          resource: arn.resource,
          resourceName: this.dataset.tableName + '/*',
        }),
      ],
      actions: [
        's3:AbortMultipartUpload',
        's3:ListBucketMultipartUploads',
        's3:ListMultipartUploadParts',
        's3:PutObject',
      ],
    }));

    // Amazon EventBridge Rule to trigger the AWS Step Functions
    new Rule(this, 'DataGeneratorTrigger', {
      schedule: Schedule.cron({ minute: `0/${Math.ceil(this.frequency/60)}` }),
      targets: [new SfnStateMachine(generatorStepFunctions, {})],
    });
  }
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Aws, aws_ec2, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { JsonPath, LogLevel, Map, StateMachine, TaskInput } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { PreparedDataset } from './prepared-dataset';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';

/**
 * The properties for the BatchReplayer construct
 */
export interface BatchReplayerProps {

  /**
   * The [PreparedDataset]{@link PreparedDataset} used to replay data
   */
  readonly dataset: PreparedDataset;
  /**
   * The frequency of the replay
   * @default - The BatchReplayer is triggered every 60 seconds
   */
  readonly frequency?: Duration;
  /**
   * The S3 Bucket sink where the BatchReplayer writes data.
   * :warning: **If the Bucket is encrypted with KMS, the Key must be managed by this stack.
   */
  readonly sinkBucket?: Bucket;
  /**
   * The S3 object key sink where the BatchReplayer writes data.
   * @default - No object key is used and the BatchReplayer writes the dataset in s3://<BUCKET_NAME>/<TABLE_NAME>
   */
  readonly sinkObjectKey?: string;
  /**
   * The maximum file size in Bytes written by the BatchReplayer
   * @default - The BatchReplayer writes 100MB files maximum
   */
  readonly outputFileMaxSizeInBytes?: number;
  /**
   * The DynamoDB table where the BatchReplayer writes data.
   */
  readonly ddbTable?: ITable;
  /**
   * Redshift table where the BatchReplayer writes data.
   */
  readonly redshiftTableName?: string;
  /**
   * Glue catalog connection name for Redshift cluster.
   */
  readonly redshiftConnection?: string;
  /**
   * Schema name of the Redshift table.
   */
  readonly redshiftSchema?: string;
  /**
   * RDS MySQL Aurora cluster where the BatchReplayer writes data.
   */
  readonly auroraMysqlTableName?: string;
  /**
   * Glue catalog connection name for Aurora MySQL cluster.
   */
  readonly auroraMysqlConnection?: string;
  /**
   * Schema name of the Aurora MySQL table.
   */
  readonly auroraMysqlSchema?: string;
  /**
   * RDS PostgreSQL Aurora cluster where the BatchReplayer writes data.
   */
  readonly auroraPostgresTableName?: string;
  /**
   * Glue catalog connection name for Aurora PostgreSQL cluster.
   */
  readonly auroraPostgresConnection?: string;
  /**
   * Schema name of the Aurora PostgreSQL table.
   */
  readonly auroraPostgresSchema?: string;
  /**
   * RDS MySQL database instance where the BatchReplayer writes data.
   */
  readonly mysqlTableName?: string;
  /**
   * Glue catalog connection name for MySQL database.
   */
  readonly mysqlConnection?: string;
  /**
   * Schema name for the RDS MySQL table.
   */
  readonly mysqlSchema?: string;
  /**
   * RDS PostgreSQL database instance where the BatchReplayer writes data.
   */
  readonly postgresTableName?: string;
  /**
   * Glue catalog connection name for the PostgreSQL database.
   */
  readonly postgresConnection?: string;
  /**
   * Schema name for the RDS PostgreSQL table.
   */
  readonly postgresSchema?: string;
  /**
   * The VPC for the database instance(s) and/or cluster(s).
   */
  readonly databaseVpc?: IVpc;
  /**
   * The security group of the database VPC. This needs to be added to the writeInBatchFn Lambda.
   */
  readonly databaseVpcSG?: ISecurityGroup;
}

/**
 * Replay the data in the given PartitionedDataset.
 *
 * It will dump files into the `sinkBucket` based on the given `frequency`.
 * The computation is in a Step Function with two Lambda steps.
 *
 * 1. resources/lambdas/find-file-paths
 * Read the manifest file and output a list of S3 file paths within that batch time range
 *
 * 2. resources/lambdas/write-in-batch
 * Take a file path, filter only records within given time range, adjust the time with offset to
 * make it looks like just being generated. Then write the output to the `sinkBucket`
 *
 * Usage example:
 * ```typescript
 *
 * const myBucket = new Bucket(stack, "MyBucket")
 *
 * new BatchReplayer(stack, "WebSalesReplayer", {
 *   dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
 *   s3BucketSink: myBucket
 *   s3ObjectKeySink: 'some-prefix',
 *   frequency: 120,
 *   outputFileMaxSizeInBytes: 10000000,
 * });
 * ```
 *
 * :warnning: **If the Bucket is encrypted with KMS, the Key must be managed by this stack.
 */
export class BatchReplayer extends Construct {

  /**
   * Dataset used for replay
   */
  public readonly dataset: PreparedDataset;

  /**
   * Frequency (in Seconds) of the replaying. The batch job will start
   * for every given frequency and replay the data in that period
   */
  public readonly frequency: number;

  /**
   * Sink bucket where the batch replayer will put data in
   */
  public readonly sinkBucket?: Bucket;

  /**
   * Sink object key where the batch replayer will put data in
   */
  public readonly sinkObjectKey?: string;

  /**
   * Maximum file size for each output file. If the output batch file is,
   * larger than that, it will be split into multiple files that fit this size.
   *
   * Default to 100MB (max value)
   */
  public readonly outputFileMaxSizeInBytes?: number;

  /**
   * The DynamoDB table where the BatchReplayer writes data.
   */
  public readonly ddbTable?: ITable;

  /**
   * Redshift table where the BatchReplayer writes data.
   */
  public readonly redshiftTableName?: string;

  /**
   * Glue catalog connection name for Redshift cluster.
   */
  public readonly redshiftConnection?: string;

  /**
   * Schema name for the Redshift table.
   */
  public readonly redshiftSchema?: string;

  /**
   * RDS MySQL Aurora cluster where the BatchReplayer writes data.
   */
  public readonly auroraMysqlTableName?: string;

  /**
   * Glue catalog connection name for Aurora MySQL cluster.
   */
  public readonly auroraMysqlConnection?: string;

  /**
   * Schema name for the Aurora MySQL table.
   */
  public readonly auroraMysqlSchema?: string;

  /**
   * RDS PostgreSQL Aurora cluster where the BatchReplayer writes data.
   */
  public readonly auroraPostgresTableName?: string;

  /**
   * Glue catalog connection name for Aurora PostgreSQL cluster.
   */
  public readonly auroraPostgresConnection?: string;

  /**
   * Schema name for the Aurora PostgreSQL table.
   */
  public readonly auroraPostgresSchema?: string;

  /**
   * RDS MySQL database instance where the BatchReplayer writes data.
   */
  public readonly mysqlTableName?: string;

  /**
   * Glue catalog connection name for the MySQL database.
   */
  public readonly mysqlConnection?: string;

  /**
   * Schema name for the RDS MySQL table.
   */
  public readonly mysqlSchema?: string;

  /**
   * RDS PostgreSQL database instance where the BatchReplayer writes data.
   */
  public readonly postgresTableName?: string;

  /**
   * Glue catalog connection name for the PostgreSQL database.
   */
  public readonly postgresConnection?: string;

  /**
   * Schema name for the RDS PostgreSQL table.
   */
  public readonly postgresSchema?: string;

  /**
   * The VPC for the database instance(s) and/or cluster(s).
   */
  public readonly databaseVpc?: IVpc;

  /**
   * The security group of the database VPC. This needs to be added to the writeInBatchFn Lambda.
   */
  public readonly databaseVpcSG?: ISecurityGroup;

  /**
   * Constructs a new instance of the BatchReplayer construct
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {BatchReplayerProps} props the BatchReplayer [properties]{@link BatchReplayerProps}
   */
  constructor(scope: Construct, id: string, props: BatchReplayerProps) {
    super(scope, id);

    this.dataset = props.dataset;
    this.frequency = props.frequency?.toSeconds() || 60;

    // Properties for S3 target
    this.outputFileMaxSizeInBytes = props.outputFileMaxSizeInBytes || 100 * 1024 * 1024; //Default to 100 MB
    this.sinkBucket = props.sinkBucket;

    // Properties for DynamoDB target
    this.ddbTable = props.ddbTable;

    // Properties for Redshift target
    this.redshiftTableName = props.redshiftTableName;
    this.redshiftConnection = props.redshiftConnection;
    this.redshiftSchema = props.redshiftSchema;

    // Properties for Aurora MySQL target
    this.auroraMysqlTableName = props.auroraMysqlTableName;
    this.auroraMysqlConnection = props.auroraMysqlConnection;
    this.auroraMysqlSchema = props.auroraMysqlSchema;

    // Properties for Aurora PostgreSQL target
    this.auroraPostgresTableName = props.auroraPostgresTableName;
    this.auroraPostgresConnection = props.auroraPostgresConnection;
    this.auroraPostgresSchema = props.auroraPostgresSchema;

    // Properties for MySQL target
    this.mysqlTableName = props.mysqlTableName;
    this.mysqlConnection = props.mysqlConnection;
    this.mysqlSchema = props.mysqlSchema;

    // Properties for PostgreSQL target
    this.postgresTableName = props.postgresTableName;
    this.postgresConnection = props.postgresConnection;
    this.postgresSchema = props.postgresSchema;

    // Vpc for the database instance(s)/cluster(s)
    this.databaseVpc = props.databaseVpc;
    this.databaseVpcSG = props.databaseVpcSG;

    const dataWranglerLayer = LayerVersion.fromLayerVersionArn(this, 'PandasLayer', `arn:aws:lambda:${Aws.REGION}:336392948345:layer:AWSDataWrangler-Python39:1`);

    const manifestBucketName = this.dataset.manifestLocation.bucketName;
    const manifestObjectKey = this.dataset.manifestLocation.objectKey;
    const dataBucketName = this.dataset.location.bucketName;
    const dataObjectKey = this.dataset.location.objectKey;

    const findFilePathsFnPolicy = [
      new PolicyStatement({
        actions: [
          's3:GetObject',
          's3:ListBucket',
        ],
        resources: [
          `arn:aws:s3:::${dataBucketName}/${dataObjectKey}/*`,
          `arn:aws:s3:::${dataBucketName}/${dataObjectKey}-manifest.csv`,
          `arn:aws:s3:::${dataBucketName}`,
        ],
      }),
    ];

    /**
     * Find all paths within the time range from the manifest file
     */
    const findFilePathsFn = new PreBundledFunction(this, 'FindFilePath', {
      memorySize: 1024,
      codePath: 'data-generator/resources/lambdas/find-file-paths',
      runtime: Runtime.PYTHON_3_9,
      handler: 'find-file-paths.handler',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.minutes(15),
      layers: [dataWranglerLayer],
      lambdaPolicyStatements: findFilePathsFnPolicy,
    });

    const findFilePathsFnTask = new LambdaInvoke(this, 'FindFilePathFnTask', {
      lambdaFunction: findFilePathsFn,
      payload: TaskInput.fromObject({
        frequency: this.frequency,
        manifestFileBucket: manifestBucketName,
        manifestFileKey: manifestObjectKey,
        triggerTime: JsonPath.stringAt('$$.Execution.Input.time'),
        offset: this.dataset.offset,
      }),
      // Retry on 500 error on invocation with an interval of 2 sec with back-off rate 2, for 6 times
      retryOnServiceExceptions: true,
      outputPath: '$.Payload',
    });

    const writeInBatchFnPolicy = [];

    writeInBatchFnPolicy.push(
      new PolicyStatement({
        actions: [
          'ec2:CreateNetworkInterface',
          'ec2:DescribeNetworkInterfaces',
          'ec2:DeleteNetworkInterface',
        ],
        resources: ['*'],
      }),
    );

    let taskInputObj = {
      // Array from the last step to be mapped
      outputFileIndex: JsonPath.stringAt('$.index'),
      filePath: JsonPath.stringAt('$.filePath'),

      // For calculating the start/end time
      frequency: this.frequency,
      triggerTime: JsonPath.stringAt('$$.Execution.Input.time'),
      offset: this.dataset.offset,

      // For file processing
      dateTimeColumnToFilter: this.dataset.dateTimeColumnToFilter,
      dateTimeColumnsToAdjust: this.dataset.dateTimeColumnsToAdjust,
    };

    // S3 target is selected
    if (this.sinkBucket) {
      // Used to force S3 bucket auto cleaning after deletion of this
      this.node.addDependency(this.sinkBucket);

      // Add policy to allow access to bucket
      writeInBatchFnPolicy.push(
        new PolicyStatement({
          actions: [
            's3:GetObject',
            's3:ListBucket',
          ],
          resources: [
            `arn:aws:s3:::${dataBucketName}/${dataObjectKey}/*`,
            `arn:aws:s3:::${dataBucketName}`,
          ],
        }),
      );
      this.sinkObjectKey = props.sinkObjectKey ? `${props.sinkObjectKey}/${this.dataset.tableName}` : this.dataset.tableName;
      // Add params to allow data to be output to S3 target
      let s3Params = {
        sinkPath: this.sinkBucket.s3UrlForObject(this.sinkObjectKey),
        outputFileMaxSizeInBytes: this.outputFileMaxSizeInBytes,
      };
      taskInputObj = Object.assign(taskInputObj, s3Params);
    }

    // DynamoDB target is selected
    if (this.ddbTable) {
      // Add policy to allow access to table
      writeInBatchFnPolicy.push(
        new PolicyStatement({
          actions: [
            'dynamodb:DescribeTable',
            'dynamodb:PutItem',
            'dynamodb:BatchWriteItem',
          ],
          resources: [this.ddbTable.tableArn],
        }),
      );
      // Add params to allow data to be output to DynamoDB target
      let ddbParams = {
        ddbTableName: this.ddbTable.tableName,
      };
      taskInputObj = Object.assign(taskInputObj, ddbParams);
    }

    let writeInBatchFn: PreBundledFunction;

    /**
     * Redshift and RDS databases require the Lambda to have VPC access.
     */
    if (this.databaseVpc && this.databaseVpcSG) {

      // Redshift target is selected
      if (this.redshiftTableName && this.redshiftConnection && this.redshiftSchema) {
        // Add policy to allow access to table
        writeInBatchFnPolicy.push(
            new PolicyStatement({
              actions: [
                'secretsmanager:GetSecretValue',
              ],
              resources: [this.redshiftConnection],
            }),
        );
        // Add params to allow data to be output to Redshift target
        let redshiftParams = {
          redshiftTableName: this.redshiftTableName,
          redshiftConnection: this.redshiftConnection,
          redshiftSchema: this.redshiftSchema,
        };
        taskInputObj = Object.assign(taskInputObj, redshiftParams);
      }

      // Aurora MySQL target is selected
      if (this.auroraMysqlTableName && this.auroraMysqlConnection && this.auroraMysqlSchema) {
        // Add policy to allow access to table
        writeInBatchFnPolicy.push(
          new PolicyStatement({
            actions: [
              'secretsmanager:GetSecretValue',
            ],
            resources: [this.auroraMysqlConnection],
          }),
        );
        // Add params to allow data to be output to Aurora MySQL target
        let auroraMysqlParams = {
          auroraMysqlTableName: this.auroraMysqlTableName,
          auroraMysqlConnection: this.auroraMysqlConnection,
          auroraMysqlSchema: this.auroraMysqlSchema,
        };
        taskInputObj = Object.assign(taskInputObj, auroraMysqlParams);
      }

      // Aurora PostgreSQL target is selected
      if (this.auroraPostgresTableName && this.auroraPostgresConnection && this.auroraPostgresSchema) {
        // Add policy to allow access to table
        writeInBatchFnPolicy.push(
          new PolicyStatement({
            actions: [
              'secretsmanager:GetSecretValue',
            ],
            resources: [this.auroraPostgresConnection],
          }),
        );
        // Add params to allow data to be output to Aurora Postgres target
        let auroraPostgresParams = {
          auroraPostgresTableName: this.auroraPostgresTableName,
          auroraPostgresConnection: this.auroraPostgresConnection,
          auroraPostgresSchema: this.auroraPostgresSchema,
        };
        taskInputObj = Object.assign(taskInputObj, auroraPostgresParams);
      }

      // MySQL target is selected
      if (this.mysqlTableName && this.mysqlConnection && this.mysqlSchema) {
        // Add policy to allow access to table
        writeInBatchFnPolicy.push(
          new PolicyStatement({
            actions: [
              'secretsmanager:GetSecretValue',
            ],
            resources: [this.mysqlConnection],
          }),
        );
        // Add params to allow data to be output to MySQL target
        let mysqlParams = {
          mysqlTableName: this.mysqlTableName,
          mysqlConnection: this.mysqlConnection,
          mysqlSchema: this.mysqlSchema,
        };
        taskInputObj = Object.assign(taskInputObj, mysqlParams);
      }

      // PostgreSQL target is selected
      if (this.postgresTableName && this.postgresConnection && this.postgresSchema) {
        // Add policy to allow access to table
        writeInBatchFnPolicy.push(
          new PolicyStatement({
            actions: [
              'secretsmanager:GetSecretValue',
            ],
            resources: [this.postgresConnection],
          }),
        );
        // Add params to allow data to be output to Postgres target
        let postgresParams = {
          postgresTableName: this.postgresTableName,
          postgresConnection: this.postgresConnection,
          postgresSchema: this.postgresSchema,
        };
        taskInputObj = Object.assign(taskInputObj, postgresParams);
      }

      /**
       * Rewrite data
       */
      writeInBatchFn = new PreBundledFunction(this, 'WriteInBatch', {
        memorySize: 3008,
        codePath: 'data-generator/resources/lambdas/write-in-batch',
        runtime: Runtime.PYTHON_3_9,
        handler: 'write-in-batch.handler',
        logRetention: RetentionDays.ONE_WEEK,
        timeout: Duration.minutes(15),
        layers: [dataWranglerLayer],
        lambdaPolicyStatements: writeInBatchFnPolicy,
        vpc: this.databaseVpc, // Add VPC configuration if set for database connections
        vpcSubnets: this.databaseVpc.selectSubnets({
          subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
        }),
        securityGroups: [this.databaseVpcSG],
      });
    } else {
      /**
       * Rewrite data
       */
      writeInBatchFn = new PreBundledFunction(this, 'WriteInBatch', {
        memorySize: 3008,
        codePath: 'data-generator/resources/lambdas/write-in-batch',
        runtime: Runtime.PYTHON_3_9,
        handler: 'write-in-batch.handler',
        logRetention: RetentionDays.ONE_WEEK,
        timeout: Duration.minutes(15),
        layers: [dataWranglerLayer],
        lambdaPolicyStatements: writeInBatchFnPolicy,
      });
    }

    if (this.sinkBucket) {
        // grant permissions to write to the bucket and to use the KMS key
        this.sinkBucket.grantWrite(writeInBatchFn, `${this.sinkObjectKey}/*`);
    }

    const writeInBatchFnTask = new LambdaInvoke(this, 'WriteInBatchFnTask', {
      lambdaFunction: writeInBatchFn,
      payload: TaskInput.fromObject(taskInputObj),
      // Retry on 500 error on invocation with an interval of 2 sec with back-off rate 2, for 6 times
      retryOnServiceExceptions: true,
      outputPath: '$.Payload',
    });

    // Use "Map" step to write each filePath parallelly
    const writeInBatchMapTask = new Map(this, 'WriteInBatchMapTask', {
      itemsPath: JsonPath.stringAt('$.filePaths'),
      parameters: {
        index: JsonPath.stringAt('$$.Map.Item.Index'),
        filePath: JsonPath.stringAt('$$.Map.Item.Value'),
      },
    });
    writeInBatchMapTask.iterator(writeInBatchFnTask);

    // Overarching Step Function StateMachine
    const batchReplayStepFn = new StateMachine(this, 'BatchReplayStepFn', {
      definition: findFilePathsFnTask.next(writeInBatchMapTask),
      timeout: Duration.minutes(20),
      logs: {
        destination: new LogGroup(this, 'LogGroup', {
          retention: RetentionDays.ONE_WEEK,
          logGroupName: `/aws/batch-replayer/${this.dataset.tableName}`,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        level: LogLevel.ALL,
      },
    });

    new Rule(this, 'BatchReplayStepFnTrigger', {
      schedule: Schedule.cron({ minute: `0/${Math.ceil(this.frequency / 60)}` }),
      targets: [new SfnStateMachine(batchReplayStepFn, {})],
    });
  }
}

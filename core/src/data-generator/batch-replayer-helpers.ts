import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket } from 'aws-cdk-lib/aws-s3';


export interface IS3Sink {
  /**
   * The S3 Bucket sink where the BatchReplayer writes data.
   * :warning: **If the Bucket is encrypted with KMS, the Key must be managed by this stack.
   */
  readonly sinkBucket: Bucket;
  /**
   * The S3 object key sink where the BatchReplayer writes data.
   * @default - No object key is used and the BatchReplayer writes the dataset in s3://<BUCKET_NAME>/<TABLE_NAME>
   */
  sinkObjectKey?: string;
  /**
   * The maximum file size in Bytes written by the BatchReplayer
   * @default - The BatchReplayer writes 100MB files maximum
   */
  outputFileMaxSizeInBytes?: number;
}

export interface DbSink {
  /**
   * The name of the table to write to
   */
  readonly table: string;
  /**
   * Secret ARN of the database connection
   */
  readonly connection: string;
  /**
   * The name of the database schema if required
   */
  readonly schema?: string;
  /**
   * Database engine if applicable
   */
  readonly type?: 'mysql' | 'postgresql';
}

export interface DynamoDbSink {
  /**
   * DynamoDB table
   */
  readonly table: ITable;
}

/**
 * Set up permissions to write to S3 target and params required for WriteInBatch Lambda
 *
 * @param S3Props
 * @param dataBucketName
 * @param dataObjectKey
 */
export function prepareS3Target(S3Props: IS3Sink, dataBucketName: string, dataObjectKey: string)
  : {policy:PolicyStatement; taskInputParams:Object} {
  // Add policy to allow access to bucket
  const policy = new PolicyStatement({
    actions: [
      's3:GetObject',
      's3:ListBucket',
    ],
    resources: [
      `arn:aws:s3:::${dataBucketName}/${dataObjectKey}/*`,
      `arn:aws:s3:::${dataBucketName}`,
    ],
  });
  // Add params to allow data to be output to S3 target
  const taskInputParams = {
    sinkPath: S3Props.sinkBucket.s3UrlForObject(S3Props.sinkObjectKey),
    outputFileMaxSizeInBytes: S3Props.outputFileMaxSizeInBytes,
  };
  return { policy, taskInputParams };
}

/**
 * Set up permissions to write to DynamoDB target and params required for WriteInBatch Lambda
 *
 * @param ddbProps
 */
export function prepareDdbTarget(ddbProps: DynamoDbSink): {policy:PolicyStatement; taskInputParams:Object} {
  // Add policy to allow access to table
  const policy = new PolicyStatement({
    actions: [
      'dynamodb:DescribeTable',
      'dynamodb:PutItem',
      'dynamodb:BatchWriteItem',
    ],
    resources: [ddbProps.table.tableArn],
  });
  // Add params to allow data to be output to DynamoDB target
  const taskInputParams = {
    ddbTableName: ddbProps.table.tableName,
  };
  return { policy, taskInputParams };
}

/**
 * Set up permissions to write to Redshift target and params required for WriteInBatch Lambda
 *
 * @param redshiftProps
 */
export function prepareRedshiftTarget(redshiftProps: DbSink): {policy:PolicyStatement; taskInputParams:Object} {
  // Add policy to allow access to table
  const policy = new PolicyStatement({
    actions: [
      'secretsmanager:GetSecretValue',
    ],
    resources: [redshiftProps.connection],
  });
  // Add params to allow data to be output to Redshift target
  const taskInputParams = {
    redshiftTableName: redshiftProps.table,
    redshiftConnection: redshiftProps.connection,
    redshiftSchema: redshiftProps.schema,
  };
  return { policy, taskInputParams };
}

/**
 * Set up permissions to write to S3 target and params required for WriteInBatch Lambda
 *
 * @param auroraProps
 */
export function prepareAuroraTarget(auroraProps: DbSink): {policy:PolicyStatement; taskInputParams:Object} {
  // Add policy to allow access to table
  const policy = new PolicyStatement({
    actions: [
      'secretsmanager:GetSecretValue',
    ],
    resources: [auroraProps.connection],
  });
  // Add params to allow data to be output to Aurora MySQL target
  const taskInputParams = {
    auroraTableName: auroraProps.table,
    auroraConnection: auroraProps.connection,
    auroraSchema: auroraProps.schema,
    dbType: auroraProps.type,
  };
  return { policy, taskInputParams };
}

/**
 * Set up permissions to write to RDS target and params required for WriteInBatch Lambda
 *
 * @param rdsProps
 */
export function prepareRdsTarget(rdsProps: DbSink): {policy:PolicyStatement; taskInputParams:Object} {
  // Add policy to allow access to table
  const policy = new PolicyStatement({
    actions: [
      'secretsmanager:GetSecretValue',
    ],
    resources: [rdsProps.connection],
  });
  // Add params to allow data to be output to RDS target
  const taskInputParams = {
    rdsTableName: rdsProps.table,
    rdsConnection: rdsProps.connection,
    rdsSchema: rdsProps.schema,
    dbType: rdsProps.type,
  };
  return { policy, taskInputParams };
}

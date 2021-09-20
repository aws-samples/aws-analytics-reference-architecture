import * as path from 'path';
import cdk = require('@aws-cdk/core');
import {Aws} from '@aws-cdk/core';
import iam = require('@aws-cdk/aws-iam');
import firehose = require('@aws-cdk/aws-kinesisfirehose');
import { Bucket } from '@aws-cdk/aws-s3';
import * as logs from '@aws-cdk/aws-logs';


export interface DataExporterProps {
  bucket: Bucket;
  /**
    * Sink Arn to export the data .
   * Sink must be an Amazon S3 bucket.
   */
  readonly sinkArn: string;
  /**
   * Sink Arn to export the data.
   */
  readonly database: string;
  /**
   * Table used to map the input schema
   */
  readonly table: string;
}



export class DataExporter  extends cdk.Construct {

  /**
   * Constructs a new instance of the DataExporter class
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {DataExporterProps} props the DataExporter [properties]{@link DataExporterProps}
   * @access public
   */
  public readonly ingestionStream: firehose.CfnDeliveryStream;

  constructor(scope: cdk.Construct, id: string, props: DataExporterProps) {
    super(scope, id);

    const role = new iam.Role(this, 'FirehoseRole', {
      assumedBy: new iam.ServicePrincipal('firehose.amazonaws.com'),
    });

    const gluePolicy = iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueServiceRole");
      role.addManagedPolicy(gluePolicy);

    // Create log group for storing forehose logs.
    const logGroup = new logs.LogGroup(this, 'data-exporter-log-group', {
      logGroupName: '/data-exporter/firehose/',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.FIVE_DAYS
    });
    
    // Create the Kinesis Firehose log stream.
    const firehoseLogStream = new logs.LogStream(this, 'kinesis-firehose-log', {
      logGroup: logGroup,
      logStreamName: 'firehose-stream',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    props.bucket.grantReadWrite(role);

    const deliveryStreamName = 'DataExporter-KfstreamLayerStream';
    this.ingestionStream = new firehose.CfnDeliveryStream(this, 'FirehoseDeliveryStream', {
      deliveryStreamName,
      deliveryStreamType: 'DirectPut',
      extendedS3DestinationConfiguration: {
        bucketArn: props.bucket.bucketArn,
        bufferingHints: {
          intervalInSeconds: 120,
          sizeInMBs: 128
        },
        cloudWatchLoggingOptions: {
          logGroupName: logGroup.logGroupName,
          logStreamName: firehoseLogStream.logStreamName
        },
        roleArn: role.roleArn,
        errorOutputPrefix: 'failed-data/',
        prefix: 'ingest-data/',
        compressionFormat: 'UNCOMPRESSED',
        s3BackupMode: 'Disabled',
        dataFormatConversionConfiguration: {
          enabled: true,
          inputFormatConfiguration: {
            deserializer: {
              openXJsonSerDe: {}
           }
         },
          outputFormatConfiguration: {
            serializer: {
              orcSerDe: {}
           }
         },
          schemaConfiguration: {
            roleArn: role.roleArn,
            catalogId: Aws.ACCOUNT_ID,
            region: Aws.REGION,
            databaseName: props.database,
            tableName: props.table
          }

        }
      }
    });
    if (!this.ingestionStream .deliveryStreamName){
      this.ingestionStream.deliveryStreamName = deliveryStreamName;
    }
  }
}

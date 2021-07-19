import * as path from 'path';
import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import firehose = require('@aws-cdk/aws-kinesisfirehose');
import { Bucket } from '@aws-cdk/aws-s3';
import * as logs from '@aws-cdk/aws-logs';


export interface KfstreamProps {
  bucket: Bucket
}

export class Kfstream extends cdk.Construct {
  public readonly ingestionStream: firehose.CfnDeliveryStream;
  
  constructor(scope: cdk.Construct, id: string, props: KfstreamProps) {
    super(scope, id);

    const role = new iam.Role(this, 'FirehoseRole', {
      assumedBy: new iam.ServicePrincipal('firehose.amazonaws.com'),
    });
    
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

    const deliveryStreamName = 'KfstreamLayerStream';
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
        compressionFormat: 'snappy',
        s3BackupMode: 'Disabled',
        dataFormatConversionConfiguration: {
          enabled: true,
          schemaConfiguration: {
            roleArn: role.roleArn
          }
             
        }
      }
    });
    if (!this.ingestionStream .deliveryStreamName){
      this.ingestionStream.deliveryStreamName = deliveryStreamName;
    }
  }
}

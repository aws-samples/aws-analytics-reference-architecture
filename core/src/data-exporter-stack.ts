import * as path from 'path';
import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import firehose = require('@aws-cdk/aws-kinesisfirehose');
import { Bucket } from '@aws-cdk/aws-s3';

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

    props.bucket.grantReadWrite(role);

    // Props details: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-kinesisfirehose-deliverystream-extendeds3destinationconfiguration.html
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
        roleArn: role.roleArn,
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

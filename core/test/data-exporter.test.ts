import * as path from 'path';
import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');

import { DataExporter } from './data-exporter-stack';

export class MainStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const assetBasePath = path.join(__dirname, '..', '..');

    // Data Lake for events store
    const rawBucket = new s3.Bucket(this, 'EventStorage', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.S3_MANAGED
    });

    // Creation of the firehose stream
    const Dataexporter = new DataExporter(this, 'Streamng layer', {
      bucket: rawBucket,
      sinkArn: 'test',
      database: 'test2',
      table: 'table'

    })
}
}

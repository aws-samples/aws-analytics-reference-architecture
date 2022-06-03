import { Key } from 'aws-cdk-lib/aws-kms';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { App, RemovalPolicy, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { BatchReplayer, PreparedDataset } from './data-generator';


const mockApp = new App();
const stack = new Stack(mockApp, 'test');

const myKey = new Key(stack, 'MyKey', {
  removalPolicy: RemovalPolicy.DESTROY,
});

const myBucket = new Bucket(stack, 'MyBucket', {
  encryptionKey: myKey,
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

new BatchReplayer(stack, 'test', {
  dataset: PreparedDataset.RETAIL_1_GB_CUSTOMER,
  sinkBucket: myBucket,
  sinkObjectKey: 'test',
});
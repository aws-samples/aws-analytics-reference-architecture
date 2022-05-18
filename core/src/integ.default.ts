import { Key } from '@aws-cdk/aws-kms';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, RemovalPolicy, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { BatchReplayer } from './data-generator/batch-replayer';
import { PreparedDataset } from './datasets';


const mockApp = new App();
const stack = new Stack(mockApp, 'eks-emr-studio');

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

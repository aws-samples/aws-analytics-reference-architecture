import { Bucket } from 'aws-cdk-lib/aws-s3';
import { App, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { LakeformationS3Location } from './lf-s3-location';
import { Key } from 'aws-cdk-lib/aws-kms';


const mockApp = new App();
const stack = new Stack(mockApp, 'test');

const myBucket = Bucket.fromBucketName(stack, 'mybucket', 'xxxxxxxxxx');
const myKey = Key.fromKeyArn(stack, 'Key', 'xxxxxxxxxx');

new LakeformationS3Location(stack, 'Location', {
  s3Bucket: myBucket,
  s3ObjectKey: 'test',
  kmsKey: myKey,
});
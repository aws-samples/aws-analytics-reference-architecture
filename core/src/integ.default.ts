import { App, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { DataDomain } from './data-mesh';


const mockApp = new App();
const stack = new Stack(mockApp, 'test');

// const myBucket = Bucket.fromBucketName(stack, 'mybucket', 'xxxxxxxxxx');
// const myKey = Key.fromKeyArn(stack, 'Key', 'xxxxxxxxxx');

// new LakeformationS3Location(stack, 'Location', {
//   s3Bucket: myBucket,
//   s3ObjectKey: 'test',
//   kmsKey: myKey,
// });

new DataDomain(stack, 'CentralGovernance', { centralAccountId: '11111111111111111'});


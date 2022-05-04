import { App, Stack, Aspects } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { BatchReplayer } from './data-generator/batch-replayer';
import { PreparedDataset } from './datasets';


const mockApp = new App();
const stack = new Stack(mockApp, 'eks-emr-studio');

Aspects.of(mockApp).add(new AwsSolutionsChecks({ verbose: true }));

new BatchReplayer(stack,'test',{
  dataset: PreparedDataset.RETAIL_1_GB_CUSTOMER,
  s3LocationSink: {
    bucketName: 'test',
    objectKey: 'test',
  }
})
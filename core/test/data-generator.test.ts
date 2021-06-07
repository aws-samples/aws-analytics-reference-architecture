import * as cdk from '@aws-cdk/core';
import { DataGenerator, Dataset } from '../src/data-generator';
import '@aws-cdk/assert/jest';

test('custom Dataset', () => {
  new cdk.Stack();
  // Instantiate a custom Dataset
  const customDataset = new Dataset('s3://custom-s3-path', 'custom_datetime');
  // Test if parameters are right
  expect(customDataset.location).toEqual('s3://custom-s3-path');
  expect(customDataset.datetime).toEqual('custom_datetime');
});

test('DataGenerator class', () => {
  const dataGeneratorStack = new cdk.Stack();
  // Instantiate a DataGenerator
  const predefinedGenerator = new DataGenerator(dataGeneratorStack, 'predefinedGenerator', {
    sinkArn: 'arn:aws:s3:::*',
    sourceS3Path: Dataset.RETAIL_WEBSALE.location,
    sourceDatetime: Dataset.RETAIL_WEBSALE.datetime,
  });
  expect(predefinedGenerator.sourceS3Path).toEqual(Dataset.RETAIL_WEBSALE.location);
  expect(predefinedGenerator.sourceDatetime).toEqual(Dataset.RETAIL_WEBSALE.datetime);
});
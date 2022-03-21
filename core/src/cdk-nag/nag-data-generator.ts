import { App, Aspects, Stack } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { DataGenerator } from '../data-generator';
import { Dataset } from '../datasets';

const mockApp = new App();

const dataGeneratorStack = new Stack(mockApp, 'data-generator');
// Instantiate a DataGenerator
const predefinedGenerator = new DataGenerator(dataGeneratorStack, 'predefinedGenerator', {
  sinkArn: 'arn:aws:s3:::test-bucket',
  dataset: Dataset.RETAIL_1GB_STORE_SALE,
});

Aspects.of(predefinedGenerator).add(new AwsSolutionsChecks({ verbose: true }));

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Stack } from '@aws-cdk/core';
import { DataGenerator } from '../src/data-generator';
import { Dataset } from '../src/datasets';
import '@aws-cdk/assert/jest';

const dataGeneratorStack = new Stack();
// Instantiate a DataGenerator
const predefinedGenerator = new DataGenerator(dataGeneratorStack, 'predefinedGenerator', {
  sinkArn: 'arn:aws:s3:::test-bucket',
  dataset: Dataset.RETAIL_1GB_STORE_SALE,
});

test('Predefined source Amazon S3 Bucket', () => {
  // Test if the Amazon S3 Bucket for the source is correct
  expect(predefinedGenerator.dataset.location.bucketName).toEqual(Dataset.RETAIL_1GB_STORE_SALE.location.bucketName);
});

test('Predefined source Amazon S3 prefix', () => {
  // Test if the Amazon S3 Prefix for the source is correct
  expect(predefinedGenerator.dataset.location.objectKey).toEqual(Dataset.RETAIL_1GB_STORE_SALE.location.objectKey);
});
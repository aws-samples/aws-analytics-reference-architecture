// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Stack } from '@aws-cdk/core';
import { DataGenerator, Dataset } from '../src/data-generator';
import '@aws-cdk/assert/jest';

const dataGeneratorStack = new Stack();
// Instantiate a custom Dataset
const customDataset = new Dataset('s3://custom-s3-path', 'custom_datetime');

test('custom Dataset location', () => {
  // Test if location parameter is right
  expect(customDataset.location).toEqual('s3://custom-s3-path');
});

test('custom Dataset datetime', () => {
  // Test if datetime parameter is right
  expect(customDataset.datetime).toEqual('custom_datetime');
});

// Instantiate a DataGenerator
const predefinedGenerator = new DataGenerator(dataGeneratorStack, 'predefinedGenerator', {
  sinkArn: 'arn:aws:s3:::*',
  sourceS3Path: Dataset.RETAIL_WEBSALE.location,
  sourceDatetime: Dataset.RETAIL_WEBSALE.datetime,
});

test('DataGenerator source S3 path', () => {
  // Test if the source S3 path is right
  expect(predefinedGenerator.sourceS3Path).toEqual(Dataset.RETAIL_WEBSALE.location);
});

test('DataGenerator source datetime', () => {
  // Test if the source datetime column is right
  expect(predefinedGenerator.sourceDatetime).toEqual(Dataset.RETAIL_WEBSALE.datetime);
});
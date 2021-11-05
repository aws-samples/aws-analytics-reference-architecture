// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, Stack } from '@aws-cdk/core';
import { DataGenerator, Dataset } from '.';
import { AthenaDefaultSetup } from './athena-default-setup';
import { DataLakeStorage } from './data-lake-storage';

const mockApp = new App();
const stack = new Stack(mockApp, 'teststack');
new AthenaDefaultSetup(stack, 'integ-test-lake');

const storage = new DataLakeStorage(stack, 'integ-test-storage', {});

new DataGenerator(stack, 'integ-test-data-generator', {
  dataset: Dataset.RETAIL_1GB_STORE_SALE,
  sinkArn: storage.rawBucket.bucketArn,
  frequency: 120,
});

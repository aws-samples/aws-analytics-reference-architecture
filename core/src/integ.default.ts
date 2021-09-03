// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, Stack } from '@aws-cdk/core';
import { DataLakeStorage } from '.';
import { DataGenerator } from './data-generator';
import { Dataset } from './dataset';

const mockApp = new App();
const stack = new Stack(mockApp, 'teststack');
const lake = new DataLakeStorage(stack, 'testlake', {});
new DataGenerator(stack, 'testing-generator', {
  sinkArn: lake.rawBucket.bucketArn,
  dataset: Dataset.RETAIL_1GB_STORE_SALE,
  frequency: 4,
});
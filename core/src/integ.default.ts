// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Bucket } from '@aws-cdk/aws-s3';
import { App, Stack } from '@aws-cdk/core';
import { BatchReplayer } from './data-generator/batch-replayer';
import { PreparedDataset } from './datasets/prepared-dataset';

const mockApp = new App();
const testStack = new Stack(mockApp, 'DataReplayerTestStack');

const integTestBucket = new Bucket(testStack, "IntegTestBucket");

new BatchReplayer(testStack, "CustomerIntegBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_CUSTOMER,
  frequency: 600, 
  sinkBucket: integTestBucket,
  outputFileMaxSizeInBytes: 20480,
});
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Bucket } from '@aws-cdk/aws-s3';
import { App, Stack } from '@aws-cdk/core';
import { BatchReplayer } from './data-generator/batch-replayer';
import { PartitionedDataset } from './datasets/partitioned-dataset';

const mockApp = new App();
const testStack = new Stack(mockApp, 'DataReplayerTestStack');

const integTestBucket = new Bucket(testStack, "IntegTestBucket");

new BatchReplayer(testStack, "CoreIntegBatchReplayer", {
  dataset: PartitionedDataset.RETAIL_1GB_WEB_SALE,
  frequency: 600, 
  sinkBucket: integTestBucket
});
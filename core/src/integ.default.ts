// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Bucket } from '@aws-cdk/aws-s3';
import { App, Stack } from '@aws-cdk/core';
import { BatchReplayer } from './data-generator/batch-replayer';
import { PreparedDataset } from './datasets/prepared-dataset';

const mockApp = new App();
const testStack = new Stack(mockApp, 'DataReplayerTestStack');

const integTestBucket = new Bucket(testStack, "IntegTestBucket");
const sinkLocation = {bucketName: integTestBucket.bucketName, objectKey: ''};

new BatchReplayer(testStack, "WebSaleIntegBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  frequency: 600, 
  s3LocationSink: sinkLocation,
  outputFileMaxSizeInBytes: 20480,
});

new BatchReplayer(testStack, "StoreSaleIntegBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_STORE_SALE,
  frequency: 600, 
  s3LocationSink: sinkLocation,
  outputFileMaxSizeInBytes: 20480,
});

new BatchReplayer(testStack, "CustomerIntegBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_CUSTOMER,
  frequency: 600, 
  s3LocationSink: sinkLocation,
  outputFileMaxSizeInBytes: 20480,
});

new BatchReplayer(testStack, "AddressIntegBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_CUSTOMER_ADDRESS,
  frequency: 600, 
  s3LocationSink: sinkLocation,
  outputFileMaxSizeInBytes: 20480,
});

new BatchReplayer(testStack, "ItemIntegBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_ITEM,
  frequency: 600, 
  s3LocationSink: sinkLocation,
  outputFileMaxSizeInBytes: 20480,
});

new BatchReplayer(testStack, "StoreIntegBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_STORE,
  frequency: 600, 
  s3LocationSink: sinkLocation,
  outputFileMaxSizeInBytes: 20480,
});

new BatchReplayer(testStack, "PromoIntegBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_PROMO,
  frequency: 600, 
  s3LocationSink: sinkLocation,
  outputFileMaxSizeInBytes: 20480,
});

new BatchReplayer(testStack, "WarehouseIntegBatchReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_WAREHOUSE,
  frequency: 600, 
  s3LocationSink: sinkLocation,
  outputFileMaxSizeInBytes: 20480,
});
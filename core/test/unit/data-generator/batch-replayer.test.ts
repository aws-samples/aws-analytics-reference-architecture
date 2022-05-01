// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Test BatchReplayer
 *
 * @group unit/other/data-generator/batch replayer
 */

import { Stack } from "@aws-cdk/core";

import { BatchReplayer } from "../../../src/data-generator/batch-replayer";
import { PartitionedDataset } from "../../../src/datasets";
import "@aws-cdk/assert/jest";
import { Template } from "@aws-cdk/assertions";

let testStack: Stack;
let batchReplayer: BatchReplayer;
let template: Template;

beforeEach(() => {
  testStack = new Stack();
  batchReplayer = new BatchReplayer(testStack, "TestBatchReplayer", {
    dataset: PartitionedDataset.RETAIL_1GB_WEB_SALE,
    frequency: 120,
    s3LocationSink: {
      bucketName: 'test',
      objectKey: 'test',
    },
  });
  template = Template.fromStack(testStack);
});

test("BatchReplayer should use given frequency", () => {
  expect(batchReplayer.frequency).toBe(120);
});

test("BatchReplayer should use default frequency", () => {
  const batchReplayerWithNoFreqProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PartitionedDataset.RETAIL_1GB_WEB_SALE,
    s3LocationSink: {
      bucketName: 'test',
      objectKey: 'test',
    },
  });
  expect(batchReplayerWithNoFreqProp.frequency).toBe(60);
});

test("BatchReplayer should use given max output file size", () => {
  const batchReplayerWithFilesizeProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PartitionedDataset.RETAIL_1GB_WEB_SALE,
    s3LocationSink: {
      bucketName: 'test',
      objectKey: 'test',
    },    outputFileMaxSizeInBytes: 20480,
  });
  expect(batchReplayerWithFilesizeProp.outputFileMaxSizeInBytes).toBe(20480);
});

test("BatchReplayer should use default max output file size 100MB", () => {
  const batchReplayerWithNoFilesizeProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PartitionedDataset.RETAIL_1GB_WEB_SALE,
    s3LocationSink: {
      bucketName: 'test',
      objectKey: 'test',
    },
  });
  expect(batchReplayerWithNoFilesizeProp.outputFileMaxSizeInBytes).toBe(100 * 1024 * 1024);
});

test("BatchReplayer should create 2 lambda functions from Dockerfile with 15 mins timeout", () => {
  template.hasResourceProperties("AWS::Lambda::Function", {
    "PackageType": "Image",
    "Timeout": 900
  })
});

test("BatchReplayer should create a step function", () => {
  template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
});



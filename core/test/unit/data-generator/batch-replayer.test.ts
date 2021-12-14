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
import { Bucket } from "@aws-cdk/aws-s3";

let testStack: Stack;
let testSinkBucket: Bucket;
let batchReplayer: BatchReplayer;

beforeEach(() => {
  testStack = new Stack();
  testSinkBucket = new Bucket(testStack, 'TestSinkBucket')
  batchReplayer = new BatchReplayer(testStack, "TestBatchReplayer", {
    dataset: PartitionedDataset.RETAIL_1GB_WEB_SALE,
    frequency: 120,
    sinkBucket: testSinkBucket,
  });
});

test("BatchReplayer should use given frequency", () => {
  expect(batchReplayer.frequency).toBe(120);
});

test("BatchReplayer should use default frequency", () => {
  const batchReplayerWithNoFreqProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PartitionedDataset.RETAIL_1GB_WEB_SALE,
    sinkBucket: testSinkBucket,
  });
  expect(batchReplayerWithNoFreqProp.frequency).toBe(60);
});

test("BatchReplayer should create a batch replay function with 15 mins timeout", () => {
  expect(testStack).toHaveResourceLike("AWS::Lambda::Function", {
    Timeout: 900,
  });
});

test("BatchReplayer should create a batch replay function with a step function", () => {
  expect(testStack).toHaveResource("AWS::StepFunctions::StateMachine");
});



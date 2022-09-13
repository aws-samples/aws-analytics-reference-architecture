// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Test BatchReplayer
 *
 * @group unit/data-generator/batch-replayer
 */

import { Duration, Stack } from "aws-cdk-lib";

import { BatchReplayer, PreparedDataset } from "../../../src/data-generator";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Template } from "aws-cdk-lib/assertions";

let testStack: Stack;
let bucket: Bucket;
let batchReplayer: BatchReplayer;
let template: Template;

beforeEach(() => {
  testStack = new Stack();
  bucket = new Bucket(testStack, 'Bucket');
  batchReplayer = new BatchReplayer(testStack, "TestBatchReplayer", {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    frequency: Duration.seconds(120),
    sinkBucket: bucket,
    sinkObjectKey: 'test'
  });
  template = Template.fromStack(testStack);
});

test("BatchReplayer should use given frequency", () => {
  expect(batchReplayer.frequency).toBe(120);
});

test("BatchReplayer should use default frequency", () => {
  const batchReplayerWithNoFreqProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    sinkBucket: bucket,
    sinkObjectKey: 'test',
  });
  expect(batchReplayerWithNoFreqProp.frequency).toBe(60);
});

test("BatchReplayer should use given max output file size", () => {
  const batchReplayerWithFilesizeProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    sinkBucket: bucket,
    sinkObjectKey: 'test',
    outputFileMaxSizeInBytes: 20480,
  });
  expect(batchReplayerWithFilesizeProp.outputFileMaxSizeInBytes).toBe(20480);
});

test("BatchReplayer should use default max output file size 100MB", () => {
  const batchReplayerWithNoFilesizeProp = new BatchReplayer(testStack, "TestBatchReplayerWithNoFreqProp", {
    dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
    sinkBucket: bucket,
    sinkObjectKey: 'test',
  });
  expect(batchReplayerWithNoFilesizeProp.outputFileMaxSizeInBytes).toBe(100 * 1024 * 1024);
});

test("BatchReplayer should create 2 lambda functions from Dockerfile with 15 mins timeout", () => {
  template.hasResourceProperties("AWS::Lambda::Function", {
    //"PackageType": "Image",
    "Timeout": 900
  })
});

test("BatchReplayer should create a step function", () => {
  template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
});



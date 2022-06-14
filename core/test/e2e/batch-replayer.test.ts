// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests BatchReplayer
*
* @group integ/data-generator/batch-replayer
*/

import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';

import { BatchReplayer } from '../../src/data-generator/batch-replayer';
import { PreparedDataset } from '../../src/data-generator/prepared-dataset';

jest.setTimeout(500000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'BatchReplayerE2eTest');

const sinkBucket = new Bucket(stack, 'SinkBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const batchReplayer = new BatchReplayer(stack, 'BatchReplay', {
  dataset: PreparedDataset.RETAIL_1_GB_STORE_SALE,
  sinkBucket: sinkBucket,
});

new cdk.CfnOutput(stack, 'DatasetName', {
  value: batchReplayer.dataset.tableName,
  exportName: 'DatasetName',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await deployStack(integTestApp, stack);

    // THEN
    expect(deployResult.outputs.DatasetName).toEqual('store_sale');

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CustomDataset
 *
 * @group integ/custom-dataset
 */

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';

import { CustomDataset, CustomDatasetInputFormat } from '../../src/data-generator/custom-dataset';
import { Duration } from 'aws-cdk-lib';

jest.setTimeout(300000);

//GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'CustomDatasetE2eTest');

const custom = new CustomDataset(stack, 'CustomDataset', {
  s3Location: {
    bucketName: 'aws-analytics-reference-architecture',
    objectKey: 'datasets/custom',
  },
  inputFormat: CustomDatasetInputFormat.CSV,
  datetimeColumn: 'tpep_pickup_datetime',
  datetimeColumnsToAdjust: ['tpep_pickup_datetime'],
  partitionRange: Duration.minutes(5),
  approximateDataSize: 1,
});

new cdk.CfnOutput(stack, 'Offset', {
  value: custom.preparedDataset.offset || 'no-offset',
  exportName: 'offset',
});

new cdk.CfnOutput(stack, 'LogGroup', {
  value: custom.glueJobLogGroup,
  exportName: 'logGroup',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const deployResult = await deployStack(integTestApp, stack);
    
    // THEN
    expect(deployResult.outputs.Offset).toMatch(new RegExp("^[0-9]+$"));
    expect(deployResult.outputs.LogGroup).toContain('/aws-glue/jobs/');

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});
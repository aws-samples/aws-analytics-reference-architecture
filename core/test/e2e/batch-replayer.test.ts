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
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { BatchReplayer } from '../../src/data-generator/batch-replayer';
import { PreparedDataset } from '../../src/datasets/prepared-dataset';

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
    const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      profile: process.env.AWS_PROFILE,
    });
    const cloudFormation = new CloudFormationDeployments({ sdkProvider });

    // WHEN
    const deployResult = await cloudFormation.deployStack({
      stack: stackArtifact,
    });

    // THEN
    expect(deployResult.outputs.DatasetName).toEqual('store_sale');

  }, 9000000);
});

afterAll(async () => {
  const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    profile: process.env.AWS_PROFILE,
  });
  const cloudFormation = new CloudFormationDeployments({ sdkProvider });

  await cloudFormation.destroyStack({
    stack: stackArtifact,
  });
});

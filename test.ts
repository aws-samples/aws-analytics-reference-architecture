// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk  from '@aws-cdk/core';
import * as dataGen from '../src/data-generator';
import * as dataLake from '../src/data-lake-storage';


const app = new cdk.App();
const stack = new cdk.Stack(app, 'stack');

const lake = new dataLake.DataLakeStorage(stack, 'dataLake', {});
new dataGen.DataGenerator(stack, 'dataGen', {
  sinkArn: lake.rawBucket.bucketArn,
  dataset: dataGen.Dataset.RETAIL_WEBSALE,
});

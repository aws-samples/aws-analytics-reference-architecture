// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CustomDataset
 *
 * @group unit/best-practice/custom-dataset
 */

import { App, Aspects, Duration, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { CustomDataset, CustomDatasetInputFormat } from '../../../src';
// eslint-disable-next-line import/no-extraneous-dependencies


const mockApp = new App();

const customDatasetStack = new Stack(mockApp, 'CustomDataset');

// Instantiate a customDataset 
new CustomDataset(customDatasetStack, 'CustomDataset', {
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


Aspects.of(customDatasetStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetJob/SynchronousGlueJobCRP',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the SynchronousGlueJobCRP' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetJob/LambdaExecutionRolePolicyCustomDatasetJobStartFn',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the SynchronousGlueJob custom resource' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetJob/LogRetentionLambdaExecutionRolePolicyCustomDatasetJobStartFn',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the SynchronousGlueJob custom resource' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetJob/LogRetentionLambdaExecutionRoleCustomDatasetJobStartFn',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the SynchronousGlueJob custom resource' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetJob/LambdaExecutionRolePolicyCustomDatasetJobWaitFn',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the SynchronousGlueJob custom resource' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetJob/LogRetentionLambdaExecutionRolePolicyCustomDatasetJobWaitFn',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the SynchronousGlueJob custom resource' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetJob/SynchronousGlueJobCRP',
  [{ id: 'AwsSolutions-IAM4', reason: 'Not the purpose of this NAG to test the SynchronousGlueJob custom resource' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetJob/SynchronousGlueJobCRP',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the SynchronousGlueJob custom resource' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetJob/SynchronousGlueJobCRP',
  [{ id: 'AwsSolutions-L1', reason: 'Not the purpose of this NAG to test the SynchronousGlueJob custom resource' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Using AWSGlueServiceRole as recommended in the AWS documentation' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/AWS679f53fac002430cb0da5b7982bd2287/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'The default lambda for AwsCustomResource CDK construct doesn\'t use the latest runtime' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/AWS679f53fac002430cb0da5b7982bd2287/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'The default lambda for AwsCustomResource CDK construct uses AWSLambdaBasicExecutionRole managed policy' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Permissions provided by CDK methods grantRead and grantReadWrite and CDK Glue Job construct. Also need wildcard for accessing all data under a prefix' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'Bucket used to store S3 access logs. Not relevant to log access.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDataset/GlueKey/Resource',
  [{ id: 'AwsSolutions-KMS5', reason: 'No need for key rotation because the key is only used one time for preparing the custom dataset' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  customDatasetStack,
  'CustomDataset/CustomDatasetRole/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The log group name cannot be infered from the Glue job properties' }],
);

                                      
test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(customDatasetStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(customDatasetStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});
                                      
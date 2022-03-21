// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

//import { ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { App, Stack, Aspects } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { EmrEksCluster } from '../emr-eks-platform/';
//import { NotebookPlatform, StudioAuthMode } from '../notebook-platform/';


const mockApp = new App();
const stack = new Stack(mockApp, 'eks-emr-studio');

Aspects.of(mockApp).add(new AwsSolutionsChecks());

EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/gromav',
});

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/awsNodeRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'EKS requires the role to use AWS managed policy, the role is protected with IRSA' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/ara-s3accesslogsBucket/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'S3 bucket used for access log' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/ara-s3accesslogsBucket/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'Bucket does not require access log, contains only EKS pod templates' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/Autoscaler/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'These are actions that are of type list and should have a wildcard' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/Autoscaler/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-EKS1', reason: 'EKS cluster is meant to be public' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/lambdaExecutionRolePolicyara-EmrManagedEndpointProviderOnEvent/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Violation mitigated with tag based access control' }],
);

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
* Tests CdkDeployer
*
* @group unit/best-practice/cdk-deployer
*/


import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { CdkDeployer, DeploymentType } from '../../../src/common/cdk-deployer';

const mockApp = new App();

const stack = new CdkDeployer(mockApp, {
  deploymentType: DeploymentType.CLICK_TO_DEPLOY,
  githubRepository: 'aws-samples/aws-analytics-reference-architecture',
  cdkAppLocation: 'refarch/aws-native',
  cdkParameters: {
    Foo: {
      default: 'no-value',
      type: 'String',
    },
    Bar: {
      default: 'some-value',
      type: 'String',
    },
  },
});

Aspects.of(stack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKDeployer/CdkBuildPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wildcard required because the CDKToolkit ID is not know and random' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKDeployer/CodeBuildRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'DefaultPolicy provided by CodeBuild Project L2 CDK construct' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKDeployer/ReportBuildRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Provided by the Custom Resource framework of CDK' }],
);

// NagSuppressions.addResourceSuppressionsByPath(
//   stack,
//   'CDKDeployer/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/Resource',
//   [{ id: 'AwsSolutions-IAM4', reason: 'Provided by the Custom Resource framework of CDK' }],
//   true,
// );

// NagSuppressions.addResourceSuppressionsByPath(
//   stack,
//   'CDKDeployer/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/Resource',
//   [{ id: 'AwsSolutions-IAM5', reason: 'Provided by the Custom Resource framework of CDK' }],
//   true,
// );

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CDKDeployer/StartBuildRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Provided by the Custom Resource framework of CDK' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  '/CDKDeployer/StartBuildFunction/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Provided by the Custom Resource framework of CDK' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  '/CDKDeployer/ReportBuildFunction/Resource',
  [{ id: 'AwsSolutions-L1', reason: 'Provided by the Custom Resource framework of CDK' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(stack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(stack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});
      
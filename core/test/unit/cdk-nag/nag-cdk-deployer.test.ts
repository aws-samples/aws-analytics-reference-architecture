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
import { CdkDeployer } from '../../../src/common/cdk-deployer';

const mockApp = new App();

const stack = new CdkDeployer(mockApp, 'CdkDeployStack', {
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
  'CdkDeployStack/CdkBuildPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wildcard required because the CDKToolkit ID is not know and random' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CdkDeployStack/CodeBuildRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'DefaultPolicy provided by CodeBuild Project L2 CDK construct' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CdkDeployStack/ReportBuildRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Provided by the Custom Resource framework of CDK' }],
);

// NagSuppressions.addResourceSuppressionsByPath(
//   stack,
//   'CdkDeployStack/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/Resource',
//   [{ id: 'AwsSolutions-IAM4', reason: 'Provided by the Custom Resource framework of CDK' }],
//   true,
// );

// NagSuppressions.addResourceSuppressionsByPath(
//   stack,
//   'CdkDeployStack/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/Resource',
//   [{ id: 'AwsSolutions-IAM5', reason: 'Provided by the Custom Resource framework of CDK' }],
//   true,
// );

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'CdkDeployStack/StartBuildRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Provided by the Custom Resource framework of CDK' }],
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
      
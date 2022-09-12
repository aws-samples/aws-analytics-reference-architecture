// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomain
 *
 * @group unit/best-practice/data-domain
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Stack, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataDomain } from '../../../src/data-mesh';


const mockApp = new App();

const dataDomainStack = new Stack(mockApp, 'dataDomain');

new DataDomain(dataDomainStack, 'myDataDomain', {
  domainName: 'Domain1Name',
  centralAccountId: '1234567891011',
  crawlerWorkflow: true,
})

Aspects.of(dataDomainStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/WorkflowRole',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/WorkflowRole',
  [{ id: 'AwsSolutions-IAM4', reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/WorkflowRole',
  [{ id: 'AwsSolutions-L1', reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/SecretKey/Resource',
  [{
    id: 'AwsSolutions-KMS5',
    reason: 'The KMS key encrypt a secret used for sharing references between environments and doesn\'t store sensitive data'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/DomainBucketSecret/Resource',
  [{
    id: 'AwsSolutions-SMG4',
    reason: 'The secret is used for sharing references between environments and doesn\'t store sensitive data'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/DataDomainCrawler',
  [{ id: 'AwsSolutions-IAM5', reason: 'DataDomainCrawler construct not in the scope of this NAG test' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/DataDomainCrawler',
  [{ id: 'AwsSolutions-SF2', reason: 'DataDomainCrawler construct not in the scope of this NAG test' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/SendEvents/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The LF admin role needs all events:Put actions (PutEvents, PutPermission, PutRule, PutTargets), hence Put:* for this specific Event Bus.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'The S3 bucket used for access logs can\'t have access log enabled' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/nracWorkflow/nracStateMachine/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'X-ray not required for the CentralGovernance workflow' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/tbacWorkflow/tbacStateMachine/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function doesn\'t need X-ray' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/CdkLfAdmin',
  [
    { id: 'AwsSolutions-S1', reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct' },
    { id: 'AwsSolutions-L1', reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct' },
    { id: 'AwsSolutions-IAM4', reason: 'Not the purpose of this NAG to LakeFormationAdmin construct' },
    { id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to LakeFormationAdmin construct' }
  ],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/LogRetentionLambdaExecutionRolePolicymyDataDomainTagPermissionsFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/LambdaExecutionRolePolicymyDataDomainTagPermissionsFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'IAM policy cannot be scoped down to log level, log name generated at run time' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataDomainStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataDomainStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CentralGovernance
 *
 * @group unit/best-practice/central-governance
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Stack, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { CentralGovernance, DataDomain } from '../../../src'


const mockApp = new App();

const centralGovStack = new Stack(mockApp, 'CentralGovernanceStack');
const dataDomainStack = new Stack(mockApp, 'DataDomainStack');

const governance = new CentralGovernance(centralGovStack, 'CentralGovernance');

new DataDomain(dataDomainStack, 'Domain', {
  centralAccountId: '1234567891011',
})

governance.registerDataDomain('Domain1', '11111111111111', 'arn:aws:secretsmanager:us-east-1:668876353122:secret:domain-config' );

Aspects.of(centralGovStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin',
  [{
    id: 'AwsSolutions-L1',
    reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct'
  }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct'
  }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct'
  }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/WorkflowRole',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Not the purpose of this NAG to test DataMeshWorkflowRole construct'
  }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/WorkflowRole',
  [{
    id: 'AwsSolutions-L1',
    reason: 'Not the purpose of this NAG to test DataMeshWorkflowRole construct'
  }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/WorkflowRole',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'Not the purpose of this NAG to test DataMeshWorkflowRole construct'
  }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/Domain1LFLocation',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Not the purpose of this NAG to test LakeFormationS3Location construct'
  }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/sendEvents/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The LF admin role needs all events:Put actions (PutEvents, PutPermission, PutRule, PutTargets), hence Put:* for this specific Event Bus.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/RegisterDataProduct/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'X-ray not required for the CentralGovernance workflow' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(centralGovStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(centralGovStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

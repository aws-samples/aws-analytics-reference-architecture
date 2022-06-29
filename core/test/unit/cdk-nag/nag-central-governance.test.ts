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
import { CentralGovernance, DataDomain } from '../../../src/data-mesh'


const mockApp = new App();

const centralGovStack = new Stack(mockApp, 'CentralGovernanceStack');
const dataDomainStack = new Stack(mockApp, 'DataDomainStack');

const governance = new CentralGovernance(centralGovStack, 'CentralGovernance', {});

const domain = new DataDomain(dataDomainStack, 'Domain', {
  centralAccountId: '1234567891011',
})

governance.registerDataDomain('Domain1', domain);

Aspects.of(centralGovStack).add(new AwsSolutionsChecks());

// See https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_stepfunctions_tasks.CallAwsService.html#iamresources 
NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/WorkflowRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Step Function CallAWSService requires iamResources to allow it to make API calls. ' +
      'For each API call required, there is a wildcard on resource as resources are not known before Step Function execution. ' +
      'Granular access controls are added to the role that Step Function assumes during execution. ' +
      'Additionally, wildcard is added for Log group by default. See: https://github.com/aws/aws-cdk/issues/7158'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/WorkflowRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'The purpose of the LfAdminRole construct is to use an AWS Managed Policy.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/sendEvents/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The LF admin role needs all events:Put actions (PutEvents, PutPermission, PutRule, PutTargets), hence Put:* for this specific Event Bus.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/RegisterDataProduct/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function X-Ray tracing is outside the scope of the CentralGovernance construct.' }],
);

NagSuppressions.addStackSuppressions(
  dataDomainStack,
  [{ id: 'AwsSolutions-IAM5', reason: 'NAG testing doesn\'t target DataDomain Construct' }],
);

NagSuppressions.addStackSuppressions(
  dataDomainStack,
  [{ id: 'AwsSolutions-IAM4', reason: 'NAG testing doesn\'t target DataDomain Construct' }],
);

NagSuppressions.addStackSuppressions(
  dataDomainStack,
  [{ id: 'AwsSolutions-SF2', reason: 'NAG testing doesn\'t target DataDomain Construct' }],
);

NagSuppressions.addStackSuppressions(
  dataDomainStack,
  [{ id: 'AwsSolutions-S1', reason: 'NAG testing doesn\'t target DataDomain Construct' }],
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

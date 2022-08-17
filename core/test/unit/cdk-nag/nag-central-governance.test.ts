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

const governance = new CentralGovernance(centralGovStack, 'CentralGovernance');

new DataDomain(dataDomainStack, 'Domain', {
  centralAccountId: '1234567891011',
})

governance.registerDataDomain('Domain1', '11111111111111' );

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
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin/lfAdminCreateCrp/framework-onEvent/Resource',
  [{
    id: 'AwsSolutions-L1',
    reason: 'Custom Resource Provider is provided by CDK and cannot be changed to latest runtime.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/GetDomainBucketCr/CustomResourcePolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'AWS Custom Resource policy is provided by CDK.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/AWS679f53fac002430cb0da5b7982bd2287/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'AWS Custom Resource lambda function role is provided by CDK.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin/lfAdminCreateFn/Resource',
  [{
    id: 'AwsSolutions-L1',
    reason: 'Custom Resource Provider is provided by CDK and cannot be changed to latest runtime.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/AWS679f53fac002430cb0da5b7982bd2287/Resource',
  [{
    id: 'AwsSolutions-L1',
    reason: 'AWS Custom Resource lambda function is provided by CDK and cannot be changed to latest runtime.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin/LogRetentionLambdaExecutionRoleCdkLakeFormationAdminlfAdminCreateFn/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Custom Resource Provider is provided by CDK and is using wildcards permissions.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin/LogRetentionLambdaExecutionRolePolicyCdkLakeFormationAdminlfAdminCreateFn/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Custom Resource Provider is provided by CDK and is using wildcards permissions.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin/LambdaExecutionRolePolicyCdkLakeFormationAdminlfAdminCreateFn/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Custom Resource Provider is provided by CDK and is using wildcards permissions.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin/lfAdminCreateCrp/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Custom Resource Provider is provided by CDK and using wildcards permissions.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/CdkLakeFormationAdmin/lfAdminCreateCrp/framework-onEvent/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'Custom Resource Provider is provided by CDK and using managed policies.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/WorkflowRole/WorkflowRolePolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Needs all ram:Get, ram:List and lakeformation permissions. Needs wildcard resources because there are only known during workflow execution.'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/sendEvents/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The LF admin role needs all events:Put actions (PutEvents, PutPermission, PutRule, PutTargets), hence Put:* for this specific Event Bus.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/Domain1LFLocation/LFS3AccessRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Permissions given by grantReadWrite() method. Permissions given to all subfolder objects.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  centralGovStack,
  'CentralGovernanceStack/CentralGovernance/RegisterDataProduct/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function X-Ray tracing is outside the scope of the CentralGovernance construct.' }],
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

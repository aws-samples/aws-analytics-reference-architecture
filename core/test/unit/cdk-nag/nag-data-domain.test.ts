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
  centralAccountId: '1234567891011',
  crawlerWorkflow: false,
})

Aspects.of(dataDomainStack).add(new AwsSolutionsChecks());

// See https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_stepfunctions_tasks.CallAwsService.html#iamresources 
NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/WorkflowRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Step Function CallAWSService requires iamResources to allow it to make API calls. ' +
      'For each API call required, there is a wildcard on resource as resources are not known before Step Function execution. ' +
      'Granular access controls are added to the role that Step Function assumes during execution. ' +
      'Additionally, wildcard is added for Log group by default. See: https://github.com/aws/aws-cdk/issues/7158'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/WorkflowRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'The purpose of the LfAdminRole construct is to use an AWS Managed Policy.'
  }],
);


// NagSuppressions.addResourceSuppressionsByPath(
//   dataDomainStack,
//   'dataDomain/myDataDomain/DataLakeAccess/Resource',
//   [{ id: 'AwsSolutions-IAM5', reason: 'The LF admin role needs access to all the objects under the prefix' }],
// );

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/SendEvents/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'The LF admin role needs all events:Put actions (PutEvents, PutPermission, PutRule, PutTargets), hence Put:* for this specific Event Bus.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/myDataDomain/DataDomainWorkflow/CrossAccStateMachine/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function X-Ray tracing is outside the scope of the DataDomain construct.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainStack,
  'dataDomain/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'The S3 bucket used for access logs can\'t have access log enabled' }],
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

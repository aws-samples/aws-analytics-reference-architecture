// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomainWorkflow
 *
 * @group unit/best-practice/data-domain-workflow
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { Role, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { App, Stack, Aspects, RemovalPolicy, Aws } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataDomainWorkflow } from '../../../src/data-mesh'


const mockApp = new App();

const dataDomainWorkflowStack = new Stack(mockApp, 'dataDomainWorkflow');

const workflowRole = new Role(dataDomainWorkflowStack, 'myRole', {
  assumedBy: new CompositePrincipal(
    new ServicePrincipal('glue.amazonaws.com'),
    new ServicePrincipal('lakeformation.amazonaws.com'),
    new ServicePrincipal('states.amazonaws.com')
  ),
});
workflowRole.applyRemovalPolicy(RemovalPolicy.DESTROY)

const eventBus = new EventBus(dataDomainWorkflowStack, 'dataDomainEventBus', {
  eventBusName: `${Aws.ACCOUNT_ID}_dataDomainEventBus`,
});
eventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

new DataDomainWorkflow(dataDomainWorkflowStack, 'myDataDomain', {
  workflowRole,
  centralAccountId: '1234567891011',
  eventBus,
});

Aspects.of(dataDomainWorkflowStack).add(new AwsSolutionsChecks());

// See https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_stepfunctions_tasks.CallAwsService.html#iamresources
// See https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_stepfunctions_tasks.CallAwsService.html#iamresources
NagSuppressions.addResourceSuppressionsByPath(
  dataDomainWorkflowStack,
  'dataDomainWorkflow/myRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Step Function CallAWSService requires iamResources to allow it to make API calls. ' +
      'For each API call required, there is a wildcard on resource as resources are not known before Step Function execution. ' +
      'Granular access controls are added to the role that Step Function assumes during execution. ' +
      'Additionally, wildcard is added for Log group by default. See: https://github.com/aws/aws-cdk/issues/7158'
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainWorkflowStack,
  'dataDomainWorkflow/myDataDomain/CrossAccStateMachine/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function X-Ray tracing is outside the scope of the DataDomainWorkflow construct.' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataDomainWorkflowStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataDomainWorkflowStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

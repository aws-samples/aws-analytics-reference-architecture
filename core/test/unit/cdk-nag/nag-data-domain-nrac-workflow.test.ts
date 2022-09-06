// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomainNracWorkflow
 *
 * @group unit/best-practice/data-domain-nrac-workflow
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Stack, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataDomainNracWorkflow } from '../../../src/data-mesh/data-domain-nrac-workflow';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { Role, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';


const mockApp = new App();

const dataDomainNracWorkflowStack = new Stack(mockApp, 'DataDomainNracWorkflowStack');

const workflowRole = new Role(dataDomainNracWorkflowStack, 'WorkflowRole', {
  assumedBy: new CompositePrincipal(
    new ServicePrincipal('states.amazonaws.com'),
  ),
});

const eventBus = new EventBus(dataDomainNracWorkflowStack, 'DataDomainEventBus', {
  eventBusName: 'data-mesh-bus',
});

new DataDomainNracWorkflow(dataDomainNracWorkflowStack, 'DataDomainWorflow', {
  workflowRole: workflowRole,
  centralAccountId: '11111111111111',
  domainName: 'Domain1Name',
  eventBus: eventBus,
});

Aspects.of(dataDomainNracWorkflowStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainNracWorkflowStack,
  'DataDomainNracWorkflowStack/WorkflowRole',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the IAM Role' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainNracWorkflowStack,
  'DataDomainNracWorkflowStack/DataDomainWorflow/nracStateMachine/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function doesn\'t need X-ray' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainNracWorkflowStack,
  'DataDomainNracWorkflowStack/DataDomainWorflow/nracStateMachine/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function doesn\'t need X-ray' }],
  true,
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataDomainNracWorkflowStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataDomainNracWorkflowStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

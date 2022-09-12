// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomainTbacWorkflow
 *
 * @group unit/best-practice/data-domain-tbac-workflow
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Stack, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataDomainTbacWorkflow } from '../../../src/data-mesh/data-domain-tbac-workflow';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { Role, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';


const mockApp = new App();

const dataDomainTbacWorkflowStack = new Stack(mockApp, 'DataDomainTbacWorkflowStack');

const workflowRole = new Role(dataDomainTbacWorkflowStack, 'WorkflowRole', {
  assumedBy: new CompositePrincipal(
    new ServicePrincipal('states.amazonaws.com'),
  ),
});

const eventBus = new EventBus(dataDomainTbacWorkflowStack, 'DataDomainEventBus', {
  eventBusName: 'data-mesh-bus',
});

new DataDomainTbacWorkflow(dataDomainTbacWorkflowStack, 'DataDomainTbacWorkflow', {
  workflowRole: workflowRole,
  centralAccountId: '11111111111111',
  domainName: 'Domain1Name',
  eventBus: eventBus,
});

Aspects.of(dataDomainTbacWorkflowStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainTbacWorkflowStack,
  'DataDomainTbacWorkflowStack/WorkflowRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the IAM Role' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainTbacWorkflowStack,
  'DataDomainTbacWorkflowStack/DataDomainTbacWorkflow/tbacStateMachine/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function doesn\'t need X-ray' }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataDomainTbacWorkflowStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataDomainTbacWorkflowStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

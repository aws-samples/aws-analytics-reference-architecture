// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomainWorkflow
 *
 * @group unit/best-practice/data-domain-workflow
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Stack, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataDomainWorkflow } from '../../../src/data-mesh/data-domain-workflow';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { Role, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';


const mockApp = new App();

const dataDomainWorkflowStack = new Stack(mockApp, 'DataDomainWorkflowStack');
  
  const workflowRole = new Role(dataDomainWorkflowStack, 'WorkflowRole', {
    assumedBy: new CompositePrincipal(
      new ServicePrincipal('states.amazonaws.com'),
    ),
  });

  const eventBus = new EventBus(dataDomainWorkflowStack, 'DataDomainEventBus', {
    eventBusName: 'data-mesh-bus',
  });
  
  new DataDomainWorkflow(dataDomainWorkflowStack, 'DataDomainWorflow', {
    workflowRole: workflowRole,
    centralAccountId: '11111111111111',
    eventBus: eventBus,
  });

Aspects.of(dataDomainWorkflowStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainWorkflowStack,
  'DataDomainWorkflowStack/WorkflowRole',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the IAM Role' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainWorkflowStack,
  'DataDomainWorkflowStack/DataDomainWorflow/CrossAccStateMachine/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function doesn\'t need X-ray' }],
  true,
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

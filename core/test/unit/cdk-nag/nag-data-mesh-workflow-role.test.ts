// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataMeshWorkflowRole
 *
 * @group unit/best-practice/data-mesh-workflow-role
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Stack, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataMeshWorkflowRole } from '../../../src/data-mesh/data-mesh-workflow-role';


const mockApp = new App();

const dataMeshWorkflowRoleStack = new Stack(mockApp, 'DataMeshWorkflowRoleStack');

new DataMeshWorkflowRole(dataMeshWorkflowRoleStack, 'DataMeshWorkflowRole',);

Aspects.of(dataMeshWorkflowRoleStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataMeshWorkflowRoleStack,
  'DataMeshWorkflowRoleStack/DataMeshWorkflowRole/WorkflowRolePolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Resources are dynamic, WorkflowRolePolicy only knows resources during State Machine execution' }],
  true,
);
  
NagSuppressions.addResourceSuppressionsByPath(
  dataMeshWorkflowRoleStack,
  'DataMeshWorkflowRoleStack/DataMeshWorkflowRole/LfAdmin',
  [{ id: 'AwsSolutions-L1', reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataMeshWorkflowRoleStack,
  'DataMeshWorkflowRoleStack/DataMeshWorkflowRole/LfAdmin',
  [{ id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataMeshWorkflowRoleStack,
  'DataMeshWorkflowRoleStack/DataMeshWorkflowRole/LfAdmin',
  [{ id: 'AwsSolutions-IAM4', reason: 'Not the purpose of this NAG to test LakeFormationAdmin construct' }],
  true,
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataMeshWorkflowRoleStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataMeshWorkflowRoleStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, Stack } from '@aws-cdk/core';
import { DataPlatform } from './notebooks-data-platform/dataplatform';
import { StudioAuthMode, StudioUserDefinition } from './notebooks-data-platform/dataplatform-notebook';

const envInteg = { account: '', region: '' };

const mockApp = new App();
const stack = new Stack(mockApp, 'deployment', { env: envInteg });

const dept1 = DataPlatform.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
});

dept1.addNotebookPlatform({
  studioName: 'mystudio1',
  emrVCNamespace: 'mystudio1ns',
  studioAuthMode: StudioAuthMode.SSO,
  acmCertificateArn: 'arn:aws:acm:eu-west-1:123456789012:certificate/8a5dceb1-ee9d-46a5-91d2-7b4a1ea0b64d',
});

let userList: StudioUserDefinition[] = [{
  identityName: '', /*<username or Group as it appears in SSO>*/
  identityType: 'USER' || 'SSO',
  executionPolicyNames: ['policyManagedEndpoint'], // The name of the policy to be used by the role for an EMR on EKS managedendpoint
}];

dept1.addUsersNotebookPlatform('unit1', userList);

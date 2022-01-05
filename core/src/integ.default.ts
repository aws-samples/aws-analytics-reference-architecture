// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { App, Stack } from '@aws-cdk/core';
import { EmrEksCluster, NotebookPlatform, StudioAuthMode } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'stack');

const policy = new ManagedPolicy(stack, 'MyPolicy',{
  statements: [
    new PolicyStatement({
      resources: ['*'],
      actions: ['s3:*'],
    }),
  ]
})

const emrEks = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'MY_ROLE_ARN',
});

const notebookPlatform =new NotebookPlatform(stack, 'platform1',{
  emrEks: emrEks,
  eksNamespace: 'test',
  studioName: 'platform1',
  studioAuthMode: StudioAuthMode.IAM,
})

notebookPlatform.addUser([{
  identityName: 'MY_USER',
  identityType: 'USER',
  executionPolicyNames: [policy.managedPolicyName],
  emrOnEksVersion: 'emr-6.3.0-latest',
}]);

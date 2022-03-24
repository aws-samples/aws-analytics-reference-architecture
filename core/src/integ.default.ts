// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { App, Stack, Aws, ArnFormat, CfnOutput } from '@aws-cdk/core';
import { EmrEksCluster, NotebookPlatform, StudioAuthMode } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'stack');

const policy = new ManagedPolicy(stack, 'MyPolicy', {
  statements: [
    new PolicyStatement({
      resources: ['*'],
      actions: ['s3:*'],
    }),
    new PolicyStatement({
      resources: [
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'logs',
          resource: '*',
          arnFormat: ArnFormat.NO_RESOURCE_NAME,
        }),
      ],
      actions: [
        'logs:*',
      ],
    }),
  ],
});

const emrEks = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::xxxxxxxxxx:role/xxxxxxxx',
});

emrEks.addEmrVirtualCluster(stack,{
  name: 'critical',
  eksNamespace: 'critical',
  createNamespace: true,
})

const role = emrEks.createExecutionRole(stack, 'critical', policy, 'critical-role');

const  notebookPlatform = new NotebookPlatform(stack, 'platform1', {
  emrEks: emrEks,
  eksNamespace: 'test2',
  studioName: 'notebook2',
  studioAuthMode: StudioAuthMode.IAM,
});

notebookPlatform.addUser([{
  identityName: 'xxxxxxxx',
  identityType: 'USER',
  notebookManagedEndpoints: [{
    emrOnEksVersion: 'emr-6.4.0-latest',
    executionPolicy: policy,
  }],
}]);

new CfnOutput(stack, 'execRole', {value: role.roleArn})


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { App, Stack, Aws, ArnFormat, Aspects } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { EmrEksCluster, NotebookPlatform, StudioAuthMode } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'stack');

Aspects.of(mockApp).add(new AwsSolutionsChecks({ verbose: true }));

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
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/gromav',
});

let notebookPlatform = new NotebookPlatform(stack, 'platform1', {
  emrEks: emrEks,
  eksNamespace: 'test',
  studioName: 'notebook1',
  studioAuthMode: StudioAuthMode.IAM,
});

notebookPlatform.addUser([{
  identityName: 'vincent',
  identityType: 'USER',
  notebookManagedEndpoints: [{
    emrOnEksVersion: 'emr-6.4.0-latest',
    executionPolicy: policy,
  }],
}]);

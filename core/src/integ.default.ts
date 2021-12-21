// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Role } from '@aws-cdk/aws-iam';
import { App, Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'stack');
const cluster = new EmrEksCluster(stack, 'testCluster', { eksAdminRoleArn: '<MY_ROLE_ARN>' });


const virtualCluster = cluster.addEmrVirtualCluster(stack, {
  name: 'sometest',
  eksNamespace: 'sometest',
  createNamespace: true,
});

// cluster.addEmrVirtualCluster(stack, {
//   name: 'anothertest',
//   eksNamespace: 'anothertest',
//   createNamespace: true,
// });
const execRole = Role.fromRoleArn(stack, 'execRole', '<MY_ROLE_ARN>');

cluster.addManagedEndpoint(stack, 'ME', {virtualClusterId: virtualCluster.attrId,executionRole: execRole});

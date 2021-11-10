// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Role } from '@aws-cdk/aws-iam';
import { App, Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'stack');
const cluster = new EmrEksCluster(stack, 'testCluster', { eksAdminRoleArn: 'arn:aws:iam::668876353122:role/gromav' });


const virtualCluster = cluster.addEmrVirtualCluster({
  name: 'sometest',
  eksNamespace: 'sometest',
  createNamespace: true,
});

cluster.addEmrVirtualCluster({
  name: 'anothertest',
  eksNamespace: 'anothertest',
  createNamespace: true,
});

const execRole = Role.fromRoleArn(stack, 'execRole', 'arn:aws:iam::668876353122:role/gromav');

cluster.addManagedEndpoint(stack, cluster.managedEndpointProviderServiceToken, 'test', virtualCluster.attrId, execRole, 'arn:aws:acm:us-east-1:668876353122:certificate/aba0c2c8-c470-43a5-a3c0-07189ee96af0');
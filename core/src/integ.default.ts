// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'stack');
const cluster = new EmrEksCluster(stack, 'testCluster', { eksAdminRoleArn: 'arn:aws:iam::668876353122:role/gromav' });

cluster.addEmrVirtualCluster({
  name: 'test',
});

cluster.addEmrVirtualCluster({
  name: 'test2',
  eksNamespace: 'test',
  createNamespace: true,
});

cluster.addEmrVirtualCluster({
  name: 'test3',
  eksNamespace: 'test',
  createNamespace: true,
});
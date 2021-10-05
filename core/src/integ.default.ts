// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, NestedStack, Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'stack');
const stack1 = new NestedStack(stack, 'teststack');
const stack2 = new NestedStack(stack, 'teststack2')
;const cluster = new EmrEksCluster(stack1, 'testCluster1', { eksAdminRoleArn: 'arn:aws:iam::XXXXXXXXXXXX:role/YYYYYYY' });
const cluster2 = new EmrEksCluster(stack2, 'testCluster2', {
  eksAdminRoleArn: 'arn:aws:iam::XXXXXXXXXXXX:role/YYYYYYY',
  eksClusterName: 'some-cluster',
});
cluster.addEmrVirtualCluster({
  name: 'test',
});
cluster2.addEmrVirtualCluster({
  name: 'test2',
});

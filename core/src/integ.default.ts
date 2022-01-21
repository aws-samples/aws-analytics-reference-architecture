// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Role } from '@aws-cdk/aws-iam';
import { App, Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'stack');
const cluster = new EmrEksCluster(stack, 'testCluster', { eksAdminRoleArn: 'arn:aws:iam::xxxxxxxxxx:role/xxxxxxxx' });


const virtualCluster = cluster.addEmrVirtualCluster({
  name: 'sometest',
  eksNamespace: 'sometest',
  createNamespace: true,
});

const execRole = Role.fromRoleArn(stack, 'execRole', 'arn:aws:iam::xxxxxxxxxx:role/xxxxxxxx');

cluster.addManagedEndpoint(stack, 'ME', virtualCluster.attrId, execRole, 'arn:aws:acm:us-east-1:xxxxxxxxxx:certificate/xxxxxxxxxxxxxxxxxxxxxxxx');
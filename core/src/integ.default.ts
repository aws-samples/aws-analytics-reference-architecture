// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'teststack');
new EmrEksCluster(stack, 'testlake', {});
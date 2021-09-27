// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, Stack } from '@aws-cdk/core';
import { AthenaDefaultSetup } from './athena-default-setup';

const mockApp = new App();
const stack = new Stack(mockApp, 'teststack');
new AthenaDefaultSetup(stack, 'testlake');
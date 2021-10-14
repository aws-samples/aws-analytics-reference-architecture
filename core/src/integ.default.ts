// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, Stack } from '@aws-cdk/core';
import { SingletonGlueDefaultRole } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'testStack');
SingletonGlueDefaultRole.getOrCreate(stack);

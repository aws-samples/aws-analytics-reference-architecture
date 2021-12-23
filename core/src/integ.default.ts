// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import { App, Stack } from '@aws-cdk/core';
import { Example } from '.';

const mockApp = new App();
const exampleStack = new Stack(mockApp, 'stack');

// Instantiate Example Construct with custom Props
new Example(exampleStack, 'CustomExample', { name: 'message', value: 'hello!' });
// Instantiate Example Construct without Props for getting default parameters
new Example(exampleStack, 'DefaultExample', {});

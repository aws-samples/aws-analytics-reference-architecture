// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Data Platform notebooks
 *
 * @group unit/other/notebooks-data-platform
 */

//TODO REDO this unit test to support the new way of deploying notebooks with nested stacks

import * as assertCDK from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { EmrEksCluster, StudioAuthMode, NotebookPlatform } from '../../../src';

const stack = new Stack();

const cluster = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
});

new NotebookPlatform(stack, 'platform1', {
  emrEks: cluster,
  eksNamespace: 'integrationtestssons',
  studioName: 'integration-test-sso',
  studioAuthMode: StudioAuthMode.SSO,
});

test('The stack should have nested stacks for the notebooks infrastructure', () => {

  assertCDK.expect(stack).to(
    assertCDK.countResources('AWS::CloudFormation::Stack', 3),
  );
});


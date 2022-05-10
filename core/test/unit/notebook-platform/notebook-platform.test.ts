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

test('The stack should have nested stacks for EKS but not for NotebookPlatform', () => {

  assertCDK.expect(stack).to(
    assertCDK.countResources('AWS::CloudFormation::Stack', 2),
  );
});

test('EMR virtual cluster should be created with proper configuration', () => {
  assertCDK.expect(stack).to (
    assertCDK.countResources('AWS::EMRContainers::VirtualCluster', 1),
  );

  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EMRContainers::VirtualCluster', {
      ContainerProvider: assertCDK.objectLike({
        Type: 'EKS',
        Info: assertCDK.objectLike({
          EksInfo: {
            Namespace: 'integrationtestssons',
          },
        }),
      }),
      Name: 'emrvcintegrationtestsso',
    }),
  );
});

test('Should find a an EMR Studio with SSO Auth Mode', () => {

  assertCDK.expect(stack).to(
    assertCDK.countResources('AWS::EMR::Studio', 1),
  );

  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EMR::Studio', {
      AuthMode: 'SSO',
    }),
  );
});

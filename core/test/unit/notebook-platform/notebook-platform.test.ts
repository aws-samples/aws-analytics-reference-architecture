// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Data Platform notebooks
 *
 * @group unit/other/notebooks-data-platform
 */

//TODO REDO this unit test to support the new way of deploying notebooks with nested stacks

import { Template, Match } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';
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

const template = Template.fromStack(stack);

test('The stack should have nested stacks for EKS but not for NotebookPlatform', () => {
  template.resourceCountIs('AWS::CloudFormation::Stack', 2);
});

test('EMR virtual cluster should be created with proper configuration', () => {
  template.resourceCountIs('AWS::EMRContainers::VirtualCluster', 1);
  
  template.hasResourceProperties('AWS::EMRContainers::VirtualCluster', {
    ContainerProvider: Match.objectLike({
      Type: 'EKS',
      Info: Match.objectLike({
        EksInfo: {
          Namespace: 'integrationtestssons',
        },
      }),
    }),
    Name: 'emrvcintegrationtestsso',
  });
});

test('Should find a an EMR Studio with SSO Auth Mode', () => {
  template.resourceCountIs('AWS::EMR::Studio', 1);

  template.hasResourceProperties('AWS::EMR::Studio', {
    AuthMode: 'SSO',
  });
});

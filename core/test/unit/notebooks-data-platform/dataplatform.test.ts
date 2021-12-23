//TODO REDO this unit test to support the new way of deploying notebooks with nested stacks

import * as assertCDK from '@aws-cdk/assert';
import { TaintEffect } from '@aws-cdk/aws-eks';
import { Stack } from '@aws-cdk/core';
import {
  StudioAuthMode,
  DataPlatform,
} from '../../../src/notebooks-data-platform';

const stack = new Stack();

const dept1 = DataPlatform.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
});

const dept2 = DataPlatform.getOrCreate(stack);

dept1.addNotebookPlatform({
  studioName: 'integration-test-sso',
  emrVCNamespace: 'integrationtestssons',
  studioAuthMode: StudioAuthMode.SSO,
});

dept1.addNotebookPlatform({
  studioName: 'integration-test-iam-fed',
  studioAuthMode: StudioAuthMode.IAM,
  emrVCNamespace: 'integrationtestiamns',
  idpAuthUrl: 'https://myapps.microsoft.com/signin/9b33f8d1-2cdd-4972-97a6-dedfc5a4bb38?tenantId=eb9c8428-db71-4fa4-9cc8-0a49d2c645c5',
  idpArn: 'arn:aws:iam::123456789012:saml-provider/AWS-ARA-Test',
});


dept2.addNotebookPlatform({
  studioName: 'integration-test-iam-auth',
  studioAuthMode: StudioAuthMode.IAM,
  emrVCNamespace: 'integrationtestauthns',
});

test('The stack should have nested stack for the notebooks infrastructure', () => {

  assertCDK.expect(stack).to(
    assertCDK.countResources('AWS::CloudFormation::Stack', 5),
  );
});

test('EKS cluster should have the default Nodegroups and two notebooks nodegroup', () => {

  assertCDK.expect(stack).to(
    assertCDK.countResources('AWS::EKS::Nodegroup', 11),
  );
  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EKS::Nodegroup', {
      NodegroupName: 'notebook-driver-0',
      InstanceTypes: ['t3.large'],
      Labels: {
        'role': 'notebook',
        'spark-role': 'driver',
        'node-lifecycle': 'on-demand',
      },
      Taints: [
        {
          Key: 'role',
          Value: 'notebook',
          Effect: TaintEffect.NO_SCHEDULE,
        },
      ],
      ScalingConfig: {
        DesiredSize: 0,
        MaxSize: 10,
        MinSize: 0,
      },
    },
    ),
  );

  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EKS::Nodegroup', {
      NodegroupName: 'notebook-executor-0',
      InstanceTypes: ['t3.2xlarge',
        't3a.2xlarge'],
      CapacityType: 'SPOT',
      Labels: {
        'role': 'notebook',
        'spark-role': 'executor',
        'node-lifecycle': 'spot',
      },
      Taints: [
        {
          Key: 'role',
          Value: 'notebook',
          Effect: 'NO_SCHEDULE',
        },
        {
          Effect: 'NO_SCHEDULE',
          Key: 'node-lifecycle',
          Value: 'spot',
        },
      ],
      ScalingConfig: {
        DesiredSize: 0,
        MaxSize: 100,
        MinSize: 0,
      },
    },
    ),
  );
});


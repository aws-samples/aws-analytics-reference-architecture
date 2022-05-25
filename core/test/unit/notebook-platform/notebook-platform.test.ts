// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Data Platform notebooks
 *
 * @group unit/notebook-data-platform
 */

import * as assertCDK from '@aws-cdk/assert';
import { ManagedPolicy, PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';
import { Stack } from '@aws-cdk/core';
import { EmrEksCluster, StudioAuthMode, NotebookPlatform, NotebookUserOptions } from '../../../src';

const stacksso = new Stack();

const stackiamfed = new Stack();
const stackiamauth = new Stack();

const clusterSSO = EmrEksCluster.getOrCreate(stacksso, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
});

const clusterIAMAUTH = EmrEksCluster.getOrCreate(stackiamauth, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
});

const clusterIAMFED = EmrEksCluster.getOrCreate(stackiamfed, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
});

const ssoNotebook = new NotebookPlatform(stacksso, 'platform1', {
  emrEks: clusterSSO,
  eksNamespace: 'integrationtestssons',
  studioName: 'integration-test-sso',
  studioAuthMode: StudioAuthMode.SSO,
});

let iamFedNotebook = new NotebookPlatform(stackiamfed, 'dataplatformIAMFed', {
  emrEks: clusterIAMFED,
  studioName: 'integration-test-iam',
  studioAuthMode: StudioAuthMode.IAM,
  eksNamespace: 'dataplatformiamfed',
  idpAuthUrl: 'https://myapps.microsoft.com/signin/9b33f8d1-2cdd-4972-97a6-dedfc5a4bb38?tenantId=eb9c8428-db71-4fa4-9cc8-0a49d2c645c5',
  idpArn: 'arn:aws:iam::012345678901:saml-provider/AWS-ARA-Test',
});

let iamAuthNotebook = new NotebookPlatform(stackiamauth, 'dataplatformIAMAuth', {
  emrEks: clusterIAMAUTH,
  studioName: 'integration-test-auth',
  studioAuthMode: StudioAuthMode.IAM,
  eksNamespace: 'dataplatformiamauth',
});

test('The stack should have nested stacks for EKS but not for NotebookPlatform', () => {

  assertCDK.expect(stacksso).to(
    assertCDK.countResources('AWS::CloudFormation::Stack', 2),
  );
});

test('EKS should have at least 1 private subnet with tags', () => {
  // THEN
  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('AWS::EC2::Subnet', {
      Tags: assertCDK.arrayWith(
        assertCDK.objectLike({
          Key: 'aws-cdk:subnet-type',
          Value: 'Private',
        }),
        assertCDK.objectLike({
          Key: 'for-use-with-amazon-emr-managed-policies',
          Value: 'true',
        }),
      ),
    }),
  );
});

test('EMR virtual cluster should be created with proper configuration', () => {
  assertCDK.expect(stacksso).to (
    assertCDK.countResources('AWS::EMRContainers::VirtualCluster', 1),
  );

  assertCDK.expect(stacksso).to(
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

  assertCDK.expect(stacksso).to(
    assertCDK.countResources('AWS::EMR::Studio', 1),
  );

  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('AWS::EMR::Studio', {
      AuthMode: 'SSO',
    }),
  );
});


test('Should find an IAM role for EMR Studio used as Service Role', () => {
  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('AWS::IAM::Role', {
      RoleName: 'studioServiceRole+integrationtestsso',
    }),
  );
});

test('Should find a an EMR Studio with SSO Auth Mode', () => {

  assertCDK.expect(stacksso).to(
    assertCDK.countResources('AWS::EMR::Studio', 1),
  );

  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('AWS::EMR::Studio', {
      AuthMode: 'SSO',
      DefaultS3Location: {
        'Fn::Join': [
          '',
          [
            's3://',
            {
              Ref: 'workspacesbucketintegrationtestsso04B693AF',
            },
            '/',
          ],
        ],
      },
    }),
  );
});

test('Should find a mapping between an EMR Studio, a user and a session policy for SSO or an IdP identity and a role', () => {

  const policySSO = new ManagedPolicy(stacksso, 'testPolicy', {
    document: new PolicyDocument({
      statements: [
        new PolicyStatement({
          resources: ['*'],
          actions: ['s3:*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['logs:*'],
        }),
      ],
    }),
  });

  const policyIAMFed = new ManagedPolicy(stackiamfed, 'testPolicy', {
    document: new PolicyDocument({
      statements: [
        new PolicyStatement({
          resources: ['*'],
          actions: ['s3:*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['logs:*'],
        }),
      ],
    }),
  });

  const policyIAMAuth = new ManagedPolicy(stackiamauth, 'testPolicy', {
    document: new PolicyDocument({
      statements: [
        new PolicyStatement({
          resources: ['*'],
          actions: ['s3:*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['logs:*'],
        }),
      ],
    }),
  });

  let userList_SSO: NotebookUserOptions[] = [{
    identityName: 'lotfi-emr-advanced',
    identityType: 'USER',
    notebookManagedEndpoints: [{
      executionPolicy: policySSO,
    }],
  },
  {
    identityName: 'JohnDoe',
    identityType: 'USER',
    notebookManagedEndpoints: [{
      executionPolicy: policySSO,
    }],
  }];

  ssoNotebook.addUser(userList_SSO);

  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('AWS::EMR::StudioSessionMapping', {
      IdentityName: 'lotfi-emr-advanced',
    }),
  );

  //Improve this test to test against the policy attached
  let userList_IAMFed: NotebookUserOptions[] = [{
    identityName: 'Toto',
    notebookManagedEndpoints: [{
      executionPolicy: policyIAMFed,
    }],
  }];

  let userList_IAMAuth: NotebookUserOptions[] = [{
    identityName: 'Toto',
    notebookManagedEndpoints: [{
      executionPolicy: policyIAMAuth,
    }],
  }];

  iamFedNotebook.addUser(userList_IAMFed);

  assertCDK.expect(stackiamfed).to(
    assertCDK.haveResource('AWS::IAM::Role', {
      RoleName: {
        'Fn::Join': [
          '',
          [
            'Role-Toto',
            {
              'Fn::GetAtt': [
                'dataplatformIAMFedStudiointegrationtestiam434AEA47',
                'StudioId',
              ],
            },
          ],
        ],
      },

    }),
  );

  iamAuthNotebook.addUser(userList_IAMAuth);

  assertCDK.expect(stackiamauth).to(
    assertCDK.haveResource('AWS::IAM::User'),
  );

});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Data Platform notebooks
 *
 * @group unit/notebook-data-platform
 */

//TODO REDO this unit test to support the new way of deploying notebooks with nested stacks

import { Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { ManagedPolicy, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { EmrEksCluster, StudioAuthMode, NotebookPlatform, NotebookUserOptions } from '../../../src';

const stacksso = new Stack();

const stackiamfed = new Stack();
const stackiamauth = new Stack();

const clusterSSO = EmrEksCluster.getOrCreate(stacksso, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
});

new NotebookPlatform(stacksso, 'platform1', {
  emrEks: clusterSSO,
  eksNamespace: 'integrationtestssons',
  studioName: 'integration-test-sso',
  studioAuthMode: StudioAuthMode.SSO,
});

const clusterIAMAUTH = EmrEksCluster.getOrCreate(stackiamauth, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
});

const clusterIAMFED = EmrEksCluster.getOrCreate(stackiamfed, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
});

let iamFedNotebook = new NotebookPlatform(stackiamfed, 'dataplatformIAMFed', {
  emrEks: clusterIAMFED,
  studioName: 'integration-test-iam',
  studioAuthMode: StudioAuthMode.IAM,
  eksNamespace: 'dataplatformiamfed',
  idpAuthUrl:
    'https://myapps.microsoft.com/signin/9b33f8d1-2cdd-4972-97a6-dedfc5a4bb38?tenantId=eb9c8428-db71-4fa4-9cc8-0a49d2c645c5',
  idpArn: 'arn:aws:iam::012345678901:saml-provider/AWS-ARA-Test',
});

let iamAuthNotebook = new NotebookPlatform(stackiamauth, 'dataplatformIAMAuth', {
  emrEks: clusterIAMAUTH,
  studioName: 'integration-test-auth',
  studioAuthMode: StudioAuthMode.IAM,
  eksNamespace: 'dataplatformiamauth',
});

const stackssoTemplate = Template.fromStack(stacksso);

test('The stack should have nested stacks for EKS but not for NotebookPlatform', () => {
  stackssoTemplate.resourceCountIs('AWS::CloudFormation::Stack', 2);
});

test('EKS should have at least 1 private subnet with tags', () => {
  // THEN
  stackssoTemplate.hasResourceProperties('AWS::EC2::Subnet', {
    Tags: Match.arrayWith([
      Match.objectLike({
        Key: 'aws-cdk:subnet-type',
        Value: 'Private',
      }),
      Match.objectLike({
        Key: 'for-use-with-amazon-emr-managed-policies',
        Value: 'true',
      }),
    ]),
  });
});

test('EMR virtual cluster should be created with proper configuration', () => {
  stackssoTemplate.resourceCountIs('AWS::EMRContainers::VirtualCluster', 1);

  stackssoTemplate.hasResourceProperties('AWS::EMRContainers::VirtualCluster', {
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
  stackssoTemplate.resourceCountIs('AWS::EMR::Studio', 1),
  stackssoTemplate.hasResourceProperties('AWS::EMR::Studio', {
    AuthMode: 'SSO',
  });
});

test('Should find an IAM role for EMR Studio used as Service Role', () => {
  stackssoTemplate.hasResourceProperties('AWS::IAM::Role', {
    RoleName: 'studioServiceRole+integrationtestsso',
  });
});

test('Should find a an EMR Studio with SSO Auth Mode', () => {
  stackssoTemplate.resourceCountIs('AWS::EMR::Studio', 1),
  stackssoTemplate.hasResourceProperties('AWS::EMR::Studio', {
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
  });
});

test('Should find a mapping between an EMR Studio, a user and a session policy for SSO or an IdP identity and a role', () => {
  const stacksso = new Stack();

  const clusterSSO = EmrEksCluster.getOrCreate(stacksso, {
    eksAdminRoleArn: 'arn:aws:iam::123456789012:role/Admin',
  });

  const ssoNotebook = new NotebookPlatform(stacksso, 'platform1', {
    emrEks: clusterSSO,
    eksNamespace: 'integrationtestssons',
    studioName: 'integration-test-sso',
    studioAuthMode: StudioAuthMode.SSO,
  });

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

  let userList_SSO: NotebookUserOptions[] = [
    {
      identityName: 'lotfi-emr-advanced',
      identityType: 'USER',
      notebookManagedEndpoints: [
        {
          executionPolicy: policySSO,
          managedEndpointName: 'ssoRole',
        },
      ],
    },
    {
      identityName: 'JohnDoe',
      identityType: 'USER',
      notebookManagedEndpoints: [
        {
          executionPolicy: policySSO,
          managedEndpointName: 'ssoRole',
        },
      ],
    },
  ];

  ssoNotebook.addUser(userList_SSO);

  const stackssoTemplate = Template.fromStack(stacksso);
  stackssoTemplate.hasResourceProperties('AWS::EMR::StudioSessionMapping', {
    IdentityName: 'lotfi-emr-advanced',
  });

  //Improve this test to test against the policy attached
  let userList_IAMFed: NotebookUserOptions[] = [
    {
      identityName: 'Toto',
      notebookManagedEndpoints: [
        {
          executionPolicy: policyIAMFed,
          managedEndpointName: 'iamFedRole',
        },
      ],
    },
  ];

  let userList_IAMAuth: NotebookUserOptions[] = [
    {
      identityName: 'Toto',
      notebookManagedEndpoints: [
        {
          executionPolicy: policyIAMAuth,
          managedEndpointName: 'iamAuthRole',
        },
      ],
    },
  ];

  iamFedNotebook.addUser(userList_IAMFed);

  const stackiamfedTemplate = Template.fromStack(stackiamfed);

  stackiamfedTemplate.hasResourceProperties('AWS::IAM::Role', {
    RoleName: {
      'Fn::Join': [
        '',
        [
          'Role-Toto',
          {
            'Fn::GetAtt': ['dataplatformIAMFedStudiointegrationtestiam434AEA47', 'StudioId'],
          },
        ],
      ],
    },
  });

  iamAuthNotebook.addUser(userList_IAMAuth);
});

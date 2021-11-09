import * as assertCDK from '@aws-cdk/assert';
import { TaintEffect } from '@aws-cdk/aws-eks';
import { Stack } from '@aws-cdk/core';
import {
  DataPlatformNotebook,
  StudioAuthMode,
  StudioUserDefinition,
} from '../src/dataplatform-notebook';

const stacksso = new Stack();
const stackiamfed = new Stack();
const stackiamauth = new Stack();

let dataPlatformSSO = new DataPlatformNotebook(stacksso, 'dataplatform', {
  studioName: 'integration-test-sso',
  emrVCNamespace: 'dataplatformsso',
  studioAuthMode: StudioAuthMode.SSO,
  eksAdminRoleArn: 'arn:aws:iam::012345678901:role/Admin',
  acmCertificateArn: 'arn:aws:acm:eu-west-1:012345678901:certificate/8a5dceb1-ee9d-46a5-91d2-7b4a1ea0b64d',
});

let dataPlatformIAMFed = new DataPlatformNotebook(stackiamfed, 'dataplatform', {
  studioName: 'integration-test-iam',
  studioAuthMode: StudioAuthMode.IAM_FEDERATED,
  emrVCNamespace: 'dataplatformiamfed',
  eksAdminRoleArn: 'arn:aws:iam::012345678901:role/Admin',
  acmCertificateArn: 'arn:aws:acm:eu-west-1:012345678901:certificate/8a5dceb1-ee9d-46a5-91d2-7b4a1ea0b64d',
  idpAuthUrl: 'https://myapps.microsoft.com/signin/9b33f8d1-2cdd-4972-97a6-dedfc5a4bb38?tenantId=eb9c8428-db71-4fa4-9cc8-0a49d2c645c5',
  idPArn: 'arn:aws:iam::012345678901:saml-provider/AWS-ARA-Test',
});

let dataPlatformIAMAuth = new DataPlatformNotebook(stackiamauth, 'dataplatform', {
  studioName: 'integration-test-auth',
  studioAuthMode: StudioAuthMode.IAM_AUTHENTICATED,
  emrVCNamespace: 'dataplatformiamauth',
  eksAdminRoleArn: 'arn:aws:iam::012345678901:role/Admin',
  acmCertificateArn: 'arn:aws:acm:eu-west-1:012345678901:certificate/8a5dceb1-ee9d-46a5-91d2-7b4a1ea0b64d',
});

test('Stack should have a KMS encryption key', () => {
  assertCDK.expect(stacksso).to(
    assertCDK.countResources('AWS::KMS::Key', 1),
  );
});


test('EKS cluster created with correct version and name', () => {
  // THEN
  assertCDK.expect(stacksso).to(
    assertCDK.countResources('Custom::AWSCDK-EKS-Cluster', 1),
  );

  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('Custom::AWSCDK-EKS-Cluster', {
      Config: assertCDK.objectLike({
        version: '1.20',
        name: 'ara-cluster',
      }),
    }),
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

test('EKS cluster should have the default Nodegroups and two notebooks nodegroup', () => {

  assertCDK.expect(stacksso).to(
    assertCDK.countResources('AWS::EKS::Nodegroup', 11),
  );
  assertCDK.expect(stacksso).to(
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

  assertCDK.expect(stacksso).to(
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
            Namespace: 'dataplatformsso',
          },
        }),
      }),
      Name: 'emr-vc-integration-test-sso',
    }),
  );
});

//TODO ENHANCE THIS TESTS TO TEST FOR SG RULES
test('workspace security group should allow outbound access to port 18888 and to port 443 on TCP', () => {

  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('AWS::EC2::SecurityGroup', {
      GroupName: 'workSpaceSecurityGroup-integration-test-sso',
      Tags: assertCDK.objectLike([{
        Key: 'for-use-with-amazon-emr-managed-policies',
        Value: 'true',
      }]),
      VpcId: {
        Ref: 'araclusterDefaultVpcD501221D',
      },
    }),
  );
});

test('engine security group should be present, not used with EMR on EKS, but required for EMR Studio', () => {

  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('AWS::EC2::SecurityGroup', {
      GroupName: 'engineSecurityGroup-integration-test-sso',
      Tags: assertCDK.objectLike([{
        Key: 'for-use-with-amazon-emr-managed-policies',
        Value: 'true',
      }]),
      VpcId: {
        Ref: 'araclusterDefaultVpcD501221D',
      },
    }),
  );
});

test('Should find 2 S3 bucket used for EMR Studio Notebook and to upload node templates ', () => {

  // Count the number of buckets it should be
  assertCDK.expect(stacksso).to(
    assertCDK.countResources('AWS::S3::Bucket', 2),
  );

  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('AWS::S3::Bucket', {
      BucketName: {
        'Fn::Join': [
          '',
          [
            'ara-workspaces-bucket-',
            {
              Ref: 'AWS::AccountId',
            },
            '-integrationtestsso',
          ],
        ],
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              KMSMasterKeyID: {
                'Fn::GetAtt': [
                  'dataplatformKMSkeyintegrationtestsso85DE5F2E',
                  'Arn',
                ],
              },
              SSEAlgorithm: 'aws:kms',
            },
          },
        ],
      },
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
              Ref: 'dataplatformWorkspacesBucketintegrationtestssoC5D3B725',
            },
            '/',
          ],
        ],
      },
    }),
  );
});

test('Should find an EMR Studio with IAM Auth Mode', () => {

  assertCDK.expect(stackiamfed).to(
    assertCDK.countResources('AWS::EMR::Studio', 1),
  );

  assertCDK.expect(stackiamfed).to(
    assertCDK.haveResource('AWS::EMR::Studio', {
      AuthMode: 'IAM',
      DefaultS3Location: {
        'Fn::Join': [
          '',
          [
            's3://',
            {
              Ref: 'dataplatformWorkspacesBucketintegrationtestiamB4FB923F',
            },
            '/',
          ],
        ],
      },
    }),
  );
});


test('Should find a mapping between an EMR Studio, a user and a session policy for SSO or an IdP identity and a role', () => {

  let userList_SSO: StudioUserDefinition[] = [{
    identityName: 'lotfi-emr-advanced',
    identityType: 'USER',
    executionPolicyNames: ['policyManagedEndpoint1', 'policyManagedEndpoint3'],
  },
  {
    identityName: 'JohnDoe',
    identityType: 'USER',
    executionPolicyNames: ['policyManagedEndpoint2', 'policyManagedEndpoint1'],
  }];

  dataPlatformSSO.addUser(userList_SSO);

  assertCDK.expect(stacksso).to(
    assertCDK.haveResource('AWS::EMR::StudioSessionMapping', {
      IdentityName: 'lotfi-emr-advanced',
    }),
  );

  //Improve this test to test against the policy attached
  let userList_IAM: StudioUserDefinition[] = [{
    identityName: 'Toto',
    executionPolicyNames: ['policyManagedEndpoint1', 'policyManagedEndpoint3'],
  }, {
    identityName: 'JaneDoe',
    executionPolicyNames: ['policyManagedEndpoint1', 'policyManagedEndpoint2'],
  }];

  dataPlatformIAMFed.addUser(userList_IAM);

  assertCDK.expect(stackiamfed).to(
    assertCDK.haveResource('AWS::IAM::Role', {
      RoleName: {
        'Fn::Join': [
          '',
          [
            'Role-Toto',
            {
              'Fn::GetAtt': [
                'dataplatformStudioECE4B5E6',
                'StudioId',
              ],
            },
          ],
        ],
      },

    }),
  );

  dataPlatformIAMAuth.addUser(userList_IAM);

  assertCDK.expect(stackiamauth).to(
    assertCDK.haveResource('AWS::IAM::User'),
  );

});

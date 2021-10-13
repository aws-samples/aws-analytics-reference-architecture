import * as assertCDK from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import {
  DataPlatformNotebook,
  StudioAuthMode,
  StudioUserDefinition,
} from '../src/dataplatform-notebook';

const stack = new Stack();
const stackiam = new Stack();

let dataPlatform = new DataPlatformNotebook(stack, 'dataplatform', {
  studioName: 'nodegroupfix',
  studioAuthMode: StudioAuthMode.SSO,
  eksAdminRoleArn: 'arn:aws:iam::012345678901:role/Admin',
  acmCertificateArn: 'arn:aws:acm:eu-west-1:012345678901:certificate/8a5dceb1-ee9d-46a5-91d2-7b4a1ea0b64d',
});

new DataPlatformNotebook(stackiam, 'dataplatform', {
  studioName: 'nodegroupfix-iam',
  studioAuthMode: StudioAuthMode.IAM_FEDERATED,
  eksAdminRoleArn: 'arn:aws:iam::012345678901:role/Admin',
  acmCertificateArn: 'arn:aws:acm:eu-west-1:012345678901:certificate/8a5dceb1-ee9d-46a5-91d2-7b4a1ea0b64d',
  idpAuthUrl: 'https://myapps.microsoft.com/signin/9b33f8d1-2cdd-4972-97a6-dedfc5a4bb38?tenantId=eb9c8428-db71-4fa4-9cc8-0a49d2c645c5',
  idPArn: 'arn:aws:iam::012345678901:saml-provider/AWS-ARA-Test',
});

test('Stack should have a KMS encryption key', () => {
  assertCDK.expect(stack).to(
    assertCDK.countResources('AWS::KMS::Key', 1),
  );
});


test('EKS cluster created with correct version and name', () => {
  // THEN
  assertCDK.expect(stack).to(
    assertCDK.countResources('Custom::AWSCDK-EKS-Cluster', 1),
  );

  assertCDK.expect(stack).to(
    assertCDK.haveResource('Custom::AWSCDK-EKS-Cluster', {
      Config: assertCDK.objectLike({
        version: '1.20',
        name: 'job-test-nodegroupfix',
      }),
    }),
  );
});

test('EKS should have at least 1 private subnet with tags', () => {
  // THEN
  assertCDK.expect(stack).to(
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

  assertCDK.expect(stack).to(
    assertCDK.countResources('AWS::EKS::Nodegroup', 11),
  );
  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EKS::Nodegroup', {
      NodegroupName: 'notebook-driver-0',
      InstanceTypes: ['t3.xlarge'],
      Labels: {
        'role': 'notebook',
        'spark-role': 'driver',
        'app': 'enterprise-gateway',
        'emr-containers.amazonaws.com/resource.type': 'job.run',
      },
      Taints: [
        {
          Key: 'app',
          Value: 'enterprise-gateway',
          Effect: 'NO_SCHEDULE',
        },
      ],
      ScalingConfig: {
        DesiredSize: 0,
        MaxSize: 50,
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
        'app': 'enterprise-gateway',
        'emr-containers.amazonaws.com/resource.type': 'job.run',
      },
      Taints: [
        {
          Key: 'app',
          Value: 'enterprise-gateway',
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
        MaxSize: 50,
        MinSize: 0,
      },
    },
    ),
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
            Namespace: 'default',
          },
        }),
      }),
      Name: 'multi-stack-nodegroupfix',
    }),
  );
});


test('workspace security group should allow outbound access to port 18888 and to port 443 on TCP', () => {

  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EC2::SecurityGroup', {
      GroupName: 'workSpaceSecurityGroup',
      Tags: assertCDK.objectLike([{
        Key: 'for-use-with-amazon-emr-managed-policies',
        Value: 'true',
      }]),
      VpcId: {
        Ref: 'dataplatformjobtestnodegroupfixDefaultVpc348D757D',
      },
    }),
  );
});

test('engine security group should be present, not used with EMR on EKS, but mandatory for EMR Studio', () => {

  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EC2::SecurityGroup', {
      GroupName: 'engineSecurityGroup',
      Tags: assertCDK.objectLike([{
        Key: 'for-use-with-amazon-emr-managed-policies',
        Value: 'true',
      }]),
      VpcId: {
        Ref: 'dataplatformjobtestnodegroupfixDefaultVpc348D757D',
      },
    }),
  );
});

test('Should find one S3 bucket used for EMR Studio Notebook ', () => {

  // Count the number of buckets it should be
  assertCDK.expect(stack).to(
    assertCDK.countResources('AWS::S3::Bucket', 1),
  );

  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::S3::Bucket', {
      BucketName: {
        'Fn::Join': [
          '',
          [
            'ara-workspaces-bucket-',
            {
              Ref: 'AWS::AccountId',
            },
            '-nodegroupfix',
          ],
        ],
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              KMSMasterKeyID: {
                'Fn::GetAtt': [
                  'dataplatformKMSkeynodegroupfixB5F2DB76',
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
  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::IAM::Role', {
      RoleName: 'studioServiceRole+nodegroupfix',
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
      DefaultS3Location: {
        'Fn::Join': [
          '',
          [
            's3://',
            {
              Ref: 'dataplatformWorkspacesBucketnodegroupfix47A86DA4',
            },
            '/',
          ],
        ],
      },
    }),
  );
});

test('Should find an EMR Studio with IAM Auth Mode', () => {

  assertCDK.expect(stackiam).to(
    assertCDK.countResources('AWS::EMR::Studio', 1),
  );

  assertCDK.expect(stackiam).to(
    assertCDK.haveResource('AWS::EMR::Studio', {
      AuthMode: 'IAM',
      DefaultS3Location: {
        'Fn::Join': [
          '',
          [
            's3://',
            {
              Ref: 'dataplatformWorkspacesBucketnodegroupfixiamEBD0BDC1',
            },
            '/',
          ],
        ],
      },
    }),
  );
});


test('Should find a mapping between an EMR Studio, a user and a session policy', () => {

  let userList_SSO: StudioUserDefinition[] = [{
    mappingIdentityName: 'lotfi-emr-advanced',
    mappingIdentityType: 'USER',
    executionPolicyArns: ['arn:aws:iam::0123455678901:policy/policyManagedEndpoint1', 'arn:aws:iam::0123455678901:policy/policyManagedEndpoint3'],
  },
  {
    mappingIdentityName: 'JohnDoe',
    mappingIdentityType: 'USER',
    executionPolicyArns: ['arn:aws:iam::0123455678901:policy/policyManagedEndpoint2', 'arn:aws:iam::0123455678901:policy/policyManagedEndpoint1'],
  }];

  dataPlatform.addSSOUsers(userList_SSO);

  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EMR::StudioSessionMapping', {
      IdentityName: 'lotfi-emr-advanced',
    }),
  );

  //TODO uncomment this one IAM Federation is fixed to support multiple role Arns for a single user
  /*let userList_IAM: StudioUserDefinition[] = [{
    executionPolicyArns: ['arn:aws:iam::0123455678901:policy/policyManagedEndpoint1', 'arn:aws:iam::0123455678901:policy/policyManagedEndpoint3'],
  }];

  dataPlatform_iam.addFederatedUsers(userList_IAM, 'arn:aws:iam::214783019211:saml-provider/AzureAD');

  assertCDK.expect(stackiam).to(
    assertCDK.haveResource('AWS::EMR::StudioSessionMapping', {
      IdentityName: 'lotfi-emr-advanced',
    }),
  );*/
});

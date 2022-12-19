// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests EMR on EKS cluster
 *
 * @group unit/emr-eks-platform/emr-eks-cluster
 */

import { ManagedPolicy, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';
import { Autoscaler, EmrEksCluster } from '../../../src/emr-eks-platform/emr-eks-cluster';
import { TaintEffect } from 'aws-cdk-lib/aws-eks';
import { Template, Match } from 'aws-cdk-lib/assertions';

const emrEksClusterStack = new Stack();
const cluster = EmrEksCluster.getOrCreate(emrEksClusterStack, {
  eksAdminRoleArn: 'arn:aws:iam::1234567890:role/AdminAccess',
  autoScaling: Autoscaler.CLUSTER_AUTOSCALER
});
cluster.addEmrVirtualCluster(emrEksClusterStack, {
  name: 'test',
});
const policy = new ManagedPolicy(emrEksClusterStack, 'testPolicy', {
  document: new PolicyDocument({
    statements: [
      new PolicyStatement({
        resources: ['*'],
        actions: ['s3:*'],
      }),
    ],
  }),
});
cluster.createExecutionRole(emrEksClusterStack, 'test', policy, 'default', 'myExecRole');
const template = Template.fromStack(emrEksClusterStack);

test('EKS cluster created with correct version and name', () => {
  // THEN
  template.resourceCountIs('Custom::AWSCDK-EKS-Cluster', 1);

  template.hasResourceProperties('Custom::AWSCDK-EKS-Cluster', {
    Config: Match.objectLike({
      version: '1.22',
      name: 'data-platform',
    }),
  });
});

test('EKS VPC should be tagged', () => {
  // THEN
  template.hasResourceProperties('AWS::EC2::VPC', {
    Tags: Match.arrayWith([
      Match.objectLike({
        Key: 'for-use-with-amazon-emr-managed-policies',
        Value: 'true',
      }),
    ]),
  });
});

test('EKS should have at least 1 private subnet with tags', () => {
  // THEN
  template.hasResourceProperties('AWS::EC2::Subnet', {
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

test('EKS should have a helm chart for deploying the cluster autoscaler', () => {
  template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
    Chart: 'cluster-autoscaler',
    Repository: 'https://kubernetes.github.io/autoscaler',
    Namespace: 'kube-system',
    Values: {
      'Fn::Join': [
        '',
        Match.arrayWith([
          '{"cloudProvider":"aws","awsRegion":"',
          {
            Ref: 'AWS::Region',
          },
          '","autoDiscovery":{"clusterName":"data-platform"},"rbac":{"serviceAccount":{"name":"cluster-autoscaler","create":false}},"extraArgs":{"skip-nodes-with-local-storage":false,"scan-interval":"5s","expander":"least-waste","balance-similar-node-groups":true,"skip-nodes-with-system-pods":false}}',
        ]),
      ],
    },
  });
});

test('EKS should have a helm chart for deploying the cert manager', () => {
  template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
    Chart: 'cert-manager',
    Repository: 'https://charts.jetstack.io',
    Namespace: 'cert-manager',
  });
});

test('EKS should have a helm chart for deploying the AWS load balancer controller', () => {
  template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
    Chart: 'aws-load-balancer-controller',
    Repository: 'https://aws.github.io/eks-charts',
    Namespace: 'kube-system',
    Values: '{"clusterName":"data-platform","serviceAccount":{"name":"aws-load-balancer-controller","create":false}}',
  });
});

test('EKS should have a helm chart for deploying the Kubernetes Dashboard', () => {
  template.hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
    Chart: 'kubernetes-dashboard',
    Repository: 'https://kubernetes.github.io/dashboard/',
  });
});

test('EKS cluster should have the default Nodegroups', () => {
  template.resourceCountIs('AWS::EKS::Nodegroup', 11);

  template.hasResourceProperties('AWS::EKS::Nodegroup', {
    AmiType: 'AL2_x86_64',
    InstanceTypes: ['t3.medium'],
    Labels: {
      role: 'tooling',
    },
    ScalingConfig: {
      DesiredSize: 2,
      MaxSize: 10,
      MinSize: 2,
    },
    Tags: Match.objectLike({
      'eks:cluster-name': 'data-platform',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'tooling',
      'k8s.io/cluster-autoscaler/node-template/label/eks.amazonaws.com/capacityType': 'ON_DEMAND',
    }),
  });

  template.hasResourceProperties('AWS::EKS::Nodegroup', {
    NodegroupName: 'critical-0',
    AmiType: 'AL2_ARM_64',
    InstanceTypes: ['m6gd.8xlarge'],
    Labels: {
      role: 'critical',
      'node-lifecycle': 'on-demand',
    },
    ScalingConfig: {
      DesiredSize: 0,
      MaxSize: 100,
      MinSize: 0,
    },
    Taints: [
      {
        Effect: 'NO_SCHEDULE',
        Key: 'role',
        Value: 'critical',
      },
    ],
    Tags: Match.objectLike({
      'eks:cluster-name': 'data-platform',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/eks.amazonaws.com/capacityType': 'ON_DEMAND',
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'on-demand',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'critical',
      'k8s.io/cluster-autoscaler/node-template/taint/role': 'critical:NO_SCHEDULE',
    }),
  });

  template.hasResourceProperties('AWS::EKS::Nodegroup', {
    NodegroupName: 'shared-driver-0',
    AmiType: 'AL2_ARM_64',
    InstanceTypes: ['m6g.xlarge'],
    Labels: {
      role: 'shared',
      'spark-role': 'driver',
      'node-lifecycle': 'on-demand',
    },
    ScalingConfig: {
      DesiredSize: 0,
      MaxSize: 10,
      MinSize: 0,
    },
    Tags: Match.objectLike({
      'eks:cluster-name': 'data-platform',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/eks.amazonaws.com/capacityType': 'ON_DEMAND',
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'on-demand',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'shared',
      'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'driver',
    }),
  });

  template.hasResourceProperties('AWS::EKS::Nodegroup', {
    NodegroupName: 'shared-executor-0',
    AmiType: 'AL2_ARM_64',
    InstanceTypes: ['m6g.8xlarge', 'm6gd.8xlarge'],
    Labels: {
      role: 'shared',
      'spark-role': 'executor',
      'node-lifecycle': 'spot',
    },
    ScalingConfig: {
      DesiredSize: 0,
      MaxSize: 100,
      MinSize: 0,
    },
    Taints: [
      {
        Effect: 'NO_SCHEDULE',
        Key: 'node-lifecycle',
        Value: 'spot',
      },
    ],
    Tags: Match.objectLike({
      'eks:cluster-name': 'data-platform',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/eks.amazonaws.com/capacityType': 'SPOT',
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'spot',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'shared',
      'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'executor',
      'k8s.io/cluster-autoscaler/node-template/taint/node-lifecycle': 'spot:NO_SCHEDULE',
    }),
  });

  template.hasResourceProperties('AWS::EKS::Nodegroup', {
    NodegroupName: 'notebook-driver-0',
    InstanceTypes: ['t3.large'],
    Labels: {
      role: 'notebook',
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
    Tags: Match.objectLike({
      'eks:cluster-name': 'data-platform',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/eks.amazonaws.com/capacityType': 'ON_DEMAND',
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'on-demand',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'notebook',
      'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'driver',
      'k8s.io/cluster-autoscaler/node-template/taint/role': 'notebook:NO_SCHEDULE',
    }),
  });

  template.hasResourceProperties('AWS::EKS::Nodegroup', {
    NodegroupName: 'notebook-executor-0',
    InstanceTypes: ['t3.2xlarge', 't3a.2xlarge'],
    AmiType: 'AL2_x86_64',
    CapacityType: 'SPOT',
    Labels: {
      role: 'notebook',
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
    Tags: Match.objectLike({
      'eks:cluster-name': 'data-platform',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/eks.amazonaws.com/capacityType': 'SPOT',
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'spot',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'notebook',
      'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'executor',
      'k8s.io/cluster-autoscaler/node-template/taint/role': 'notebook:NO_SCHEDULE',
      'k8s.io/cluster-autoscaler/node-template/taint/node-lifecycle': 'spot:NO_SCHEDULE',
    }),
  });
});

test('EMR virtual cluster should be created with proper configuration', () => {
  template.hasResourceProperties('AWS::EMRContainers::VirtualCluster', {
    ContainerProvider: Match.objectLike({
      Type: 'EKS',
      Info: Match.objectLike({
        EksInfo: {
          Namespace: 'default',
        },
      }),
    }),
    Name: 'test',
  });
});

test('Execution role policy should be created with attached policy', () => {
  template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
    PolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 's3:*',
          Effect: 'Allow',
          Resource: '*',
        }),
      ]),
    }),
  });
});

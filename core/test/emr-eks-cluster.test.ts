import * as assertCDK from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import { Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '../src/emr-eks-cluster';

const emrEksClusterStack = new Stack();
const cluster = new EmrEksCluster(emrEksClusterStack, 'emrEksClusterTest', {
  eksAdminRoleArn: 'arn:aws:iam::1234567890:role/AdminAccess',
});
cluster.addEmrVirtualCluster({
  name: 'test',
});

test('EKS cluster created with correct version and name', () => {
  // THEN
  expect(emrEksClusterStack).toCountResources('Custom::AWSCDK-EKS-Cluster', 1);

  assertCDK.expect(emrEksClusterStack).to(
    assertCDK.haveResource('Custom::AWSCDK-EKS-Cluster', {
      Config: assertCDK.objectLike({
        version: '1.20',
        name: 'emr-eks-cluster',
      }),
    }),
  );
});

test('EKS VPC should be tagged', () => {
  // THEN
  assertCDK.expect(emrEksClusterStack).to(
    assertCDK.haveResource('AWS::EC2::VPC', {
      Tags: assertCDK.arrayWith(
        assertCDK.objectLike({
          Key: 'for-use-with-amazon-emr-managed-policies',
          Value: 'true',
        }),
      ),
    }),
  );
});

test('EKS should have at least 1 private subnet with tags', () => {
  // THEN
  assertCDK.expect(emrEksClusterStack).to(
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

test('EKS should have a helm chart for deploying the cluster autoscaler', () => {
  expect(emrEksClusterStack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
    Chart: 'cluster-autoscaler',
    Repository: 'https://kubernetes.github.io/autoscaler',
    Namespace: 'kube-system',
    Values: {
      'Fn::Join': [
        '',
        assertCDK.arrayWith(
          '{\"cloudProvider\":\"aws\",\"awsRegion\":\"',
          {
            Ref: 'AWS::Region',
          },
          '\",\"autoDiscovery\":{\"clusterName\":\"',
          '\"},\"rbac\":{\"serviceAccount\":{\"name\":\"cluster-autoscaler\",\"create\":false}},\"extraArgs\":{\"skip-nodes-with-local-storage\":false,\"scan-interval\":\"5s\",\"expander\":\"least-waste\",\"balance-similar-node-groups\":true,\"skip-nodes-with-system-pods\":false}}',
        ),
      ],
    },
  });
});

test('EKS should have a helm chart for deploying the cert manager', () => {
  expect(emrEksClusterStack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
    Chart: 'cert-manager',
    Repository: 'https://charts.jetstack.io',
    Namespace: 'cert-manager',
  });
});

test('EKS should have a helm chart for deploying the AWS load balancer controller', () => {
  expect(emrEksClusterStack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
    Chart: 'aws-load-balancer-controller',
    Repository: 'https://aws.github.io/eks-charts',
    Namespace: 'kube-system',
    Values: {
      'Fn::Join': [
        '',
        assertCDK.arrayWith(
          '{\"clusterName\":\"',
          '\",\"serviceAccount\":{\"name\":\"aws-load-balancer-controller\",\"create\":false}}',
        ),
      ],
    },
  });
});

test('EKS should have a helm chart for deploying the Kubernetes Dashboard', () => {
  expect(emrEksClusterStack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
    Chart: 'kubernetes-dashboard',
    Repository: 'https://kubernetes.github.io/dashboard/',
  });
});

test('EKS cluster should have the default Nodegroups', () => {

  expect(emrEksClusterStack).toCountResources('AWS::EKS::Nodegroup', 7);

  expect(emrEksClusterStack).toHaveResource('AWS::EKS::Nodegroup', {
    AmiType: 'AL2_x86_64',
    InstanceTypes: ['t3.medium'],
    Labels: {
      role: 'tooling',
    },
    ScalingConfig: {
      DesiredSize: 1,
      MaxSize: 50,
      MinSize: 1,
    },
    Tags: assertCDK.objectLike({
      'k8s.io/cluster-autoscaler/emr-eks-cluster': 'owned',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'tooling',
    }),
  });

  expect(emrEksClusterStack).toHaveResource('AWS::EKS::Nodegroup', {
    NodegroupName: 'critical-0',
    AmiType: 'AL2_ARM_64',
    InstanceTypes: ['m6gd.2xlarge'],
    Labels: {
      'role': 'critical',
      'emr-containers.amazonaws.com/resource.type': 'job.run',
    },
    ScalingConfig: {
      DesiredSize: 0,
      MaxSize: 50,
      MinSize: 0,
    },
    Taints: [
      {
        Effect: 'NO_SCHEDULE',
        Key: 'role',
        Value: 'critical',
      },
    ],
    Tags: assertCDK.objectLike({
      'k8s.io/cluster-autoscaler/emr-eks-cluster': 'owned',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/emr-containers.amazonaws.com/resource.type': 'job.run',
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'on-demand',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'critical',
      'k8s.io/cluster-autoscaler/node-template/taint/role': 'critical:NO_SCHEDULE',
    }),
  });

  expect(emrEksClusterStack).toHaveResource('AWS::EKS::Nodegroup', {
    NodegroupName: 'shared-driver-0',
    AmiType: 'AL2_ARM_64',
    InstanceTypes: ['m6g.xlarge'],
    Labels: {
      'role': 'shared',
      'spark-role': 'driver',
      'emr-containers.amazonaws.com/resource.type': 'job.run',
    },
    ScalingConfig: {
      DesiredSize: 0,
      MaxSize: 50,
      MinSize: 0,
    },
    Tags: assertCDK.objectLike({
      'k8s.io/cluster-autoscaler/emr-eks-cluster': 'owned',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/emr-containers.amazonaws.com/resource.type': 'job.run',
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'on-demand',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'shared',
      'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'driver',
    }),
  });

  expect(emrEksClusterStack).toHaveResource('AWS::EKS::Nodegroup', {
    NodegroupName: 'shared-executor-0',
    AmiType: 'AL2_ARM_64',
    InstanceTypes: ['m6g.2xlarge', 'm6gd.2xlarge'],
    Labels: {
      'role': 'shared',
      'spark-role': 'executor',
      'emr-containers.amazonaws.com/resource.type': 'job.run',
    },
    ScalingConfig: {
      DesiredSize: 0,
      MaxSize: 50,
      MinSize: 0,
    },
    Taints: [
      {
        Effect: 'NO_SCHEDULE',
        Key: 'node-lifecycle',
        Value: 'spot',
      },
    ],
    Tags: assertCDK.objectLike({
      'k8s.io/cluster-autoscaler/emr-eks-cluster': 'owned',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/emr-containers.amazonaws.com/resource.type': 'job.run',
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'spot',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'shared',
      'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'executor',
      'k8s.io/cluster-autoscaler/node-template/taint/node-lifecycle': 'spot:NO_SCHEDULE',
    }),
  });
});

test('EMR virtual cluster should be created with proper configuration', () => {
  expect(emrEksClusterStack).toCountResources('AWS::EMRContainers::VirtualCluster', 1);

  expect(emrEksClusterStack).toHaveResource('AWS::EMRContainers::VirtualCluster', {
    ContainerProvider: assertCDK.objectLike({
      Type: 'EKS',
      Info: assertCDK.objectLike({
        EksInfo: {
          Namespace: 'default',
        },
      }),
    }),
    Name: 'test',
  });
});

// Add test for master role
// Add test for Cluster Autoscaler serviceAccount ?/ IAM role?
// Add test for Cluster Autoscaler serviceAccount policy
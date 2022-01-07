// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests EMR on EKS cluster
 *
 * @group unit/other/emr-eks-cluster
 */

 import * as assertCDK from '@aws-cdk/assert';
 import '@aws-cdk/assert/jest';
 import { ManagedPolicy, PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';
 import { Stack } from '@aws-cdk/core';
 import { EmrEksCluster } from '../../../src/emr-eks-platform/emr-eks-cluster';
 import { TaintEffect } from '@aws-cdk/aws-eks';

 
 const emrEksClusterStack = new Stack();
 const cluster = EmrEksCluster.getOrCreate(emrEksClusterStack, {
   eksAdminRoleArn: 'arn:aws:iam::1234567890:role/AdminAccess',
 });
 cluster.addEmrVirtualCluster(emrEksClusterStack, {
   name: 'test',
 });
 const policy = new ManagedPolicy(emrEksClusterStack, 'testPolicy', {
   document: new PolicyDocument({
     statements: [new PolicyStatement({
       resources: ['*'],
       actions: ['s3:*'],
     })],
   }),
 });
 cluster.createExecutionRole(emrEksClusterStack, 'test', policy);
 
 test('EKS cluster created with correct version and name', () => {
   // THEN
   expect(emrEksClusterStack).toCountResources('Custom::AWSCDK-EKS-Cluster', 1);
 
   assertCDK.expect(emrEksClusterStack).to(
     assertCDK.haveResource('Custom::AWSCDK-EKS-Cluster', {
       Config: assertCDK.objectLike({
         version: '1.21',
         name: 'data-platform',
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
           '\",\"autoDiscovery\":{\"clusterName\":\"data-platform\"},\"rbac\":{\"serviceAccount\":{\"name\":\"cluster-autoscaler\",\"create\":false}},\"extraArgs\":{\"skip-nodes-with-local-storage\":false,\"scan-interval\":\"5s\",\"expander\":\"least-waste\",\"balance-similar-node-groups\":true,\"skip-nodes-with-system-pods\":false}}',
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
     Values: '{"clusterName":"data-platform","serviceAccount":{"name":"aws-load-balancer-controller","create":false}}',
   });
 });
 
 test('EKS should have a helm chart for deploying the Kubernetes Dashboard', () => {
   expect(emrEksClusterStack).toHaveResource('Custom::AWSCDK-EKS-HelmChart', {
     Chart: 'kubernetes-dashboard',
     Repository: 'https://kubernetes.github.io/dashboard/',
   });
 });
 
 test('EKS cluster should have the default Nodegroups', () => {
 
   expect(emrEksClusterStack).toCountResources('AWS::EKS::Nodegroup', 13);
 
   expect(emrEksClusterStack).toHaveResource('AWS::EKS::Nodegroup', {
     AmiType: 'AL2_x86_64',
     InstanceTypes: ['t3.medium'],
     Labels: {
       role: 'tooling',
     },
     ScalingConfig: {
       DesiredSize: 1,
       MaxSize: 10,
       MinSize: 1,
     },
     Tags: assertCDK.objectLike({
       'k8s.io/cluster-autoscaler/data-platform': 'owned',
       'k8s.io/cluster-autoscaler/enabled': 'true',
       'k8s.io/cluster-autoscaler/node-template/label/role': 'tooling',
     }),
   });
 
   expect(emrEksClusterStack).toHaveResource('AWS::EKS::Nodegroup', {
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
     Tags: assertCDK.objectLike({
       'k8s.io/cluster-autoscaler/data-platform': 'owned',
       'k8s.io/cluster-autoscaler/enabled': 'true',
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
       'node-lifecycle': 'on-demand',
     },
     ScalingConfig: {
       DesiredSize: 0,
       MaxSize: 10,
       MinSize: 0,
     },
     Tags: assertCDK.objectLike({
       'k8s.io/cluster-autoscaler/data-platform': 'owned',
       'k8s.io/cluster-autoscaler/enabled': 'true',
       'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'on-demand',
       'k8s.io/cluster-autoscaler/node-template/label/role': 'shared',
       'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'driver',
     }),
   });
 
   expect(emrEksClusterStack).toHaveResource('AWS::EKS::Nodegroup', {
     NodegroupName: 'shared-executor-0',
     AmiType: 'AL2_ARM_64',
     InstanceTypes: ['m6g.8xlarge', 'm6gd.8xlarge'],
     Labels: {
       'role': 'shared',
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
     Tags: assertCDK.objectLike({
       'k8s.io/cluster-autoscaler/data-platform': 'owned',
       'k8s.io/cluster-autoscaler/enabled': 'true',
       'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'spot',
       'k8s.io/cluster-autoscaler/node-template/label/role': 'shared',
       'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'executor',
       'k8s.io/cluster-autoscaler/node-template/taint/node-lifecycle': 'spot:NO_SCHEDULE',
     }),
   });

   expect(emrEksClusterStack).toHaveResource('AWS::EKS::Nodegroup', {
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
     Tags: assertCDK.objectLike({
      'k8s.io/cluster-autoscaler/data-platform': 'owned',
      'k8s.io/cluster-autoscaler/enabled': 'true',
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'on-demand',
      'k8s.io/cluster-autoscaler/node-template/label/role': 'notebook',
      'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'driver',
      'k8s.io/cluster-autoscaler/node-template/taint/role': 'notebook:NO_SCHEDULE',
    }),
    });

    expect(emrEksClusterStack).toHaveResource('AWS::EKS::Nodegroup', {
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
      Tags: assertCDK.objectLike({
        'k8s.io/cluster-autoscaler/data-platform': 'owned',
        'k8s.io/cluster-autoscaler/enabled': 'true',
        'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle': 'spot',
        'k8s.io/cluster-autoscaler/node-template/label/role': 'notebook',
        'k8s.io/cluster-autoscaler/node-template/label/spark-role': 'executor',
        'k8s.io/cluster-autoscaler/node-template/taint/role': 'notebook:NO_SCHEDULE',
        'k8s.io/cluster-autoscaler/node-template/taint/node-lifecycle': 'spot:NO_SCHEDULE',
      }),
     });

 });
 
 test('EMR virtual cluster should be created with proper configuration', () => {
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
 
 test('Execution role policy should be created with attached policy', () => {
   expect(emrEksClusterStack).toHaveResource('AWS::IAM::ManagedPolicy', {
     PolicyDocument: assertCDK.objectLike({
       Statement: assertCDK.arrayWith(assertCDK.objectLike({
         Action: 's3:*',
         Effect: 'Allow',
         Resource: '*',
       })),
     }),
   });
 });

 
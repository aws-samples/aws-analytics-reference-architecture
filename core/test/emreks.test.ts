import * as assertCDK from '@aws-cdk/assert';
import { KubernetesVersion } from '@aws-cdk/aws-eks';
import * as cdk from '@aws-cdk/core';
import { EmrEksCluster } from '../src/emreks';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'TestStack');

const ec2ClusterName = 'test-ec2';
const fargateClusterName = 'test-fargate';

new EmrEksCluster(stack, 'MyTestConstruct', {
  ec2ClusterName: ec2ClusterName,
  fargateClusterName: fargateClusterName,
  kubernetesVersion: KubernetesVersion.V1_20,
  adminRoleArn: 'arn:aws:iam::318535617973:role/AdminAccess',
});

test('Eks cluster created with correct version', () => {
  // THEN
  assertCDK.expect(stack).to(
    assertCDK.haveResource('Custom::AWSCDK-EKS-Cluster', {
      Config: assertCDK.objectLike({
        version: '1.20',
      }),
    }),
  );
});

test('should have fargate-based EMR virtual cluster', () => {
  // THEN
  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EMRContainers::VirtualCluster', {
      ContainerProvider: assertCDK.objectLike({
        Info: {
          EksInfo: {
            Namespace: fargateClusterName,
          },
        },
      }),
    }),
  );
});
test('should have ec2-based EMR virtual cluster', () => {
  // THEN
  assertCDK.expect(stack).to(
    assertCDK.haveResource('AWS::EMRContainers::VirtualCluster', {
      ContainerProvider: assertCDK.objectLike({
        Info: {
          EksInfo: {
            Namespace: 'default',
          },
        },
      }),
    }),
  );
});

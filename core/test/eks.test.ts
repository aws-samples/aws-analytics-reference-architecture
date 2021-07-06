import * as assertCDK from '@aws-cdk/assert';
import { KubernetesVersion } from '@aws-cdk/aws-eks';
import * as cdk from '@aws-cdk/core';
import { EksCluster } from '../src/eks';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'TestStack');
const cluster = new EksCluster(stack, 'MyTestConstruct', {
  version: KubernetesVersion.V1_20,
  fargateNamespace: 'spark-notebooks',
  adminRoleArn: 'arn:aws:iam::1234567890:role/AdminAccess',
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

test('Eks VPC should be tagged', () => {
  // THEN
  assertCDK.expect(stack).to(
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

test('should have at least 1 private subnet with tags', () => {
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

test('should have fargate profile with proper tags', () => {
  // THEN
  assertCDK.expect(stack).to(
    assertCDK.haveResource('Custom::AWSCDK-EKS-FargateProfile', {
      Config: assertCDK.objectLike({
        selectors: assertCDK.arrayWith(
          assertCDK.objectLike({
            namespace: cluster.fargateNamespace,
            labels: {
              'app': 'enterprise-gateway',
              'component': 'kernel',
              'spark-role': 'executor',
            },
          }),
        ),
      }),
    }),
  );
});

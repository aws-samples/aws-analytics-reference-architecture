import * as assertCDK from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import { Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '../src/emr-eks-cluster';

const emrEksClusterStack = new Stack();
new EmrEksCluster(emrEksClusterStack, 'emrEksClusterTest', {
  eksAdminRoleArn: 'arn:aws:iam::1234567890:role/AdminAccess',
});

test('Eks cluster created with correct version', () => {
  // THEN
  expect(emrEksClusterStack).toCountResources('Custom::AWSCDK-EKS-Cluster', 1);

  assertCDK.expect(emrEksClusterStack).to(
    assertCDK.haveResource('Custom::AWSCDK-EKS-Cluster', {
      Config: assertCDK.objectLike({
        version: '1.20',
      }),
    }),
  );
});

test('Eks VPC should be tagged', () => {
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

test('should have at least 1 private subnet with tags', () => {
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
import * as assertCDK from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { EmrEksCluster } from '../src/emr-eks-cluster';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'TestStack');

new EmrEksCluster(stack, 'MyTestConstruct', {});

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

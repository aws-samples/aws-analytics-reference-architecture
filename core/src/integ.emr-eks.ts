import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { Stack, App } from '@aws-cdk/core';
import { EmrEksCluster } from './emr-eks-cluster';

const envInteg = { account: '372775283473', region: 'eu-west-1' };

const mockApp = new App();
const stack = new Stack(mockApp, 'integration-testing', { env: envInteg });


const emrEks = new EmrEksCluster(stack, 'EmrEks', {
  kubernetesVersion: KubernetesVersion.V1_20,
  eksAdminRoleArn: 'arn:aws:iam::372775283473:role/FULL',
  eksClusterName: 'EmrEksCluster3',
});

const emrVirtCluster = emrEks.addEmrVirtualCluster({
  createNamespace: false,
  eksNamespace: 'default',
  name: 'ec2VirtCluster',
});

const managedEndpoint = emrEks.addManagedEndpoint(
  'endpoint',
  emrVirtCluster.instance.attrId,
  {
    acmCertificateArn: 'arn:aws:acm:eu-west-1:372775283473:certificate/959ee6ac-5b39-42d7-a2f1-bac2485ac533',
    emrOnEksVersion: 'emr-6.2.0-latest',
  },
);

managedEndpoint.node.addDependency(emrVirtCluster);


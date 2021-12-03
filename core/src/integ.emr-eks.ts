import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { Stack, App } from '@aws-cdk/core';
import { EmrEksCluster } from './emr-eks-data-platform/emr-eks-cluster';

const envInteg = { account: '', region: '' };

const mockApp = new App();
const stack = new Stack(mockApp, 'integration-testing', { env: envInteg });


const emrEks = new EmrEksCluster(stack, 'EmrEks', {
  kubernetesVersion: KubernetesVersion.V1_20,
  eksAdminRoleArn: '',
  eksClusterName: 'EmrEksCluster3',
});

// const emrVirtCluster =
emrEks.addEmrVirtualCluster(stack, {
  createNamespace: false,
  eksNamespace: 'default',
  name: 'ec2VirtCluster',
});

/*const managedEndpoint = emrEks.addManagedEndpoint(
  'endpoint',
  emrVirtCluster.attrId,
  '',
  '',
);

managedEndpoint.node.addDependency(emrVirtCluster);*/


import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { Construct, Stack } from '@aws-cdk/core';
import { DataPlatformNotebookProp } from './dataplatform-notebook';
import { EmrEksCluster } from './emr-eks-cluster';
import { EmrEksNodegroup } from './emr-eks-nodegroup';


export class SingletonEmrEksCluster extends EmrEksCluster {

  public static getOrCreate(scope: Construct, props: DataPlatformNotebookProp) {

    const clusterName = 'ara-dataplatform-cluster';
    const stack = Stack.of(scope);
    const id = `${clusterName}Singleton`;

    let emrEksCluster: EmrEksCluster;

    if (stack.node.tryFindChild(id) == undefined) {
      emrEksCluster = new EmrEksCluster(stack, id, {
        kubernetesVersion: props.kubernetesVersion || KubernetesVersion.V1_20,
        eksAdminRoleArn: props.eksAdminRoleArn,
        eksClusterName: clusterName,
      });

      //Add a nodegroup for notebooks
      emrEksCluster.addEmrEksNodegroup(EmrEksNodegroup.NOTEBOOK_DRIVER);
      emrEksCluster.addEmrEksNodegroup(EmrEksNodegroup.NOTEBOOK_EXECUTOR);
    }


    return stack.node.tryFindChild(id) as EmrEksCluster || emrEksCluster!;
  }

}

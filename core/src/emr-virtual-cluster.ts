import { Cluster } from '@aws-cdk/aws-eks';
import { CfnVirtualCluster } from '@aws-cdk/aws-emrcontainers';
import { Construct } from '@aws-cdk/core';

export interface EmrVirtualClusterProps {
  readonly name: string;
  readonly eksNamespace: string;
  readonly createNamespace?: boolean;
}

export class EmrVirtualCluster extends Construct {
  public readonly instance: CfnVirtualCluster;

  constructor(
    scope: Construct,
    id: string,
    eksCluster: Cluster,
    props: EmrVirtualClusterProps,
  ) {
    super(scope, id);

    const virtCluster = new CfnVirtualCluster(this, 'EMRClusterEc2', {
      name: props.name,
      containerProvider: {
        id: eksCluster.clusterName,
        type: 'EKS',
        info: { eksInfo: { namespace: props.eksNamespace } },
      },
    });
    this.instance = virtCluster;
  }
}

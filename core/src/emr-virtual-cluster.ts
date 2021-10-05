import { Cluster } from '@aws-cdk/aws-eks';
import { CfnVirtualCluster } from '@aws-cdk/aws-emrcontainers';
import { Construct } from '@aws-cdk/core';

/**
 * The properties for the EmrVirtualCluster Construct class.
 */
export interface EmrVirtualClusterProps {
  /**
   * name of the  EmrVirtualCluster to be created
   */
  readonly name: string;
  /**
   * name of the  EKS namespace to be linked to the EMR virtual Cluster
   * @default - Use the default namespace
   */
  readonly eksNamespace?: string;
  /**
   * creates EKS namespace
   * @default - Do not create the namespace
   */
  readonly createNamespace?: boolean;
}

/**
 * @summary EmrEksNodegroup High-order construct creating EMR Virtual cluster
 */

export class EmrVirtualCluster extends Construct {
  /**
   * reference to the CfnVirtualCluster created
   * @access public
   */
  public readonly instance: CfnVirtualCluster;

  /**
   * Creates a new instance of the EMR Virtual Cluster.
   * @param {cdk.Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {Cluster} EKS Cluster instance
   * @param {EmrVirtualClusterProps} props the EmrVirtualClusterProps [properties]{@link EmrVirtualClusterProps}
   * @access public
   */
  constructor(scope: Construct, id: string, eksCluster: Cluster, props: EmrVirtualClusterProps) {
    super(scope, id);

    // TODO create the namespace

    const virtCluster = new CfnVirtualCluster(this, 'EMRClusterEc2', {
      name: props.name,
      containerProvider: {
        id: eksCluster.clusterName,
        type: 'EKS',
        info: { eksInfo: { namespace: props.eksNamespace || 'default' } },
      },
    });
    this.instance = virtCluster;
  }
}

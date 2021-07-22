import { Cluster } from "@aws-cdk/aws-eks";
import { CfnVirtualCluster } from "@aws-cdk/aws-emrcontainers";
import { Construct } from "@aws-cdk/core";

/**
 * @summary The properties for the EmrVirtualCluster Construct class.
 */
export interface EmrVirtualClusterProps {
  /**
   * name of the  EmrVirtualCluster to be created
   */
  readonly name: string;
  /**
   * name of the  EKS namespace to be linked to the EMR virtual Cluster
   * @default default
   */
  readonly eksNamespace: string;
  /**
   * creates EKS namespace
   * @default false
   */
  readonly createNamespace?: boolean;
}

/**
 * @summary EmrEksNodegroup High-order construct creating EMR Virtual cluster
 */

export class EmrVirtualCluster extends Construct {
  /**
   * reference to the CfnVirtualCluster created
   * @since 1.0.0
   * @access public
   */
  public readonly instance: CfnVirtualCluster;

  /**
   * Creates a new instance of the EMR Virtual Cluster.
   * @param {cdk.Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {Cluster} EKS Cluster instance
   * @param {EmrVirtualClusterProps} props the EmrVirtualClusterProps [properties]{@link EmrVirtualClusterProps}
   * @since 1.0.0
   * @access public
   */
  constructor(
    scope: Construct,
    id: string,
    eksCluster: Cluster,
    props: EmrVirtualClusterProps
  ) {
    super(scope, id);

    const virtCluster = new CfnVirtualCluster(this, "EMRClusterEc2", {
      name: props.name,
      containerProvider: {
        id: eksCluster.clusterName,
        type: "EKS",
        info: { eksInfo: { namespace: props.eksNamespace } },
      },
    });
    this.instance = virtCluster;
  }
}

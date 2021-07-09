import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { Construct } from '@aws-cdk/core';
import { EmrEksNodegroup } from './emr-eks-nodegroup';

/**
 * @summary The properties for the EmrEksCluster Construct class.
 */

export interface EmrEksClusterProps {
  /**
     * Name of the Amazon EKS cluster to reuse
     * @default -  Create a new Amazon EKS cluster
     */
  readonly eksClusterName?: string;
  /**
     * Amazon IAM Role to be added to EKS master roles that will give you the access to kubernetes cluster from AWS console UI
     * @default -  The Amazon IAM role used by AWS CDK
     */
  eksAdminRoleArn?: string;
  /**
     * List of EmrEksNodegroup to create in the cluster
     * @default -  Create a default set of EmrEksNodegroup
     */
  readonly emrEksNodegroups?: EmrEksNodegroup[];
  /**
     * Kubernetes version for EKS cluster that will be created
     * @default -  Use the latest version available
     */
  readonly kubernetesVersion?: KubernetesVersion;
}

/**
 * @Summary EmrEksCluster Construct packaging all the ressources required to run Amazon EMR on Amazon EKS.
 */

export class EmrEksCluster extends Construct {

  /**
     * Constructs a new instance of the EmrEksCluster class. An EmrEksCluster contains everything required to run Amazon EMR on Amazon EKS.
     * Nodegroups can be customized providing a list of Nodegroups
     * @param {cdk.Construct} scope the Scope of the CDK Construct
     * @param {string} id the ID of the CDK Construct
     * @param {EmrEksClusterProps} props the EmrEksClusterProps [properties]{@link EmrEksClusterProps}
     * @since 1.0.0
     * @access public
     */

  constructor(scope: Construct, id: string /*props: EmrEksClusterProps*/) {
    super(scope, id);

  }

  public addEmrEksNodegroup() {
    // only one type of nodegroup, if possible managed.
  }

  public addEmrVirtualCluster() {

  }
}
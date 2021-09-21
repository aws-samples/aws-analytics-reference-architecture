//import * as fs from "fs";
import * as eks from '@aws-cdk/aws-eks';
import * as emrcontainers from '@aws-cdk/aws-emrcontainers';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import { EksCluster } from './eks';
import * as IamPolicyEmrJobRole from './k8s/iam-policy-emr-job-role.json';

/**
 * Config parameters for EmrEksCluster
 */

export interface EmrEksClusterProps {
  /**
   * EMR Virtual Cluster Name for ec2-based cluster
   */

  readonly ec2ClusterName: string;

  /**
   * EMR Virtual Cluster Name for fargate cluster
   */
  readonly fargateClusterName?: string;

  /**
   * Kubernetes version for EKS cluster that will be created
   */
  readonly kubernetesVersion: eks.KubernetesVersion;

  /**
   * IAM Role to be added to EKS master roles that will give you the access to kubernetes cluster from AWS console UI
   */
  readonly adminRoleArn: string;
}

/**
 * Config parameters for EmrVirtualCluster
 */
export interface EmrVirtualClusterProps {
  /**
   * EMR Virtual Cluster Name for ec2-based cluster
   */
  readonly ec2ClusterName: string;

  /**
   * EMR Virtual Cluster Name for fargate cluster
   */
  readonly fargateClusterName?: string;

  /**
   * EKS cluster name to be used with EMR Virtual clusters
   */
  readonly eksClusterName: string;
}

/**
 *  Opinionated configuration for EMR on EKS cluster.
 *  @requires EksCluster CDK construct
 */

export class EmrEksCluster extends cdk.Construct {
  /**
   * EksCluster CDK Construct
   */
  public readonly eksClusterConstruct: EksCluster;

  /**
   * Virtual cluster construct, used to enforce deployment dependancy on EksCluster to make sure all custom resources are provisioned.
   */

  //public emrVirtualClusterConstruct: EmrVirtualCluster;

  constructor(scope: cdk.Construct, id: string, props: EmrEksClusterProps) {
    super(scope, id);

    this.eksClusterConstruct = new EksCluster(this, 'eksCluster', {
      adminRoleArn: props.adminRoleArn,
      fargateNamespace: props.fargateClusterName || '',
      version: props.kubernetesVersion,
    });

    /* Create serviceLinkedRole for EMR and add to kubernetes configmap */

    this.eksClusterConstruct.eksClusterCDK.awsAuth.addMastersRole(
      iam.Role.fromRoleArn(
        this,
        'ServiceRoleForAmazonEMRContainers',
        `arn:aws:iam::${
          cdk.Stack.of(this).account
        }:role/AWSServiceRoleForAmazonEMRContainers`,
      ),
      'emr-containers',
    );

    const slRole = new iam.CfnServiceLinkedRole(this, 'EmrServiceIAMRole', {
      awsServiceName: 'emr-containers.amazonaws.com',
    });

    const roleBinding = this.eksClusterConstruct.loadManifest(
      'roleBinding',
      './src/k8s/rbac/emr-containers.yaml',
      [{ key: '{{NAMESPACE}}', val: 'default' }],
    );
    roleBinding.node.addDependency(slRole);

    const ec2VirtualCluster = new emrcontainers.CfnVirtualCluster(
      this,
      'EMRClusterEc2',
      {
        name: props.ec2ClusterName,
        containerProvider: {
          id: this.eksClusterConstruct.eksClusterCDK.clusterName,
          type: 'EKS',
          info: { eksInfo: { namespace: 'default' } },
        },
      },
    );
    ec2VirtualCluster.node.addDependency(roleBinding);
    ec2VirtualCluster.node.addDependency(slRole);

    /*this.emrVirtualClusterConstruct.node.addDependency(
      this.eksClusterConstruct
    );*/

    //Create EMR Worker IAM Role and trust policy
    const EmrWorkerPolicyDocument =
      iam.PolicyDocument.fromJson(IamPolicyEmrJobRole);
    /* JSON.parse(
        IamPolicyEmrJobRole
      )
    );*/
    const EmrWorkerIAMPolicy = new iam.ManagedPolicy(
      this,
      'EMRWorkerIAMPolicy',
      { document: EmrWorkerPolicyDocument },
    );
    const EmrWorkerIAMRole = new iam.Role(this, 'EMRWorkerIAMRole', {
      assumedBy: new iam.FederatedPrincipal(
        this.eksClusterConstruct.eksClusterCDK.openIdConnectProvider.openIdConnectProviderArn,
        [],
        'sts:AssumeRoleWithWebIdentity',
      ),
    });
    EmrWorkerIAMRole.addManagedPolicy(EmrWorkerIAMPolicy);

    /**
     *  creating different nodegroups for workloads based on SLA
     */

    this.eksClusterConstruct.addManagedNodeGroup(
      'sparkCritical',
      ['r5d.xlarge'],
      { desiredCapacity: 0, minCapacity: 0, maxCapacity: 5 },
      true,
      false,
      ['sla=critical', 'spark-role=driver', 'spark-role=executor'],
      [
        {
          key: 'sla',
          value: 'critical',
          effect: eks.TaintEffect.NO_SCHEDULE,
        },
      ],
    );

    this.eksClusterConstruct.addSelfManagedNodeGroup(
      'sparkSharedOnDemand',
      'm5.xlarge',
      { desiredCapacity: 0, minCapacity: 0, maxCapacity: 5 },
      false,
      ['sla=shared', 'sla=notebook', 'spark-role=driver', 'spark-role=executor'],
    );

    this.eksClusterConstruct.addSelfManagedNodeGroup(
      'sparkSharedSpot',
      'm5.xlarge',
      { desiredCapacity: 0, minCapacity: 0, maxCapacity: 5 },
      false,
      ['sla=shared', 'sla=notebook', 'spark-role=executor'],
      '0.15',
    );
  }
}

/**
 * EMR VirtualCluster CDK construct. used only internally for correct dependency resolution
 */
/*
class EmrVirtualCluster extends cdk.Construct {
  public readonly fargateVirtualClusterId?: string;
  public readonly ec2VirtualClusterId: string;

  constructor(scope: cdk.Construct, id: string, props: EmrVirtualClusterProps) {
    super(scope, id);
    const ec2VirtualCluster = new emrcontainers.CfnVirtualCluster(
      this,
      "EMRClusterEc2",
      {
        name: props.ec2ClusterName,
        containerProvider: {
          id: props.eksClusterName,
          type: "EKS",
          info: { eksInfo: { namespace: "default" } },
        },
      }
    );

    this.ec2VirtualClusterId = ec2VirtualCluster.attrId;

    if (props.fargateClusterName) {
      const fargateVirtualCluster = new emrcontainers.CfnVirtualCluster(
        this,
        "EMRClusterFargate",
        {
          name: props.fargateClusterName,
          containerProvider: {
            id: props.eksClusterName,
            type: "EKS",
            info: {
              eksInfo: { namespace: props.fargateClusterName },
            },
          },
        }
      );
      this.fargateVirtualClusterId = fargateVirtualCluster.attrId;
    }
  }
}
*/

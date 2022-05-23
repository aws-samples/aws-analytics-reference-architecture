// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { InstanceType,  ISubnet } from 'aws-cdk-lib/aws-ec2';
import { NodegroupOptions, TaintEffect, CapacityType, NodegroupAmiType } from 'aws-cdk-lib/aws-eks';

/**
 * The Options for adding EmrEksNodegroup to an EmrEksCluster. Some of the Amazon EKS Nodegroup parameters are overriden:
 * -  NodegroupName by the id and an index per AZ
 * -  LaunchTemplate spec
 * -  SubnetList by either the subnet parameter or one subnet per Amazon EKS Cluster AZ.
 * -  Labels and Taints are automatically used to tag the nodegroup for the cluster autoscaler
 */

export interface EmrEksNodegroupOptions extends NodegroupOptions {
  /**
   * Set to true if using instance types with local NVMe drives to mount them automatically at boot time
   * @default false
   */
  readonly mountNvme?: boolean;
  /**
   * Configure the Amazon EKS NodeGroup in this subnet. Use this setting for resource dependencies like an Amazon RDS database.
   * The subnet must include the availability zone information because the nodegroup is tagged with the AZ for the K8S Cluster Autoscaler.
   * @default - One NodeGroup is deployed per cluster AZ
   */
  readonly subnet?: ISubnet;
}

/**
 * @summary EmrEksNodegroup containing the default Nodegroups
 */
export class EmrEksNodegroup {

  /*
   ** Default nodegroup configuration for Kubernetes applications required by EMR on EKS (e.g cert manager and cluster autoscaler)
   */
  public static readonly TOOLING_ALL: EmrEksNodegroupOptions = {
    nodegroupName: 'tooling',
    instanceTypes: [new InstanceType('t3.medium')],
    minSize: 1,
    maxSize: 10,
    labels: { role: 'tooling' },
  };

  /**
   * Default nodegroup configuration for EMR on EKS critical workloads (both drivers and executors)
   */
  public static readonly CRITICAL_ALL: EmrEksNodegroupOptions = {
    nodegroupName: 'critical',
    mountNvme: true,
    instanceTypes: [new InstanceType('m6gd.8xlarge')],
    amiType: NodegroupAmiType.AL2_ARM_64,
    minSize: 0,
    maxSize: 100,
    labels: {
      'role': 'critical',
      'node-lifecycle': 'on-demand',
    },
    taints: [
      {
        key: 'role',
        value: 'critical',
        effect: TaintEffect.NO_SCHEDULE,
      },
    ],
  };

  /**
   * Default nodegroup configuration for EMR on EKS shared (non-crtical) workloads (drivers only)
   */
  public static readonly SHARED_DRIVER: EmrEksNodegroupOptions = {
    nodegroupName: 'shared-driver',
    instanceTypes: [new InstanceType('m6g.xlarge')],
    amiType: NodegroupAmiType.AL2_ARM_64,
    minSize: 0,
    maxSize: 10,
    labels: {
      'role': 'shared',
      'spark-role': 'driver',
      'node-lifecycle': 'on-demand',
    },
  };
  /**
   * Default nodegroup configuration for EMR on EKS shared (non-crtical) workloads (executors only)
   */
  public static readonly SHARED_EXECUTOR: EmrEksNodegroupOptions = {
    nodegroupName: 'shared-executor',
    instanceTypes: [new InstanceType('m6g.8xlarge'), new InstanceType('m6gd.8xlarge')],
    minSize: 0,
    maxSize: 100,
    capacityType: CapacityType.SPOT,
    amiType: NodegroupAmiType.AL2_ARM_64,
    labels: {
      'role': 'shared',
      'spark-role': 'executor',
      'node-lifecycle': 'spot',
    },
    taints: [
      {
        key: 'node-lifecycle',
        value: 'spot',
        effect: TaintEffect.NO_SCHEDULE,
      },
    ],
  };

  /**
   * Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS (executors only)
   */
  public static readonly NOTEBOOK_EXECUTOR: EmrEksNodegroupOptions = {
    nodegroupName: 'notebook-executor',
    instanceTypes: [new InstanceType('t3.2xlarge'), new InstanceType('t3a.2xlarge')],
    minSize: 0,
    maxSize: 100,
    capacityType: CapacityType.SPOT,
    labels: {
      'role': 'notebook',
      'spark-role': 'executor',
      'node-lifecycle': 'spot',
    },
    taints: [
      {
        key: 'role',
        value: 'notebook',
        effect: TaintEffect.NO_SCHEDULE,
      },
      {
        key: 'node-lifecycle',
        value: 'spot',
        effect: TaintEffect.NO_SCHEDULE,
      },
    ],
  };
  /**
   * Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS (drivers only)
   */
  public static readonly NOTEBOOK_DRIVER: EmrEksNodegroupOptions = {
    nodegroupName: 'notebook-driver',
    instanceTypes: [new InstanceType('t3.large')],
    minSize: 0,
    maxSize: 10,
    labels: {
      'role': 'notebook',
      'spark-role': 'driver',
      'node-lifecycle': 'on-demand',
    },
    taints: [
      {
        key: 'role',
        value: 'notebook',
        effect: TaintEffect.NO_SCHEDULE,
      },
    ],
  };
  /**
   * Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS
   * This nodegroup is replacing [NOTEBOOK_DRIVER]{@link EmrEksNodegroup.NOTEBOOK_DRIVER}
   * and [NOTEBOOK_EXECUTOR]{@link EmrEksNodegroup.NOTEBOOK_EXECUTOR} because EMR on EKS
   * Managed Endpoint currently doesn't support Pod Template customization
   */
  public static readonly NOTEBOOK_WITHOUT_PODTEMPLATE: EmrEksNodegroupOptions = {
    nodegroupName: 'notebook-without-pod-template',
    instanceTypes: [new InstanceType('t3.2xlarge'), new InstanceType('t3a.2xlarge')],
    minSize: 0,
    maxSize: 100,
    capacityType: CapacityType.SPOT,
    labels: {
      'role': 'notebook',
      'node-lifecycle': 'spot',
    },
  };
}

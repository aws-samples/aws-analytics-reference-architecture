// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { InstanceType,  ISubnet } from '@aws-cdk/aws-ec2';
import { NodegroupOptions, TaintEffect, CapacityType, NodegroupAmiType } from '@aws-cdk/aws-eks';

/**
 * The Options for adding EmrEksNodegroup to an EmrEksCluster. Some of the Amazon EKS Nodegroup parameters are overriden:
 * -  NodegroupName by the id and an index per AZ
 * -  LaunchTemplate spec
 * -  SubnetList by either the subnet parameter or one subnet per Amazon EKS Cluster AZ.
 */

export interface EmrEksNodegroupOptions extends NodegroupOptions {
  /**
   * Nodegroup ID
   */
  readonly id: string;
  /**
   * Set to true if using instance types with local NVMe drives to mount them automatically at boot time
   * @default false
   */
  readonly mountNvme?: boolean;
  /**
   * Configure the Amazon EKS NodeGroup in this subnet. Use this setting for resource dependencies like an Amazon RD
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
    id: 'tooling',
    instanceTypes: [new InstanceType('t3.medium')],
    minSize: 1,
    maxSize: 10,
    labels: { role: 'tooling' },
  };

  /*
   ** Default nodegroup configuration for EMR on EKS critical workloads
   */
  public static readonly CRITICAL_ALL: EmrEksNodegroupOptions = {
    id: 'critical',
    mountNvme: true,
    instanceTypes: [new InstanceType('m6gd.8xlarge')],
    amiType: NodegroupAmiType.AL2_ARM_64,
    minSize: 0,
    maxSize: 100,
    labels: {
      role: 'critical',
    },
    taints: [
      {
        key: 'role',
        value: 'critical',
        effect: TaintEffect.NO_SCHEDULE,
      },
    ],
  };

  /*
   ** Default nodegroup configuration for EMR on EKS shared (non-crtical) workloads
   */
  public static readonly SHARED_DRIVER: EmrEksNodegroupOptions = {
    id: 'shared-driver',
    instanceTypes: [new InstanceType('m6g.xlarge')],
    amiType: NodegroupAmiType.AL2_ARM_64,
    minSize: 0,
    maxSize: 10,
    labels: {
      'role': 'shared',
      'spark-role': 'driver',
    },
  };

  public static readonly SHARED_EXECUTOR: EmrEksNodegroupOptions = {
    id: 'shared-executor',
    instanceTypes: [new InstanceType('m6g.8xlarge'), new InstanceType('m6gd.8xlarge')],
    minSize: 0,
    maxSize: 100,
    capacityType: CapacityType.SPOT,
    amiType: NodegroupAmiType.AL2_ARM_64,
    labels: {
      'role': 'shared',
      'spark-role': 'executor',
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
   * Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS.
   */
  public static readonly NOTEBOOK_EXECUTOR: EmrEksNodegroupOptions = {
    id: 'notebook-executor',
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

  public static readonly NOTEBOOK_DRIVER: EmrEksNodegroupOptions = {
    id: 'notebook-driver',
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
}

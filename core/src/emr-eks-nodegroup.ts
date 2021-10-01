// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { InstanceType,  ISubnet } from '@aws-cdk/aws-ec2';
import { NodegroupOptions, TaintEffect, CapacityType, NodegroupAmiType } from '@aws-cdk/aws-eks';

/**
 * The Options for addNodeGroup() method. LaunchTemplate spec is overriden. subnetList is overriden by either the subnet parameter.
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
  public static readonly NODEGROUP_TOOLING: EmrEksNodegroupOptions = {
    id: 'tooling',
    instanceTypes: [new InstanceType('t3.medium')],
    minSize: 1,
    maxSize: 50,
    labels: { role: 'tooling' },
  };

  /*
   ** Default nodegroup configuration for EMR on EKS critical workloads
   */
  public static readonly NODEGROUP_CRITICAL: EmrEksNodegroupOptions = {
    id: 'critical',
    mountNvme: true,
    instanceTypes: [new InstanceType('r5d.xlarge')],
    minSize: 0,
    maxSize: 50,
    labels: {
      'role': 'critical',
      'emr-containers.amazonaws.com/resource.type': 'job.run',
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
  public static readonly NODEGROUP_SHARED: EmrEksNodegroupOptions = {
    id: 'shared',
    mountNvme: true,
    instanceTypes: [new InstanceType('m5.xlarge')],
    minSize: 0,
    maxSize: 50,
    labels: {
      'role': 'shared',
      'emr-containers.amazonaws.com/resource.type': 'job.run',
    },
  };

  /*
   ** Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS
   */
  public static readonly NODEGROUP_NOTEBOOKS: EmrEksNodegroupOptions = {
    id: 'notebooks',
    mountNvme: true,
    instanceTypes: [new InstanceType('t4g.xlarge'), new InstanceType('t4g.2xlarge')],
    minSize: 0,
    maxSize: 50,
    amiType: NodegroupAmiType.AL2_ARM_64,
    capacityType: CapacityType.SPOT,
    labels: {
      'role': 'notebook',
      'app': 'enterprise-gateway',
      'emr-containers.amazonaws.com/resource.type': 'job.run',
    },
    taints: [
      {
        key: 'app',
        value: 'enterprise-gateway',
        effect: TaintEffect.NO_SCHEDULE,
      },
      {
        key: 'node-lifecycle',
        value: 'spot',
        effect: TaintEffect.NO_SCHEDULE,
      },
    ],
  };
}

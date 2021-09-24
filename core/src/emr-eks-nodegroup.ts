// add default nodegroups as in here https://github.com/aws-samples/aws-analytics-reference-architecture/blob/feature/data-generator/core/src/data-generator.ts

import { CfnLaunchTemplate, InstanceType } from '@aws-cdk/aws-ec2';
import {
  NodegroupOptions,
  NodegroupAmiType,
  TaintEffect,
  CapacityType,
  Cluster,
  Nodegroup,
} from '@aws-cdk/aws-eks';
import { ManagedPolicy } from '@aws-cdk/aws-iam';
import { Construct, Fn } from '@aws-cdk/core';

/**
 * @summary The properties for the EmrEksNodegroup Construct class.
 */

export interface EmrEksNodegroupProps {
  /**
   * unique resource Id for CDK stack
   */
  readonly id: string;

  /**
   * Set to true if using instance types with local NVMe drives to mount them automatically at boot time
   * @default false
   */
  readonly options: NodegroupOptions;
  /**
   * Set to true if using instance types with local NVMe drives to mount them automatically at boot time
   * @default false
   */
  readonly mountNvme?: boolean;
}

/**
 * @summary EmrEksNodegroup High-order construct automating nodegroup creation and opinioned default nodegroups configuration for EMR on EKS workloads
 */

export class EmrEksNodegroup extends Construct {
  /*
   ** Default nodegroup configuration for Kubernetes applications required by EMR on EKS (e.g cert manager and cluster autoscaler)
   */
  public static readonly NODEGROUP_TOOLING: EmrEksNodegroupProps = {
    id: 'tooling',
    options: {
      instanceTypes: [new InstanceType('m5.xlarge')],
      minSize: 1,
      maxSize: 50,
      labels: { role: 'tooling' },
    },
  };

  /*
   ** Default nodegroup configuration for EMR on EKS critical workloads
   */
  public static readonly NODEGROUP_CRITICAL: EmrEksNodegroupProps = {
    id: 'criticalNodeGroup',
    mountNvme: true,
    options: {
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
    },
  };

  /*
   ** Default nodegroup configuration for EMR on EKS shared (non-crtical) workloads
   */
  public static readonly NODEGROUP_SHARED: EmrEksNodegroupProps = {
    id: 'sharedNodeGroup',
    mountNvme: true,
    options: {
      instanceTypes: [new InstanceType('m5.xlarge')],
      minSize: 0,
      maxSize: 50,
      labels: {
        'role': 'shared',
        'emr-containers.amazonaws.com/resource.type': 'job.run',
      },
      taints: [
        {
          key: 'role',
          value: 'shared',
          effect: TaintEffect.NO_SCHEDULE,
        },
      ],
    },
  };

  /*
   ** Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS
   */
  public static readonly NODEGROUP_NOTEBOOKS: EmrEksNodegroupProps = {
    id: 'notebooksNodeGroup',
    mountNvme: true,
    options: {
      instanceTypes: [new InstanceType('m5.xlarge')],
      amiType: NodegroupAmiType.AL2_X86_64,
      minSize: 0,
      maxSize: 50,
      capacityType: CapacityType.SPOT,
      labels: {
        'role': 'notebook',
        'emr-containers.amazonaws.com/resource.type': 'job.run',
      },
    },
  };

  /**
   * reference to the aws-eks/Nodegroup created
   * @since 1.0.0
   * @access public
   */

  public readonly eksGroup: Nodegroup;

  /**
   * Creates a new instance of the managed Eks node group.
   * The construct is using LaunchTemplate to install SSM agent and mounts NVME disks.
   * If you are overwriting launchTemplateSpec via props make sure you are implementing it yourself.
   * @param {cdk.Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {EmrEksNodegroupProps} props the EmrEksNodegroupProps [properties]{@link EmrEksNodegroupProps}
   * @since 1.0.0
   * @access public
   */

  constructor(scope: Construct, cluster: Cluster, props: EmrEksNodegroupProps) {
    super(scope, props.id);

    const userData = [
      'yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
      'systemctl enable amazon-ssm-agent',
      'systemctl start amazon-ssm-agent',
    ];

    if (props.mountNvme) {
      userData.concat([
        'IDX=1 && for DEV in /dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_*-ns-1; do  mkfs.xfs ${DEV};mkdir -p /pv-disks/local${IDX};echo ${DEV} /pv-disks/local${IDX} xfs defaults,noatime 1 2 >> /etc/fstab; IDX=$((${IDX} + 1)); done',
        'mount -a',
      ]);
    }

    const userDataMime = `MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==MYBOUNDARY=="

--==MYBOUNDARY==
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
${userData.join('\r\n')}

--==MYBOUNDARY==--\\
`;
    const lt = new CfnLaunchTemplate(this, 'LaunchTemplate', {
      launchTemplateData: {
        userData: Fn.base64(userDataMime),
      },
    });

    const nodeGroupParameters = {
      ...props.options,
      ...{
        launchTemplateSpec: props.options.launchTemplateSpec ?? {
          id: lt.ref,
          version: lt.attrLatestVersionNumber,
        },
      },
    };

    this.eksGroup = cluster.addNodegroupCapacity(props.id, nodeGroupParameters);

    // Attach IAM Policy for SSM to be able to get shell access to the nodes
    this.eksGroup.role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );
  }
}

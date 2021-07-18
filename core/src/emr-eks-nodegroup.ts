// add default nodegroups as in here https://github.com/aws-samples/aws-analytics-reference-architecture/blob/feature/data-generator/core/src/data-generator.ts

import { CfnLaunchTemplate, InstanceType } from "@aws-cdk/aws-ec2";
import {
  NodegroupOptions,
  NodegroupAmiType,
  TaintEffect,
  CapacityType,
  Cluster,
  Nodegroup,
} from "@aws-cdk/aws-eks";
import { ManagedPolicy } from "@aws-cdk/aws-iam";
import { Construct, Fn } from "@aws-cdk/core";

export interface EmrEksNodegroupProps {
  id: string;
  options: NodegroupOptions;
  mountNvme?: boolean;
}

export class EmrEksNodegroup extends Construct {
  public static readonly NODEGROUP_TOOLING: EmrEksNodegroupProps = {
    id: "tooling",
    options: {
      instanceTypes: [new InstanceType("t3.medium")],
      minSize: 1,
      labels: { role: "tooling" },
    },
  };
  public static readonly NODEGROUP_CRITICAL: EmrEksNodegroupProps = {
    id: "criticalNodeGroup",
    mountNvme: true,
    options: {
      instanceTypes: [new InstanceType("r5d.xlarge")],
      minSize: 0,
      maxSize: 50,
      labels: {
        role: "critical",
        "emr-containers.amazonaws.com/resource.type": "job.run",
      },
      taints: [
        {
          key: "role",
          value: "critical",
          effect: TaintEffect.NO_SCHEDULE,
        },
      ],
    },
  };
  public static readonly NODEGROUP_SHARED: EmrEksNodegroupProps = {
    id: "sharedNodeGroup",
    mountNvme: true,
    options: {
      instanceTypes: [new InstanceType("m5.xlarge")],
      minSize: 0,
      maxSize: 50,
      labels: {
        role: "shared",
        "emr-containers.amazonaws.com/resource.type": "job.run",
      },
      taints: [
        {
          key: "role",
          value: "shared",
          effect: TaintEffect.NO_SCHEDULE,
        },
      ],
    },
  };
  public static readonly NODEGROUP_NOTEBOOKS: EmrEksNodegroupProps = {
    id: "notebooksNodeGroup",
    mountNvme: true,
    options: {
      instanceTypes: [new InstanceType("t4g.medium")],
      amiType: NodegroupAmiType.AL2_ARM_64,
      minSize: 0,
      maxSize: 50,
      capacityType: CapacityType.SPOT,
      labels: {
        role: "notebook",
        "emr-containers.amazonaws.com/resource.type": "job.run",
      },
      taints: [
        {
          key: "role",
          value: "notebook",
          effect: TaintEffect.NO_SCHEDULE,
        },
      ],
    },
  };

  public readonly eksGroup: Nodegroup;

  constructor(scope: Construct, cluster: Cluster, props: EmrEksNodegroupProps) {
    super(scope, props.id);

    if ("launchTemplateSpec" in props.options) {
      throw new TypeError("LaunchTemplate is not supported in this version");
    }

    const userData = [
      "yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm",
      "systemctl enable amazon-ssm-agent",
      "systemctl start amazon-ssm-agent",
    ];

    if (props.mountNvme) {
      userData.concat([
        "IDX=1 && for DEV in /dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_*-ns-1; do  mkfs.xfs ${DEV};mkdir -p /pv-disks/local${IDX};echo ${DEV} /pv-disks/local${IDX} xfs defaults,noatime 1 2 >> /etc/fstab; IDX=$((${IDX} + 1)); done",
        "mount -a",
      ]);
    }

    const userDataMime = `MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==MYBOUNDARY=="

--==MYBOUNDARY==
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
${userData.join("\r\n")}

--==MYBOUNDARY==--\\
`;
    const lt = new CfnLaunchTemplate(this, "LaunchTemplate", {
      launchTemplateData: {
        userData: Fn.base64(userDataMime),
      },
    });

    const nodeGroupParameters = {
      ...props.options,
      ...{
        launchTemplateSpec: {
          id: lt.ref,
          version: lt.attrLatestVersionNumber,
        },
      },
    };

    this.eksGroup = cluster.addNodegroupCapacity(props.id, nodeGroupParameters);

    // Attach IAM Policy for SSM to be able to get shell access to the nodes
    this.eksGroup.role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );
  }
}

import * as fs from 'fs';
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import * as yaml from 'js-yaml';

/**
 * @summary The properties for the EksCluster Construct class.
 */

export interface EksClusterProps {
  /**
   * IAM role that is used to access AWS console so you're able to use console UI to manage EKS service
   */
  readonly adminRoleArn: string;

  /**
   * Fargate namespace to be created in the cluster
   */
  readonly fargateNamespace: string;
  /**
   * Kubernetes cluster version to be created
   */
  readonly version: eks.KubernetesVersion;
}
/**
 * Configuration options for specifying node group size
 */

export interface EksClusterNodeGroupProps {
  /**
   * Min number of instances to be maintained in the nodegroup
   */
  readonly minCapacity: number;

  /**
   * Desired number of instances to be maintained in the nodegroup
   */
  readonly desiredCapacity: number;

  /**
   * Max number of instances that can be created in the nodegroup
   */
  readonly maxCapacity: number;
}

/**
 * High-level EKS Cluster CDK construct
 */

export class EksCluster extends cdk.Construct {
  /**
   *  Kubernetes Cluster version
   */

  public readonly version: eks.KubernetesVersion;

  /**
   * Fargate namespace to be created
   */

  public readonly fargateNamespace: string;

  /**
   * Reference to base CDK eksCluster, use it to access available piblic properties and menthods.
   *
   * @see https://docs.aws.amazon.com/cdk/api/latest/docs/aws-eks-readme.html
   */
  public readonly eksClusterCDK: eks.Cluster;

  private infra: EksClusterInfra;
  private k8s: EksClusterK8s;

  constructor(scope: cdk.Construct, id: string, props: EksClusterProps) {
    super(scope, id);
    this.infra = new EksClusterInfra(this, 'eksInfra', props);
    this.k8s = new EksClusterK8s(this, 'eksK8s', {
      eksCluster: this.infra.eksCluster,
      fargateNamespace: props.fargateNamespace,
    });
    this.k8s.node.addDependency(this.infra);
    this.version = props.version;
    this.fargateNamespace = props.fargateNamespace;
    this.eksClusterCDK = this.infra.eksCluster;
  }

  /**
   * Add Self-Managed NodeGroup to the EKS cluster and takes care of all tagging, NVME drives mounting, supports on-demand and spot options.
   * @param nodeGroupName  NodeGroup name, must be unique
   * @param instanceType EC2 instance type, e.g. m5.xlarge
   * @param nodeGroupConfig specify min/desired/max number of instances in the nodegroup
   * @param useNVMe  set to true if your instances have NVMe drives, they will be mounted automatically.
   * @param labels Array of key=value pairs that will be added as labels for each node, e.g. ['sla=critical','type=ondemand']
   * @param spotPrice if set nodegroup will be created using spot instances, specify the max price per hour you are willing to pay for spot instance, e.g. '0.28'
   */

  public addSelfManagedNodeGroup(
    nodeGroupName: string,
    instanceType: string,
    nodeGroupConfig: EksClusterNodeGroupProps,
    useNVMe: boolean,
    labels: string[],
    spotPrice?: string,
  ): AutoScalingGroup {
    const asgSpark = this.eksClusterCDK.addAutoScalingGroupCapacity(
      nodeGroupName,
      {
        instanceType: new ec2.InstanceType(instanceType),
        minCapacity: nodeGroupConfig.minCapacity,
        desiredCapacity: nodeGroupConfig.desiredCapacity,
        maxCapacity: nodeGroupConfig.maxCapacity,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
        spotPrice: spotPrice,
        bootstrapOptions: {
          kubeletExtraArgs:
            '--node-labels  ' +
            labels.join(',') +
            ',emr-containers.amazonaws.com/resource.type=job.run',
        },
      },
    );
    if (useNVMe) {
      asgSpark.addUserData(
        '#!/bin/bash',
        'yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
        'systemctl enable amazon-ssm-agent',
        'systemctl start amazon-ssm-agent',
        'yum install nvme-cli -y',
        "instance_stores=$(nvme list | awk '/Instance Storage/ {print $1}')",
        'mkdir -p /pv-disks/local',
        'count=$(echo $instance_stores | wc -w)',
        'if [[ $count -eq 1 ]]; then',
        'mkfs.ext4 $instance_stores',
        'echo $instance_stores /pv-disks/local ext4 defaults,noatime 0 2 >> /etc/fstab',
        'elif [[ $count -gt 1 ]]; then',
        'mdadm --create --verbose --level=0 /dev/md0 --name=DATA --raid-devices=$count $instance_stores',
        'mdadm --wait /dev/md0',
        'mkfs.ext4 /dev/md0',
        'mdadm --detail --scan >> /etc/mdadm.conf',
        'echo /dev/md0 /pv-disks/local ext4 defaults,noatime 0 2 >> /etc/fstab',
        'fi',
        'mount -a',
      );
    } else {
      asgSpark.addUserData(
        '#!/bin/bash',
        'yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
        'systemctl enable amazon-ssm-agent',
        'systemctl start amazon-ssm-agent',
      );
    }

    // Attach IAM Policy for SSM to be able to get shell access to the nodes
    asgSpark.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );

    this.infra.ClusterAutoscalerIAMPolicy.attachToRole(asgSpark.role);

    cdk.Tags.of(asgSpark).add(
      `k8s.io/cluster-autoscaler/${this.infra.clusterNameDeferred}`,
      'owned',
      { applyToLaunchedInstances: true },
    );
    cdk.Tags.of(asgSpark).add('k8s.io/cluster-autoscaler/enabled', 'true', {
      applyToLaunchedInstances: true,
    });

    return asgSpark;
  }

  /**
   * Add EKS Managed NodeGroup to the EKS cluster and takes care of all tagging, NVME drives mounting, supports on-demand and spot options.
   * @param nodeGroupName  NodeGroup name, must be unique
   * @param instanceTypes  array of EC2 instance types, e.g. ['m5.xlarge','m6g.xlarge']
   * @param nodeGroupConfig specify min/desired/max number of instances in the nodegroup
   * @param useNVMe  set to true if your instances have NVMe drives, they will be mounted automatically.
   * @param useSpot  set to true to use spot instances, ottherwise on-demand instances will be used. Mixed capacity pool is not suuported.
   * @param labels Array of key=value pairs that will be added as labels for each node, e.g. ['sla=critical','type=ondemand']
   * @param taints The Kubernetes taints to be applied to the nodes in the node group when they are created. @see https://docs.aws.amazon.com/eks/latest/userguide/node-taints-managed-node-groups.html
   */

  public addManagedNodeGroup(
    nodeGroupName: string,
    instanceTypes: string[],
    nodeGroupConfig: EksClusterNodeGroupProps,
    useNVMe: boolean,
    useSpot: boolean,
    labels: string[],
    taints?: eks.TaintSpec[],
  ): eks.Nodegroup {
    const userData = [
      'yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
      'systemctl enable amazon-ssm-agent',
      'systemctl start amazon-ssm-agent',
    ];

    if (useNVMe) {
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
    const lt = new ec2.CfnLaunchTemplate(this, 'LaunchTemplate', {
      launchTemplateData: {
        userData: cdk.Fn.base64(userDataMime),
      },
    });
    const nodeGroupParameters = {
      launchTemplateSpec: {
        id: lt.ref,
        version: lt.attrLatestVersionNumber,
      },
      minSize: nodeGroupConfig.minCapacity,
      maxSize: nodeGroupConfig.maxCapacity,
      desiredSize: nodeGroupConfig.desiredCapacity,
      subnets: { subnetType: ec2.SubnetType.PRIVATE },
      capacityType: useSpot
        ? eks.CapacityType.SPOT
        : eks.CapacityType.ON_DEMAND,
      instanceTypes: instanceTypes.map((itm) => new ec2.InstanceType(itm)),
      labels: { 'emr-containers.amazonaws.com/resource.type': 'job.run' },
      taints: taints,
    };
    for (const itm in labels) {
      let item = itm.split('=');
      Object.assign(nodeGroupParameters.labels, { [item[0]]: item[1] });
    }

    const sparkManagedGroup =
      this.eksClusterCDK.addNodegroupCapacity(nodeGroupName);

    // Attach IAM Policy for SSM to be able to get shell access to the nodes
    sparkManagedGroup.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );

    this.infra.ClusterAutoscalerIAMPolicy.attachToRole(sparkManagedGroup.role);

    cdk.Tags.of(sparkManagedGroup).add(
      `k8s.io/cluster-autoscaler/${this.infra.clusterNameDeferred}`,
      'owned',
      { applyToLaunchedInstances: true },
    );
    cdk.Tags.of(sparkManagedGroup).add(
      'k8s.io/cluster-autoscaler/enabled',
      'true',
      {
        applyToLaunchedInstances: true,
      },
    );

    return sparkManagedGroup;
  }

  public loadManifest(
    id: string,
    yamlFile: string,
    replacementMap?: ReplacementMapSpec[],
  ) {
    return this.k8s.loadManifest(id, yamlFile, replacementMap);
  }
}

/**
 * This internal construct is to separate AWS infrastructure from Kubernetes specific configuration and applications to enfoce the correct dependancy flow and avoid race conditions.
 *
 */

class EksClusterInfra extends cdk.Construct {
  public readonly version: eks.KubernetesVersion;
  public readonly fargateNamespace: string;
  public readonly eksCluster: eks.Cluster;

  public ClusterAutoscalerIAMPolicy: iam.Policy;
  public clusterNameDeferred: cdk.CfnJson;

  constructor(scope: cdk.Construct, id: string, props: EksClusterProps) {
    super(scope, id);
    this.version = props.version || eks.KubernetesVersion.V1_20;
    this.fargateNamespace = props.fargateNamespace;

    this.eksCluster = new eks.Cluster(this, 'eksCluster', {
      defaultCapacity: 0,
      version: this.version,
    });
    this.clusterNameDeferred = new cdk.CfnJson(this, 'clusterName', {
      value: this.eksCluster.clusterName,
    });

    const clusterAdmin = iam.Role.fromRoleArn(
      this,
      'AdminRole',
      props.adminRoleArn,
    );
    this.eksCluster.awsAuth.addMastersRole(clusterAdmin, 'AdminRole');

    // Add EKS-managed node group for running cert manager and ALB Ingress controller
    this.eksCluster.addNodegroupCapacity('tooling', {
      instanceType: new ec2.InstanceType('t3.medium'),
      minSize: 2,
      labels: {},
    });

    // Add EKS Fargate profile for EMR workloads
    this.eksCluster.addFargateProfile('fargate', {
      selectors: [
        {
          namespace: this.fargateNamespace,
          labels: {
            'app': 'enterprise-gateway',
            'component': 'kernel',
            'spark-role': 'executor',
          },
        },
      ],
    });

    //Create ClusterAutscaler IAM Role
    const ClusterAutoscalerPolicyDocument = iam.PolicyDocument.fromJson(
      JSON.parse(
        fs.readFileSync('./src/k8s/iam-policy-autoscaler.json', 'utf8'),
      ),
    );
    this.ClusterAutoscalerIAMPolicy = new iam.Policy(
      this,
      'ClusterAutoscalerIAMPolicy',
      { document: ClusterAutoscalerPolicyDocument },
    );

    const AutoscalerServiceAccount = this.eksCluster.addServiceAccount(
      'Autoscaler',
      { name: 'cluster-autoscaler', namespace: 'kube-system' },
    );
    this.ClusterAutoscalerIAMPolicy.attachToRole(AutoscalerServiceAccount.role);

    cdk.Tags.of(this.eksCluster.vpc).add(
      'for-use-with-amazon-emr-managed-policies',
      'true',
    );
    this.eksCluster.vpc.privateSubnets.forEach((subnet) =>
      cdk.Tags.of(subnet).add(
        'for-use-with-amazon-emr-managed-policies',
        'true',
      ),
    );
    this.eksCluster.vpc.publicSubnets.forEach((subnet) =>
      cdk.Tags.of(subnet).add(
        'for-use-with-amazon-emr-managed-policies',
        'true',
      ),
    );
  }
}

interface EksClusterK8sProps {
  eksCluster: eks.Cluster;
  fargateNamespace?: string;
}

/**
 * This internal construct is to separate AWS infrastructure from Kubernetes specific configuration and applications to enfoce the correct dependancy flow and avoid race conditions.
 *
 */
class EksClusterK8s extends cdk.Construct {
  /**
   * reference to the base cdk aws-cdk/eks/Cluster cluster instance
   */
  private eksCluster: eks.Cluster;

  constructor(scope: cdk.Construct, id: string, props: EksClusterK8sProps) {
    super(scope, id);
    this.eksCluster = props.eksCluster;

    /* create K8s namespace for fargate */
    if (props.fargateNamespace) {
      this.loadManifest(
        'fargatenamespace',
        './src/k8s/namespaces/fargate.yaml',
        [{ key: '{{NAMESPACE}}', val: props.fargateNamespace }],
      );
    }

    this.eksCluster.addHelmChart('AutoScaler', {
      createNamespace: true,
      chart: 'cluster-autoscaler',
      namespace: 'kube-system',
      repository: 'https://kubernetes.github.io/autoscaler',
      wait: true,
      values: {
        'serviceAccount.name': 'cluster-autoscaler',
        'serviceAccount.create': false,
      },
    });

    this.eksCluster.addHelmChart('CertManager', {
      createNamespace: true,
      namespace: 'cert-manager',
      chart: 'cert-manager',
      repository: 'https://charts.jetstack.io',
      version: 'v1.4.0',
      wait: true,
    });

    /* Add K8s Role and RoleBinding to emr-containers */
    /*  ['default', props.fargateNamespace].forEach((item) => {
      if (item) {
        this.loadManifest(
          'roleBinding' + item,
          './src/k8s/rbac/emr-containers.yaml',
          [{ key: '{{NAMESPACE}}', val: item }],
        );
      }
    });*/
  }

  /**
   * Runs K8s manifest optionally replacing placeholders in the yaml file with actual values
   * ```typescript
   * const ns = "fargate";
   * this.loadManifest(
          "manifest1",
          "./src/k8s/rbac/emr-containers.yaml",
          [{ key: "{{NAMESPACE}}", val: ns }]
        )
   * ```
   * @param id CDK resource ID must be unique
   * @param yamlFile path to K8s manifest file in yaml format.
   * @param replacementMap Array of key-value objects. For each object the value of 'key' parameter will be replaced with the value of 'val' parameter.
   */

  public loadManifest(
    id: string,
    yamlFile: string,
    replacementMap?: ReplacementMapSpec[],
  ) {
    let manifestYaml = fs.readFileSync(yamlFile, 'utf8');
    if (replacementMap) {
      replacementMap.forEach((elem) => {
        const rg = new RegExp(elem.key, 'g');
        manifestYaml = manifestYaml.replace(rg, elem.val);
      });
    }
    const manifest = yaml.loadAll(manifestYaml);
    // @ts-ignore
    return this.eksCluster.addManifest(id, ...manifest);
  }
}

export interface ReplacementMapSpec {
  readonly key: string;
  readonly val: string;
}

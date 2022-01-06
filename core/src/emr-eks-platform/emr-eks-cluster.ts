// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { join } from 'path';
import { SubnetType, VpcAttributes, Vpc, IVpc } from '@aws-cdk/aws-ec2';
import { KubernetesVersion, Cluster, CapacityType, Nodegroup } from '@aws-cdk/aws-eks';
import { CfnVirtualCluster } from '@aws-cdk/aws-emrcontainers';
import { PolicyStatement, PolicyDocument, IManagedPolicy, Policy, Role, ManagedPolicy, FederatedPrincipal, CfnServiceLinkedRole } from '@aws-cdk/aws-iam';
import { Bucket, Location } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Construct, Tags, Stack, Duration, CustomResource, Fn, CfnOutput } from '@aws-cdk/core';
import { SingletonBucket } from '../singleton-bucket';
import { SingletonCfnLaunchTemplate } from '../singleton-launch-template';
import { EmrEksNodegroup, EmrEksNodegroupOptions } from './emr-eks-nodegroup';
import { EmrVirtualClusterOptions } from './emr-virtual-cluster';
import { EmrManagedEndpointOptions, EmrManagedEndpointProvider } from './emr-managed-endpoint';
import * as CriticalDefaultConfig from './resources/k8s/emr-eks-config/critical.json';
import * as NotebookDefaultConfig from './resources/k8s/emr-eks-config/notebook.json';
import * as SharedDefaultConfig from './resources/k8s/emr-eks-config/shared.json';
import * as IamPolicyAlb from './resources/k8s/iam-policy-alb.json';
import * as IamPolicyAutoscaler from './resources/k8s/iam-policy-autoscaler.json';
import * as K8sRoleBinding from './resources/k8s/rbac/emr-containers-role-binding.json';
import * as K8sRole from './resources/k8s/rbac/emr-containers-role.json';


/**
 * The properties for the EmrEksCluster Construct class.
 */

export interface EmrEksClusterProps {
  /**
   * Name of the Amazon EKS cluster to be created
   * @default -  The [default cluster name]{@link EmrEksCluster.DEFAULT_CLUSTER_NAME}
   */
  readonly eksClusterName?: string;
  /**
   * Amazon IAM Role to be added to Amazon EKS master roles that will give access to kubernetes cluster from AWS console UI
   */
  readonly eksAdminRoleArn: string;
  /**
   * List of EmrEksNodegroup to create in the cluster in addition to the default [nodegroups]{@link EmrEksNodegroup}
   * @default -  Don't create additional nodegroups
   */
  readonly emrEksNodegroups?: EmrEksNodegroup[];
  /**
   * Kubernetes version for Amazon EKS cluster that will be created
   * @default -  v1.20 version is used
   */
  readonly kubernetesVersion?: KubernetesVersion;
  /**
   * Attributes of the VPC where to deploy the EKS cluster
   * VPC should have at least two private and public subnets in different Availability Zones
   * All private subnets should have the following tags:
   * 'for-use-with-amazon-emr-managed-policies'='true'
   * 'kubernetes.io/role/internal-elb'='1'
   * All public subnets should have the following tag:
   * 'kubernetes.io/role/elb'='1'
   */
  readonly eksVpcAttributes?: VpcAttributes;
}

/**
 * EmrEksCluster Construct packaging all the ressources required to run Amazon EMR on Amazon EKS.
 */
export class EmrEksCluster extends Construct {

  /**
   * Get an existing EmrEksCluster based on the cluster name property or create a new one 
   */
  public static getOrCreate(scope: Construct, props: EmrEksClusterProps) {

    const stack = Stack.of(scope);
    const id = props.eksClusterName || EmrEksCluster.DEFAULT_CLUSTER_NAME;

    let emrEksCluster: EmrEksCluster;

    if (stack.node.tryFindChild(id) == undefined) {
      emrEksCluster = new EmrEksCluster(stack, id, props);
    }

    return stack.node.tryFindChild(id) as EmrEksCluster || emrEksCluster!;
  }
  private static readonly EMR_VERSIONS = ['emr-6.4.0-latest','emr-6.3.0-latest', 'emr-6.2.0-latest', 'emr-5.33.0-latest', 'emr-5.32.0-latest'];
  private static readonly DEFAULT_EMR_VERSION = 'emr-6.4.0-latest';
  private static readonly DEFAULT_EKS_VERSION = KubernetesVersion.V1_21;
  private static readonly DEFAULT_CLUSTER_NAME = 'data-platform';
  private static readonly AUTOSCALING_POLICY = PolicyStatement.fromJson(IamPolicyAutoscaler);
  public readonly eksCluster: Cluster;
  public readonly notebookDefaultConfig: string;
  public readonly criticalDefaultConfig: string;
  public readonly sharedDefaultConfig: string;
  public readonly podTemplateLocation: Location;
  private readonly managedEndpointProviderServiceToken: string;
  private readonly emrServiceRole: CfnServiceLinkedRole;
  private readonly eksOidcProvider: FederatedPrincipal;
  private readonly assetBucket: Bucket;
  private readonly clusterName: string;
  private readonly eksVpc: IVpc | undefined;

  /**
   * Constructs a new instance of the EmrEksCluster class. An EmrEksCluster contains everything required to run Amazon EMR on Amazon EKS.
   * Amazon EKS Nodegroups and Amazon EKS Admin role can be customized.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {EmrEksClusterProps} props the EmrEksClusterProps [properties]{@link EmrEksClusterProps}
   * @access private
   */
  private constructor(scope: Construct, id: string, props: EmrEksClusterProps) {
    super(scope, id);

    this.clusterName = props.eksClusterName ?? EmrEksCluster.DEFAULT_CLUSTER_NAME;

    // create an Amazon EKS CLuster with default parameters if not provided in the properties
    if ( props.eksVpcAttributes != undefined) {

      this.eksVpc = Vpc.fromVpcAttributes(this, 'eksProvidedVpc', props.eksVpcAttributes);

      this.eksCluster = new Cluster(scope, `${this.clusterName}Cluster`, {
        defaultCapacity: 0,
        clusterName: this.clusterName,
        version: props.kubernetesVersion || EmrEksCluster.DEFAULT_EKS_VERSION,
        vpc: this.eksVpc,
      });

    } else {
      this.eksCluster = new Cluster(scope, `${this.clusterName}Cluster`, {
        defaultCapacity: 0,
        clusterName: this.clusterName,
        version: props.kubernetesVersion || EmrEksCluster.DEFAULT_EKS_VERSION,
      });
    }

    // Add the provided Amazon IAM Role as Amazon EKS Admin
    this.eksCluster.awsAuth.addMastersRole(Role.fromRoleArn( this, 'AdminRole', props.eksAdminRoleArn ), 'AdminRole');

    // Create a Kubernetes Service Account for the Cluster Autoscaler with Amazon IAM Role
    const AutoscalerServiceAccount = this.eksCluster.addServiceAccount('Autoscaler', {
      name: 'cluster-autoscaler',
      namespace: 'kube-system',
    });
    // Add the proper Amazon IAM Policy to the Amazon IAM Role for the Cluster Autoscaler
    AutoscalerServiceAccount.addToPrincipalPolicy(
      EmrEksCluster.AUTOSCALING_POLICY,
    );

    // @todo: check if we can create the service account from the Helm Chart
    // @todo: check if there's a workaround to run it with wait:true - at the moment the custom resource times out if you do that.
    // Deploy the Helm Chart for Kubernetes Cluster Autoscaler

    this.eksCluster.addHelmChart('AutoScaler', {
      chart: 'cluster-autoscaler',
      repository: 'https://kubernetes.github.io/autoscaler',
      namespace: 'kube-system',
      timeout: Duration.minutes(14),
      values: {
        cloudProvider: 'aws',
        awsRegion: Stack.of(this).region,
        autoDiscovery: { clusterName: this.clusterName },
        rbac: {
          serviceAccount: {
            name: 'cluster-autoscaler',
            create: false,
          },
        },
        extraArgs: {
          'skip-nodes-with-local-storage': false,
          'scan-interval': '5s',
          'expander': 'least-waste',
          'balance-similar-node-groups': true,
          'skip-nodes-with-system-pods': false,
        },
      },
    });

    // Tags the Amazon VPC and Subnets of the Amazon EKS Cluster
    Tags.of(this.eksCluster.vpc).add(
      'for-use-with-amazon-emr-managed-policies',
      'true',
    );
    this.eksCluster.vpc.privateSubnets.forEach((subnet) =>
      Tags.of(subnet).add('for-use-with-amazon-emr-managed-policies', 'true'),
    );
    this.eksCluster.vpc.publicSubnets.forEach((subnet) =>
      Tags.of(subnet).add('for-use-with-amazon-emr-managed-policies', 'true'),
    );

    // Create Amazon IAM ServiceLinkedRole for Amazon EMR and add to kubernetes configmap
    // required to add a dependency on the Amazon EMR virtual cluster
    this.emrServiceRole = new CfnServiceLinkedRole(this, 'EmrServiceRole', {
      awsServiceName: 'emr-containers.amazonaws.com',
    });
    this.eksCluster.awsAuth.addMastersRole(
      Role.fromRoleArn(
        this,
        'ServiceRoleForAmazonEMRContainers',
        `arn:aws:iam::${
          Stack.of(this).account
        }:role/AWSServiceRoleForAmazonEMRContainers`,
      ),
      'emr-containers',
    );

    // store the OIDC provider for creating execution roles later
    this.eksOidcProvider = new FederatedPrincipal(
      this.eksCluster.openIdConnectProvider.openIdConnectProviderArn,
      [],
      'sts:AssumeRoleWithWebIdentity',
    );

    // Create the Amazon EKS Nodegroup for tooling
    this.addNodegroupCapacity('tooling', EmrEksNodegroup.TOOLING_ALL);
    // Create default Amazon EMR on EKS Nodegroups. This will create one Amazon EKS nodegroup per AZ
    // Also create default configurations and pod templates for these nodegroups
    this.addEmrEksNodegroup('criticalAll', EmrEksNodegroup.CRITICAL_ALL);
    this.addEmrEksNodegroup('sharedDriver', EmrEksNodegroup.SHARED_DRIVER);
    this.addEmrEksNodegroup('sharedExecutor', EmrEksNodegroup.SHARED_EXECUTOR);
    // Add a nodegroup for notebooks
    this.addEmrEksNodegroup('notebookDriver',EmrEksNodegroup.NOTEBOOK_DRIVER);
    this.addEmrEksNodegroup('notebookExecutor',EmrEksNodegroup.NOTEBOOK_EXECUTOR);
    this.addEmrEksNodegroup('notebook',EmrEksNodegroup.NOTEBOOK_WITHOUT_PODTEMPLATE);
    // Create an Amazon S3 Bucket for default podTemplate assets
    this.assetBucket = SingletonBucket.getOrCreate(this, `${this.clusterName.toLowerCase()}-emr-eks-assets`);
    // Configure the podTemplate location
    this.podTemplateLocation = {
      bucketName: this.assetBucket.bucketName,
      objectKey: `${this.clusterName}/pod-template`,
    };

    // Upload the default podTemplate to the Amazon S3 asset bucket
    this.uploadPodTemplate('defaultPodTemplates',join(__dirname, 'resources/k8s/pod-template'));

    // Replace the pod template location for driver and executor with the correct Amazon S3 path in the notebook default config
    // NotebookDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.driver.podTemplateFile'] = this.assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/notebook-driver.yaml`);
    // NotebookDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.executor.podTemplateFile'] = this.assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/notebook-executor.yaml`);
    this.notebookDefaultConfig = JSON.stringify(NotebookDefaultConfig);

    // Replace the pod template location for driver and executor with the correct Amazon S3 path in the critical default config
    CriticalDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.driver.podTemplateFile'] = this.assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/critical-driver.yaml`);
    CriticalDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.executor.podTemplateFile'] = this.assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/critical-executor.yaml`);
    this.criticalDefaultConfig = JSON.stringify(CriticalDefaultConfig);

    // Replace the pod template location for driver and executor with the correct Amazon S3 path in the shared default config
    SharedDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.driver.podTemplateFile'] = this.assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/shared-driver.yaml`);
    SharedDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.executor.podTemplateFile'] = this.assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/shared-executor.yaml`);
    this.sharedDefaultConfig = JSON.stringify(SharedDefaultConfig);

    // Deploy the Helm Chart for the Certificate Manager. Required for EMR Studio ALB.
    const certManager = this.eksCluster.addHelmChart('CertManager', {
      createNamespace: true,
      namespace: 'cert-manager',
      chart: 'cert-manager',
      repository: 'https://charts.jetstack.io',
      version: 'v1.4.0',
      timeout: Duration.minutes(14),
    });

    //Create service account for ALB and install ALB
    const albPolicyDocument = PolicyDocument.fromJson(IamPolicyAlb);
    const albIAMPolicy = new Policy(
      this,

      'AWSLoadBalancerControllerIAMPolicy',
      { document: albPolicyDocument },
    );

    const albServiceAccount = this.eksCluster.addServiceAccount('ALB', {
      name: 'aws-load-balancer-controller',
      namespace: 'kube-system',
    });
    albIAMPolicy.attachToRole(albServiceAccount.role);

    const albService = this.eksCluster.addHelmChart('ALB', {
      chart: 'aws-load-balancer-controller',
      repository: 'https://aws.github.io/eks-charts',
      namespace: 'kube-system',

      timeout: Duration.minutes(14),
      values: {
        clusterName: this.clusterName,
        serviceAccount: {
          name: 'aws-load-balancer-controller',

          create: false,
        },
      },
    });
    albService.node.addDependency(albServiceAccount);
    albService.node.addDependency(certManager);

    // Add the kubernetes dashboard from helm chart
    this.eksCluster.addHelmChart('KubernetesDashboard', {
      createNamespace: true,
      namespace: 'kubernetes-dashboard',
      chart: 'kubernetes-dashboard',
      repository: 'https://kubernetes.github.io/dashboard/',
      version: 'v5.0.4',
      timeout: Duration.minutes(2),
      values: {
        fullnameOverride: 'kubernetes-dashboard',
        resources: {
          limits: {
            memory: '600Mi',
          },
        },
      },
    });

    // Add the kubernetes dashboard service account
    this.eksCluster.addManifest('kubedashboard', {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        name: 'eks-admin',
        namespace: 'kube-system',
      },
    });
    // Add the kubernetes dashboard cluster role binding
    this.eksCluster.addManifest('kubedashboardrolebinding', {
      apiVersion: 'rbac.authorization.k8s.io/v1beta1',
      kind: 'ClusterRoleBinding',
      metadata: {
        name: 'eks-admin',
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: 'cluster-admin',
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: 'eks-admin',
          namespace: 'kube-system',
        },
      ],
    });

    // Set the custom resource provider service token here to avoid circular dependencies
    this.managedEndpointProviderServiceToken = new EmrManagedEndpointProvider(this, 'ManagedEndpointProvider').provider.serviceToken;

    // Provide the Kubernetes Dashboard URL in AWS CloudFormation output
    new CfnOutput(this, 'kubernetesDashboardURL', {
      description: 'Access Kubernetes Dashboard via kubectl proxy and this URL',
      value: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:https/proxy/#/login',
    });

    // Provide the podTemplate location on Amazon S3
    new CfnOutput(this, 'podTemplateLocation', {
      description: 'Use podTemplates in Amazon EMR jobs from this Amazon S3 Location',
      value: this.assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}`),
    });
  }

  /**
   * Add new Amazon EMR on EKS nodegroups to the cluster. This method overrides Amazon EKS nodegroup options then create the nodegroup.
   * If no subnet is provided, it creates one nodegroup per private subnet in the Amazon EKS Cluster.
   * If NVME local storage is used, the user_data is modified.
   * @param {EmrEksNodegroupOptions} props the EmrEksNodegroupOptions [properties]{@link EmrEksNodegroupOptions}
   * @access public
   */
  public addEmrEksNodegroup(id: string, props: EmrEksNodegroupOptions) {

    // Get the subnet from Properties or one private subnet for each AZ
    const subnetList = props.subnet ? [props.subnet] : this.eksCluster.vpc.selectSubnets({
      onePerAz: true,
      subnetType: SubnetType.PRIVATE_WITH_NAT,
    }).subnets;

    // Add Amazon SSM agent to the user data
    var userData = [
      'yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
      'systemctl enable amazon-ssm-agent',
      'systemctl start amazon-ssm-agent',
    ];
    var launchTemplateName = `EmrEksLaunch-${this.clusterName}`;
    // If the Nodegroup uses NVMe, add user data to configure them
    if (props.mountNvme) {
      userData = userData.concat([
        'INSTANCE_TYPE=$(ec2-metadata -t)',
        'if [[ $INSTANCE_TYPE == *"2xlarge"* ]]; then',
        'DEVICE="/dev/nvme1n1"',
        'mkfs.ext4 $DEVICE',
        'else',
        'yum install -y mdadm',
        'SSD_NVME_DEVICE_LIST=("/dev/nvme1n1" "/dev/nvme2n1")',
        'SSD_NVME_DEVICE_COUNT=${#SSD_NVME_DEVICE_LIST[@]}',
        'RAID_DEVICE=${RAID_DEVICE:-/dev/md0}',
        'RAID_CHUNK_SIZE=${RAID_CHUNK_SIZE:-512}  # Kilo Bytes',
        'FILESYSTEM_BLOCK_SIZE=${FILESYSTEM_BLOCK_SIZE:-4096}  # Bytes',
        'STRIDE=$((RAID_CHUNK_SIZE * 1024 / FILESYSTEM_BLOCK_SIZE))',
        'STRIPE_WIDTH=$((SSD_NVME_DEVICE_COUNT * STRIDE))',

        'mdadm --create --verbose "$RAID_DEVICE" --level=0 -c "${RAID_CHUNK_SIZE}" --raid-devices=${#SSD_NVME_DEVICE_LIST[@]} "${SSD_NVME_DEVICE_LIST[@]}"',
        'while [ -n "$(mdadm --detail "$RAID_DEVICE" | grep -ioE \'State :.*resyncing\')" ]; do',
        'echo "Raid is resyncing.."',
        'sleep 1',
        'done',
        'echo "Raid0 device $RAID_DEVICE has been created with disks ${SSD_NVME_DEVICE_LIST[*]}"',
        'mkfs.ext4 -m 0 -b "$FILESYSTEM_BLOCK_SIZE" -E "stride=$STRIDE,stripe-width=$STRIPE_WIDTH" "$RAID_DEVICE"',
        'DEVICE=$RAID_DEVICE',
        'fi',

        'systemctl stop docker',
        'mkdir -p /var/lib/kubelet/pods',
        'mount $DEVICE /var/lib/kubelet/pods',
        'chmod 750 /var/lib/docker',
        'systemctl start docker',
      ]);
      launchTemplateName = `EmrEksNvmeLaunch-${this.clusterName}`;
    }

    // Add headers and footers to user data
    const userDataMime = Fn.base64(`MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==MYBOUNDARY=="

--==MYBOUNDARY==
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
${userData.join('\r\n')}

--==MYBOUNDARY==--\\
`);

    // Create a new LaunchTemplate or reuse existing one
    const lt = SingletonCfnLaunchTemplate.getOrCreate(this, launchTemplateName, userDataMime);

    // Create one Amazon EKS Nodegroup per subnet
    subnetList.forEach( (subnet, index) => {

      // Make the ID unique across AZ using the index of subnet in the subnet list
      const resourceId = `${id}-${index}`;
      const nodegroupName = props.nodegroupName ? `${props.nodegroupName}-${index}` : resourceId;

      // Add the user data to the NodegroupOptions
      const nodeGroupParameters = {
        ...props,
        ...{
          launchTemplateSpec: {
            id: lt.ref,
            version: lt.attrLatestVersionNumber,
          },
          subnets: {
            subnets: [subnet],
          },
          nodegroupName: nodegroupName,
        },
      };

      // Create the Amazon EKS Nodegroup
      this.addNodegroupCapacity(resourceId, nodeGroupParameters);
    });
  }

  /**
   * Add a new Amazon EMR Virtual Cluster linked to Amazon EKS Cluster.
   * @param {Construct} scope of the stack where virtual cluster is deployed
   * @param {EmrVirtualClusterOptions} options the EmrVirtualClusterProps [properties]{@link EmrVirtualClusterProps}
   * @access public
   */

  public addEmrVirtualCluster(scope: Construct, options: EmrVirtualClusterOptions): CfnVirtualCluster {
    const eksNamespace = options.eksNamespace ?? 'default';

    const regex = /^[a-z0-9]+$/g;

    if (!eksNamespace.match(regex)) {
      throw new Error(`Namespace provided violates the constraints of Namespace naming ${eksNamespace}`);
    }

    const ns = options.createNamespace
      ? this.eksCluster.addManifest(`${options.name}Namespace`, {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: eksNamespace },
      })
      : null;

    // deep clone the Role template object and replace the namespace
    const k8sRole = JSON.parse(JSON.stringify(K8sRole));
    k8sRole.metadata.namespace = eksNamespace;
    const role = this.eksCluster.addManifest(`${options.name}Role`, k8sRole);
    role.node.addDependency(this.emrServiceRole);
    if (ns) role.node.addDependency(ns);

    // deep clone the Role Binding template object and replace the namespace
    const k8sRoleBinding = JSON.parse(JSON.stringify(K8sRoleBinding));
    k8sRoleBinding.metadata.namespace = eksNamespace;
    const roleBinding = this.eksCluster.addManifest(`${options.name}RoleBinding`, k8sRoleBinding);
    roleBinding.node.addDependency(role);

    const virtCluster = new CfnVirtualCluster(scope, `${options.name}VirtualCluster`, {
      name: options.name,
      containerProvider: {
        id: this.clusterName,
        type: 'EKS',
        info: { eksInfo: { namespace: options.eksNamespace || 'default' } },
      },
    });

    virtCluster.node.addDependency(roleBinding);
    virtCluster.node.addDependency(this.emrServiceRole);
    return virtCluster;
  }

  /**
   * Creates a new Amazon EMR managed endpoint to be used with Amazon EMR Virtual Cluster .
   * CfnOutput can be customized.
   * @param {Construct} scope of the stack where managed endpoint is deployed
   * @param {string} id unique id for endpoint
   * @param {EmrManagedEndpointOptions} options The EmrManagedEndpointOptions to configure the Amazon EMR managed endpoint
   * @access public
   */
  public addManagedEndpoint(scope: Construct, id: string, options: EmrManagedEndpointOptions) {

    if (id.length > 64) {
      throw new Error(`error managed endpoint name length is greater than 64 ${id}`);
    }

    if (options.emrOnEksVersion && ! EmrEksCluster.EMR_VERSIONS.includes(options.emrOnEksVersion)) {
      throw new Error(`error unsupported EMR version ${options.emrOnEksVersion}`);
    }

    if (this.notebookDefaultConfig == undefined) {
      throw new Error('error empty configuration override is not supported on non-default nodegroups');
    }

    try {
      var jsonConfigurationOverrides = options.configurationOverrides ? JSON.stringify(options.configurationOverrides) : this.notebookDefaultConfig;
    } catch (error) {
      throw new Error(`The configuraton override is not valid JSON : ${options.configurationOverrides}`);
    }
    // Create custom resource with async waiter until the Amazon EMR Managed Endpoint is created

    const cr = new CustomResource(scope, id, {
      serviceToken: this.managedEndpointProviderServiceToken,
      properties: {
        clusterId: options.virtualClusterId,
        executionRoleArn: options.executionRole.roleArn,
        endpointName: options.managedEndpointName,
        releaseLabel: options.emrOnEksVersion || EmrEksCluster.DEFAULT_EMR_VERSION,
        configurationOverrides: jsonConfigurationOverrides,
      },
    });
    cr.node.addDependency(this.eksCluster);

    return cr;
  }

  /**
   * Add a new Amazon EKS Nodegroup to the cluster.
   * This method is be used to add a nodegroup to the Amazon EKS cluster and automatically set tags based on labels and taints
   *  so it can be used for the cluster autoscaler.
   * @param {string} nodegroupId the ID of the nodegroup
   * @param {EmrEksNodegroupOptions} options the EmrEksNodegroup [properties]{@link EmrEksNodegroupOptions}
   * @access public
   */
  public addNodegroupCapacity(nodegroupId: string, options: EmrEksNodegroupOptions): Nodegroup {

    const nodegroup = this.eksCluster.addNodegroupCapacity(nodegroupId, options);
    // Adding the Amazon SSM policy
    nodegroup.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    // Add tags for the Cluster Autoscaler management
    Tags.of(nodegroup).add(
      `k8s.io/cluster-autoscaler/${this.clusterName}`,
      'owned',
      { applyToLaunchedInstances: true },
    );
    Tags.of(nodegroup).add(
      'k8s.io/cluster-autoscaler/enabled',
      'true',
      {
        applyToLaunchedInstances: true,
      },
    );
    // Add tag for the AZ
    if (options.subnets && options.subnets.subnets) {
      Tags.of(nodegroup).add(
        'k8s.io/cluster-autoscaler/node-template/label/topology.kubernetes.io/zone',
        options.subnets.subnets[0].availabilityZone,
        {
          applyToLaunchedInstances: true,
        },
      );
    }
    Tags.of(nodegroup).add(
      'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle',
      (options.capacityType == CapacityType.SPOT) ? 'spot' : 'on-demand',
      {
        applyToLaunchedInstances: true,
      },
    );
    // Iterate over labels and add appropriate tags
    if (options.labels) {
      for (const [key, value] of Object.entries(options.labels)) {
        Tags.of(nodegroup).add(
          `k8s.io/cluster-autoscaler/node-template/label/${key}`,
          value,
          {
            applyToLaunchedInstances: true,
          },
        );
      }
    }
    // Iterate over taints and add appropriate tags
    if (options.taints) {
      options.taints.forEach( (taint) => {
        Tags.of(nodegroup).add(
          `k8s.io/cluster-autoscaler/node-template/taint/${taint.key}`,
          `${taint.value}:${taint.effect}`,
          {
            applyToLaunchedInstances: true,
          },
        );
      });
    }

    return nodegroup;
  }

  /**
   * Create and configure a new Amazon IAM Role usable as an execution role.
   * This method links the makes the created role assumed by the Amazon EKS cluster Open ID Connect provider.
   * @param {IManagedPolicy} policy the execution policy to attach to the role
   * @access public
   */
  public createExecutionRole(scope: Construct, id: string, policy: IManagedPolicy, name?: string): Role {

     // Create an execution role assumable by EKS OIDC provider
    const executionRole = new Role(scope, `${id}ExecutionRole`, {
      assumedBy: this.eksOidcProvider,
      roleName: name ? name : undefined,
      managedPolicies: [policy],
    });
    return executionRole;
  }

  /**
   * Upload podTemplates to the Amazon S3 location used by the cluster.
   * @param filePath The local path of the yaml podTemplate files to upload
   */
  public uploadPodTemplate(id: string, filePath: string) {

    new BucketDeployment(this, `${id}AssetDeployment`, {
      destinationBucket: this.assetBucket,
      destinationKeyPrefix: this.podTemplateLocation.objectKey,
      sources: [Source.asset(filePath)],
    });
  }

}

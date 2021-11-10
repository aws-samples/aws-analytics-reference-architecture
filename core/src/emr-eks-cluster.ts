// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SubnetType } from '@aws-cdk/aws-ec2';
import { KubernetesVersion, Cluster, CapacityType, Nodegroup } from '@aws-cdk/aws-eks';
import { CfnVirtualCluster } from '@aws-cdk/aws-emrcontainers';
import { PolicyStatement, PolicyDocument, Policy, Role, IRole, ManagedPolicy, FederatedPrincipal, CfnServiceLinkedRole } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Location } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Construct, Tags, Stack, Duration, CustomResource, Fn, CfnOutput } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';
import * as AWS from 'aws-sdk';
import { SingletonBucket } from '.';
import { EmrEksNodegroup, EmrEksNodegroupOptions } from './emr-eks-nodegroup';
import { EmrVirtualClusterProps } from './emr-virtual-cluster';

import * as CriticalDefaultConfig from './k8s/emr-eks-config/critical.json';
import * as NotebookDefaultConfig from './k8s/emr-eks-config/notebook.json';
import * as SharedDefaultConfig from './k8s/emr-eks-config/shared.json';
import * as IamPolicyAlb from './k8s/iam-policy-alb.json';
import * as IamPolicyAutoscaler from './k8s/iam-policy-autoscaler.json';
import * as K8sRoleBinding from './k8s/rbac/emr-containers-role-binding.json';
import * as K8sRole from './k8s/rbac/emr-containers-role.json';
import { SingletonCfnLaunchTemplate } from './singleton-launch-template';


/**
 * The properties for the EmrEksCluster Construct class.
 */

export interface EmrEksClusterProps {
  /**
   * Name of the Amazon EKS cluster to be created
   * @default -  automatically generated cluster name
   */
  readonly eksClusterName?: string;
  /**
   * Amazon IAM Role to be added to Amazon EKS master roles that will give access to kubernetes cluster from AWS console UI
   */
  readonly eksAdminRoleArn: string;
  /**
   * List of EmrEksNodegroup to create in the cluster in addition to the default [nodegroups] {@link EmrEksNodegroup}
   * @default -  Don't create additional nodegroups
   */
  readonly emrEksNodegroups?: EmrEksNodegroup[];
  /**
   * Kubernetes version for Amazon EKS cluster that will be created
   * @default -  v1.20 version is used
   */
  readonly kubernetesVersion?: KubernetesVersion;

  /**
   * ACM Certificate ARN used with EMR on EKS managed endpoint
   * @default - generate and import certificate using locally installed openssl utility
   */
  readonly acmCertificateArn?: string;
  /**
   * EMR on EKS managed endpoint version
   * @default - emr-6.3.0-latest
   */
  readonly emrOnEksVersion?: string;
}

/**
 * EmrEksCluster Construct packaging all the ressources required to run Amazon EMR on Amazon EKS.
 */
export class EmrEksCluster extends Construct {

  public static readonly DEFAULT_EKS_VERSION = KubernetesVersion.V1_20;
  public static readonly DEFAULT_EMR_VERSION = 'emr-6.3.0-latest';

  public static getOrCreate(scope: Construct, eksAdminRoleArn: string, kubernetesVersion: KubernetesVersion, clusterName: string) {

    const stack = Stack.of(scope);
    const id = `${clusterName}Singleton`;

    let emrEksCluster: EmrEksCluster;

    if (stack.node.tryFindChild(id) == undefined) {
      emrEksCluster = new EmrEksCluster(stack, id, {
        kubernetesVersion: kubernetesVersion,
        eksAdminRoleArn: eksAdminRoleArn,
        eksClusterName: `${clusterName}-ara-cluster`,
      });
    }

    return stack.node.tryFindChild(id) as EmrEksCluster || emrEksCluster!;
  }

  private static readonly EMR_VERSIONS = ['emr-6.3.0-latest', 'emr-6.2.0-latest', 'emr-5.33.0-latest', 'emr-5.32.0-latest']
  private static readonly AUTOSCALING_POLICY = PolicyStatement.fromJson(IamPolicyAutoscaler);
  private readonly emrServiceRole: CfnServiceLinkedRole;
  public readonly eksCluster: Cluster;
  public readonly notebookDefaultConfig: string;
  public readonly criticalDefaultConfig: string;
  public readonly sharedDefaultConfig: string;
  private readonly eksOidcProvider: FederatedPrincipal;
  private defaultCertificateArn?: string;
  private readonly podTemplateLocation: Location;
  private readonly clusterName: string;
  private readonly managedEndpointProvider: Provider;
  public readonly managedEndpointProviderServiceToken: string;

  /**
   * Constructs a new instance of the EmrEksCluster class. An EmrEksCluster contains everything required to run Amazon EMR on Amazon EKS.
   * Amazon EKS Nodegroups and Amazon EKS Admin role can be customized.
   * @param {cdk.Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {EmrEksClusterProps} props the EmrEksClusterProps [properties]{@link EmrEksClusterProps}
   * @access public
   */
  constructor(scope:
  Construct, id: string, props: EmrEksClusterProps) {
    super(scope, id);

    this.clusterName = props.eksClusterName ?? 'emr-eks-cluster';

    // create an Amazon EKS CLuster with default paramaters if not provided in the properties
    this.eksCluster = new Cluster(scope, this.clusterName, {
      defaultCapacity: 0,
      clusterName: this.clusterName,
      version: props.kubernetesVersion || EmrEksCluster.DEFAULT_EKS_VERSION,
    });

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
    this.emrServiceRole = new CfnServiceLinkedRole(this, 'EmrServiceIAMRole', {
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

    // Create the Nodegroup for tooling
    this.addNodegroupCapacity('tooling', EmrEksNodegroup.TOOLING_ALL);
    // Create default Nodegroups of each type in one subnet of each AZ
    // Also create default configurations and pod templates for these nodegroups
    this.addEmrEksNodegroup(EmrEksNodegroup.CRITICAL_ALL);
    this.addEmrEksNodegroup(EmrEksNodegroup.SHARED_DRIVER);
    this.addEmrEksNodegroup(EmrEksNodegroup.SHARED_EXECUTOR);

    // Create an Amazon S3 Bucket for default podTemplate assets
    const assetBucket = SingletonBucket.getOrCreate(this, `${this.clusterName.toLowerCase()}-emr-eks-assets`);
    // Deploy the default podTemplates
    this.podTemplateLocation = {
      bucketName: assetBucket.bucketName,
      objectKey: `${this.clusterName}/pod-template`,
    };
    new BucketDeployment(this, 'assetDeployment', {
      destinationBucket: assetBucket,
      destinationKeyPrefix: this.podTemplateLocation.objectKey,
      sources: [Source.asset('./src/k8s/pod-template')],
    });

    // Replace the pod template location for driver and executor with the correct Amazon S3 path in the notebook default config
    NotebookDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.driver.podTemplateFile'] = assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/notebook-driver.yaml`);
    NotebookDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.executor.podTemplateFile'] = assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/notebook-executor.yaml`);
    this.notebookDefaultConfig = JSON.stringify(NotebookDefaultConfig);

    // Replace the pod template location for driver and executor with the correct Amazon S3 path in the critical default config
    CriticalDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.driver.podTemplateFile'] = assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/critical-driver.yaml`);
    CriticalDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.executor.podTemplateFile'] = assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/critical-executor.yaml`);
    this.criticalDefaultConfig = JSON.stringify(CriticalDefaultConfig);

    // Replace the pod template location for driver and executor with the correct Amazon S3 path in the shared default config
    SharedDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.driver.podTemplateFile'] = assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/shared-driver.yaml`);
    SharedDefaultConfig.applicationConfiguration[0].properties['spark.kubernetes.executor.podTemplateFile'] = assetBucket.s3UrlForObject(`${this.podTemplateLocation.objectKey}/shared-executor.yaml`);
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
    // Provide the Kubernetes Dashboard URL in AWS CloudFormation output
    new CfnOutput(this, 'kubernetesDashboardURL', {
      description: 'Access Kubernetes Dashboard via kubectl proxy and this URL',
      value: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:https/proxy/#/login',
    });

    // Create the custom resource provider for adding managed endpoints to the cluster
    const lambdaPath = 'lambdas/managed-endpoint';

    // AWS Lambda function supporting the create, update, delete operations on Amazon EMR on EKS managed endpoints
    const onEvent = new lambda.Function(this, `${this.clusterName}ManagedEndpointOnEvent`, {
      code: lambda.Code.fromAsset(path.join(__dirname, lambdaPath)),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.onEvent',
      timeout: Duration.seconds(120),
      environment: {
        REGION: Stack.of(this).region,
      },
      // TODO least priviliges
      initialPolicy: [
        new PolicyStatement({
          resources: ['*'],
          actions: ['s3:GetObject*', 's3:GetBucket*', 's3:List*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['acm:*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['emr-containers:*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['ec2:*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['kms:*'],
        }),
      ],
    });

    // AWS Lambda supporting the status check on asynchronous create, update and delete operations
    const isComplete = new lambda.Function(this, `${this.clusterName}ManagedEndpointIsComplete`, {
      code: lambda.Code.fromAsset(path.join(__dirname, lambdaPath)),
      handler: 'index.isComplete',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(120),
      environment: {
        REGION: Stack.of(this).region,
      },
      // TODO least priviliges
      initialPolicy: [
        new PolicyStatement({
          resources: ['*'],
          actions: ['s3:GetObject*', 's3:GetBucket*', 's3:List*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['acm:*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['emr-containers:*'],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: ['ec2:*'],
        }),
      ],
    });
    this.managedEndpointProvider = new Provider(this, `CustomResourceProvider${id}`, {
      onEventHandler: onEvent,
      isCompleteHandler: isComplete,
      logRetention: RetentionDays.ONE_DAY,
      totalTimeout: Duration.minutes(30),
      queryInterval: Duration.seconds(20),
    });

    this.managedEndpointProviderServiceToken = this.managedEndpointProvider.serviceToken;

  }

  /**
   * Add a new Amazon EKS Nodegroup to the cluster with Amazon EMR on EKS best practices and configured for Cluster Autoscaler.
   * CfnOutput can be customized. If no subnet is provided, it adds one nodegroup per private subnet in the Amazon EKS Cluster
   * @param {Props} props the EmrEksNodegroupOptions [properties]{@link EmrEksNodegroupOptions}
   * @access public
   */
  public addEmrEksNodegroup(props: EmrEksNodegroupOptions) {

    // Get the subnet from Properties or one private subnet for each AZ
    const subnetList = props.subnet ? [props.subnet] : this.eksCluster.vpc.selectSubnets({
      onePerAz: true,
      subnetType: SubnetType.PRIVATE_WITH_NAT,
    }).subnets;

    // Create one Nodegroup per subnet
    subnetList.forEach( (subnet, index) => {

      // Add Amazon SSM agent to the user data
      const userData = [
        'yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
        'systemctl enable amazon-ssm-agent',
        'systemctl start amazon-ssm-agent',
      ];
      var launchTemplateName = `EmrEksLaunch-${this.clusterName}`;
      // If the Nodegroup uses NVMe, add user data to configure them
      if (props.mountNvme) {
        userData.concat([
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

      // Make the ID unique across AZ using the index of subnet in the subnet list
      const id = `${props.id}-${index}`;

      // Create a new LaunchTemplate or reuse existing one
      const lt = SingletonCfnLaunchTemplate.getOrCreate(this, launchTemplateName, userDataMime);

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
        },
      };

      // Create the Amazon EKS Nodegroup
      this.addNodegroupCapacity(id, nodeGroupParameters);
    });
  }

  /**
   * Add a new Amazon EMR Virtual Cluster linked to EKS Cluster.
   * CfnOutput can be customized.
   * @param {EmrVirtualClusterProps} props the EmrEksNodegroupProps [properties]{@link EmrVirtualClusterProps}
   * @access public
   */

  public addEmrVirtualCluster(props: EmrVirtualClusterProps): CfnVirtualCluster {
    const eksNamespace = props.eksNamespace ?? 'default';
    const ns = props.createNamespace
      ? this.eksCluster.addManifest(`${props.name}Namespace`, {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: eksNamespace },
      })
      : null;

    // deep clone the Role template object and replace the namespace
    const k8sRole = JSON.parse(JSON.stringify(K8sRole));
    k8sRole.metadata.namespace = eksNamespace;
    const role = this.eksCluster.addManifest(`${props.name}Role`, k8sRole);
    role.node.addDependency(this.emrServiceRole);
    if (ns) role.node.addDependency(ns);

    // deep clone the Role Binding template object and replace the namespace
    const k8sRoleBinding = JSON.parse(JSON.stringify(K8sRoleBinding));
    k8sRoleBinding.metadata.namespace = eksNamespace;
    const roleBinding = this.eksCluster.addManifest(`${props.name}RoleBinding`, k8sRoleBinding);
    roleBinding.node.addDependency(role);

    const virtCluster = new CfnVirtualCluster(this, `${props.name}EmrCluster`, {
      name: props.name,
      containerProvider: {
        id: this.clusterName,
        type: 'EKS',
        info: { eksInfo: { namespace: props.eksNamespace || 'default' } },
      },
    });

    virtCluster.node.addDependency(roleBinding);
    virtCluster.node.addDependency(this.emrServiceRole);
    return virtCluster;
  }

  /**
   * Creates a new Amazon EMR managed endpoint to be used with Amazon EMR Virtual Cluster .
   * CfnOutput can be customized.
   * @param {string} id unique id for endpoint
   * @param {string} virtualClusterId Amazon Emr Virtual Cluster Id
   * @param {string} acmCertificateArn - ACM Certificate Arn to be attached to the managed endpoint, @default - creates new ACM Certificate
   * @param {string} emrOnEksVersion - EmrOnEks version to be used. @default - emr-6.3.0-latest
   * @param {Role} executionRole - IAM execution role to attach
   * @param {string} configurationOverrides - The JSON configuration override for Amazon EMR Managed Endpoint, @default - Configuration related to the [default nodegroup for notebook]{@link EmrEksNodegroup.NOTEBOOK_EXECUTOR}
   * @access public
   */
  public addManagedEndpoint(
    scope: Construct,
    serviceToken: string,
    id: string,
    virtualClusterId: string,
    executionRole: IRole,
    acmCertificateArn?: string,
    emrOnEksVersion?: string,
    configurationOverrides?: string,
  ) {

    if (id.length > 64) {
      throw new Error(`error managedendpoint name length is greater than 64 ${id}`);
    }

    if (emrOnEksVersion && ! EmrEksCluster.EMR_VERSIONS.includes(emrOnEksVersion)) {
      throw new Error(`error unsupported EMR version ${emrOnEksVersion}`);
    }

    if (this.notebookDefaultConfig == undefined) {
      throw new Error('error empty configuration override is not supported on non-default nodegroups');
    }

    try {
      var jsonConfigurationOverrides = configurationOverrides ? JSON.stringify(configurationOverrides) : '';
    } catch (error) {
      throw new Error(`The configuraton override is not valid JSON : ${configurationOverrides}`);
    }
    // Create custom resource with async waiter until the Amazon EMR Managed Endpoint is created
    const endpointId = `managed-endpoint-${id}`;

    const cr = new CustomResource(scope, id, {
      serviceToken: serviceToken,
      properties: {
        clusterId: virtualClusterId,
        executionRoleArn:
          executionRole.roleArn,
        endpointName: endpointId,
        releaseLabel: emrOnEksVersion || EmrEksCluster.DEFAULT_EMR_VERSION,
        configurationOverrides: configurationOverrides
          ? jsonConfigurationOverrides
          : this.notebookDefaultConfig,
        acmCertificateArn:
          acmCertificateArn ||
          this.defaultCertificateArn ||
          String(this.createAcmCertificate()),
      },
    });
    cr.node.addDependency(this.eksCluster);

    return cr;
  }

  private createAcmCertificate(): any {
    const clientAcm = new AWS.ACM({
      apiVersion: '2015-12-08',
      region: process.env.CDK_DEFAULT_REGION,
    });
    async () => {
      try {
        execSync(
          `openssl req -x509 -newkey rsa:1024 -keyout /tmp/privateKey.pem  -out /tmp/certificateChain.pem -days 365 -nodes -subj "/C=US/ST=Washington/L=Seattle/O=MyOrg/OU=MyDept/CN=*.${this.clusterName}.com"`,
        );
      } catch (error) {
        throw new Error(`Error generating certificate ${error}`);
      }

      try {
        const command = {
          Certificate: Buffer.from(
            fs.readFileSync('/tmp/certificateChain.pem', 'binary'),
          ),
          PrivateKey: Buffer.from(
            fs.readFileSync('/tmp/privateKey.pem', 'binary'),
          ),
        };
        const response = await clientAcm.importCertificate(command).promise();
        this.defaultCertificateArn = String(response.CertificateArn);
        return this.defaultCertificateArn;
      } catch (error) {
        console.log(error);
        throw new Error(`error importing certificate ${error}`);
      }
    };
  }

  /**
   * Add a new Amazon EMR on EKS Nodegroup to the cluster
   * @param {string} nodegroupId the ID of the nodegroup
   * @param {EmrEksNodegroupOptions} options the EmrEksNodegroup [properties]{@link EmrEksNodegroupOptions}
   * @access public
   */
  public addNodegroupCapacity(nodegroupId: string, options: EmrEksNodegroupOptions): Nodegroup {

    const nodeGroupParameters = {
      ...options,
      ...{
        // Default nodegroupName should be the ID (according to CDK documentation)
        nodegroupName: nodegroupId,
      },
    };

    const nodegroup = this.eksCluster.addNodegroupCapacity(nodegroupId, nodeGroupParameters);
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
    };
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
   * Create and configure a new Amazon IAM Role usable as an execution role
   * @param {Policy} policy the execution policy to attach to the role
   * @access public
   */
  public createExecutionRole(policy: Policy): Role {
    // Create an execution role assumable by EKS OIDC provider
    const executionRole = new Role(this, 'executionRole', {
      assumedBy: this.eksOidcProvider,
    });
    executionRole.attachInlinePolicy(policy);
    return executionRole;
  }

}

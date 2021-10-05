// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SubnetType } from '@aws-cdk/aws-ec2';
import { KubernetesVersion, Cluster, CapacityType, Nodegroup } from '@aws-cdk/aws-eks';
import { PolicyStatement, PolicyDocument, Policy, Role, ManagedPolicy, FederatedPrincipal, CfnServiceLinkedRole } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Construct, Tags, Stack, Duration, CustomResource, Fn } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';
import * as AWS from 'aws-sdk';
import { EmrEksNodegroup, EmrEksNodegroupOptions } from './emr-eks-nodegroup';
import { EmrVirtualClusterProps, EmrVirtualCluster } from './emr-virtual-cluster';

import * as IamPolicyAlb from './k8s/iam-policy-alb.json';
import * as IamPolicyAutoscaler from './k8s/iam-policy-autoscaler.json';
import * as IamPolicyEmrJobRole from './k8s/iam-policy-emr-job-role.json';
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
   * List of EmrEksNodegroup to create in the cluster
   * @default -  Create a default set of EmrEksNodegroup
   */
  readonly emrEksNodegroups?: EmrEksNodegroup[];
  /**
   * Kubernetes version for Amazon EKS cluster that will be created
   * @default -  v1.20 version is used
   */
  readonly kubernetesVersion?: KubernetesVersion;

  /**
   * ACM Certificate ARN used with EMR on EKS managed endpoint
   * @default - attempt to generate and import certificate using locally installed openssl utility
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
  private static readonly EMR_VERSIONS = ['emr-6.3.0-latest', 'emr-6.2.0-latest', 'emr-5.33.0-latest', 'emr-5.32.0-latest']
  private static readonly AUTOSCALING_POLICY = PolicyStatement.fromJson(IamPolicyAutoscaler);
  private readonly emrServiceRole: CfnServiceLinkedRole;
  private readonly eksClusterName: string;
  public readonly eksCluster: Cluster;
  private emrWorkerIAMRole: Role;

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

    this.eksClusterName = props.eksClusterName ?? 'emr-eks-cluster';

    // create an Amazon EKS CLuster with default paramaters if not provided in the properties
    this.eksCluster = new Cluster(scope, this.eksClusterName, {
      defaultCapacity: 0,
      clusterName: this.eksClusterName,
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
        autoDiscovery: { clusterName: this.eksCluster.clusterName },
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

    // Make the execution role able to assume roles
    this.emrWorkerIAMRole = new Role(this, 'EMRWorkerIAMRole', {
      assumedBy: new FederatedPrincipal(
        this.eksCluster.openIdConnectProvider.openIdConnectProviderArn,
        [],
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    // Create the Nodegroup for tooling
    this.addSsmNodegroupCapacity('tooling', EmrEksNodegroup.TOOLING_ALL);
    // If no Nodegroup is provided, create Nodegroups for each type in one subnet of each AZ
    if (!props.emrEksNodegroups) {
      this.addEmrEksNodegroup(EmrEksNodegroup.CRITICAL_ALL);
      this.addEmrEksNodegroup(EmrEksNodegroup.SHARED_DRIVER);
      this.addEmrEksNodegroup(EmrEksNodegroup.SHARED_EXECUTOR);
    }

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
        clusterName: this.eksCluster.clusterName,
        serviceAccount: {
          name: 'aws-load-balancer-controller',

          create: false,
        },
      },
    });
    albService.node.addDependency(albServiceAccount);
    albService.node.addDependency(certManager);
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
      var launchTemplateName = `EmrEksLaunch-${this.eksClusterName}`;
      // If the Nodegroup uses NVMe, add user data to configure them
      if (props.mountNvme) {
        userData.concat([
          'IDX=1 && for DEV in /dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_*-ns-1; do  mkfs.xfs ${DEV};mkdir -p /pv-disks/local${IDX};echo ${DEV} /pv-disks/local${IDX} xfs defaults,noatime 1 2 >> /etc/fstab; IDX=$((${IDX} + 1)); done',
          'mount -a',
        ]);
        launchTemplateName = `EmrEksNvmeLaunch-${this.eksClusterName}`;
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
          // Default nodegroupName should be the ID (according to CDK documentation)
          nodegroupName: id,
        },
      };

      // Create the Amazon EKS Nodegroup
      const emrNodeGroup = this.addSsmNodegroupCapacity(id, nodeGroupParameters);

      // Add tags for the Cluster Autoscaler management
      Tags.of(emrNodeGroup).add(
        `k8s.io/cluster-autoscaler/${this.eksClusterName}`,
        'owned',
        { applyToLaunchedInstances: true },
      );
      Tags.of(emrNodeGroup).add(
        'k8s.io/cluster-autoscaler/enabled',
        'true',
        {
          applyToLaunchedInstances: true,
        },
      );
      // Add tag for the AZ
      Tags.of(emrNodeGroup).add(
        'k8s.io/cluster-autoscaler/node-template/label/topology.kubernetes.io/zone',
        subnet ? subnet.availabilityZone : '',
        {
          applyToLaunchedInstances: true,
        },
      );
      Tags.of(emrNodeGroup).add(
        'k8s.io/cluster-autoscaler/node-template/label/node-lifecycle',
        (props.capacityType == CapacityType.SPOT) ? 'spot' : 'on-demand',
        {
          applyToLaunchedInstances: true,
        },
      );
      // Iterate over labels and add appropriate tags
      if (props.labels) {
        for (const [key, value] of Object.entries(props.labels)) {
          Tags.of(emrNodeGroup).add(
            `k8s.io/cluster-autoscaler/node-template/label/${key}`,
            value,
            {
              applyToLaunchedInstances: true,
            },
          );
        }
      }

      // Iterate over taints and add appropriate tags
      if (props.taints) {
        props.taints.forEach( (taint) => {
          Tags.of(emrNodeGroup).add(
            `k8s.io/cluster-autoscaler/node-template/label/${taint.key}`,
            `${taint.value}:${taint.effect}`,
            {
              applyToLaunchedInstances: true,
            },
          );
        });
      }
    });
  }

  /**
   * Add a new Amazon EMR Virtual Cluster linked to EKS Cluster.
   * CfnOutput can be customized.
   * @param {EmrVirtualClusterProps} props the EmrEksNodegroupProps [properties]{@link EmrVirtualClusterProps}
   * @access public
   */

  public addEmrVirtualCluster(props: EmrVirtualClusterProps): EmrVirtualCluster {
    const eksNamespace = props.eksNamespace ?? 'default';
    const ns = props.createNamespace
      ? this.eksCluster.addManifest('eksNamespace', {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: eksNamespace },
      })
      : null;

    K8sRole.metadata.namespace = eksNamespace;
    const role = this.eksCluster.addManifest('eksNamespaceRole', K8sRole);
    role.node.addDependency(this.emrServiceRole);
    if (ns) role.node.addDependency(ns);

    K8sRoleBinding.metadata.namespace = eksNamespace;
    const roleBinding = this.eksCluster.addManifest(
      'eksNamespaceRoleBinding',
      K8sRoleBinding,
    );
    roleBinding.node.addDependency(role);

    const virtCluster = new EmrVirtualCluster(
      this,
      props.name,
      this.eksCluster,
      props,
    );

    virtCluster.node.addDependency(roleBinding);
    virtCluster.node.addDependency(this.emrServiceRole);

    //Create EMR Worker IAM Role and trust policy
    const EmrWorkerPolicyDocument =
      PolicyDocument.fromJson(IamPolicyEmrJobRole);
    const EmrWorkerIAMPolicy = new ManagedPolicy(this, 'EMRWorkerIAMPolicy', {
      document: EmrWorkerPolicyDocument,
    });
    this.emrWorkerIAMRole.addManagedPolicy(EmrWorkerIAMPolicy);

    return virtCluster;
  }

  /**
   * Creates a new Amazon EMR managed endpoint to be used with Amazon EMR Virtual Cluster .
   * CfnOutput can be customized.
   * @param {string} id unique id for endpoint
   * @param {string} virtualClusterId Amazon Emr Virtual Cluster Id
   * @param {string} acmCertificateArn - ACM Certificate Arn to be attached to the JEG managed endpoint, @default - creates new ACM Certificate
   * @param {string} emrOnEksVersion - EmrOnEks version to be used. @default - emr-6.3.0-latest
   * @param {string} executionRoleArn - IAM execution role to attach @default @see https://docs.aws.amazon.com/emr/latest/EMR-on-EKS-DevelopmentGuide/creating-job-execution-role.html
   * @param {string} configurationOverrides - The JSON configuration override for Amazon EMR Managed Endpoint, @default - Amazon EMR on EKS default parameters
   * @access public
   */
  public addManagedEndpoint(
    id: string,
    virtualClusterId: string,
    acmCertificateArn?: string,
    emrOnEksVersion?: string,
    executionRoleArn?: string,
    configurationOverrides?: string,
  ) {

    if (emrOnEksVersion && ! EmrEksCluster.EMR_VERSIONS.includes(emrOnEksVersion)) {
      throw new Error(`error unsupported EMR version ${emrOnEksVersion}`);
    }

    try {
      var jsonConfigurationOverrides = configurationOverrides ? JSON.stringify(configurationOverrides) : '';
    } catch (error) {
      throw new Error(`The configuraton override is not valid JSON : ${configurationOverrides}`);
    }
    // Create custom resource with async waiter until the Amazon EMR Managed Endpoint is created
    const endpointId = `managed-endpoint-${id}`;
    const lambdaPath = 'lambdas/managed-endpoint';

    const onEvent = new lambda.Function(this, `${endpointId}-on-event`, {
      code: lambda.Code.fromAsset(path.join(__dirname, lambdaPath)),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.onEvent',
      timeout: Duration.seconds(120),
      environment: {
        REGION: Stack.of(this).region,
        CLUSTER_ID: virtualClusterId,
        EXECUTION_ROLE_ARN:
          executionRoleArn || this.emrWorkerIAMRole.roleArn,
        ENDPOINT_NAME: endpointId,
        RELEASE_LABEL: emrOnEksVersion || EmrEksCluster.DEFAULT_EMR_VERSION,
        CONFIGURATION_OVERRIDES: configurationOverrides
          ? jsonConfigurationOverrides
          : '',
        ACM_CERTIFICATE_ARN:
          acmCertificateArn ||
          String(this.getOrCreateAcmCertificate()),
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

    const isComplete = new lambda.Function(this, `${endpointId}-is-complete`, {
      code: lambda.Code.fromAsset(path.join(__dirname, lambdaPath)),
      handler: 'index.isComplete',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(120),
      environment: {
        REGION: Stack.of(this).region,
        CLUSTER_ID: virtualClusterId,
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
    const myProvider = new Provider(this, 'CustomResourceProvider' + id, {
      onEventHandler: onEvent,
      isCompleteHandler: isComplete,
      logRetention: RetentionDays.ONE_DAY,
      totalTimeout: Duration.minutes(30),
      queryInterval: Duration.seconds(10),
    });
    return new CustomResource(this, id, {
      serviceToken: myProvider.serviceToken,
    });
  }

  private getOrCreateAcmCertificate(): any {
    const clientAcm = new AWS.ACM({
      apiVersion: '2015-12-08',
      region: process.env.CDK_DEFAULT_REGION,
    });
    const cert = async () => {
      try {
        const getCerts = await clientAcm
          .listCertificates({
            MaxItems: 50,
            Includes: {
              keyTypes: ['RSA_1024'],
            },
          })
          .promise();

        if (getCerts.CertificateSummaryList) {
          const existingCert = getCerts.CertificateSummaryList.find(
            (itm) => itm.DomainName == '*.emreksanalyticsframework.com',
          );

          if (existingCert) return String(existingCert.CertificateArn);
        }
      } catch (error) {
        console.log(error);
        throw new Error(`error getting acm certs ${error}`);
      }

      try {
        execSync(
          'openssl req -x509 -newkey rsa:1024 -keyout /tmp/privateKey.pem  -out /tmp/certificateChain.pem -days 365 -nodes -subj "/C=US/ST=Washington/L=Seattle/O=MyOrg/OU=MyDept/CN=*.emreksanalyticsframework.com"',
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
        return String(response.CertificateArn);
      } catch (error) {
        console.log(error);
        throw new Error(`error importing certificate ${error}`);
      }
    };

    return cert();
  }

  public addSsmNodegroupCapacity(nodegroupId: string, options: EmrEksNodegroupOptions): Nodegroup {
    // Create the Nodegroup for tooling
    const nodegroup = this.eksCluster.addNodegroupCapacity(nodegroupId, options);
    // Adding the Amazon SSM policy
    nodegroup.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
    return nodegroup;
  }
}

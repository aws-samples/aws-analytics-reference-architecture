// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {CfnAddon, Cluster, HelmChart, KubernetesManifest, KubernetesVersion} from 'aws-cdk-lib/aws-eks';
import {
    CfnInstanceProfile,
    Effect,
    FederatedPrincipal,
    ManagedPolicy,
    Policy,
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal
} from 'aws-cdk-lib/aws-iam';
import {Aws, CfnOutput, Duration, Stack, Tags} from 'aws-cdk-lib';
import {Queue} from 'aws-cdk-lib/aws-sqs';
import {Rule} from 'aws-cdk-lib/aws-events';
import {SqsQueue} from 'aws-cdk-lib/aws-events-targets';
import {Construct} from 'constructs';
import {ISubnet, Port, SecurityGroup, SubnetType} from 'aws-cdk-lib/aws-ec2';
import {Utils} from '../utils';
import {EmrEksNodegroup, EmrEksNodegroupOptions} from './emr-eks-nodegroup';
import {EmrEksCluster} from './emr-eks-cluster';
import * as IamPolicyEbsCsiDriver from './resources/k8s/iam-policy-ebs-csi-driver.json';


/**
 * @internal
 * Upload podTemplates to the Amazon S3 location used by the cluster.
 * @param {Cluster} cluster the unique ID of the CDK resource
 * @param {Construct} scope The local path of the yaml podTemplate files to upload
 * @param {string} eksAdminRoleArn The admin role of the EKS cluster
 */
export function eksClusterSetup(cluster: EmrEksCluster, scope: Construct, eksAdminRoleArn?: string) {


  // Add the provided Amazon IAM Role as Amazon EKS Admin
  if (eksAdminRoleArn != undefined){
    cluster.eksCluster.awsAuth.addMastersRole(Role.fromRoleArn( scope, 'AdminRole', eksAdminRoleArn ), 'AdminRole');
  }

  const ebsCsiDriverIrsa = cluster.eksCluster.addServiceAccount ('ebsCSIDriverRoleSA', {
    name: 'ebs-csi-controller-sa',
    namespace: 'kube-system',
  });

  const ebsCsiDriverPolicyDocument = PolicyDocument.fromJson(IamPolicyEbsCsiDriver);

  const ebsCsiDriverPolicy = new Policy(
    scope,
    'IamPolicyEbsCsiDriverIAMPolicy',
    { document: ebsCsiDriverPolicyDocument },
  );

  ebsCsiDriverPolicy.attachToRole (ebsCsiDriverIrsa.role);

  const ebsCSIDriver = new CfnAddon(scope, 'ebsCsiDriver', {
    addonName: 'aws-ebs-csi-driver',
    clusterName: cluster.eksCluster.clusterName,
    serviceAccountRoleArn: ebsCsiDriverIrsa.role.roleArn,
    addonVersion: 'v1.18.0-eksbuild.1',
    resolveConflicts: "OVERWRITE"
  });

  ebsCSIDriver.node.addDependency(ebsCsiDriverIrsa);

  // Deploy the Helm Chart for the Certificate Manager. Required for EMR Studio ALB.
  cluster.eksCluster.addHelmChart('CertManager', {
    createNamespace: true,
    namespace: 'cert-manager',
    chart: 'cert-manager',
    repository: 'https://charts.jetstack.io',
    version: '1.11.2',
    timeout: Duration.minutes(14),
    values: {
      startupapicheck: {
        timeout: '5m'
      },
      installCRDs: true
    }
  });

  // Add the kubernetes dashboard from helm chart
  cluster.eksCluster.addHelmChart('KubernetesDashboard', {
    createNamespace: true,
    namespace: 'kubernetes-dashboard',
    chart: 'kubernetes-dashboard',
    repository: 'https://kubernetes.github.io/dashboard/',
    version: 'v6.0.0',
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
  cluster.eksCluster.addManifest('kubedashboard', {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      name: 'eks-admin',
      namespace: 'kube-system',
    },
  });
  // Add the kubernetes dashboard cluster role binding
  cluster.eksCluster.addManifest('kubedashboardrolebinding', {
    apiVersion: 'rbac.authorization.k8s.io/v1',
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

  // Nodegroup capacity needed for all the tooling components including Karpenter
  let EmrEksNodeGroupTooling: any = { ...EmrEksNodegroup.TOOLING_ALL };
  EmrEksNodeGroupTooling.nodeRole = cluster.ec2InstanceNodeGroupRole;

  // Create the Amazon EKS Nodegroup for tooling
  cluster.addNodegroupCapacity('Tooling', EmrEksNodeGroupTooling as EmrEksNodegroupOptions);

  //IAM role created for the aws-node pod following AWS best practice not to use the EC2 instance role
  const awsNodeRole: Role = new Role(scope, 'awsNodeRole', {
    assumedBy: new FederatedPrincipal(
      cluster.eksCluster.openIdConnectProvider.openIdConnectProviderArn,
      { ...[] },
      'sts:AssumeRoleWithWebIdentity',
    ),
    roleName: `awsNodeRole-${cluster.clusterName}`,
    managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy')],
  });

  // update the aws-node service account with IAM role created for it
  new KubernetesManifest(scope, 'awsNodeServiceAccountUpdateManifest', {
    cluster: cluster.eksCluster,
    manifest: [
      {
        apiVersion: 'v1',
        kind: 'ServiceAccount',
        metadata: {
          name: 'aws-node',
          namespace: 'kube-system',
          annotations: {
            'eks.amazonaws.com/role-arn': awsNodeRole.roleArn,
          },
        },
      }
    ],
    overwrite: true,
  });

  // Provide the Kubernetes Dashboard URL in AWS CloudFormation output
  new CfnOutput(scope, 'kubernetesDashboardURL', {
      description: 'Access Kubernetes Dashboard via kubectl proxy and this URL',
      value: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:https/proxy/#/login',
  });
}

/**
 * @internal
 * Method to add the default EKS Managed Nodegroups configured for Spark workloads
 */
export function setDefaultManagedNodeGroups(cluster: EmrEksCluster) {

  let EmrEksNodeGroupCritical: any = { ...EmrEksNodegroup.CRITICAL_ALL };
  EmrEksNodeGroupCritical.nodeRole = cluster.ec2InstanceNodeGroupRole;
  cluster.addEmrEksNodegroup('criticalAll', EmrEksNodeGroupCritical as EmrEksNodegroupOptions);

  let EmrEksNodeGroupsharedDriver: any = {...EmrEksNodegroup.SHARED_DRIVER};
  EmrEksNodeGroupsharedDriver.nodeRole = cluster.ec2InstanceNodeGroupRole;
  cluster.addEmrEksNodegroup('sharedDriver', EmrEksNodeGroupsharedDriver as EmrEksNodegroupOptions);

  let EmrEksNodeGroupsharedExecutor: any = {...EmrEksNodegroup.SHARED_EXECUTOR};
  EmrEksNodeGroupsharedExecutor.nodeRole = cluster.ec2InstanceNodeGroupRole;
  cluster.addEmrEksNodegroup('sharedExecutor', EmrEksNodeGroupsharedExecutor as EmrEksNodegroupOptions);

  let EmrEksNodeGroupnotebookDriver: any = {...EmrEksNodegroup.NOTEBOOK_DRIVER};
  EmrEksNodeGroupnotebookDriver.nodeRole = cluster.ec2InstanceNodeGroupRole;
  cluster.addEmrEksNodegroup('notebookDriver', EmrEksNodeGroupnotebookDriver as EmrEksNodegroupOptions);

  let EmrEksNodeGroupnotebookExecutor: any = {...EmrEksNodegroup.NOTEBOOK_EXECUTOR};
  EmrEksNodeGroupnotebookExecutor.nodeRole = cluster.ec2InstanceNodeGroupRole;
  cluster.addEmrEksNodegroup('notebookExecutor', EmrEksNodeGroupnotebookExecutor as EmrEksNodegroupOptions);

}

/**
 * @internal
 * Method to add the default Karpenter provisioners for Spark workloads
 */
export function setDefaultKarpenterProvisioners(cluster: EmrEksCluster) {
  const subnets = cluster.eksCluster.vpc.selectSubnets({
    onePerAz: true,
    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
  }).subnets;

  subnets.forEach( (subnet, index) => {
    let criticalManfifestYAML = karpenterManifestSetup(cluster.clusterName,`${__dirname}/resources/k8s/karpenter-provisioner-config/critical-provisioner.yml`, subnet);
    cluster.addKarpenterProvisioner(`karpenterCriticalManifest-${index}`, criticalManfifestYAML);

    let sharedDriverManfifestYAML = karpenterManifestSetup(cluster.clusterName,`${__dirname}/resources/k8s/karpenter-provisioner-config/shared-driver-provisioner.yml`, subnet);
    cluster.addKarpenterProvisioner(`karpenterSharedDriverManifest-${index}`, sharedDriverManfifestYAML);

    let sharedExecutorManfifestYAML = karpenterManifestSetup(cluster.clusterName,`${__dirname}/resources/k8s/karpenter-provisioner-config/shared-executor-provisioner.yml`, subnet);
    cluster.addKarpenterProvisioner(`karpenterSharedExecutorManifest-${index}`, sharedExecutorManfifestYAML);

    let notebookDriverManfifestYAML = karpenterManifestSetup(cluster.clusterName,`${__dirname}/resources/k8s/karpenter-provisioner-config/notebook-driver-provisioner.yml`, subnet);
    cluster.addKarpenterProvisioner(`karpenterNotebookDriverManifest-${index}`, notebookDriverManfifestYAML);

    let notebookExecutorManfifestYAML = karpenterManifestSetup(cluster.clusterName,`${__dirname}/resources/k8s/karpenter-provisioner-config/notebook-executor-provisioner.yml`, subnet);
    cluster.addKarpenterProvisioner(`karpenterNotebookExecutorManifest-${index}`, notebookExecutorManfifestYAML);
  })
}

/**
 * @internal
 * Method to generate the Karpenter manifests from templates and targeted to the specific EKS cluster
 */
export function karpenterManifestSetup(clusterName: string, path: string, subnet: ISubnet): any {

  let manifest = Utils.readYamlDocument(path);

  manifest = manifest.replace('{{subnet-id}}', subnet.subnetId);
  manifest = manifest.replace( /(\{{az}})/g, subnet.availabilityZone);
  manifest = manifest.replace('{{cluster-name}}', clusterName);

  let manfifestYAML: any = manifest.split("---").map((e: any) => Utils.loadYaml(e));

  return manfifestYAML;
}

/**
 * @internal
 * Install all the required configurations of Karpenter SQS and Event rules to handle spot and unhealthy instance termination
 * Create a security group to be used by nodes created with karpenter
 * Tags the subnets and VPC to be used by karpenter
 * create a tooling provisioner that will deploy in each of the AZs, one per AZ
 */
export function karpenterSetup(cluster: Cluster,
    eksClusterName: string,
    scope: Construct,
    karpenterVersion?: string): HelmChart {

    const karpenterInterruptionQueue: Queue = new Queue(scope, 'karpenterInterruptionQueue', {
        queueName: eksClusterName,
        retentionPeriod: Duration.seconds(300)
    });

    karpenterInterruptionQueue.addToResourcePolicy(
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['sqs:SendMessage'],
            principals: [new ServicePrincipal('sqs.amazonaws.com'), new ServicePrincipal('events.amazonaws.com')]
        })
    );

    new Rule(scope, 'scheduledChangeRule', {
        eventPattern: {
            source: ['aws.heatlh'],
            detail: ['AWS Health Event']
        },
        targets: [new SqsQueue(karpenterInterruptionQueue)]
    });

    new Rule(scope, 'instanceStateChangeRule', {
        eventPattern: {
            source: ['aws.ec2'],
            detail: ['EC2 Instance State-change Notification']
        },
        targets: [new SqsQueue(karpenterInterruptionQueue)]
    });

    const karpenterNodeRole = new Role(cluster, 'karpenter-node-role', {
        assumedBy: new ServicePrincipal(`ec2.${cluster.stack.urlSuffix}`),
        managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'),
            ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'),
            ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
            ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        ],
        roleName: `KarpenterNodeRole-${eksClusterName}`,
    });

    const karpenterControllerPolicyStatementSSM: PolicyStatement = new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:GetParameter', 'pricing:GetProducts'],
        resources: ['*'],
    });

    const karpenterControllerPolicyStatementEC2: PolicyStatement = new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
            'ec2:CreateLaunchTemplate',
            'ec2:DeleteLaunchTemplate',
            'ec2:CreateFleet',
            'ec2:RunInstances',
            'ec2:CreateTags',
            'ec2:TerminateInstances',
            'ec2:DescribeLaunchTemplates',
            'ec2:DescribeInstances',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeSubnets',
            'ec2:DescribeInstanceTypes',
            'ec2:DescribeInstanceTypeOfferings',
            'ec2:DescribeAvailabilityZones',
        ],
        resources: ['*'],
    });

    const karpenterControllerPolicyStatementIAM: PolicyStatement = new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['iam:PassRole'],
        resources: [`arn:aws:iam::${Aws.ACCOUNT_ID}:role/KarpenterNodeRole-${eksClusterName}`],
    });

    const karpenterInstanceProfile = new CfnInstanceProfile(cluster, 'karpenter-instance-profile', {
        roles: [karpenterNodeRole.roleName],
        instanceProfileName: `karpenterNodeInstanceProfile-${eksClusterName}`,
        path: '/'
    });

    cluster.awsAuth.addRoleMapping(karpenterNodeRole, {
        username: 'system:node:{{EC2PrivateDNSName}}',
        groups: ['system:bootstrappers', 'system:nodes'],
    });

    const karpenterNS = cluster.addManifest('karpenterNS', {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: 'karpenter' },
    });

    const karpenterAccount = cluster.addServiceAccount('Karpenter', {
        name: 'karpenter',
        namespace: 'karpenter',
    });

    karpenterAccount.node.addDependency(karpenterNS);

    karpenterAccount.addToPrincipalPolicy(karpenterControllerPolicyStatementSSM);
    karpenterAccount.addToPrincipalPolicy(karpenterControllerPolicyStatementEC2);
    karpenterAccount.addToPrincipalPolicy(karpenterControllerPolicyStatementIAM);

    //Deploy Karpenter Chart
    const karpenterChart = cluster.addHelmChart('Karpenter', {
        chart: 'karpenter',
        release: 'karpenter',
        repository: 'oci://public.ecr.aws/karpenter/karpenter',
        namespace: 'karpenter',
        version: karpenterVersion || EmrEksCluster.DEFAULT_KARPENTER_VERSION,
        timeout: Duration.minutes(14),
        wait: true,
        values: {
            serviceAccount: {
                name: 'karpenter',
                create: false,
                annotations: {
                    'eks.amazonaws.com/role-arn': karpenterAccount.role.roleArn,
                },
            },
            settings: {
                aws: {
                    defaultInstanceProfile: karpenterInstanceProfile.instanceProfileName,
                    clusterName: eksClusterName,
                    clusterEndpoint: cluster.clusterEndpoint,
                    interruptionQueueName: karpenterInterruptionQueue.queueName
                },
            }

        },
    });

    karpenterChart.node.addDependency(karpenterAccount);

    const karpenterInstancesSg = new SecurityGroup(scope, 'karpenterSg', {
        vpc: cluster.vpc,
        allowAllOutbound: true,
        description: 'security group for a karpenter instances',
        securityGroupName: 'karpenterSg',
        disableInlineRules: true,
    });

    Tags.of(karpenterInstancesSg).add('karpenter.sh/discovery', `${eksClusterName}`);

    cluster.clusterSecurityGroup.addIngressRule(
        karpenterInstancesSg,
        Port.allTraffic(),
    );

    karpenterInstancesSg.addIngressRule(
        karpenterInstancesSg,
        Port.allTraffic(),
    );

    karpenterInstancesSg.addIngressRule(
        cluster.clusterSecurityGroup,
        Port.allTraffic(),
    );

    Tags.of(cluster.vpc).add(
        'karpenter.sh/discovery', eksClusterName,
    );

    cluster.vpc.privateSubnets.forEach((subnet) => {
        Tags.of(subnet).add('karpenter.sh/discovery', eksClusterName);
    });

    cluster.vpc.publicSubnets.forEach((subnet) =>
        Tags.of(subnet).add('karpenter.sh/discovery', eksClusterName),
    );

    const privateSubnets = cluster.vpc.selectSubnets({
        onePerAz: true,
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    }).subnets;

    let listPrivateSubnets: string[] = privateSubnets.map(subnet => subnet.subnetId)

    let manifest = Utils.readYamlDocument(`${__dirname}/resources/k8s/karpenter-provisioner-config/tooling-provisioner.yml`);

    manifest = manifest.replace(/(\{{cluster-name}})/g, eksClusterName);
    manifest = manifest.replace(/(\{{subnet-list}})/g, listPrivateSubnets.join(','));

    let manfifestYAML: any = manifest.split("---").map((e: any) => Utils.loadYaml(e));

    const manifestApply = cluster.addManifest('provisioner-tooling', ...manfifestYAML);

    manifestApply.node.addDependency(karpenterChart);

    return karpenterChart;
}

/**
 * @internal
 * Deploy the cluster autoscaler controller in the k8s cluster
 */

export function clusterAutoscalerSetup(
    cluster: Cluster,
    eksClusterName: string,
    scope: Construct,
    k8sVersion: KubernetesVersion) {

    //Version of the autoscaler, controls the image tag
    const versionMap = new Map([
        [KubernetesVersion.V1_25, "9.25.0"],
        [KubernetesVersion.V1_24, "9.25.0"],
        [KubernetesVersion.V1_23, "9.21.0"],
        [KubernetesVersion.V1_22, "9.13.1"]
    ]);

    // Create a Kubernetes Service Account for the Cluster Autoscaler with Amazon IAM Role
    const AutoscalerServiceAccount = cluster.addServiceAccount('Autoscaler', {
        name: 'cluster-autoscaler',
        namespace: 'kube-system',
    });

    //Iam policy attached to the Role used by k8s autoscaller
    let autoscalingPolicyDescribe =
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'autoscaling:DescribeAutoScalingGroups',
                'autoscaling:DescribeAutoScalingInstances',
                'autoscaling:DescribeLaunchConfigurations',
                'autoscaling:DescribeTags',
                'ec2:DescribeLaunchTemplateVersions',
                'eks:DescribeNodegroup',
            ],
            resources: ['*'],
        });

    let autoscalingPolicyMutateGroup =
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'autoscaling:SetDesiredCapacity',
                'autoscaling:TerminateInstanceInAutoScalingGroup',
            ],
            resources: ['*'],
            conditions: {
                StringEquals: {
                    'aws:ResourceTag/eks:cluster-name': eksClusterName,
                },
            },
        });

    // Add the right Amazon IAM Policy to the Amazon IAM Role for the Cluster Autoscaler
    AutoscalerServiceAccount.addToPrincipalPolicy(
        autoscalingPolicyDescribe,
    );
    AutoscalerServiceAccount.addToPrincipalPolicy(
        autoscalingPolicyMutateGroup,
    );

    cluster.addHelmChart('AutoScaler', {
        chart: 'cluster-autoscaler',
        repository: 'https://kubernetes.github.io/autoscaler',
        version: versionMap.get(k8sVersion),
        namespace: 'kube-system',
        timeout: Duration.minutes(14),
        values: {
            cloudProvider: 'aws',
            awsRegion: Stack.of(scope).region,
            autoDiscovery: { clusterName: eksClusterName },
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

}

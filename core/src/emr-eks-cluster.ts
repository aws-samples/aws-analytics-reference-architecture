import * as fs from "fs";
import {
  KubernetesVersion,
  Cluster,
  KubernetesManifest,
} from "@aws-cdk/aws-eks";
import {
  PolicyStatement,
  PolicyDocument,
  Policy,
  Effect,
  Role,
  CfnServiceLinkedRole,
  ManagedPolicy,
  FederatedPrincipal,
} from "@aws-cdk/aws-iam";
import { Construct, Tags, Stack, Duration } from "@aws-cdk/core";
import * as yaml from "js-yaml";
import { EmrEksNodegroup, EmrEksNodegroupProps } from "./emr-eks-nodegroup";
import {
  EmrVirtualClusterProps,
  EmrVirtualCluster,
} from "./emr-virtual-cluster";

/**
 * @summary The properties for the EmrEksCluster Construct class.
 */

export interface EmrEksClusterProps {
  /**
   * Name of the Amazon EKS cluster to be created
   * @default -  automatically generated cluster name
   */
  readonly eksClusterName?: string;
  /**
   * Amazon IAM Role to be added to Amazon EKS master roles that will give you the access to kubernetes cluster from AWS console UI
   * @default -  The Amazon IAM role used by AWS CDK
   */
  readonly eksAdminRoleArn?: string;
  /**
   * List of EmrEksNodegroup to create in the cluster
   * @default -  Create a default set of EmrEksNodegroup
   */
  readonly emrEksNodegroups?: EmrEksNodegroup[];
  /**
   * Kubernetes version for Amazon EKS cluster that will be created
   * @default -  Use the latest version available
   */
  readonly kubernetesVersion?: KubernetesVersion;
}

/**
 * @summary EmrEksCluster Construct packaging all the ressources required to run Amazon EMR on Amazon EKS.
 */

export class EmrEksCluster extends Construct {
  public readonly eksCluster: Cluster;
  private readonly eksClusterName: string;
  private readonly eksClusterVersion: KubernetesVersion;
  private readonly emrServiceRole: CfnServiceLinkedRole;
  private readonly clusterAutoscalerIamRole: Policy;

  /**
   * Constructs a new instance of the EmrEksCluster class. An EmrEksCluster contains everything required to run Amazon EMR on Amazon EKS.
   * Amazon EKS Nodegroups and Amazon EKS Admin role can be customized.
   * @param {cdk.Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {EmrEksClusterProps} props the EmrEksClusterProps [properties]{@link EmrEksClusterProps}
   * @since 1.0.0
   * @access public
   */

  constructor(scope: Construct, id: string, props: EmrEksClusterProps) {
    super(scope, id);

    this.eksClusterName =
      props.eksClusterName ??
      "EmrEksCluster-" + Math.random().toString().substr(2);

    this.eksClusterVersion = props.kubernetesVersion ?? KubernetesVersion.V1_20;
    // create an Amazon EKS CLuster
    this.eksCluster = new Cluster(this, "eksCluster", {
      defaultCapacity: 0,
      clusterName: this.eksClusterName,
      version: this.eksClusterVersion,
    });

    // Adding the provided Amazon IAM Role as Amazon EKS Admin
    if (props.eksAdminRoleArn) {
      const clusterAdmin = Role.fromRoleArn(
        this,
        "AdminRole",
        props.eksAdminRoleArn
      );
      this.eksCluster.awsAuth.addMastersRole(clusterAdmin, "AdminRole");
    }

    // Create a Kubernetes Service Account for the Cluster Autoscaler with Amazon IAM Role

    const ClusterAutoscalerPolicyDocument = PolicyDocument.fromJson(
      JSON.parse(
        fs.readFileSync("./src/k8s/iam-policy-autoscaler.json", "utf8")
      )
    );

    this.clusterAutoscalerIamRole = new Policy(
      this,
      "ClusterAutoscalerIAMPolicy",
      {
        document: ClusterAutoscalerPolicyDocument,
      }
    );
    const AutoscalerServiceAccount = this.eksCluster.addServiceAccount(
      "Autoscaler",
      { name: "cluster-autoscaler", namespace: "kube-system" }
    );

    this.clusterAutoscalerIamRole.attachToRole(AutoscalerServiceAccount.role);

    // Add the proper Amazon IAM Policy to the Amazon IAM Role for the Cluster Autoscaler
    AutoscalerServiceAccount.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeTags",
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:DescribeLaunchTemplateVersions",
        ],
      })
    );

    // @todo: check if we can create the service account from the Helm Chart
    // @todo: check if there's a workaround to run it with wait:true - at the moment the custom resource times out if you do that.
    // Deploy the Helm Chart for Kubernetes Cluster Autoscaler
    this.eksCluster.addHelmChart("AutoScaler", {
      chart: "cluster-autoscaler",
      repository: "https://kubernetes.github.io/autoscaler",
      namespace: "kube-system",
      timeout: Duration.minutes(14),
      values: {
        cloudProvider: "aws",
        awsRegion: Stack.of(this).region,
        autoDiscovery: { clusterName: this.eksClusterName },
        rbac: {
          serviceAccount: {
            name: "cluster-autoscaler",
            create: false,
          },
        },
        extraArgs: {
          "skip-nodes-with-local-storage": false,
          "scan-interval": "5s",
          expander: "least-waste",
          "balance-similar-node-groups": true,
          "skip-nodes-with-system-pods": false,
        },
      },
    });

    // Tags the Amazon VPC and Subnets of the Amazon EKS Cluster
    Tags.of(this.eksCluster.vpc).add(
      "for-use-with-amazon-emr-managed-policies",
      "true"
    );
    this.eksCluster.vpc.privateSubnets.forEach((subnet) =>
      Tags.of(subnet).add("for-use-with-amazon-emr-managed-policies", "true")
    );
    this.eksCluster.vpc.publicSubnets.forEach((subnet) =>
      Tags.of(subnet).add("for-use-with-amazon-emr-managed-policies", "true")
    );

    // Create Amazon IAM ServiceLinkedRole for Amazon EMR and add to kubernetes configmap
    this.emrServiceRole = new CfnServiceLinkedRole(this, "EmrServiceIAMRole", {
      awsServiceName: "emr-containers.amazonaws.com",
    });
    this.eksCluster.awsAuth.addMastersRole(
      Role.fromRoleArn(
        this,
        "ServiceRoleForAmazonEMRContainers",
        `arn:aws:iam::${
          Stack.of(this).account
        }:role/AWSServiceRoleForAmazonEMRContainers`
      ),
      "emr-containers"
    );

    // Deploy the Helm Chart for the Certificate Manager. Required for EMR Studio ALB.
    this.eksCluster.addHelmChart("CertManager", {
      createNamespace: true,
      namespace: "cert-manager",
      chart: "cert-manager",
      repository: "https://charts.jetstack.io",
      version: "v1.4.0",
      wait: true,
      timeout: Duration.minutes(14),
    });

    this.addEmrEksNodegroup(EmrEksNodegroup.NODEGROUP_TOOLING);

    if (!props.emrEksNodegroups) {
      this.addEmrEksNodegroup(EmrEksNodegroup.NODEGROUP_CRITICAL);
      this.addEmrEksNodegroup(EmrEksNodegroup.NODEGROUP_SHARED);
      this.addEmrEksNodegroup(EmrEksNodegroup.NODEGROUP_NOTEBOOKS);
    }
  }

  /**
   * Add a new Amazon EKS Nodegroup to the cluster.
   * CfnOutput can be customized.
   * @param {Props} props the EmrEksNodegroupProps [properties]{@link EmrEksNodegroupProps}
   * @since 1.0.0
   * @access public
   */
  public addEmrEksNodegroup(props: EmrEksNodegroupProps): EmrEksNodegroup {
    const sparkManagedGroup = new EmrEksNodegroup(this, this.eksCluster, props);
    sparkManagedGroup.node.addDependency(this.clusterAutoscalerIamRole);

    this.clusterAutoscalerIamRole.attachToRole(sparkManagedGroup.eksGroup.role);

    Tags.of(sparkManagedGroup.eksGroup).add(
      `k8s.io/cluster-autoscaler/${this.eksClusterName}`,
      "owned",
      { applyToLaunchedInstances: true }
    );
    Tags.of(sparkManagedGroup.eksGroup).add(
      "k8s.io/cluster-autoscaler/enabled",
      "true",
      {
        applyToLaunchedInstances: true,
      }
    );
    return sparkManagedGroup;
  }

  /**
   * Add a new Amazon EMR Virtual Cluster linked to EKS Cluster.
   * CfnOutput can be customized.
   * @param {Props} props the EmrEksNodegroupProps [properties]{@link EmrEksNodegroupProps}
   * @since 1.0.0
   * @access public
   */

  public addEmrVirtualCluster(
    props: EmrVirtualClusterProps
  ): EmrVirtualCluster {
    const eksNamespace = props.eksNamespace ?? "default";
    const ns = props.createNamespace
      ? this.eksCluster.addManifest("eksNamespace", {
          apiVersion: "v1",
          kind: "Namespace",
          metadata: { name: eksNamespace },
        })
      : null;

    const roleBinding = this.loadManifest(
      "roleBinding" + eksNamespace,
      "./src/k8s/rbac/emr-containers.yaml",
      [{ key: "{{NAMESPACE}}", val: eksNamespace }]
    );
    roleBinding.node.addDependency(this.emrServiceRole);
    if (ns) roleBinding.node.addDependency(ns);

    const virtCluster = new EmrVirtualCluster(
      this,
      props.name,
      this.eksCluster,
      props
    );

    virtCluster.node.addDependency(roleBinding);
    virtCluster.node.addDependency(this.emrServiceRole);

    //Create EMR Worker IAM Role and trust policy
    const EmrWorkerPolicyDocument = PolicyDocument.fromJson(
      JSON.parse(
        fs.readFileSync("./src/k8s/iam-policy-emr-job-role.json", "utf8")
      )
    );
    const EmrWorkerIAMPolicy = new ManagedPolicy(this, "EMRWorkerIAMPolicy", {
      document: EmrWorkerPolicyDocument,
    });
    const EmrWorkerIAMRole = new Role(this, "EMRWorkerIAMRole", {
      assumedBy: new FederatedPrincipal(
        this.eksCluster.openIdConnectProvider.openIdConnectProviderArn,
        [],
        "sts:AssumeRoleWithWebIdentity"
      ),
    });
    EmrWorkerIAMRole.addManagedPolicy(EmrWorkerIAMPolicy);

    return virtCluster;
  }

  public addManagedEndpoint() {}

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
   * @returns @aws-cdk/aws-eks » KubernetesManifest
   */

  public loadManifest(
    id: string,
    yamlFile: string,
    replacementMap?: { key: string; val: string }[]
  ): KubernetesManifest {
    let manifestYaml = fs.readFileSync(yamlFile, "utf8");
    if (replacementMap) {
      replacementMap.forEach((elem) => {
        const rg = new RegExp(elem.key, "g");
        manifestYaml = manifestYaml.replace(rg, elem.val);
      });
    }
    const manifest = yaml.loadAll(manifestYaml);
    return this.eksCluster.addManifest(id, ...manifest);
  }
}

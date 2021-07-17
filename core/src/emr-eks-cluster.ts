import * as fs from "fs";
import {
  KubernetesVersion,
  Cluster,
  KubernetesManifest,
} from "@aws-cdk/aws-eks";
import {
  PolicyStatement,
  PolicyDocument,
  ManagedPolicy,
  Effect,
  Role,
  CfnServiceLinkedRole,
} from "@aws-cdk/aws-iam";
import { Construct, Tags, Stack, CfnJson } from "@aws-cdk/core";
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
   * Name of the Amazon EKS cluster to reuse
   * @default -  Create a new Amazon EKS cluster
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
 * @Summary EmrEksCluster Construct packaging all the ressources required to run Amazon EMR on Amazon EKS.
 */

export class EmrEksCluster extends Construct {
  public readonly eksCluster: Cluster;
  private readonly clusterNameDeferred: CfnJson;
  private readonly emrServiceRole: CfnServiceLinkedRole;
  public static readonly clusterAutoscalerPolicyName: string =
    "eksEmrClusterAutoscalerIAMPolicy";

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

    // create an Amazon EKS CLuster
    this.eksCluster = new Cluster(this, "eksCluster", {
      defaultCapacity: 0,
      version: props.kubernetesVersion ?? KubernetesVersion.V1_20,
    });

    //Create a property that will be evaulated at runtime - required for correct tagging
    this.clusterNameDeferred = new CfnJson(this, "clusterName", {
      value: this.eksCluster.clusterName,
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

    this.addEmrEksNodegroup(EmrEksNodegroup.NODEGROUP_TOOLING);

    // Create a Kubernetes Service Account for the Cluster Autoscaler with Amazon IAM Role
    const ClusterAutoscalerPolicyDocument = PolicyDocument.fromJson(
      JSON.parse(
        fs.readFileSync("./src/k8s/iam-policy-autoscaler.json", "utf8")
      )
    );
    const clusterAutoscalerIAMPolicy = new ManagedPolicy(
      this,
      "ClusterAutoscalerIAMPolicy",
      {
        document: ClusterAutoscalerPolicyDocument,
        managedPolicyName: EmrEksCluster.clusterAutoscalerPolicyName,
      }
    );

    const AutoscalerServiceAccount = this.eksCluster.addServiceAccount(
      "Autoscaler",
      { name: "cluster-autoscaler", namespace: "kube-system" }
    );
    clusterAutoscalerIAMPolicy.attachToRole(AutoscalerServiceAccount.role);

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
    // Deploy the Helm Chart for Kubernetes Cluster Autoscaler
    this.eksCluster.addHelmChart("AutoScaler", {
      chart: "cluster-autoscaler",
      namespace: "kube-system",
      repository: "https://kubernetes.github.io/autoscaler",
      wait: true,
      values: {
        "serviceAccount.name": "cluster-autoscaler",
        "serviceAccount.create": false,
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
    });

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

    sparkManagedGroup.eksGroup.role.addManagedPolicy(
      ManagedPolicy.fromManagedPolicyName(
        this,
        "eksEmrClusterAutoscalerIAMPolicy" + props.id,
        EmrEksCluster.clusterAutoscalerPolicyName
      )
    );

    Tags.of(sparkManagedGroup).add(
      `k8s.io/cluster-autoscaler/${this.clusterNameDeferred}`,
      "owned",
      { applyToLaunchedInstances: true }
    );
    Tags.of(sparkManagedGroup).add(
      "k8s.io/cluster-autoscaler/enabled",
      "true",
      {
        applyToLaunchedInstances: true,
      }
    );
    return sparkManagedGroup;
  }

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

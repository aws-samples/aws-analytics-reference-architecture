import {
  KubernetesVersion,
  Cluster,
  KubernetesManifest,
} from "@aws-cdk/aws-eks";
import { Construct, Tags, Stack, CfnJson } from "@aws-cdk/core";
import {
  PolicyStatement,
  PolicyDocument,
  Policy,
  Effect,
  Role,
  CfnServiceLinkedRole,
} from "@aws-cdk/aws-iam";
import { InstanceType } from "@aws-cdk/aws-ec2";
import { EmrEksNodegroup, EmrEksNodegroupProps } from "./emr-eks-nodegroup";
import { EmrVirtualClusterProps } from "./emr-virtual-cluster";
import * as yaml from "js-yaml";
import * as fs from "fs";

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
  eksAdminRoleArn?: string;
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
  public readonly ClusterAutoscalerIAMPolicy: Policy;
  public readonly clusterNameDeferred: CfnJson;

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

    // @todo: check if we need to configure cluster autoscaler for this nodegroup
    // Creating an Amazon EKS Managed Nodegroup for the different tools
    this.eksCluster.addNodegroupCapacity("tooling", {
      instanceTypes: [new InstanceType("t3.medium")],
      minSize: 0,
      maxSize: 2,
      labels: {
        role: "tooling",
      },
    });

    // Create a Kubernetes Service Account for the Cluster Autoscaler with Amazon IAM Role
    const ClusterAutoscalerPolicyDocument = PolicyDocument.fromJson(
      JSON.parse(
        fs.readFileSync("./src/k8s/iam-policy-autoscaler.json", "utf8")
      )
    );
    this.ClusterAutoscalerIAMPolicy = new Policy(
      this,
      "ClusterAutoscalerIAMPolicy",
      { document: ClusterAutoscalerPolicyDocument }
    );

    const AutoscalerServiceAccount = this.eksCluster.addServiceAccount(
      "Autoscaler",
      { name: "cluster-autoscaler", namespace: "kube-system" }
    );
    this.ClusterAutoscalerIAMPolicy.attachToRole(AutoscalerServiceAccount.role);

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
    new CfnServiceLinkedRole(this, "EmrServiceIAMRole", {
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

    // Add K8s Role and RoleBinding to emr-containers
    this.loadManifest(
      "roleBinding" + "default",
      "./src/k8s/rbac/emr-containers.yaml",
      [{ key: "{{NAMESPACE}}", val: "default" }]
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
  }

  /**
   * Add a new Amazon EKS Nodegroup to the cluster.
   * CfnOutput can be customized.
   * @param {Props} props the EmrEksNodegroupProps [properties]{@link EmrEksNodegroupProps}
   * @since 1.0.0
   * @access public
   */
  public addEmrEksNodegroup(props: EmrEksNodegroupProps) {}

  public addEmrVirtualCluster(props: EmrVirtualClusterProps) {}

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

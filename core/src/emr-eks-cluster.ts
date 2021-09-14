import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
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
import * as lambda from "@aws-cdk/aws-lambda";
import { RetentionDays } from "@aws-cdk/aws-logs";
import {
  Construct,
  Tags,
  Stack,
  Duration,
  CustomResource,
} from "@aws-cdk/core";
import { Provider } from "@aws-cdk/custom-resources";
import * as AWS from "aws-sdk";
import * as yaml from "js-yaml";
import { EmrEksNodegroup, EmrEksNodegroupProps } from "./emr-eks-nodegroup";
import {
  EmrVirtualClusterProps,
  EmrVirtualCluster,
} from "./emr-virtual-cluster";

import * as IamPolicyAlb from "./k8s/iam-policy-alb.json";
import * as IamPolicyAutoscaler from "./k8s/iam-policy-autoscaler.json";
import * as IamPolicyEmrJobRole from "./k8s/iam-policy-emr-job-role.json";
import * as K8sRoleBinding from "./k8s/rbac/emr-containers-role-binding.json";
import * as K8sRole from "./k8s/rbac/emr-containers-role.json";

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

  /**
   * ACM Certificate ARN used with EMR on EKS managed endpoint
   * @default - attempt to generate and import certificate using locally installed openssl utility
   */
  readonly acmCertificateArn?: string;
  /**
   * EMR on EKS managed endpoint version
   * @default - emr-6.2.0-latest
   */
  readonly emrOnEksVersion?: string;
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
  private emrWorkerIAMRole: Role;
  private scope: Construct;
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

    this.scope = scope;

    this.eksClusterName =
      props.eksClusterName ??
      "EmrEksCluster-" + Math.random().toString().substr(2);

    this.eksClusterVersion = props.kubernetesVersion ?? KubernetesVersion.V1_20;
    // create an Amazon EKS CLuster
    this.eksCluster = new Cluster(scope, "eksCluster", {
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

    const ClusterAutoscalerPolicyDocument =
      PolicyDocument.fromJson(IamPolicyAutoscaler);

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

    this.emrWorkerIAMRole = new Role(this, "EMRWorkerIAMRole", {
      assumedBy: new FederatedPrincipal(
        this.eksCluster.openIdConnectProvider.openIdConnectProviderArn,
        [],

        "sts:AssumeRoleWithWebIdentity"
      ),
    });

    this.addEmrEksNodegroup(EmrEksNodegroup.NODEGROUP_TOOLING);

    if (!props.emrEksNodegroups) {
      this.addEmrEksNodegroup(EmrEksNodegroup.NODEGROUP_CRITICAL);
      this.addEmrEksNodegroup(EmrEksNodegroup.NODEGROUP_SHARED);
      this.addEmrEksNodegroup(EmrEksNodegroup.NODEGROUP_NOTEBOOKS);

      //add default Emr Cluster
      /* const emrCluster = this.addEmrVirtualCluster({
        name: 'emrcluster1',
        eksNamespace: 'default',
      });
      const managedEndpoint = this.addManagedEndpoint(
        'me1',
        emrCluster.instance.attrId,
        props.acmCertificateArn,
        props.emrOnEksVersion,
      );
      managedEndpoint.node.addDependency(emrCluster);*/
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

    K8sRole.metadata.namespace = eksNamespace;
    const role = this.eksCluster.addManifest("eksNamespaceRole", K8sRole);
    role.node.addDependency(this.emrServiceRole);
    if (ns) role.node.addDependency(ns);

    K8sRoleBinding.metadata.namespace = eksNamespace;
    const roleBinding = this.eksCluster.addManifest(
      "eksNamespaceRoleBinding",
      K8sRoleBinding
    );
    roleBinding.node.addDependency(role);

    const virtCluster = new EmrVirtualCluster(
      this.scope,
      props.name,
      this.eksCluster,
      props
    );

    virtCluster.node.addDependency(roleBinding);
    virtCluster.node.addDependency(this.emrServiceRole);

    //Create EMR Worker IAM Role and trust policy
    const EmrWorkerPolicyDocument =
      PolicyDocument.fromJson(IamPolicyEmrJobRole);
    const EmrWorkerIAMPolicy = new ManagedPolicy(this, "EMRWorkerIAMPolicy", {
      document: EmrWorkerPolicyDocument,
    });
    this.emrWorkerIAMRole.addManagedPolicy(EmrWorkerIAMPolicy);

    return virtCluster;
  }

  /**
   * Creates a new JEG managed endpoint to be used with Amazon EMR Virtual Cluster .
   * CfnOutput can be customized.
   * @param {id} unique id for endpoint
   * @param {virtualClusterId} Emr Virtual Cluster Id
   * @param {props} props for the managed endpoint.
   * props.acmCertificateArn - ACM Certificate Arn to be attached to the JEG managed endpoint, @default - creates new ACM Certificate
   * props.emrOnEksVersion - EmrOnEks version to be used. @default - emr-6.2.0-latest
   * @since 1.0.0
   * @access public
   */
  public addManagedEndpoint(
    id: string,
    virtualClusterId: string,
    props: { acmCertificateArn?: string; emrOnEksVersion?: string }
  ) {
    // Deploy the Helm Chart for the Certificate Manager. Required for EMR Studio ALB.
    const certManager = this.eksCluster.addHelmChart("CertManager", {
      createNamespace: true,

      namespace: "cert-manager",
      chart: "cert-manager",
      repository: "https://charts.jetstack.io",
      version: "v1.4.0",
      timeout: Duration.minutes(14),
    });

    //Create service account for ALB and install ALB
    const albPolicyDocument = PolicyDocument.fromJson(IamPolicyAlb);
    const albIAMPolicy = new Policy(
      this,

      "AWSLoadBalancerControllerIAMPolicy",
      { document: albPolicyDocument }
    );

    const albServiceAccount = this.eksCluster.addServiceAccount("ALB", {
      name: "aws-load-balancer-controller",
      namespace: "kube-system",
    });
    albIAMPolicy.attachToRole(albServiceAccount.role);

    const albService = this.eksCluster.addHelmChart("ALB", {
      chart: "aws-load-balancer-controller",
      repository: "https://aws.github.io/eks-charts",
      namespace: "kube-system",

      timeout: Duration.minutes(14),
      values: {
        clusterName: this.eksClusterName,
        serviceAccount: {
          name: "aws-load-balancer-controller",
          create: false,
        },
      },
    });
    albService.node.addDependency(albServiceAccount);
    albService.node.addDependency(certManager);

    // Create custom resource with async waiter until the data is completed
    const endpointId = `managed-endpoint-${id}`;
    const lambdaPath = "managed-endpoint-cr";

    const onEvent = new lambda.Function(this.scope, `${endpointId}-on-event`, {
      code: lambda.Code.fromAsset(path.join(__dirname, lambdaPath)),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.onEvent",
      timeout: Duration.seconds(120),
      environment: {
        REGION: Stack.of(this).region,
        CLUSTER_ID: virtualClusterId,
        EXECUTION_ROLE_ARN: this.emrWorkerIAMRole.roleArn,
        ENDPOINT_NAME: endpointId,
        RELEASE_LABEL: props.emrOnEksVersion || "emr-6.2.0-latest",
        ACM_CERTIFICATE_ARN:
          props.acmCertificateArn || String(this.getOrCreateAcmCertificate()),
      },
      initialPolicy: [
        new PolicyStatement({
          resources: ["*"],
          actions: ["s3:GetObject*", "s3:GetBucket*", "s3:List*"],
        }),
        new PolicyStatement({
          resources: ["*"],
          actions: ["acm:*"],
        }),
        new PolicyStatement({
          resources: ["*"],
          actions: ["emr-containers:*"],
        }),
        new PolicyStatement({
          resources: ["*"],
          actions: ["ec2:*"],
        }),
      ],
    });

    const isComplete = new lambda.Function(this, `${endpointId}-is-complete`, {
      code: lambda.Code.fromAsset(path.join(__dirname, lambdaPath)),
      handler: "index.isComplete",
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(120),
      environment: {
        REGION: Stack.of(this).region,
        CLUSTER_ID: virtualClusterId,
      },
      initialPolicy: [
        new PolicyStatement({
          resources: ["*"],
          actions: ["s3:GetObject*", "s3:GetBucket*", "s3:List*"],
        }),
        new PolicyStatement({
          resources: ["*"],
          actions: ["acm:*"],
        }),
        new PolicyStatement({
          resources: ["*"],
          actions: ["emr-containers:*"],
        }),
        new PolicyStatement({
          resources: ["*"],
          actions: ["ec2:*"],
        }),
      ],
    });
    const myProvider = new Provider(this, "CustomResourceProvider" + id, {
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
      apiVersion: "2015-12-08",
      region: process.env.CDK_DEFAULT_REGION,
    });
    const cert = async () => {
      try {
        const getCerts = await clientAcm
          .listCertificates({
            MaxItems: 50,
            Includes: {
              keyTypes: ["RSA_1024"],
            },
          })
          .promise();

        if (getCerts.CertificateSummaryList) {
          const existingCert = getCerts.CertificateSummaryList.find(
            (itm) => itm.DomainName == "*.emreksanalyticsframework.com"
          );

          if (existingCert) return String(existingCert.CertificateArn);
        }
      } catch (error) {
        console.log(error);
        throw new Error(`error getting acm certs ${error}`);
      }

      try {
        execSync(
          'openssl req -x509 -newkey rsa:1024 -keyout /tmp/privateKey.pem  -out /tmp/certificateChain.pem -days 365 -nodes -subj "/C=US/ST=Washington/L=Seattle/O=MyOrg/OU=MyDept/CN=*.emreksanalyticsframework.com"'
        );
      } catch (error) {
        throw new Error(`Error generating certificate ${error.message}`);
      }

      try {
        const command = {
          Certificate: Buffer.from(
            fs.readFileSync("/tmp/certificateChain.pem", "binary")
          ),
          PrivateKey: Buffer.from(
            fs.readFileSync("/tmp/privateKey.pem", "binary")
          ),
        };
        const response = await clientAcm.importCertificate(command).promise();
        return String(response.CertificateArn);
      } catch (error) {
        console.log(error);
        throw new Error(`error importing certificate ${error.message}`);
      }
    };

    return cert();
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

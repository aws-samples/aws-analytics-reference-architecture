import { EmrEksCluster } from "./emr-eks-cluster";
import { CfnVirtualCluster } from "@aws-cdk/aws-emrcontainers";
import { CfnServiceLinkedRole } from "@aws-cdk/aws-iam";
import { Construct } from "@aws-cdk/core";

export interface EmrVirtualClusterProps {
  eksNamespace?: string;
  createNamespace?: boolean;
}

export class EmrVirtualCluster extends Construct {
  constructor(
    scope: Construct,
    id: string,
    emrEksCluster: EmrEksCluster,
    serviceLinkedRole: CfnServiceLinkedRole,
    props: EmrVirtualClusterProps
  ) {
    super(scope, id);

    const eksNamespace = props.eksNamespace ?? "default";
    const ns = props.createNamespace
      ? emrEksCluster.eksCluster.addManifest("eksNamespace", {
          apiVersion: "v1",
          kind: "Namespace",
          metadata: { name: eksNamespace },
        })
      : null;

    const roleBinding = emrEksCluster.loadManifest(
      "roleBinding" + eksNamespace,
      "./src/k8s/rbac/emr-containers.yaml",
      [{ key: "{{NAMESPACE}}", val: eksNamespace }]
    );
    roleBinding.node.addDependency(serviceLinkedRole);
    if (ns) roleBinding.node.addDependency(ns);

    const virtCluster = new CfnVirtualCluster(this, "EMRClusterEc2", {
      name: id,
      containerProvider: {
        id: emrEksCluster.eksCluster.clusterName,
        type: "EKS",
        info: { eksInfo: { namespace: eksNamespace } },
      },
    });
    virtCluster.node.addDependency(roleBinding);
    virtCluster.node.addDependency(serviceLinkedRole);

    return virtCluster;
  }
}

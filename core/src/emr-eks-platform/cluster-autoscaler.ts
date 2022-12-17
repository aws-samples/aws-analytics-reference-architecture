import { Cluster } from 'aws-cdk-lib/aws-eks';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EmrEksNodegroupAsgTagProvider } from './emr-eks-nodegroup-asg-tag';


export class ClusterAutoscaler {

    private readonly eksClusterName: string;
    private readonly scope: Construct;

    constructor(
        cluster: Cluster,
        eksClusterName: string,
        scope: Construct,
        autoscalerVersion?: string) {  

        this.eksClusterName = eksClusterName;
        this.scope = scope;

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
            version: autoscalerVersion || '9.11.0',
            namespace: 'kube-system',
            timeout: Duration.minutes(14),
            values: {
                cloudProvider: 'aws',
                awsRegion: Stack.of(this.scope).region,
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

        // Create the custom resource provider for tagging the EC2 Auto Scaling groups
    new EmrEksNodegroupAsgTagProvider(this.scope, 'AsgTagProvider', {
        eksClusterName: this.eksClusterName,
      }).provider.serviceToken;

    }

}
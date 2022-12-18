import { Cluster, HelmChart } from 'aws-cdk-lib/aws-eks';
import { CfnInstanceProfile, Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Aws, Duration, Stack, Tags } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';

export function karpenterSetup (cluster: Cluster,
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

    new Rule (scope, 'scheduledChangeRule', {
        eventPattern: {
            source: ['aws.heatlh'],
            detail: ['AWS Health Event']
        },
        targets: [new SqsQueue(karpenterInterruptionQueue)]
    });

    new Rule (scope, 'instanceStateChangeRule', {
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
        version: karpenterVersion || 'v0.20.0',
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

    const karpenterInstancesSg = new SecurityGroup(scope, 'caInstancesSg', {
        vpc: cluster.vpc,
        allowAllOutbound: true,
        description: 'security group for a karpenter instances',
        securityGroupName: 'caInstancesSg'
      });
      
      Tags.of(karpenterInstancesSg).add('karpenter.sh/discovery', `${eksClusterName}`);
      
      cluster.clusterSecurityGroup.addIngressRule(
        Peer.securityGroupId(karpenterInstancesSg.securityGroupId),
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


    return karpenterChart;
}



export function clusterAutoscalerSetup(
    cluster: Cluster,
    eksClusterName: string,
    scope: Construct,
    autoscalerVersion?: string) {      
    
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
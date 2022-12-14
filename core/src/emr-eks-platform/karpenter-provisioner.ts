import { Cluster, HelmChart } from 'aws-cdk-lib/aws-eks';
import { CfnInstanceProfile, Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Aws, Duration, Tags } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';


export class KarpenterProvisioner {

    private eksCluster: Cluster;
    private karpenterChart: HelmChart;

    constructor(
        cluster: Cluster,
        eksClusterName: string,
        scope: Construct,
        karpenterVersion?: string) {
        
        this.eksCluster = cluster;

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
            resources: [`arn:aws:ec2:${Aws.REGION}:${Aws.ACCOUNT_ID}:*`],
        });

        const karpenterControllerPolicyStatementIAM: PolicyStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['iam:PassRole'],
            resources: [`arn:aws:iam::${Aws.ACCOUNT_ID}:role/KarpenterNodeRole-${eksClusterName}`],
        });

        new CfnInstanceProfile(cluster, 'karpenter-instance-profile', {
            roles: [karpenterNodeRole.roleName],
            instanceProfileName: `karpenterNodeInstanceProfile-${eksClusterName}`,
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
        this.karpenterChart = cluster.addHelmChart('Karpenter', {
            chart: 'karpenter',
            repository: 'https://charts.karpenter.sh/',
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
                clusterName: eksClusterName,
                clusterEndpoint: cluster.clusterEndpoint,
                aws: {
                    defaultInstanceProfile: `karpenterNodeInstanceProfile-${eksClusterName}`,
                },
            },
        });

        this.karpenterChart.node.addDependency(karpenterAccount);


        Tags.of(cluster.vpc).add(
            'karpenter.sh/discovery', eksClusterName,
        );

        cluster.vpc.privateSubnets.forEach((subnet) => {
            Tags.of(subnet).add('karpenter.sh/discovery', eksClusterName);
        });

        cluster.vpc.publicSubnets.forEach((subnet) =>
            Tags.of(subnet).add('karpenter.sh/discovery', eksClusterName),
        );
    }

  /**
   * Add a new provisioner for the EKS cluster
   * This method is be used to add a karpenter provisioner to the Amazon EKS cluster and automatically set tags based on labels and taints
   *  so it can be used for the nodes.
   * @param {string} id the object id, must be unique accross the stack
   * @param {any} manifest the Kubernetes manifest describing the Karpenter provisioner
   * @access public
   */

  public addKarpenterProvisioner(id: string, manifest: any) {
    let manifestApply = this.eksCluster.addManifest(id, ...manifest);
    manifestApply.node.addDependency(this.karpenterChart);
  }
}
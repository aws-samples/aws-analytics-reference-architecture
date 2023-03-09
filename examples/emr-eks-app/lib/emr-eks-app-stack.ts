import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ara from 'aws-analytics-reference-architecture';
import * as iam from 'aws-cdk-lib/aws-iam' ;
import { User } from 'aws-cdk-lib/aws-iam';
import { KubectlV22Layer } from '@aws-cdk/lambda-layer-kubectl-v22'; 
import { KubernetesVersion } from 'aws-cdk-lib/aws-eks';


export class EmrEksAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const resultsBucket = ara.AraBucket.getOrCreate(this, {
      bucketName: 'results-bucket',
    });

    const kubectl = new KubectlV22Layer(this, 'KubectlLayer');

    const emrEks = ara.EmrEksCluster.getOrCreate(this,{
      eksClusterName:'emreks',
      autoscaling: ara.Autoscaler.KARPENTER,
      kubernetesVersion: KubernetesVersion.V1_22,
      kubectlLambdaLayer: kubectl,
    });

    const virtualCluster = emrEks.addEmrVirtualCluster(this,{
      name:'batch-job-cluster',
      eksNamespace: 'batchjob',
      createNamespace: true,
    });

    const emrEksPolicy = new iam.ManagedPolicy(this,'EmrPolicy',{
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions:['s3:PutObject','s3:GetObject','s3:ListBucket'],
          resources:[
            resultsBucket.bucketArn,
            resultsBucket.arnForObjects('*'),
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions:['s3:GetObject','s3:ListBucket'],
          resources:[
            "arn:aws:s3:::nyc-tlc",
            "arn:aws:s3:::nyc-tlc/*",
            "arn:aws:s3:::aws-data-lake-workshop/spark-eks/spark-eks-assembly-3.3.0.jar",
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions:['glue:*'],
          resources:[
            `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:catalog`,
            `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:database/default`,
            `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:database/emr_eks_demo`,
            `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/emr_eks_demo/value_rides`,
            `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/emr_eks_demo/raw_rides`
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW, actions:[
            'logs:CreateLogGroup',
            'logs:PutLogEvents',
            'logs:CreateLogStream',
            'logs:DescribeLogGroups',
            'logs:DescribeLogStreams'
          ],
          resources:['arn:aws:logs:*:*:*'],
        }),
      ]
    });


    const role = emrEks.createExecutionRole(this,'EmrExecRole',emrEksPolicy, 'batchjob','execRoleJob');

    const notebookUser = new User(this, 'NotebookUser', {userName: 'test'});

    const notebookPlatform = new ara.NotebookPlatform(this, 'platform-notebook', {
      emrEks: emrEks,
      eksNamespace: 'notebook',
      studioName: 'platform',
      studioAuthMode: ara.StudioAuthMode.IAM,
      });
    
      notebookPlatform.addUser([{
        iamUser: notebookUser,
        notebookManagedEndpoints: [{
          emrOnEksVersion: ara.EmrVersion.V6_9,
          executionPolicy: emrEksPolicy,
          managedEndpointName: 'platform-notebook'
        }],
      }]);
 

    // Virtual cluster Id to reference in jobs
    new cdk.CfnOutput(this, 'VirtualClusterId', { value: virtualCluster.attrId });
    // Job config for each nodegroup
    new cdk.CfnOutput(this, 'CriticalConfig', { value: emrEks.criticalDefaultConfig });
    new cdk.CfnOutput(this, 'SharedConfig', { value: emrEks.sharedDefaultConfig });
    // Execution role arn
    new cdk.CfnOutput(this, 'ExecRoleArn', { value: role.roleArn });
    // Results bucket name
    new cdk.CfnOutput(this, 'ResultsBucketName', { value: resultsBucket.bucketName });
  }
}

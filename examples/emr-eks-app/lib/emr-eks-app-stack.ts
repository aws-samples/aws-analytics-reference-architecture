import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ara from 'aws-analytics-reference-architecture';
import * as iam from 'aws-cdk-lib/aws-iam' ;


export class EmrEksAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const emrEks = ara.EmrEksCluster.getOrCreate(this,{
      eksAdminRoleArn:'',
      eksClusterName:'',
      autoscaling: ara.Autoscaler.KARPENTER,
    });

    const virtualCluster = emrEks.addEmrVirtualCluster(this,{
      name:'my-emr-eks-cluster',
      eksNamespace: 'batchjob',
      createNamespace: true,
    });

    const emrEksPolicy = new iam.ManagedPolicy(this,'managed-policy',{
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions:['s3:PutObject','s3:GetObject','s3:ListBucket'],
          resources:['YOUR-S3-BUCKET'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW, actions:['logs:PutLogEvents','logs:CreateLogStream','logs:DescribeLogGroups','logs:DescribeLogStreams'],
          resources:['arn:aws:logs:*:*:*'],
        }),
      ]
    });


    const role = emrEks.createExecutionRole(this,'emr-eks-execution-role',emrEksPolicy, 'batchjob','execRoleJob');

    // Virtual cluster Id to reference in jobs
    new cdk.CfnOutput(this, 'VirtualClusterId', { value: virtualCluster.attrId });
    // Job config for each nodegroup
    new cdk.CfnOutput(this, 'CriticalConfig', { value: emrEks.criticalDefaultConfig });
    // Execution role arn
    new cdk.CfnOutput(this, 'ExecRoleArn', { value: role.roleArn });


    const notebookPlatform = new ara.NotebookPlatform(this, 'platform-notebook', {
      emrEks: emrEks,
      eksNamespace: 'dataanalysis',
      studioName: 'platform',
      studioAuthMode: ara.StudioAuthMode.IAM,
      });
    
      notebookPlatform.addUser([{
        identityName:'',
        notebookManagedEndpoints: [{
        emrOnEksVersion: ara.EmrVersion.V6_9,
        executionPolicy: emrEksPolicy,
        managedEndpointName: 'myendpoint'
              }],
      }]);
 

  }
}

import { App, ArnFormat, Aws, CfnOutput, Stack } from 'aws-cdk-lib';
import { Autoscaler, EmrEksCluster, EmrVersion } from './emr-eks-platform';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal, User } from 'aws-cdk-lib/aws-iam';
import { NotebookPlatform, StudioAuthMode } from './notebook-platform';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved


const mockApp = new App();
const stack = new Stack(mockApp, 'EmrEksClustereE2eTest');

const emrEks = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/gromav',
  autoscaling: Autoscaler.KARPENTER,
});

const virtualCluster = emrEks.addEmrVirtualCluster(stack, {
  name: 'e2eTest',
  createNamespace: true,
  eksNamespace: 'emreks',
});

const policy = new ManagedPolicy(stack, 'MyPolicy1', {
  statements: [
    new PolicyStatement({
      resources: ['*'],
      actions: ['s3:*'],
    }),
    new PolicyStatement({
      resources: [
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'logs',
          resource: '*',
          arnFormat: ArnFormat.NO_RESOURCE_NAME,
        }),
      ],
      actions: [
        'logs:*',
      ],
    }),
  ],
});

const execRole = emrEks.createExecutionRole(stack, 'ExecRole',
  policy,
  'emreks',
  'emr-eks-exec-role',
);

const platform = new NotebookPlatform(stack, 'platform-notebook', {
  emrEks: emrEks,
  eksNamespace: 'notebook',
  studioName: 'notebook',
  studioAuthMode: StudioAuthMode.IAM,
});

const notebookUser = new User(stack, 'NotebookUser', {userName: 'test'});

platform.addUser([{
  iamUser: notebookUser,
  notebookManagedEndpoints: [
    {
      emrOnEksVersion: EmrVersion.V6_9,
      executionPolicy:   policy,
      managedEndpointName: 'notebook',
    },
  ],
}]);

// Job config for each nodegroup
new CfnOutput(stack, 'CriticalConfig', { value: emrEks.criticalDefaultConfig });
new CfnOutput(stack, 'SharedConfig', { value: emrEks.sharedDefaultConfig });
new CfnOutput(stack, 'JobExecRole', { value: execRole.roleArn });
new CfnOutput(stack, 'VirtualClusterId', { value: virtualCluster.attrId });

//import { ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { App, /*ArnFormat, Aws,*/ Stack } from '@aws-cdk/core';
import { EmrEksCluster } from './emr-eks-platform/';
//import { NotebookPlatform, SSOIdentityType, StudioAuthMode } from './notebook-platform';


const envInteg = { account: '214783019211', region: 'eu-west-1' };

const mockApp = new App();
const stack = new Stack(mockApp, 'refactoring', { env: envInteg });

const emrEks: EmrEksCluster = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::214783019211:role/Admin',
  eksClusterName: 'serviceaccounttest',
});

emrEks.addEmrVirtualCluster(stack, {
  name: 'refactoring',
  createNamespace: true,
  eksNamespace: 'refactoringns',
});

/*const myInfra: NotebookPlatform = new NotebookPlatform(stack, 'serviceaccounttest-vc', {
  emrEks: emrEks,
  eksNamespace: 'testns',
  studioName: 'mystudio',
  studioAuthMode: StudioAuthMode.SSO,
});

const policy1 = new ManagedPolicy(stack, 'MyPolicy1', {
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

myInfra.addUser([{
  identityName: 'lotfi-emr-advanced',
  identityType: SSOIdentityType.USER,
  notebookManagedEndpoints: [{
    emrOnEksVersion: 'emr-6.3.0-latest',
    executionPolicy: policy1,
  }],
}]);*/

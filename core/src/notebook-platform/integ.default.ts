import { App, Stack } from '@aws-cdk/core';
import { NotebookPlatform, StudioAuthMode } from './notebook-platform';
import { EmrEksCluster } from '../emr-eks-platform';

const envInteg = { account: 'ACCOUNT_ID', region: 'REGION' };

const mockApp = new App();
const stack = new Stack(mockApp, 'test', { env: envInteg });

const emrEks = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'MY_ROLE_ARN',
});

const notebookPlatform = new NotebookPlatform(stack, 'platform1',{
  emrEks: emrEks,
  eksNamespace: 'test',
  studioName: 'platform1',
  studioAuthMode: StudioAuthMode.IAM,
})

notebookPlatform.addUser([{
  identityName: 'NAME_OR_GROUP_AS_IT_APPEAR_IN_SSO_CONSOLE',
  identityType: 'USER',
  executionPolicyNames: ['policyManagedEndpoint'],
  emrOnEksVersion: 'emr-6.3.0-latest',
}]);

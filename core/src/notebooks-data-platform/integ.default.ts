import { App, Stack } from '@aws-cdk/core';
import { DataPlatform } from './dataplatform';
import { StudioAuthMode /*, StudioUserDefinition*/ } from './dataplatform-notebook';

const envInteg = { account: 'ACCOUNT_ID', region: 'REGION' };

const mockApp = new App();
const stack = new Stack(mockApp, 'test2', { env: envInteg });

const dept1 = DataPlatform.getOrCreate(stack, {
  eksAdminRoleArn: 'YOUR_EKS_ADMIN_ROLE',
});

dept1.addNotebookPlatform({
  studioName: 'test2',
  emrVCNamespace: 'test2ns',
  studioAuthMode: StudioAuthMode.SSO,
});

dept1.addUsersNotebookPlatform( 'test2', [{
  identityName: 'NAME_OR_GROUP_AS_IT_APPEAR_IN_SSO_CONSOLE',
  identityType: 'USER',
  executionPolicyNames: ['policyManagedEndpoint'],
  emrOnEksVersion: 'emr-6.3.0-latest',
}]);

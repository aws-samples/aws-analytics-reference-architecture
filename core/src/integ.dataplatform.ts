//import { CfnStudioSessionMappingProps } from '@aws-cdk/aws-emr';
import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { DataPlatformNotebook, StudioUserDefinition } from './dataplatform-notebook';

const envInteg = { account: '372775283473', region: 'eu-west-1' };

const mockApp = new App();
const stack = new Stack(mockApp, 'integration-testing', { env: envInteg });

const dataPlatform = new DataPlatformNotebook(stack, 'dataplatform', {
  vpcId: 'vpc-07d9a70a8a8cca968',
  engineSecurityGroupId: 'sg-09b9566e8fb32503a',
  subnetList: ['subnet-03992fb1cdcf3f3bf'],
  studioName: 'MyStudio',
  authMode: 'SSO',
});

let userList: StudioUserDefinition[]= [{
  identityName: 'lotfi-emr-advanced',
  identityType: 'USER',
  studioId: dataPlatform.studioId,
},
{
  identityName: 'mouhib.lotfi@gmail.com',
  identityType: 'USER',
  studioId: dataPlatform.studioId,
}];

dataPlatform.addUsers(userList);


new CfnOutput(stack, 'dataplatformOutput1', {
  value: dataPlatform.studioUrl,
});

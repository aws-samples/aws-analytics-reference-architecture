import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { DataPlatformNotebook, StudioUserDefinition } from './dataplatform-notebook';

const envInteg = { account: '372775283473', region: 'eu-west-1' };

const mockApp = new App();
const stack = new Stack(mockApp, 'integration-testing-dataplatform-notebook-kms-encryption', { env: envInteg });

const dataPlatform = new DataPlatformNotebook(stack, 'dataplatform', {
  studioName: '<YOUR-STUDIO-NAME>',
  studioAuthMode: 'SSO', //Leave it as is
  eksAdminRoleArn: '<role assigned to admin EKS>',
  acmCertificateArn: '<ACM certificate ARN>',
});

let userList: StudioUserDefinition[];

userList = [{
  mappingIdentityName: '<As it appears in AWS SSO console>',
  mappingIdentityType: 'USER' || 'GROUP',
  executionPolicyArn: '<policy to be used with EMR on EKS job execution>',
},
{
  mappingIdentityName: '<As it appears in AWS SSO console>',
  mappingIdentityType: 'USER' || 'GROUP',
  executionPolicyArn: '<policy to be used with EMR on EKS job execution>',
}];

dataPlatform.addSSOUsers(userList);


new CfnOutput(stack, 'dataplatformOutput1', {
  value: dataPlatform.studioUrl,
});

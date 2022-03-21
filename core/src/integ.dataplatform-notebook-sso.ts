//import { ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { App, Stack } from '@aws-cdk/core';
import { EmrEksCluster } from './emr-eks-platform/';
import { NotebookPlatform, StudioAuthMode } from './notebook-platform';


const envInteg = { account: '214783019211', region: 'eu-west-1' };

const mockApp = new App();
const stack = new Stack(mockApp, 'platform7', { env: envInteg });

const emrEks = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::214783019211:role/Admin',
  eksClusterName: 'cluster7',
});

new NotebookPlatform(stack, 'platform7-1', {
  emrEks: emrEks,
  eksNamespace: 'platform7ns',
  studioName: 'platform7',
  studioAuthMode: StudioAuthMode.SSO,
});

/*const policy1 = new ManagedPolicy(stack, 'MyPolicy1', {
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
});*/

/*
const policy2 = new ManagedPolicy(stack, 'MyPolicy2', {
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
*/

/*let configOverride: string = '{' +
    '    "applicationConfiguration": [' +
    '      {' +
    '        "classification": "spark-defaults", ' +
    '        "properties": {' +
    '          "spark.dynamicAllocation.enabled":"false"' +
    '         }' +
    '      }' +
    '    ], ' +
    '    "monitoringConfiguration": {' +
    '    "persistentAppUI": "ENABLED", ' +
    '      "cloudWatchMonitoringConfiguration": {' +
    '        "logGroupName": "/emr-containers/notebook", ' +
    '        "logStreamNamePrefix": "default"' +
    '      } '+
    '    }}';*/

/*notebookPlatform.addUser([{
  identityName: 'lotfi-emr-advanced',
  identityType: SSOIdentityType.USER,
  notebookManagedEndpoints: [{
    emrOnEksVersion: 'emr-6.3.0-latest',
    executionPolicy: policy1,
  }],
}]);

notebookPlatform.addUser([{
  identityName: 'mouhib.lotfi@gmail.com',
  identityType: SSOIdentityType.USER,
  notebookManagedEndpoints: [{
    emrOnEksVersion: 'emr-6.3.0-latest',
    executionPolicy: policy2,
  }],
}]);*/

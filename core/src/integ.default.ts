// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { App, Stack, Aws, ArnFormat } from '@aws-cdk/core';
import { EmrEksCluster, NotebookPlatform, StudioAuthMode } from '.';

const mockApp = new App();
const stack = new Stack(mockApp, 'stack');

const policy = new ManagedPolicy(stack, 'MyPolicy', {
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

const emrEks = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'YOUR-EKS-ADMIN-ROLE-ARN',
});

let configOverride: string = '{' +
    '    "applicationConfiguration": [' +
    '      {' +
    '        "classification": "spark-defaults", ' +
    '        "properties": {' +
    '          "spark.dynamicAllocation.enabled":"false"' +
    '         }' +
    '      }' +
    '    ], ' +
    '    "monitoringConfiguration": {' +
    '      "cloudWatchMonitoringConfiguration": {' +
    '        "logGroupName": "/emr-containers/jobs", ' +
    '        "logStreamNamePrefix": "demo"' +
    '      }, ' +
    '      "s3MonitoringConfiguration": {' +
    '        "logUri": "s3://joblogs"' +
    '      }' +
    '    }}';

const notebookPlatform =new NotebookPlatform(stack, 'platform1', {
  emrEks: emrEks,
  eksNamespace: 'test',
  studioName: 'platform1',
  studioAuthMode: StudioAuthMode.IAM,
});

notebookPlatform.addUser([{
  identityName: 'IF-USING-SS0-PUT-YOUR-USER-OR-GROUP-NAME-AS-IT-APPEARS-IN-SS0',
  identityType: 'USER',
  executionPolicies: [policy],
  emrOnEksVersion: 'emr-6.3.0-latest',
  configurationOverrides: configOverride,
}]);

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SyncrhonousCrawler
 *
 * @group integ/synchronous-crawler
 */

import { CfnCrawler, Database } from '@aws-cdk/aws-glue';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { SynchronousCrawler } from '../../src/synchronous-crawler';

jest.setTimeout(300000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'SynchronousCrawlerE2eTest');

const testDb = new Database(stack, 'TestDb', {
  databaseName: 'sync_crawler_test_db',
});

const crawlerRole = new Role(stack, 'CrawlerRole', {
  assumedBy: new ServicePrincipal('glue.amazonaws.com'),
  managedPolicies: [
    new ManagedPolicy(stack, 'CrawlerPolicy', {
      statements: [
        new PolicyStatement({
          actions: ['glue:GetTable'],
          resources: [
            stack.formatArn({
              account: cdk.Aws.ACCOUNT_ID,
              region: cdk.Aws.REGION,
              service: 'glue',
              resource: 'table',
              resourceName: 'sampledb/elb_logs',
            }),
            stack.formatArn({
              account: cdk.Aws.ACCOUNT_ID,
              region: cdk.Aws.REGION,
              service: 'glue',
              resource: 'catalog',
            }),
            stack.formatArn({
              account: cdk.Aws.ACCOUNT_ID,
              region: cdk.Aws.REGION,
              service: 'glue',
              resource: 'database',
              resourceName: 'sampledb',
            }),
          ],
        }),
      ],
    }),
    ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
  ],
});

const crawler = new CfnCrawler(stack, 'Crawler', {
  role: crawlerRole.roleName,
  targets: {
    s3Targets: [{
      path: `s3://athena-examples-${cdk.Aws.REGION}/elb/plaintext`,
      sampleSize: 1,
    }],
  },
  name: 'test-crawler',
  databaseName: testDb.databaseName,
});

const synchronousCrawler = new SynchronousCrawler(stack, 'SynchronousCrawler', {
  crawlerName: crawler.name || 'test-crawler',
});

new cdk.CfnOutput(stack, 'SynchronousCrawlerResource', {
  value: synchronousCrawler.toString(),
  exportName: 'SynchronousCrawlerResource',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      profile: process.env.AWS_PROFILE,
    });
    const cloudFormation = new CloudFormationDeployments({ sdkProvider });

    // WHEN
    /*const deployResult =*/ await cloudFormation.deployStack({
      stack: stackArtifact,
    });

    // THEN
    expect(true);

  }, 9000000);
});

afterAll(async () => {
  const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    profile: process.env.AWS_PROFILE,
  });
  const cloudFormation = new CloudFormationDeployments({ sdkProvider });

  await cloudFormation.destroyStack({
    stack: stackArtifact,
  });
});

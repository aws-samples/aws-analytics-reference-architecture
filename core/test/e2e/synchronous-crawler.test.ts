// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SyncrhonousCrawler
 *
 * @group integ/synchronous-crawler
 */

import * as cdk from 'aws-cdk-lib';
import { deployStack, destroyStack } from './utils';
import { Database } from '@aws-cdk/aws-glue-alpha';
import { CfnCrawler } from 'aws-cdk-lib/aws-glue';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

import { SynchronousCrawler } from '../../src/synchronous-crawler';

jest.setTimeout(300000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'SynchronousCrawlerE2eTest');

const testDb = new Database(stack, 'TestDb', {
  databaseName: 'sync_crawler_test_db',
})

const crawlerRole = new Role(stack, 'CrawlerRole', {
  assumedBy: new ServicePrincipal('glue.amazonaws.com'),
  managedPolicies: [
    new ManagedPolicy(stack, 'CrawlerPolicy',{
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
      ]
    }),
    ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
  ]
})

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
    await deployStack(integTestApp, stack);
    
    // THEN
    expect(true);

  }, 9000000);
});

afterAll(async () => {
  await destroyStack(integTestApp, stack);
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SyncrhonousCrawler
 *
 * @group integ/synchronous-crawler
 */

import * as cdk from '@aws-cdk/core';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
import { CfnCrawler } from '@aws-cdk/aws-glue';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';

import { SynchronousCrawler } from '../../src/synchronous-crawler';

jest.setTimeout(100000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'SynchronousCrawlerE2eTest');

const crawlerRole = new Role(stack, 'CrawlerRole', {
  assumedBy: new ServicePrincipal('glue.amazonaws.com'),
})

const crawler = new CfnCrawler(stack, 'Crawler', {
  role: 'role',
  targets: {
    catalogTargets: [{
      databaseName: 'sampledb',
      tables: ['elb_logs'],
    }],
  },
  name: 'test-crawler',
});

const synchronousCrawler = new SynchronousCrawler(stack, 'SynchronousCrawler', {
  crawlerName: 'test-crawler',
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

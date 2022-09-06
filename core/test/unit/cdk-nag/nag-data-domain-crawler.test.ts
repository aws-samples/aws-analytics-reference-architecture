// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomainCrawler
 *
 * @group unit/best-practice/data-domain-crawler
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Stack, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataDomainCrawler } from '../../../src/data-mesh/data-domain-crawler';
import { Role, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';


const mockApp = new App();

const dataDomainCrawlerStack = new Stack(mockApp, 'DataDomainCrawlerStack');

const workflowRole = new Role(dataDomainCrawlerStack, 'CrawlerWorkflowRole', {
  assumedBy: new CompositePrincipal(
    new ServicePrincipal('states.amazonaws.com'),
  ),
});

const bucket = new Bucket(dataDomainCrawlerStack, 'Bucket');

new DataDomainCrawler(dataDomainCrawlerStack, 'DataDomainCrawler', {
  workflowRole: workflowRole,
  dataProductsBucket: bucket,
  dataProductsPrefix: 'test',
  domainName: 'Domain1Name',
});

Aspects.of(dataDomainCrawlerStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainCrawlerStack,
  'DataDomainCrawlerStack/CrawlerWorkflowRole',
  [
    { id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the Crawler Workflow Role' }
  ],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainCrawlerStack,
  'DataDomainCrawlerStack/Bucket/Resource',
  [
    { id: 'AwsSolutions-S10', reason: 'Not the purpose of this NAG to test the IAM Role' },
    { id: 'AwsSolutions-S2', reason: 'Not the purpose of this NAG to test the IAM Role' },
    { id: 'AwsSolutions-S1', reason: 'Not the purpose of this NAG to test the IAM Role' },
    { id: 'AwsSolutions-S3', reason: 'Not the purpose of this NAG to test the IAM Role' },
    { id: 'AwsSolutions-IAM5', reason: 'Not the purpose of this NAG to test the IAM Role' }
  ],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainCrawlerStack,
  'DataDomainCrawlerStack/DataDomainCrawler/UpdateTableSchemas/Resource',
  [{ id: 'AwsSolutions-SF2', reason: 'The Step Function doesn\'t need X-ray' }],
  true,
);

NagSuppressions.addResourceSuppressionsByPath(
  dataDomainCrawlerStack,
  'DataDomainCrawlerStack/DataDomainCrawler/S3AccessPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Crawler needs GetObject*, List* and GetBucket* and Glue:*' }],
  true,
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataDomainCrawlerStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataDomainCrawlerStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

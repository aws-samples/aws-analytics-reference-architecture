// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomainCrawler
 *
 * @group unit/best-practice/data-domain-crawler
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { Role, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { App, Stack, Aspects, RemovalPolicy, Aws } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataDomainCrawler } from '../../../src/data-mesh'


const mockApp = new App();

const dataDomainCrawlerStack = new Stack(mockApp, 'dataDomainCrawler');

const lfAdminRole = new Role(dataDomainCrawlerStack, 'myRole', {
    assumedBy: new CompositePrincipal(
        new ServicePrincipal('glue.amazonaws.com'),
        new ServicePrincipal('lakeformation.amazonaws.com'),
        new ServicePrincipal('states.amazonaws.com')
    ),
});
lfAdminRole.applyRemovalPolicy(RemovalPolicy.DESTROY)

const eventBus = new EventBus(dataDomainCrawlerStack, 'dataDomainEventBus', {
    eventBusName: `${Aws.ACCOUNT_ID}_dataDomainEventBus`,
});
eventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

new DataDomainCrawler(dataDomainCrawlerStack, 'myDataDomainCrawler', {
    lfAdminRole,
    eventBus,
    dataDomainWorkflowArn: "arn-test"
});

Aspects.of(dataDomainCrawlerStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
    dataDomainCrawlerStack,
    'dataDomainCrawler/myRole/DefaultPolicy/Resource',
    [{ id: 'AwsSolutions-IAM5', reason: 'The role is not part of tested resources' }],
);

NagSuppressions.addResourceSuppressionsByPath(
    dataDomainCrawlerStack,
    'dataDomainCrawler/myDataDomainCrawler/UpdateTableSchemas/Resource',
    [{ id: 'AwsSolutions-SF2', reason: 'The Step Function X-Ray tracing is outside the scope of the DataDomainCrawler construct.' }],
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

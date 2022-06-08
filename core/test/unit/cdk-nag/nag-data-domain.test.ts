// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomain
 *
 * @group unit/best-practice/data-domain
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { Role, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { App, Stack, Aspects, RemovalPolicy } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataDomain } from '../../../src/data-mesh';


const mockApp = new App();

const dataDomainStack = new Stack(mockApp, 'dataDomain');

const lfAdminRole = new Role(dataDomainStack, 'myRole', {
    assumedBy: new CompositePrincipal(
        new ServicePrincipal('glue.amazonaws.com'),
        new ServicePrincipal('lakeformation.amazonaws.com'),
        new ServicePrincipal('states.amazonaws.com')
    ),
});
lfAdminRole.applyRemovalPolicy(RemovalPolicy.DESTROY)

new DataDomain(dataDomainStack, 'myDataDomain', {
    centralAccId: '1234567891011',
    crawlerWorkflow: false,
    lfAdminRole,
})

Aspects.of(dataDomainStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
    dataDomainStack,
    'dataDomain/myRole/DefaultPolicy/Resource',
    [{ id: 'AwsSolutions-IAM5', reason: 'The role is not part of tested resources' }],
);

NagSuppressions.addResourceSuppressionsByPath(
    dataDomainStack,
    'dataDomain/myDataDomain/DataLakeAccess/Resource',
    [{ id: 'AwsSolutions-IAM5', reason: 'The LF admin role needs access to all the objects under the prefix' }],
);

NagSuppressions.addResourceSuppressionsByPath(
    dataDomainStack,
    'dataDomain/myDataDomain/SendEvents/Resource',
    [{ id: 'AwsSolutions-IAM5', reason: 'The LF admin role needs all events:Put actions (PutEvents, PutPermission, PutRule, PutTargets), hence Put:* for this specific Event Bus.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
    dataDomainStack,
    'dataDomain/myDataDomain/DataDomainWorkflow/CrossAccStateMachine/Resource',
    [{ id: 'AwsSolutions-SF2', reason: 'The Step Function X-Ray tracing is outside the scope of the DataDomain construct.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
    dataDomainStack,
    'dataDomain/s3-access-logs/Resource',
    [{ id: 'AwsSolutions-S1', reason: 'The S3 bucket used for access logs can\'t have access log enabled' }],
);

test('No unsuppressed Warnings', () => {
    const warnings = Annotations.fromStack(dataDomainStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
    console.log(warnings);
    expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
    const errors = Annotations.fromStack(dataDomainStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
    console.log(errors);
    expect(errors).toHaveLength(0);
});

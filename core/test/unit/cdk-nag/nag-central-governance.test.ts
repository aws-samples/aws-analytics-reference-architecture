// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CentralGovernance
 *
 * @group unit/best-practice/central-governance
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { Role, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { App, Stack, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { CentralGovernance } from '../../../src/data-mesh'


const mockApp = new App();

const centralGovStack = new Stack(mockApp, 'centralGov');

const lfAdminRole = new Role(centralGovStack, 'myRole', {
    assumedBy: new CompositePrincipal(
        new ServicePrincipal('glue.amazonaws.com'),
        new ServicePrincipal('lakeformation.amazonaws.com'),
        new ServicePrincipal('states.amazonaws.com')
    ),
})

new CentralGovernance(centralGovStack, 'myCentralGov', {
    lfAdminRole
})

Aspects.of(centralGovStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
    centralGovStack,
    'centralGov/myRole/DefaultPolicy/Resource',
    [{ id: 'AwsSolutions-IAM5', reason: 'The role is not part of tested resources' }],
);

NagSuppressions.addResourceSuppressionsByPath(
    centralGovStack,
    'centralGov/myCentralGov/sendEvents/Resource',
    [{ id: 'AwsSolutions-IAM5', reason: 'The LF admin role needs all events:Put actions (PutEvents, PutPermission, PutRule, PutTargets), hence Put:* for this specific Event Bus.' }],
);

NagSuppressions.addResourceSuppressionsByPath(
    centralGovStack,
    'centralGov/myCentralGov/RegisterDataProduct/Resource',
    [{ id: 'AwsSolutions-SF2', reason: 'The Step Function X-Ray tracing is outside the scope of the CentralGovernance construct.' }],
);

test('No unsuppressed Warnings', () => {
    const warnings = Annotations.fromStack(centralGovStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
    console.log(warnings);
    expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
    const errors = Annotations.fromStack(centralGovStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
    console.log(errors);
    expect(errors).toHaveLength(0);
});

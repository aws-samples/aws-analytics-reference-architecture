// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataDomainRegistration
 *
 * @group unit/best-practice/data-domain-registration
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { App, Stack, Aspects, RemovalPolicy, Aws } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks } from 'cdk-nag';
import { DataDomainRegistration } from '../../../src/data-mesh'


const mockApp = new App();

const dataDomainRegStack = new Stack(mockApp, 'dataDomainReg');

const eventBus = new EventBus(dataDomainRegStack, 'centralEventBus', {
    eventBusName: `${Aws.ACCOUNT_ID}_centralEventBus`,
});
eventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

new DataDomainRegistration(dataDomainRegStack, 'registerMyDomain', {
    dataDomainAccId: '1234567891011',
    dataDomainRegion: 'us-east-1',
    eventBusName: eventBus.eventBusName,
})

Aspects.of(dataDomainRegStack).add(new AwsSolutionsChecks());

test('No unsuppressed Warnings', () => {
    const warnings = Annotations.fromStack(dataDomainRegStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
    console.log(warnings);
    expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
    const errors = Annotations.fromStack(dataDomainRegStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
    console.log(errors);
    expect(errors).toHaveLength(0);
});

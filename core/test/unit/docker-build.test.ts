// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests for the custom resource to build images
 *
 * @group unit/docker-image-builder
 */

import { RemovalPolicy, Stack } from 'aws-cdk-lib';

import { Template, Match } from 'aws-cdk-lib/assertions';
import { EmrEksImageBuilder } from '../../src/docker-builder'


describe('EmrEksJobTemplateProvider', () => {
    const EmrEksImageBuilderStack = new Stack();


    const publish = new EmrEksImageBuilder(EmrEksImageBuilderStack, 'test', {
        repositoryName: 'my-repo',
        ecrRemovalPolicy: RemovalPolicy.RETAIN
    });

    publish.publishImage('./', 'v4');

    const template = Template.fromStack(EmrEksImageBuilderStack);

    test('Docker image builder Custome resource', () => {

        // Test if EmrEksJobTemplateProvider is a singleton
        // It should only contain 3 AWS Lambda function (2 for the Provider framework and 1 for CR)
        template.resourceCountIs('AWS::Lambda::Function', 8);
        // It should only contain 3 Amazon IAM Role (1 for onEvent, 2 for the Provider framework)
        template.resourceCountIs('AWS::IAM::Role', 11);
    });

    test('Docker image builder Custome resource should contain the IAM policies to start codebuild job', () => {
        template.hasResourceProperties('AWS::IAM::ManagedPolicy',
            Match.objectLike({
                PolicyDocument:
                {
                    Statement: Match.arrayWith([
                        Match.objectLike({
                            Action: ['codebuild:BatchGetBuilds', 'codebuild:StartBuild'],
                            Effect: 'Allow',
                        }),
                    ]),
                },
            }));
    });

    test('Verify the permissions of codebuild project', () => {
        template.hasResourceProperties('AWS::IAM::Policy',
            Match.objectLike({
                PolicyDocument:
                {
                    Statement: Match.arrayWith([
                        Match.objectLike({
                            Action: [
                                'ecr:BatchGetImage',
                                'ecr:GetAuthorizationToken',
                                'ecr:BatchCheckLayerAvailability',
                                'ecr:GetDownloadUrlForLayer'
                            ],
                            Effect: 'Allow',
                        }),
                    ]),
                },
            }));
    });
});

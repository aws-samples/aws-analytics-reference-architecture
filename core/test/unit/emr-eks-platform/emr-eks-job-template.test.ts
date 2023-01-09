// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Amazon EMR Managed Endpoint custom resource provider
 *
 * @group unit/emr-eks-platform/job-template-provider
 */

import { Stack } from 'aws-cdk-lib';

import { Template, Match } from 'aws-cdk-lib/assertions';
import { EmrEksJobTemplateProvider } from '../../../src/emr-eks-platform/emr-eks-job-template';


describe('EmrEksJobTemplateProvider', () => {
  const EmrEksJobTemplateProviderStack = new Stack();


  new EmrEksJobTemplateProvider(EmrEksJobTemplateProviderStack, 'test');

  const template = Template.fromStack(EmrEksJobTemplateProviderStack);

  test('EmrEksJobTemplateProvider contains the right number of resources', () => {

    // Test if EmrEksJobTemplateProvider is a singleton
    // It should only contain 3 AWS Lambda function (2 for the Provider framework and 1 for CR)
    template.resourceCountIs('AWS::Lambda::Function', 3);
    // It should only contain 3 Amazon IAM Role (1 for onEvent, 2 for the Provider framework)
    template.resourceCountIs('AWS::IAM::Role', 3);
  });

  test('EmrEksJobTemplateProvider contains the right permissions', () => {
    template.hasResourceProperties('AWS::IAM::ManagedPolicy',
      Match.objectLike({
        PolicyDocument:
        {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: 'emr-containers:DeleteJobTemplate',
              Condition: {
                StringEquals: { 'aws:ResourceTag/for-use-with': 'cdk-analytics-reference-architecture' },
              },
              Effect: 'Allow',
            }),
            Match.objectLike({
              Action: ['emr-containers:CreateJobTemplate', 'emr-containers:TagResource'],
              Condition: {
                StringEquals: { 'aws:RequestTag/for-use-with': 'cdk-analytics-reference-architecture' },
              },
              Effect: 'Allow',
            }),
          ]),
        },
      }));
  });
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Amazon EMR Managed Endpoint custom resource provider 
 *
 * @group unit/emr-eks-platform/managed-endpoint-provider
 */

import { Stack } from 'aws-cdk-lib';
import { EmrManagedEndpointProvider } from '../../../src/emr-eks-platform/emr-managed-endpoint';

import { Template, Match} from 'aws-cdk-lib/assertions';
import { AraBucket } from '../../../src/ara-bucket';


describe ('ManagedEndpointProvider', () => {
  const ManagedEndpointProviderStack = new Stack();

  const assetBucket = AraBucket.getOrCreate(ManagedEndpointProviderStack, { bucketName: 'asset'});
  new EmrManagedEndpointProvider(ManagedEndpointProviderStack, 'test', { assetBucket: assetBucket});

  const template = Template.fromStack(ManagedEndpointProviderStack);

  test('ManagedEndpointProvider contains the right number of resources', () => {

    // Test if ManagedEndpointProvider is a singleton
    // It should only contain 7 AWS Lambda function (2 for onEvent and isComplete, 3 for the Provider framework, 2 for deleting bucket content with CDK)
    template.resourceCountIs('AWS::Lambda::Function', 7);
    // It should only contain 9 Amazon IAM Role (2 for onEvent and isComplete, 4 for the Provider framework, 3 for buckets)
    template.resourceCountIs('AWS::IAM::Role', 9);
  });

  test('EmrManagedEndpointPorvider contains the right permissions', () => {
    template.hasResourceProperties('AWS::IAM::ManagedPolicy', 
      Match.objectLike({
        PolicyDocument: 
        {
          Statement: Match.arrayWith([
            {
              Action: [
                's3:GetObject*',
                's3:GetBucket*',
                's3:List*',
              ],
              Effect: 'Allow',
              Resource: {
                "Fn::GetAtt": [
                  Match.anyValue(),
                  "Arn"
                ],
              },
            },
            {
              Action: [
                'emr-containers:DescribeManagedEndpoint',
                'emr-containers:DeleteManagedEndpoint',
              ],
              Condition: {
                StringEquals: { 'aws:ResourceTag/for-use-with': 'cdk-analytics-reference-architecture' } 
              },
              Effect: 'Allow',
              Resource: '*',
            },
            Match.objectLike({
              Action: 'emr-containers:CreateManagedEndpoint',
              Condition: { 
                StringEquals: { 'aws:ResourceTag/for-use-with': 'cdk-analytics-reference-architecture' }
              },
              Effect: 'Allow',
            }),
            Match.objectLike({
              Action: 'emr-containers:TagResource',
              Condition: { 
                StringEquals: { 'aws:ResourceTag/for-use-with': 'cdk-analytics-reference-architecture' }
              },
              Effect: 'Allow',
            }),
            {
              Action: [
                'ec2:CreateSecurityGroup',
                'ec2:DeleteSecurityGroup',
                'ec2:AuthorizeSecurityGroupEgress',
                'ec2:AuthorizeSecurityGroupIngress',
                'ec2:RevokeSecurityGroupEgress',
                'ec2:RevokeSecurityGroupIngress',
              ],
              Effect: 'Allow',
              Resource: '*',
            },
          ]),
        },
      }));
  });
});
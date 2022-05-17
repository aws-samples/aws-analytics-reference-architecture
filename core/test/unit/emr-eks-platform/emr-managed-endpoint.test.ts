// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Amazon EMR Managed Endpoint custom resource provider 
 *
 * @group unit/other/emr-eks-cluster
 */

import { Stack } from 'aws-cdk-lib';
import { EmrManagedEndpointProvider } from '../../../src/emr-eks-platform/emr-managed-endpoint';
import { Template, Match} from 'aws-cdk-lib/assertions';


describe ('ManagedEndpointProvider', () => {
  const ManagedEndpointProviderStack = new Stack();
  new EmrManagedEndpointProvider(ManagedEndpointProviderStack, 'test');

  const template = Template.fromStack(ManagedEndpointProviderStack);

  test('ManagedEndpointProvider contains the right number of resources', () => {

    // Test if ManagedEndpointProvider is a singleton
    // It should only contain 5 AWS Lambda function (2 for onEvent and isComplete, 3 for the Provider framework)
    template.resourceCountIs('AWS::Lambda::Function', 6);
    // It should only contain 6 Amazon IAM Role (2 for onEvent and isComplete, 4 for the Provider framework)
    template.resourceCountIs('AWS::IAM::Role', 7);
  });

  test('EmrManagedEndpointPorvider contains the right permissions', () => {
    template.hasResourceProperties('AWS::IAM::Policy', 
      Match.objectLike({
        PolicyDocument: 
        {
          Statement: Match.arrayEquals([
            {
              Action: [
                's3:GetObject*',
                's3:GetBucket*',
                's3:List*',
              ],
              Effect: 'Allow',
              Resource: '*',
            },
            {
              Action: [
                'acm:ImportCertificate',
                'acm:DescribeCertificate',
              ],
              Effect: 'Allow',
              Resource: '*',
            },
            {
              Action: [
                'emr-containers:DescribeManagedEndpoint',
                'emr-containers:CreateManagedEndpoint',
                'emr-containers:DeleteManagedEndpoint',
              ],
              Effect: 'Allow',
              Resource: '*',
            },
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
            {
              Action: 'kms:Decrypt',
              Effect: 'Allow',
              Resource: '*',
            },
          ]),
        },
      }));
  });
});
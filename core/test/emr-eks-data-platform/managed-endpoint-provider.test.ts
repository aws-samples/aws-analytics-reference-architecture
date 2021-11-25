// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Stack } from '@aws-cdk/core';
import { ManagedEndpointProvider } from '../../src/emr-eks-data-platform/managed-endpoint-provider';
import '@aws-cdk/assert/jest';
//import * as assertCDK from '@aws-cdk/assert';


test('ManagedEndpointProvider', () => {

  const ManagedEndpointProviderStack = new Stack();

  // Instantiate 2 ManagedEndpointProvider Constructs
  ManagedEndpointProvider.getOrCreate(ManagedEndpointProviderStack, 'test');
  ManagedEndpointProvider.getOrCreate(ManagedEndpointProviderStack, 'test');

  // Test if ManagedEndpointProvider is a singleton
  // It should only contain 6 AWS Lambda function (2 for onEvent and isComplete, 4 for the Provider framework)
  expect(ManagedEndpointProviderStack).toCountResources('AWS::Lambda::Function', 6);
  // It should only contain 5 Amazon IAM Role (2 for onEvent and isComplete, 4 for the Provider framework)
  expect(ManagedEndpointProviderStack).toCountResources('AWS::IAM::Role', 7);


  // expect(ManagedEndpointProviderStack).toHaveResource('AWS::IAM::Role', {
  //   AssumeRolePolicyDocument: {
  //     Statement: [
  //       {
  //         Action: 'sts:AssumeRole',
  //         Effect: 'Allow',
  //         Principal: {
  //           Service: 'lambda.amazonaws.com',
  //         },
  //       },
  //     ],
  //     Version: '2012-10-17',
  //   },
  //   Policies: [
  //     {
  //       PolicyDocument: assertCDK.objectLike({
  //         Statement: assertCDK.arrayWith(
  //           {
  //             Action: [
  //               's3:GetObject*',
  //               's3:GetBucket*',
  //               's3:List*',
  //             ],
  //             Effect: 'Allow',
  //             Resource: '*',
  //           },
  //           {
  //             Action: [
  //               'acm:ImportCertificate',
  //               'acm:DescribeCertificate',
  //             ],
  //             Effect: 'Allow',
  //             Resource: '*',
  //           },
  //           {
  //             Action: [
  //               'emr-containers:CreateManagedEndpoint',
  //               'emr-containers:DeleteManagedEndpoint',
  //               'emr-containers:DescribeManagedEndpoint',
  //             ],
  //             Effect: 'Allow',
  //             Resource: '*',
  //           },
  //           {
  //             Action: [
  //               'ec2:CreateSecurityGroup',
  //               'ec2:DeleteSecurityGroup',
  //               'ec2:AuthorizeSecurityGroupEgress',
  //               'ec2:AuthorizeSecurityGroupIngress',
  //               'ec2:RevokeSecurityGroupEgress',
  //               'ec2:RevokeSecurityGroupIngress',
  //             ],
  //             Effect: 'Allow',
  //             Resource: '*',
  //           },
  //           {
  //             Action: 'kms:Decrypt',
  //             Effect: 'Allow',
  //             Resource: '*',
  //           }),
  //       }),
  //       PolicyName: 'ManagedEndpointProvider',
  //     },
  //   ],
  // });
});
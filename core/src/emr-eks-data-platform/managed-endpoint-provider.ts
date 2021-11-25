// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Construct, Duration, Stack } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';


/**
 * ManagedEndpointProvider Construct implementing a custom resource provider for managing Amazon EMR on Amazon EKS Managed Endpoints.
 */
export class ManagedEndpointProvider extends Construct {

  /**
   * Get the ManagedEndpointProvider from the AWS CDK Stack based on the provided ID.
   * If no ManagedEndpointProvider exists, creates a new one.
   * @param {Construct} scope The scope of the CDK Construct to search
   * @param {string} id The ID of the ManagedEndpointProvider to retrieve
   * @returns
   */
  public static getOrCreate(scope: Construct, id: string) {
    const stack = Stack.of(scope);
    return stack.node.tryFindChild(id) as ManagedEndpointProvider || new ManagedEndpointProvider(scope, id);
  }
  /**
   * The custom resource Provider for creating Amazon EMR Managed Endpoints custom resources
   */
  public readonly provider: Provider;

  /**
   * Constructs a new instance of the ManageEndpointProvider. The provider can then be used to create Amazon EMR on EKS Managed Endpoint custom resources
   * @param { Construct} scope the Scope of the CDK Construct
   * @param id the ID of the CDK Construct
   */

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create the custom resource provider for adding managed endpoints to the cluster
    const lambdaPath = 'lambdas/managed-endpoint';

    const lambdaPolicy = [
      new PolicyStatement({
        resources: ['*'],
        actions: ['s3:GetObject*', 's3:GetBucket*', 's3:List*'],
      }),
      new PolicyStatement({
        resources: ['*'],
        actions: ['acm:ImportCertificate', 'acm:DescribeCertificate'],
      }),
      new PolicyStatement({
        resources: ['*'],
        actions: ['emr-containers:DescribeManagedEndpoint',
          'emr-containers:CreateManagedEndpoint',
          'emr-containers:DeleteManagedEndpoint'],
      }),
      new PolicyStatement({
        resources: ['*'],
        actions: [
          'ec2:CreateSecurityGroup',
          'ec2:DeleteSecurityGroup',
          'ec2:AuthorizeSecurityGroupEgress',
          'ec2:AuthorizeSecurityGroupIngress',
          'ec2:RevokeSecurityGroupEgress',
          'ec2:RevokeSecurityGroupIngress',
        ],
      }),
      new PolicyStatement({
        resources: ['*'],
        actions: ['kms:Decrypt'],
      }),
    ];

    // AWS Lambda function supporting the create, update, delete operations on Amazon EMR on EKS managed endpoints
    const onEvent = new Function(this, 'ManagedEndpointOnEvent', {
      code: Code.fromAsset(path.join(__dirname, lambdaPath)),
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.onEvent',
      timeout: Duration.seconds(120),
      environment: {
        REGION: Stack.of(this).region,
      },
      initialPolicy: lambdaPolicy,
    });

    // AWS Lambda supporting the status check on asynchronous create, update and delete operations
    const isComplete = new Function(this, 'ManagedEndpointIsComplete', {
      code: Code.fromAsset(path.join(__dirname, lambdaPath)),
      handler: 'index.isComplete',
      runtime: Runtime.NODEJS_12_X,
      timeout: Duration.seconds(120),
      environment: {
        REGION: Stack.of(this).region,
      },
      initialPolicy: lambdaPolicy,
    });

    this.provider = new Provider(this, `CustomResourceProvider${id}`, {
      onEventHandler: onEvent,
      isCompleteHandler: isComplete,
      logRetention: RetentionDays.ONE_DAY,
      totalTimeout: Duration.minutes(30),
      queryInterval: Duration.seconds(20),
    });
  }
}
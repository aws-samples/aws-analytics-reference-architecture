// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { IRole, PolicyStatement } from '@aws-cdk/aws-iam';
import { Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { IBucket } from '@aws-cdk/aws-s3';
import { Construct, Duration, Aws } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';
import { PreBundledFunction } from '../common/pre-bundled-function';


/**
* The properties for the EMR Managed Endpoint to create.
*/
export interface EmrManagedEndpointOptions {
  /**
   * The name of the EMR managed endpoint
   */
  readonly managedEndpointName: string;
  /**
   * The Id of the Amazon EMR virtual cluster containing the managed endpoint
   */
  readonly virtualClusterId: string;
  /**
   * The Amazon IAM role used as the execution role, this role must provide access to all the AWS resource a user will interact with
   * These can be S3, DynamoDB, Glue Catalog
   */
  readonly executionRole: IRole;
  /**
   * The Amazon EMR version to use
   * @default - The [default Amazon EMR version]{@link EmrEksCluster.DEFAULT_EMR_VERSION}
   */
  readonly emrOnEksVersion?: string;
  /**
   * The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint
   * @default - Configuration related to the [default nodegroup for notebook]{@link EmrEksNodegroup.NOTEBOOK_EXECUTOR}
   */
  readonly configurationOverrides?: string;
}


/**
 * The properties for the EMR on EKS Managed Endpoint to create.
 * @private
 */
export interface EmrManagedEndpointProviderProps {
  /**
   * The bucket containing the k8s assets, in this case the pod templates
   */
  readonly assetBucket: IBucket;
}

/**
 * A custom resource provider for CRUD operations on Amazon EMR on EKS Managed Endpoints.
 * @private
 */
export class EmrManagedEndpointProvider extends Construct {
  /**
   * The custom resource Provider for creating Amazon EMR Managed Endpoints custom resources
   * @private
   */
  public readonly provider: Provider;

  /**
   * Constructs a new instance of the ManageEndpointProvider. The provider can then be used to create Amazon EMR on EKS Managed Endpoint custom resources
   * @param { Construct} scope the Scope of the CDK Construct
   * @param id the ID of the CDK Construct
   * @private
   */

  constructor(scope: Construct, id: string, props: EmrManagedEndpointProviderProps) {
    super(scope, id);

    //The policy allowing the managed endpoint custom resource to create call the APIs for managed endpoint
    const lambdaPolicy = [
      new PolicyStatement({
        resources: [props.assetBucket.bucketArn],
        actions: ['s3:GetObject*', 's3:GetBucket*', 's3:List*'],
      }),
      new PolicyStatement({
        resources: ['*'],
        actions: ['emr-containers:DescribeManagedEndpoint',
          'emr-containers:DeleteManagedEndpoint'],
        conditions: { StringEquals: { 'aws:ResourceTag/for-use-with': 'cdk-analytics-reference-architecture' } },
      }),
      new PolicyStatement({
        resources: [`arn:${Aws.PARTITION}:emr-containers:${Aws.REGION}:${Aws.ACCOUNT_ID}:/virtualclusters/*`],
        actions: ['emr-containers:CreateManagedEndpoint'],
        conditions: { StringEquals: { 'aws:ResourceTag/for-use-with': 'cdk-analytics-reference-architecture' } },
      }),
      new PolicyStatement({
        resources: [`arn:${Aws.PARTITION}:emr-containers:${Aws.REGION}:${Aws.ACCOUNT_ID}:/virtualclusters/*`],
        actions: ['emr-containers:TagResource'],
        conditions: { StringEquals: { 'aws:ResourceTag/for-use-with': 'cdk-analytics-reference-architecture' } },
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
    ];

    // AWS Lambda function supporting the create, update, delete operations on Amazon EMR on EKS managed endpoints
    const onEvent = new PreBundledFunction(this, 'OnEvent', {
      codePath: 'emr-eks-platform/resources/lambdas/managed-endpoint',
      runtime: Runtime.PYTHON_3_8,
      handler: 'lambda.on_event',
      name: 'EmrManagedEndpointProviderOnEvent',
      lambdaPolicyStatements: lambdaPolicy,
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(120),
    });

    // AWS Lambda supporting the status check on asynchronous create, update and delete operations
    const isComplete = new PreBundledFunction(this, 'IsComplete', {
      codePath: 'emr-eks-platform/resources/lambdas/managed-endpoint',
      handler: 'lambda.is_complete',
      name: 'EmrManagedEndpointProviderIsComplete',
      lambdaPolicyStatements: lambdaPolicy,
      runtime: Runtime.PYTHON_3_8,
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(120),
    });

    this.provider = new Provider(this, 'CustomResourceProvider', {
      onEventHandler: onEvent,
      isCompleteHandler: isComplete,
      totalTimeout: Duration.minutes(30),
      queryInterval: Duration.seconds(20),
      providerFunctionName: 'managedEndpointProviderFn',
    });

  }
}

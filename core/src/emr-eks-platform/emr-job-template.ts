// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Duration } from 'aws-cdk-lib';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { Construct } from 'constructs';
import { PreBundledLayer } from '../common/pre-bundled-layer';


/**
* The properties for the EMR Managed Endpoint to create.
*/
export interface EmrEksJobTemplateDefinition {
    /**
     * The name of the job template
     */
    readonly name: string;
    /**
     * The JSON definition of the job template
     */
    readonly jobTemplateData: string;
  }

/**
 * A custom resource provider for CRUD operations on Amazon EMR on EKS Managed Endpoints.
 * @private
 */
export class EmrEksJobTemplateProvider extends Construct {
  /**
   * The custom resource Provider for creating Amazon EMR Managed Endpoints custom resources
   */
  public readonly provider: Provider;

  /**
   * Constructs a new instance of the ManageEndpointProvider. The provider can then be used to create Amazon EMR on EKS Managed Endpoint custom resources
   * @param { Construct} scope the Scope of the CDK Construct
   * @param id the ID of the CDK Construct
   * @private
   */

  constructor(scope: Construct, id: string) {
    super(scope, id);

    //The policy allowing the creatio of the job template
    const lambdaPolicy = [
      new PolicyStatement({
        resources: ['*'],
        actions: ['emr-containers:CreateJobTemplate',
          'emr-containers:DescribeJobTemplate'],
        conditions: { StringEquals: { 'aws:RequestTag/for-use-with': 'cdk-analytics-reference-architecture' } }
      }),
    ];

    // AWS Lambda function supporting the create, update, delete operations on Amazon EMR on EKS managed endpoints
    const onEvent = new PreBundledFunction(this, 'OnEvent', {
      codePath: 'emr-eks-platform/resources/lambdas/job-template',
      runtime: Runtime.PYTHON_3_9,
      handler: 'lambda.on_event',
      layers: [PreBundledLayer.getOrCreate(scope, 'common/resources/lambdas/pre-bundled-layer')],
      lambdaPolicyStatements: lambdaPolicy,
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(120),
    });

    this.provider = new Provider(this, 'CustomResourceProvider', {
      onEventHandler: onEvent,
      providerFunctionName: 'jobTemplateFn',
    });

  }
}

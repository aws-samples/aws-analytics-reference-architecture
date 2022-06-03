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
//import { ScopedIamProvider } from '../common/scoped-iam-customer-resource';


/**
* The properties for the EmrEksNodegroupAsgTagsProvider Construct class.
 * @private
*/
export interface EmrEksNodegroupAsgTagProviderProps {
  /**
   * The name of the EKS cluster
   * @private
   */
  readonly eksClusterName: string;
}

/**
 * EmrEksNodegroupAsgTagsProvider Construct implementing a custom resource provider for tagging EC2 Auto Scaling Group of EmrEksNodegroup.
 * By default EKS Managed Nodegroups are using EC2 Auto Scaling Group that are not tagged for Kubernetes Cluster Autoscaler usage.
 * If minimum number of node is 0, the Cluster Autoscaler is [not able to scale the nodegroup](https://github.com/aws/containers-roadmap/issues/724)
 */
export class EmrEksNodegroupAsgTagProvider extends Construct {

  /**
   * The custom resource Provider for creating custom resources
   */
  public readonly provider: Provider;

  /**
   * Constructs a new instance of the ManageEnEmrEksNodegroupAsgTagsProviderdpointProvider.
   * The provider can then be used to create custom resources for tagging EC2 Auto Scaling group
   * @param { Construct} scope the Scope of the CDK Construct
   * @param id the ID of the CDK Construct
   */

  constructor(scope: Construct, id: string, props: EmrEksNodegroupAsgTagProviderProps) {
    super(scope, id);

    //The policy allowing asg Tag custom resource call autoscaling api
    const lambdaPolicy = [
      new PolicyStatement({
        resources: ['*'],
        actions: [
          'autoscaling:DescribeAutoScalingGroups',
        ],
      }),
      new PolicyStatement({
        resources: ['*'],
        actions: [
          'autoscaling:CreateOrUpdateTags',
          'autoscaling:DeleteTags',
        ],
        conditions: {
          'ForAnyValue:StringEquals': {
            'aws:ResourceTag/eks:cluster-name': props.eksClusterName,
          },
        },
      }),
    ];

    // AWS Lambda function supporting the create, update, delete operations on Amazon EMR on EKS managed endpoints
    const onEvent = new PreBundledFunction(this, 'OnEvent', {
      runtime: Runtime.PYTHON_3_9,
      codePath: 'emr-eks-platform/resources/lambdas/nodegroup-asg-tag',
      handler: 'lambda.on_event',
      name: 'EmrEksNodegroupAsgTagOnEventFn',
      lambdaPolicyStatements: lambdaPolicy,
      logRetention: RetentionDays.ONE_WEEK,
      layers: [PreBundledLayer.getOrCreate(scope, 'common/resources/lambdas/pre-bundled-layer')],
      timeout: Duration.seconds(45),
      environment: {
        EKS_CLUSTER_NAME: props.eksClusterName,
      },
    });

    this.provider = new Provider(this, 'CustomResourceProvider', {
      onEventHandler: onEvent,
    });
  }
}

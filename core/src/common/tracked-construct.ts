// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
/**
 * The properties for the TrackedConstructProps construct.
 */
export interface TrackedConstructProps {
  /**
   * Unique code used to measure the number of the CloudFormation deployments
   */
  trackingCode: string;
}

/**
 * A type of CDK Construct that is tracked via a unique code in Stack labels. 
 * It is  used to measure the number of deployments and so the impact of the Analytics Reference Architecture.
 */
export class TrackedConstruct extends Construct {

  /**
   * Constructs a new instance of the TrackedConstruct
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {TrackedConstructProps} props the TrackedConstruct [properties]{@link TrackedConstructProps}
   */
  constructor(scope: Construct, id: string, props: TrackedConstructProps) {
    super(scope, id);

    if (!scope.node.tryGetContext('@aws-analytics-reference-architecture/disableConstructsDeploymentTracking')) {
      const stack = cdk.Stack.of(this);
      const description = `${stack.templateOptions.description} (${props.trackingCode})`;
      stack.templateOptions.description = description;
    }
  }
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';

/**
 * The properties for defining a Managed Endpoint
 * The interface is used to create a managed Endpoint which can be leveraged by multiple users
 */
export interface NotebookManagedEndpointOptions {
  /**
     * The version of Amazon EMR to deploy
     * */
  readonly emrOnEksVersion?: string;

  /**
     * The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint
     * an example can be found [here]
     * (https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/core/src/emr-eks-data-platform/resources/k8s/emr-eks-config/critical.json)
     */
  readonly configurationOverrides?: any;

  /**
     * The name of the policy to be used for the execution Role to pass to ManagedEndpoint,
     * this role should allow access to any resource needed for the job including: Amazon S3 buckets, Amazon DynamoDB, AWS Glue Data Catalog
     * */
  readonly executionPolicy: ManagedPolicy;

  /**
   * The name of the managed endpoint
   * if no name is provided then the name of the policy associated with managed endpoint will be used as a name
   * */
  readonly managedEndpointName: string;
}

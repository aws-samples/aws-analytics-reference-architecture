// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * The properties for defining a user.
 * The interface is used to create and assign a user or a group to a Amazon EMR Studio
 */
export interface NotebookUserOptions {
  /**
   * Name of the identity as it appears in AWS SSO console, or the name to be given to a user in IAM_AUTHENTICATED
   * */
  readonly identityName: string;
  /**
   * Type of the identity either GROUP or USER, to be used when SSO is used as an authentication mode
   * */
  readonly identityType?: string;
  /**
   * The name of the policy to be used for the execution Role to pass to ManagedEndpoint,
   * this role should allow access to any resource needed for the job including: Amazon S3 buckets, Amazon DynamoDB
   * */
  readonly executionPolicyNames: string [];
  /**
   * The version of Amazon EMR to deploy
   * */
  readonly emrOnEksVersion?: string;
  /**
   * The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint
   * @default - Configuration related to the [default nodegroup for notebook]{@link EmrEksNodegroup.NOTEBOOK_EXECUTOR}
   */
  readonly configurationOverrides?: string;
}
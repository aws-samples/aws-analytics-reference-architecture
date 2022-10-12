// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { IUser } from 'aws-cdk-lib/aws-iam';
import { NotebookManagedEndpointOptions } from './notebook-managed-endpoint';

/**
 * The properties for defining a user.
 * The interface is used to create and assign a user or a group to an Amazon EMR Studio
 */
export interface NotebookUserOptions {
  /**
   * Name of the identity as it appears in AWS IAM Identity Center console, or the IAM user to be used when IAM authentication is chosen
   * */
  readonly identityName?: string;

  /**
   * IAM User for EMR Studio, if both iamUser and identityName are provided, the iamUser will have precedence
   * and will be used for EMR Studio
   *
   * if your IAM user is created in the same CDK stack you can pass the USER object
   * */
  readonly iamUser?: IUser;

  /**
   * Required
   * Type of the identity either GROUP or USER, to be used when SSO is used as an authentication mode
   * {@see SSOIdentityType}
   * */
  readonly identityType?: string;

  /**
   * Required
   * Array of {@link NotebookManagedEndpointOptions} this defines the managed endpoint the notebook/workspace user will have access to
   * */
  readonly notebookManagedEndpoints: NotebookManagedEndpointOptions [];

}

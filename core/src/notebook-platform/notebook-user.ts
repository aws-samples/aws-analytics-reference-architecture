// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyDocument } from '@aws-cdk/aws-iam';
import { NotebookManagedEndpointOptions } from './notebook-managed-endpoint';

/**
 * The properties for defining a user.
 * The interface is used to create and assign a user or a group to an Amazon EMR Studio
 */
export interface NotebookUserOptions {
  /**
   * Required
   * Name of the identity as it appears in AWS SSO console, or the name to be given to a user in IAM_AUTHENTICATED
   * */
  readonly identityName: string;

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

  /**
   * The iam policy to be applied for the user, if no policy is provided a default one would be applied to the user
   * */
  readonly userIamPolicy?: PolicyDocument;

}

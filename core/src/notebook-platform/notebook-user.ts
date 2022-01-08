// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { NotebookManagedEndpointOptions } from './notebook-managed-endpoint';

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

  readonly notebookManagedEndpoints: NotebookManagedEndpointOptions [];

}

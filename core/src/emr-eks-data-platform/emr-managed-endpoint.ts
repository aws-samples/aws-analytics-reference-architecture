// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { IRole } from '@aws-cdk/aws-iam';

/**
 * The properties for the EmrVirtualCluster Construct class.
 */
export interface EmrManagedEndpointOptions {
  /**
     * The Id of the Amazon EMR virtual cluster containing the managed endpoint
     */
  readonly virtualClusterId: string;
  /**
     * The Amazon IAM role used as the execution role
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

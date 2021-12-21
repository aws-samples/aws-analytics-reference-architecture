// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * The properties for the EmrVirtualCluster Construct class.
 */
export interface EmrVirtualClusterOptions {
  /**
   * name of the Amazon Emr virtual cluster to be created
   */
  readonly name: string;
  /**
   * name of the Amazon EKS namespace to be linked to the Amazon EMR virtual cluster
   * @default - Use the default namespace
   */
  readonly eksNamespace?: string;
  /**
   * creates Amazon EKS namespace
   * @default - Do not create the namespace
   */
  readonly createNamespace?: boolean;
}

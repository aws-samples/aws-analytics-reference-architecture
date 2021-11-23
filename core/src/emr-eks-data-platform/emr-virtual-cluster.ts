// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * The properties for the EmrVirtualCluster Construct class.
 */
export interface EmrVirtualClusterProps {
  /**
   * name of the  EmrVirtualCluster to be created
   */
  readonly name: string;
  /**
   * name of the  EKS namespace to be linked to the EMR virtual Cluster
   * @default - Use the default namespace
   */
  readonly eksNamespace?: string;
  /**
   * creates EKS namespace
   * @default - Do not create the namespace
   */
  readonly createNamespace?: boolean;
}

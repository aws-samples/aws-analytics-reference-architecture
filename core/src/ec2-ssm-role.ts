// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Role, RoleProps, ManagedPolicy } from '@aws-cdk/aws-iam';
import { Construct } from '@aws-cdk/core';

/**
 * @summary Construct extending IAM Role with AmazonSSMManagedInstanceCore managed policy
 */

export class Ec2SsmRole extends Role {

  /**
   * Constructs a new instance of the Ec2SsmRole class.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {RoleProps} props the RoleProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: RoleProps) {
    super(scope, id, props);
    this.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
  }
}
import { Role, RoleProps, ManagedPolicy } from '@aws-cdk/aws-iam';
import { Construct } from '@aws-cdk/core';

/**
 * Construct extending IAM Role with AmazonSSMManagedInstanceCore managed policy
 */

export class Ec2SsmRole extends Role {

  /**
   * Constructs a new instance of the Ec2SsmRole class.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {RoleProps} props the RoleProps [properties]{@link RoleProps}
   * @since 1.0.0
   * @access public
   */

  constructor(scope: Construct, id: string, props: RoleProps) {
    super(scope, id, props);
    this.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
  }
}
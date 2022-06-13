import { Role, RoleProps, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { CfnDataLakeSettings } from 'aws-cdk-lib/aws-lakeformation';
import { Construct } from 'constructs';

/**
 * Construct extending IAM Role with managed and inline policies for LF admin. Adds this role as LF admin.
 */

export class LfAdminRole extends Role {

  /**
   * Constructs a new instance of the LfAdminRole class.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {RoleProps} props the RoleProps [properties]{@link RoleProps}
   * @access public
   */

  constructor(scope: Construct, id: string, props: RoleProps) {
    super(scope, id, props);
    this.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'));
    this.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSLakeFormationCrossAccountManager'));
    this.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSLakeFormationDataAdmin'));
    this.grantPassRole(this);

    // Add this role to LF admins
    new CfnDataLakeSettings(this, 'AddLfAdmin', {
      admins: [{ dataLakePrincipalIdentifier: this.roleArn }],
    });
  }
}

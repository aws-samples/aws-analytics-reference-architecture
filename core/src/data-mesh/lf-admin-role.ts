import { Role, RoleProps, ManagedPolicy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
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

    new ManagedPolicy(this, 'LFAdminPolicy', {
      statements: [
        new PolicyStatement({
          actions: [
            'lakeformation:*',
            'glue:GetDatabase',
            'glue:GetDatabases',
            'glue:CreateDatabase',
            'glue:UpdateDatabase',
            'glue:GetTable',
            'glue:GetTables',
            'glue:CreateTable',
            'glue:UpdateTable',
            'iam:GetRole'
          ],
          resources: ['*'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          actions: [
            'lakeformation:PutDataLakeSettings'
          ],
          resources: ['*'],
          effect: Effect.DENY,
        }),
        new PolicyStatement({
          actions: [
            'ram:CreateResourceShare'
          ],
          resources: ['*'],
          effect: Effect.ALLOW,
          conditions: {
            StringLikeIfExists: {
              'ram:RequestedResourceType': [
                'glue:Table',
                'glue:Database',
                'glue:Catalog'
              ]
            }
          }
        }),
        new PolicyStatement({
          actions: [
            'ram:UpdateResourceShare',
            'ram:AssociateResourceShare',
            'ram:GetResourceShares'
          ],
          resources: ['*'],
          effect: Effect.ALLOW,
          conditions: {
            StringLike: {
              'ram:ResourceShareName': [
                'LakeFormation*'
              ]
            }
          }
        }),
        new PolicyStatement({
          actions: [
            'glue:PutResourcePolicy',
            'ram:Get*',
            'ram:List*'
          ],
          resources: ['*'],
          effect: Effect.ALLOW,
        }),
      ],
      roles: [this],
    })

    this.grantPassRole(this);

    // Add this role to LF admins
    new CfnDataLakeSettings(this, 'AddLfAdmin', {
      admins: [{ dataLakePrincipalIdentifier: this.roleArn }],
    });
  }
}
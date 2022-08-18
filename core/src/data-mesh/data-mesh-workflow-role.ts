import { Role, ManagedPolicy, PolicyStatement, Effect, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { LakeFormationAdmin } from '../lake-formation';

/**
 * Construct extending IAM Role with managed and inline policies for LF admin. Adds this role as LF admin.
 */

export class DataMeshWorkflowRole extends Construct {

  public readonly role: Role;

  /**
   * Constructs a new instance of the LfAdminRole class.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {RoleProps} props the RoleProps [properties]{@link RoleProps}
   * @access public
   */

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.role = new Role(this, 'Role', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('states.amazonaws.com'),
      )
    });

    new ManagedPolicy(this, 'WorkflowRolePolicy', {
      statements: [
        new PolicyStatement({
          actions: [
            'lakeformation:*',
            'glue:GetDatabase',
            'glue:GetDatabases',
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
      roles: [this.role],
    })

    // Add this role to LF admins
    new LakeFormationAdmin(this, 'LfAdmin', {
      principal: this.role,
    });
  }
}

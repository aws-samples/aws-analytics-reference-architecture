import { Construct } from 'constructs';
import {
  aws_iam,
  aws_opensearchservice,
  RemovalPolicy,
  aws_secretsmanager,
  custom_resources,
  CustomResource,
  aws_lambda_nodejs,
  Stack,
  CfnOutput,
} from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';

export interface OpensearchClusterProps {
  readonly domainName?: string;
  readonly accessRoles: aws_iam.Role[];
  readonly adminUsername: string;
  readonly usernames: string[];
}

export class OpensearchCluster extends Construct {
  /**
   * Get an existing OpensearchCluster based on the cluster name property or create a new one
   * only one Opensearch cluster can exist per stack
   * @param {Construct} scope the CDK scope used to search or create the cluster
   * @param {OpensearchClusterProps} props the OpensearchClusterProps [properties]{@link OpensearchClusterProps} if created
   */
  public static getOrCreate(scope: Construct, props: OpensearchClusterProps) {
    const stack = Stack.of(scope);
    const id = props.domainName || OpensearchCluster.DEFAULT_DOMAIN_NAME;

    let opensearchCluster: OpensearchCluster;

    if (stack.node.tryFindChild(id) == undefined) {
      opensearchCluster = new OpensearchCluster(stack, id, props);
    }

    return (stack.node.tryFindChild(id) as OpensearchCluster) || opensearchCluster!;
  }

  public static readonly DEFAULT_DOMAIN_NAME = 'opensearch-platform';
  public readonly domainName: string;
  public readonly domain: aws_opensearchservice.Domain;
  private readonly apiFn: aws_lambda_nodejs.NodejsFunction;
  private readonly masterRole: aws_iam.Role;
  private prevCr?: CustomResource;

  /**
   * @public
   * Constructs a new instance of the OpensearchCluster class
   * @param {Construct} scope the Scope of the AWS CDK Construct
   * @param {string} id the ID of the AWS CDK Construct
   * @param {OpensearchClusterProps} props the OpensearchCluster [properties]{@link OpensearchClusterProps}
   */

  constructor(scope: Construct, id: string, props: OpensearchClusterProps) {
    super(scope, id);
    const { accessRoles, adminUsername, usernames } = props;

    this.domainName = props.domainName ?? OpensearchCluster.DEFAULT_DOMAIN_NAME;

    this.masterRole = new aws_iam.Role(this, 'AccessRole', {
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonOpenSearchServiceFullAccess'),
      ],
    });

    this.domain = new aws_opensearchservice.Domain(this, 'Domain', {
      domainName: this.domainName,
      removalPolicy: RemovalPolicy.DESTROY,
      version: aws_opensearchservice.EngineVersion.OPENSEARCH_1_0,
      useUnsignedBasicAuth: true,
      fineGrainedAccessControl: {
        masterUserArn: this.masterRole.roleArn,
      },
    });

    this.domain.addAccessPolicies(
      new aws_iam.PolicyStatement({
        actions: ['es:*'],
        effect: aws_iam.Effect.ALLOW,
        principals: [new aws_iam.AccountPrincipal(Stack.of(this).account)],
        resources: [this.domain.domainArn],
      })
    );
    this.apiFn = new aws_lambda_nodejs.NodejsFunction(this, 'api', {
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_18_X,
      environment: {
        REGION: Stack.of(this).region,
        ENDPOINT: this.domain.domainEndpoint,
      },
      role: this.masterRole,
    });

    this.addAdminUser(adminUsername, adminUsername);
    usernames.map((username) => this.addDasboardUser(username, username));

    accessRoles.map((accessRole) => this.addAccessRole(accessRole.toString(), accessRole));

    const awsCustom = new custom_resources.AwsCustomResource(this, 'EnableInternalUserDatabaseCR', {
      onCreate: {
        service: 'OpenSearch',
        action: 'updateDomainConfig',
        parameters: {
          DomainName: this.domain.domainName,
          AdvancedSecurityOptions: {
            InternalUserDatabaseEnabled: true,
          },
        },
        physicalResourceId: custom_resources.PhysicalResourceId.of('InternalUserDatabase'),
        outputPaths: ['DomainConfig.AdvancedSecurityOptions'],
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [this.domain.domainArn],
      }),
    });
    this.domain.grantReadWrite(awsCustom);
  }

  private apiCustomResource(id: string, path: string, body: any) {
    const provider = new custom_resources.Provider(this, 'Provider/' + id, {
      onEventHandler: this.apiFn,
    });
    const cr = new CustomResource(this, 'ApiCR/' + id, {
      serviceToken: provider.serviceToken,
      properties: {
        path,
        body,
      },
    });
    cr.node.addDependency(this.domain);
    if (this.prevCr) cr.node.addDependency(this.prevCr);
    this.prevCr = cr;
  }

  /**
   * Add a new role to the cluster.
   * This method is used to add an admin user to the Amazon opensearch cluster
   * @param {string} id a unique id
   * @param {string} username the username
   */
  public addAdminUser(id: string, username: string) {
    this.addUser(id, username, ['all_access', 'security_manager']);
  }

  /**
   * Add a new role to the cluster.
   * This method is used to add a dashboard user to the Amazon opensearch cluster
   * @param {string} id a unique id
   * @param {string} username the username
   */
  public addDasboardUser(id: string, username: string) {
    this.addUser(id, username, ['opensearch_dashboards_user']);
  }

  /**
   * Add a new role to the cluster.
   * This method is used to add a user to the Amazon opensearch cluster
   * @param {string} id a unique id
   * @param {string} username the username
   * @param {object} template the permissions template
   */
  public addUser(id: string, username: string, template: Array<string>) {
    const secret = new aws_secretsmanager.Secret(this, `${username}-Secret`, {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username }),
        generateStringKey: 'password',
      },
    });
    new CfnOutput(this, 'output-' + id, {
      description: 'Secret with Username & Password for user ' + username,
      value: secret.secretName,
    });
    secret.grantRead(this.masterRole);
    this.apiCustomResource(id, '_plugins/_security/api/internalusers/' + username, {
      passwordFieldSecretArn: secret.secretArn,
      opendistro_security_roles: template,
    });
  }

  /**
   * Add a new role to the cluster.
   * This method is used to add an access role to the Amazon opensearch cluster
   * @param {string} id a unique id
   * @param {aws_iam.Role} role the iam role
   */
  public addAccessRole(id: string, role: aws_iam.Role) {
    const name = role.roleName;
    this.domain.grantIndexReadWrite('*', role);
    this.domain.grantPathReadWrite('*', role);
    this.domain.grantReadWrite(role);

    this.addRole('role-' + id, name, {
      cluster_permissions: ['cluster_composite_ops', 'cluster_monitor'],
      index_permissions: [
        {
          index_patterns: ['*'],
          allowed_actions: ['crud', 'create_index', 'manage'],
        },
      ],
    });

    this.addRoleMapping('mapping-' + id, name, role);
  }

  /**
   * Add a new role to the cluster.
   * This method is used to add a security role to the Amazon opensearch cluster
   * @param {string} id a unique id
   * @param {string} name the role name
   * @param {object} template the permissions template
   */
  public addRole(id: string, name: string, template: object) {
    this.apiCustomResource(id, '_plugins/_security/api/roles/' + name, template);
  }

  /**
   * Add a new role to the cluster.
   * This method is used to add a role mapping to the Amazon opensearch cluster
   * @param {string} id a unique id
   * @param {string} name the role name
   * @param {aws_iam.Role} role the iam role
   */
  public addRoleMapping(id: string, name: string, role: aws_iam.Role) {
    this.apiCustomResource(id, '_plugins/_security/api/rolesmapping/' + name, {
      backend_roles: [role.roleArn],
    });
  }

  /**
   * Add a new role to the cluster.
   * This method is used to add an index to the Amazon opensearch cluster
   * @param {string} id a unique id
   * @param {string} name the role name
   * @param {object} template the permissions template
   */
  public addIndex(id: string, name: string, template: any) {
    this.apiCustomResource(id, '/' + name, template);
  }

  /**
   * Add a new role to the cluster.
   * This method is used to add a rollup strtegy to the Amazon opensearch cluster
   * @param {string} id a unique id
   * @param {string} name the role name
   * @param {object} template the permissions template
   */
  public addRollupStrategy(id: string, name: string, template: any) {
    this.apiCustomResource(id, '_plugins/_rollup/jobs/' + name, template);
  }
}

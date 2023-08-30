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
    // const slr = new aws_iam.CfnServiceLinkedRole(this, 'Service Linked Role', {
    //   awsServiceName: 'es.amazonaws.com',
    // });

    this.domainName = props.domainName ?? OpensearchCluster.DEFAULT_DOMAIN_NAME;

    this.masterRole = new aws_iam.Role(this, 'AccessRole', {
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonOpenSearchServiceFullAccess'),
        // ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
      ],
    });
    // const masterRole = aws_iam.Role.fromRoleName(this, 'AccessRole', 'l3master');

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

    this.addAdminUser(adminUsername);
    usernames.map((username) => this.addDasboardUser(username));

    accessRoles.map((accessRole) => this.addAccessRole(accessRole));

    // const domain = aws_opensearchservice.Domain.fromDomainEndpoint(
    //   this,
    //   'Domain',
    //   'https://search-aaa-ry3e2cedp3wnt24ntku4tfcyry.eu-west-1.es.amazonaws.com'
    // );

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

    // const bootstrapFn = new aws_lambda_nodejs.NodejsFunction(this, 'bootstrap', {
    //   timeout: Duration.minutes(1),
    //   architecture: Architecture.ARM_64,
    //   runtime: Runtime.NODEJS_18_X,
    //   environment: {
    //     REGION: Stack.of(this).region,
    //     ENDPOINT: domain.domainEndpoint,
    //   },
    //   role: this.masterRole,
    // });

    // domain.grantIndexReadWrite('*', bootstrapFn);
    // domain.grantPathReadWrite('*', bootstrapFn);
    // domain.grantReadWrite(bootstrapFn);

    // const provider = new custom_resources.Provider(this, 'BootstrapProvider', {
    //   onEventHandler: bootstrapFn,
    // });
    // new CustomResource(this, 'BootstrapCR', {
    //   serviceToken: provider.serviceToken,
    //   properties: {
    //     accessRolesArns: accessRoles.map((role) => role.roleArn),
    //     adminSecretArn: adminSecret.secretArn,
    //     // TO_BE_REMOVED: Date.now(),
    //   },
    // });
  }

  private apiCustomResource(path: string, body: any, id?: string) {
    const provider = new custom_resources.Provider(this, 'Provider/' + (id || path), {
      onEventHandler: this.apiFn,
    });

    new CustomResource(this, 'ApiCR/' + (id || path), {
      serviceToken: provider.serviceToken,
      properties: {
        path,
        body,
        // TO_BE_REMOVED: Date.now(),
      },
    });
  }

  public addAdminUser(username: string) {
    this.addUser(username, ['all_access', 'security_manager']);
  }

  public addDasboardUser(username: string) {
    this.addUser(username, ['opensearch_dashboards_user']);
  }

  public addUser(username: string, permissions: Array<string>) {
    const secret = new aws_secretsmanager.Secret(this, `${username}-Secret`, {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username }),
        generateStringKey: 'password',
      },
    });
    secret.grantRead(this.masterRole);
    this.apiCustomResource('_plugins/_security/api/internalusers/' + username, {
      passwordFieldSecretArn: secret.secretArn,
      opendistro_security_roles: permissions,
    });
  }

  public addAccessRole(role: aws_iam.Role) {
    const name = role.roleName;
    // const name = roleArn.split(':').pop()?.split('/').pop();
    this.domain.grantIndexReadWrite('*', role);
    this.domain.grantPathReadWrite('*', role);
    this.domain.grantReadWrite(role);

    this.apiCustomResource(
      '_plugins/_security/api/roles/' + name,
      {
        cluster_permissions: ['cluster_composite_ops', 'cluster_monitor'],
        index_permissions: [
          {
            index_patterns: ['*'],
            allowed_actions: ['crud', 'create_index', 'manage'],
          },
        ],
      },
      'role-' + role.toString()
    );
    this.apiCustomResource(
      '_plugins/_security/api/rolesmapping/' + name,
      {
        backend_roles: [role.roleArn],
      },
      'mapping-' + role.toString()
    );
  }

  /**
   * Add a new role to the cluster.
   * This method is used to add a nodegroup to the Amazon EKS cluster and automatically set tags based on labels and taints
   * @param {string} name the role name
   * @param {object} permissions the permissions template
   */
  public addRole(name: string, permissions: object) {
    this.apiCustomResource('_plugins/_security/api/roles/' + name, permissions);
  }

  public addRoleMapping(name: string, role: aws_iam.Role) {
    this.apiCustomResource('_plugins/_security/api/rolesmapping/' + name, {
      backend_roles: [role.roleArn],
    });
  }

  public addIndex(name: string, mapping: any) {
    this.apiCustomResource('/' + name, mapping);
  }

  public addRollupStrategy(name: string, mapping: any) {
    this.apiCustomResource('_plugins/_rollup/jobs/' + name, mapping);
  }
}

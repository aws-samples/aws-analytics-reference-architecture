// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ISecurityGroup, Peer, Port, SecurityGroup, SubnetType } from '@aws-cdk/aws-ec2';
import { CfnStudio, CfnStudioProps, CfnStudioSessionMapping } from '@aws-cdk/aws-emr';
import { CfnVirtualCluster } from '@aws-cdk/aws-emrcontainers';
import { IManagedPolicy, IRole, ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Key } from '@aws-cdk/aws-kms';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { Aws, CfnOutput, Construct, NestedStack, RemovalPolicy, Tags } from '@aws-cdk/core';
import { EmrEksCluster } from '../emr-eks-platform';
import { Utils } from '../utils';
import {
  createIAMFederatedRole,
  createIAMRolePolicy,
  createIAMUser,
  createStudioServiceRolePolicy,
  createStudioUserRolePolicy,
  createUserSessionPolicy,
} from './notebook-platform-helpers';
import { NotebookUserOptions } from './notebook-user';


/**
 * The properties for NotebookPlatform Construct.
 */
export interface NotebookPlatformProps {
  /**
   * Required
   * the EmrEks infrastructure used for the deployment
   * */
  readonly emrEks: EmrEksCluster;
  /**
   * Required the name to be given to the Amazon EMR Studio
   * Must be unique across the AWS account
   * */
  readonly studioName: string;
  /**
   * Required the authentication mode of Amazon EMR Studio
   * Either 'SSO' or 'IAM' defined in the Enum {@link studioAuthMode}
   * */
  readonly studioAuthMode: StudioAuthMode;
  /**
   * the namespace where to deploy the EMR Virtual Cluster
   * @default - Use the {@link EmrVirtualClusterOptions} default namespace
   * */
  readonly eksNamespace?: string;
  /**
   * Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio
   * This is the URL used to sign in the AWS console
   * */
  readonly idpAuthUrl?: string;
  /**
   * Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio
   * Value can be set with {@link IdpRelayState} Enum or through a value provided by the user
   * */
  readonly idpRelayStateParameterName?: string;
  /**
   * Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio
   * Value taken from the IAM console in the Identity providers console
   * */
  readonly idpArn?: string;
}

/**
 * Enum to define authentication mode for Amazon EMR Studio
 */
export enum StudioAuthMode {
  IAM = 'IAM',
  SSO = 'SSO',
}

/**
 * Enum to define the type of identity Type in EMR studio
 */
export enum SSOIdentityType {
  USER = 'USER',
  GROUP = 'GROUP',
}

/**
 * Enum to define the RelayState of different IdPs
 * Used in EMR Studio Prop in the IAM_FEDERATED scenario
 */
export enum IdpRelayState {
  MICROSOFT_AZURE = 'RelayState',
  AUTH0 = 'RelayState',
  GOOGLE = 'RelayState',
  OKTA = 'RelayState',
  PING_FEDERATE = 'TargetResource',
  PING_ONE = 'PingOne',
}

/**
 * A CDK construct to create a notebook infrastructure based on Amazon EMR Studio and assign users to it
 *
 * This construct is initialized through a constructor that takes as argument an interface defined in {@link NotebookPlatformProps}
 * The construct has a method to add users {@link addUser} the method take as argument {@link NotebookUserOptions}
 *
 * Resources deployed:
 *
 * * An S3 Bucket used by EMR Studio to store the Jupyter notebooks
 * * A KMS encryption Key used to encrypt an S3 bucket used by EMR Studio to store jupyter notebooks
 * * An EMR Studio service Role as defined here, and allowed to access the S3 bucket and KMS key created above
 * * An EMR Studio User Role as defined here - The policy template which is leveraged is the Basic one from the Amazon EMR Studio documentation
 * * Multiple EMR on EKS Managed Endpoints, each for a user or a group of users
 * * An execution role to be passed to the Managed endpoint from a policy provided by the user
 * * Multiple Session Policies that are used to map an EMR Studio user or group to a set of resources they are allowed to access. These resources are: <br />
 *   - EMR Virtual Cluster - created above <br />
 *   - ManagedEndpoint <br />
 *
 *
 * Usage example:
 *
 * ```typescript
 * const emrEks = EmrEksCluster.getOrCreate(stack, {
 *   eksAdminRoleArn: 'arn:aws:iam::012345678912:role/Admin-Admin',
 *   eksClusterName: 'cluster',
 * });
 *
 * const notebookPlatform = new NotebookPlatform(stack, 'platform-notebook', {
 *   emrEks: emrEks,
 *   eksNamespace: 'platformns',
 *   studioName: 'platform',
 *   studioAuthMode: StudioAuthMode.SSO,
 * });
 *
 *
 * const policy1 = new ManagedPolicy(stack, 'MyPolicy1', {
 *   statements: [
 *     new PolicyStatement({
 *       resources: ['*'],
 *       actions: ['s3:*'],
 *     }),
 *     new PolicyStatement({
 *       resources: [
 *         stack.formatArn({
 *           account: Aws.ACCOUNT_ID,
 *           region: Aws.REGION,
 *           service: 'logs',
 *           resource: '*',
 *           arnFormat: ArnFormat.NO_RESOURCE_NAME,
 *         }),
 *       ],
 *       actions: [
 *         'logs:*',
 *       ],
 *     }),
 *   ],
 * });
 *
 * notebookPlatform.addUser([{
 *   identityName: 'user1',
 *   identityType: SSOIdentityType.USER,
 *   notebookManagedEndpoints: [{
 *     emrOnEksVersion: 'emr-6.3.0-latest',
 *     executionPolicy: policy1,
 *   }],
 * }]);
 *
 * ```
 */
export class NotebookPlatform extends NestedStack {
  private static readonly STUDIO_PRINCIPAL: string = 'elasticmapreduce.amazonaws.com';
  private readonly studioId: string;
  private readonly workSpaceSecurityGroup: SecurityGroup;
  private readonly engineSecurityGroup: ISecurityGroup | undefined;
  private readonly workspacesBucket: Bucket;
  private readonly studioUserRole?: IRole;
  private readonly studioServicePolicy: IManagedPolicy [];
  private readonly studioUserPolicy: IManagedPolicy [];
  private readonly studioSubnetList: string[] | undefined ;
  private readonly studioInstance: CfnStudio;
  private readonly studioName: string;
  private readonly emrEks: EmrEksCluster;
  private readonly emrVirtCluster: CfnVirtualCluster;
  private readonly emrVirtualClusterName: string;
  private readonly notebookPlatformEncryptionKey: Key;
  private readonly managedEndpointExecutionPolicyArnMapping: Map<string, string>;
  private readonly federatedIdPARN : string | undefined;
  private readonly authMode :string;
  private studioServiceRole: IRole;

  /**
   * @public
   * Constructs a new instance of the DataPlatform class
   * @param {Construct} scope the Scope of the AWS CDK Construct
   * @param {string} id the ID of the AWS CDK Construct
   * @param {NotebookPlatformProps} props the DataPlatformNotebooks [properties]{@link NotebookPlatformProps}
   */

  constructor(scope: Construct, id: string, props: NotebookPlatformProps) {
    super(scope, id);

    this.studioServicePolicy = [];
    this.studioUserPolicy = [];
    this.studioSubnetList = [];
    this.managedEndpointExecutionPolicyArnMapping = new Map<string, string>();
    this.authMode = props.studioAuthMode;

    if (props.idpArn !== undefined) {
      this.federatedIdPARN = props.idpArn;
    }

    //Create encryption key to use with cloudwatch loggroup and S3 bucket storing notebooks and
    this.notebookPlatformEncryptionKey = new Key(
      this,
      'KMS-key-'+ Utils.stringSanitizer(props.studioName),
    );

    this.emrVirtualClusterName = 'emr-vc-' + Utils.stringSanitizer(props.studioName);
    this.emrEks = props.emrEks;

    //Get the list of private subnets in VPC
    this.studioSubnetList = this.emrEks.eksCluster.vpc.selectSubnets({
      onePerAz: true,
      subnetType: SubnetType.PRIVATE_WITH_NAT,
    }).subnetIds;


    //Create a virtual cluster a give it a name of 'emr-vc-'+studioName provided by user
    this.emrVirtCluster = this.emrEks.addEmrVirtualCluster(this, {
      createNamespace: true,
      eksNamespace: props.eksNamespace,
      name: Utils.stringSanitizer(this.emrVirtualClusterName),
    });

    //Create a security group to be attached to the studio workspaces
    this.workSpaceSecurityGroup = new SecurityGroup(this, 'workspaceSecurityGroup', {
      vpc: this.emrEks.eksCluster.vpc,
      securityGroupName: 'workSpaceSecurityGroup-'+props.studioName,
      allowAllOutbound: false,
    });

    //Tag workSpaceSecurityGroup to be used with EMR Studio
    Tags.of(this.workSpaceSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Create a security group to be attached to the engine for EMR
    //This is mandatory for Amazon EMR Studio although we are not using EMR on EC2
    this.engineSecurityGroup = new SecurityGroup(this, 'engineSecurityGroup', {
      vpc: this.emrEks.eksCluster.vpc,
      securityGroupName: 'engineSecurityGroup-'+props.studioName,
      allowAllOutbound: false,
    });

    //Tag engineSecurityGroup to be used with EMR Studio
    Tags.of(this.engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Create S3 bucket to store EMR Studio workspaces
    //Bucket is kept after destroying the construct
    this.workspacesBucket = new Bucket(this, 'WorkspacesBucket' + props.studioName, {
      bucketName: 'ara-workspaces-bucket-' + Aws.ACCOUNT_ID + '-' + Utils.stringSanitizer(props.studioName),
      enforceSSL: true,
      encryptionKey: this.notebookPlatformEncryptionKey,
      encryption: BucketEncryption.KMS,
    });

    //Create a Managed policy for Studio service role
    this.studioServicePolicy.push(ManagedPolicy.fromManagedPolicyArn(this,
      'StudioServiceManagedPolicy', createStudioServiceRolePolicy(this, this.notebookPlatformEncryptionKey.keyArn, this.workspacesBucket.bucketName,
        props.studioName),
    ));

    //Create a role for the Studio
    this.studioServiceRole = new Role(this, 'studioServiceRole', {
      assumedBy: new ServicePrincipal(NotebookPlatform.STUDIO_PRINCIPAL),
      roleName: 'studioServiceRole+' + Utils.stringSanitizer(props.studioName),
      managedPolicies: this.studioServicePolicy,
    });

    // Create an EMR Studio user role only if the user uses SSO as authentication mode
    if (props.studioAuthMode === 'SSO') {
      //Get Managed policy for Studio user role and put it in an array to be assigned to a user role
      this.studioUserPolicy.push(ManagedPolicy.fromManagedPolicyArn(this,
        'StudioUserManagedPolicy',
        createStudioUserRolePolicy(this, props.studioName, this.studioServiceRole.roleName),
      ));

      //Create a role for the EMR Studio user, this roles is further restricted by session policy for each user
      this.studioUserRole = new Role(this, 'studioUserRole', {
        assumedBy: new ServicePrincipal(NotebookPlatform.STUDIO_PRINCIPAL),
        roleName: 'studioUserRole+' + Utils.stringSanitizer(props.studioName),
        managedPolicies: this.studioUserPolicy,
      });
    }
    // Create the EMR Studio
    this.studioInstance = new CfnStudio(this, 'Studio', <CfnStudioProps>{
      authMode: props.studioAuthMode,
      defaultS3Location: 's3://' + this.workspacesBucket.bucketName + '/',
      engineSecurityGroupId: this.engineSecurityGroup.securityGroupId,
      name: props.studioName,
      serviceRole: this.studioServiceRole.roleArn,
      subnetIds: this.studioSubnetList,
      userRole: this.studioUserRole ? this.studioUserRole.roleArn : undefined,
      vpcId: this.emrEks.eksCluster.vpc.vpcId,
      workspaceSecurityGroupId: this.workSpaceSecurityGroup.securityGroupId,
      idpAuthUrl: props.idpAuthUrl ? props.idpAuthUrl : undefined,
      idpRelayStateParameterName: props.idpRelayStateParameterName ? props.idpRelayStateParameterName: undefined,
    });

    // Set the Studio URL and Studio Id this is used in session Mapping for
    // EMR Studio when {@linkcode addFederatedUsers} or {@linkcode addSSOUsers} are called
    this.studioName = props.studioName;

    //Set the Studio Id to use for SessionMapping
    this.studioId = this.studioInstance.attrStudioId;

    //Return EMR Studio URL as CfnOutput
    if (this.nestedStackParent != undefined) {
      new CfnOutput(this.nestedStackParent, `URL for EMR Studio: ${this.studioName}`, {
        value: this.studioInstance.attrUrl,
      });
    }
  }

  /**
   * @public
   * Method to add users, take a list of userDefinition and will create a managed endpoints for each user
   * and create an IAM Policy scoped to the list managed endpoints
   * @param {NotebookUserOptions} userList list of users
   */
  public addUser(userList: NotebookUserOptions []) {
    //Initialize the managedEndpointArns
    //Used to store the arn of managed endpoints after creation for each users
    //This is used to update the IAM policy
    let managedEndpointArns: string [] = [];
    //let managedEndpointObjects: Map<string, CustomResource> = new Map <string, CustomResource> ();

    let iamRolePolicy: ManagedPolicy;

    let iamUserList: string [] = [];

    //Loop through each user and create its managed endpoint(s) as defined by the user
    for (let user of userList) {

      //For each policy create a role and then pass it to addManageEndpoint to create an endpoint
      user.notebookManagedEndpoints.forEach( (notebookManagedEndpoint, index) => {

        //Check if the managedendpoint is already used in role which is created for a managed endpoint
        //if there is no managedendpointArn create a new managedendpoint
        //else get managedendpoint and push it to  @managedEndpointArns
        if (!this.managedEndpointExecutionPolicyArnMapping.has(notebookManagedEndpoint.executionPolicy.managedPolicyName)) {

          //For each user or group, create a new managedEndpoint
          //ManagedEndpoint ARN is used to update and scope the session policy of the user or group

          let emrOnEksVersion: string | undefined = user.notebookManagedEndpoints[index].emrOnEksVersion;
          let configOverride: string | undefined = user.notebookManagedEndpoints[index].configurationOverrides;

          let managedEndpoint = this.emrEks.addManagedEndpoint(
            this,
            `${this.studioName}${Utils.stringSanitizer(notebookManagedEndpoint.executionPolicy.managedPolicyName)}`,
            {
              managedEndpointName: `${this.studioName}-${notebookManagedEndpoint.executionPolicy.managedPolicyName}`,
              virtualClusterId: this.emrVirtCluster.attrId,
              executionRole: this.emrEks.createExecutionRole(
                this,
                `${user.identityName}${index}`,
                notebookManagedEndpoint.executionPolicy,
              ),
              emrOnEksVersion: emrOnEksVersion ? emrOnEksVersion : undefined,
              configurationOverrides: configOverride ? configOverride : undefined,
            },

          );

          managedEndpoint.node.addDependency(this.emrEks);

          //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
          let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(
            this,
            `engineSecurityGroup${user.identityName}${index}`,
            managedEndpoint.getAttString('securityGroup'));

          Tags.of(engineSecurityGroup).add('for-use-by-analytics-reference-architecture', 'true');

          let vpcCidrBlock: string = this.emrEks.eksCluster.vpc.vpcCidrBlock;

          //Update workspace Security Group to allow outbound traffic on port 18888 toward Engine Security Group
          this.workSpaceSecurityGroup.addEgressRule(Peer.ipv4(vpcCidrBlock), Port.tcp(18888), 'Allow traffic to EMR');

          this.engineSecurityGroup?.addIngressRule(Peer.ipv4(vpcCidrBlock), Port.tcp(18888), 'Allow traffic from EMR Studio');

          this.workSpaceSecurityGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

          //Tag the Security Group of the ManagedEndpoint to be used with EMR Studio
          Tags.of(engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

          //Add the managedendpointArn to @managedEndpointExcutionPolicyArnMapping
          //This is to avoid the creation an endpoint with the same policy twice
          //Save resources and reduce the deployment time
          // TODO check the emr version is the same => to be fixed on a later commit need to solve adding a tuple to a JS map
          this.managedEndpointExecutionPolicyArnMapping.set(notebookManagedEndpoint.executionPolicy.managedPolicyName, managedEndpoint.getAttString('arn'));

          //Push the managedendpoint arn to be used in to build the policy to attach to it
          managedEndpointArns.push(managedEndpoint.getAttString('arn'));
        } else {
          let managedPolicyName = notebookManagedEndpoint.executionPolicy.managedPolicyName;
          managedEndpointArns.push(<string> this.managedEndpointExecutionPolicyArnMapping.get(managedPolicyName));
        }
      });

      if (this.authMode === 'IAM' && this.federatedIdPARN === undefined) {
        //Create the role policy and gets its ARN
        iamRolePolicy = createIAMRolePolicy(this, user, this.studioServiceRole.roleName,
          managedEndpointArns, this.studioId);

        let iamUserCredentials: string = createIAMUser(this, iamRolePolicy!, user.identityName);

        if (this.nestedStackParent != undefined) {
          new CfnOutput(this.nestedStackParent, `${user.identityName}`, {
            value: iamUserCredentials,
          });
        }

      } else if (this.authMode === 'IAM' && this.federatedIdPARN != undefined) {
        //Create the role policy and gets its ARN
        iamRolePolicy = createIAMRolePolicy(this, user, this.studioServiceRole.roleName,
          managedEndpointArns, this.studioId);

        createIAMFederatedRole(this, iamRolePolicy!, this.federatedIdPARN!, user.identityName, this.studioId);

      } else if (this.authMode === 'SSO') {
        //Create the session policy and gets its ARN
        let sessionPolicyArn = createUserSessionPolicy(this, user, this.studioServiceRole.roleName,
          managedEndpointArns, this.studioId);

        if (user.identityType == 'USER' || user.identityType == 'GROUP') {
          //Map a session to user or group
          new CfnStudioSessionMapping(this, 'studioUser' + user.identityName + user.identityName, {
            identityName: user.identityName,
            identityType: user.identityType,
            sessionPolicyArn: sessionPolicyArn,
            studioId: this.studioId,
          });
        } else {
          throw new Error(`identityType should be either USER or GROUP not ${user.identityType}`);
        }
      }
    }

    return iamUserList;
  }
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ISecurityGroup, Peer, Port, SecurityGroup, SubnetType } from '@aws-cdk/aws-ec2';
import { CfnStudio, CfnStudioProps, CfnStudioSessionMapping } from '@aws-cdk/aws-emr';
import { CfnVirtualCluster } from '@aws-cdk/aws-emrcontainers';
import { IManagedPolicy, IRole, ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Key } from '@aws-cdk/aws-kms';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { Aws, CfnOutput, Construct, NestedStack, RemovalPolicy, Tags } from '@aws-cdk/core';
import { EmrEksCluster } from '../emr-eks-platform/emr-eks-cluster';
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
 * The properties for DataPlatformNotebook Construct.
 */
export interface NotebookPlatformProps {
  /**
   * Required the EmrEks infrastructure used for the deployment
   * */
  readonly emrEks: EmrEksCluster;
  /**
   * Required the be given to the name of Amazon EMR Studio
   * Must be unique across the AWS account
   * */
  readonly studioName: string;
  /**
   * Required the authentication mode of Amazon EMR Studio
   * Either 'SSO' or 'IAM' defined in the Enum {@linkcode studioAuthMode}
   * */
  readonly studioAuthMode: StudioAuthMode;
  /**
   * the namespace where to deploy the EMR Virtual Cluster
   * @default - Use the {@linkcode EmrVirtualClusterOptions} default namespace
   * */
  readonly eksNamespace?: string;
  /**
   * Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio
   * This is is the URL used to sign in the AWS console
   * */
  readonly idpAuthUrl?: string;
  /**
   * Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio
   * Value can be set with {@linkcode idpRelayState} Enum or through a value provided by the user
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
 * @internal
 * Construct to create an Amazon EKS cluster, Amazon EMR virtual cluster and Amazon EMR Studio
 * Construct can also take as parameters Amazon EKS id, Amazon VPC Id and list of subnets then create Amazon EMR virtual cluster and Amazon EMR Studio
 * Construct is then used to assign users to the created EMR Studio
 */
export class NotebookPlatform extends Construct {
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
  private readonly nestedStack: NestedStack;
  private studioServiceRole: IRole;

  /**
   * Constructs a new instance of the DataGenerator class
   * @param {Construct} scope the Scope of the AWS CDK Construct
   * @param {string} id the ID of the AWS CDK Construct
   * @param {DataPlatformNotebookProps} props the DataPlatformNotebooks [properties]{@link DataPlatformNotebookProps}
   */

  constructor(scope: Construct, id: string, props: NotebookPlatformProps) {
    super(scope, id);

    this.studioServicePolicy = [];
    this.studioUserPolicy = [];
    this.studioSubnetList = [];
    this.managedEndpointExecutionPolicyArnMapping = new Map<string, string>();
    this.authMode = props.studioAuthMode;

    this.nestedStack = new NestedStack(scope, `${props.studioName}-stack`);

    if (props.idpArn !== undefined) {
      this.federatedIdPARN = props.idpArn;
    }

    //Create encryption key to use with cloudwatch loggroup and S3 bucket storing notebooks and
    this.notebookPlatformEncryptionKey = new Key(
      this.nestedStack,
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
    this.emrVirtCluster = this.emrEks.addEmrVirtualCluster(this.nestedStack, {
      createNamespace: true,
      eksNamespace: props.eksNamespace,
      name: Utils.stringSanitizer(this.emrVirtualClusterName),
    });

    //Create a security group to be attached to the studio workspaces
    this.workSpaceSecurityGroup = new SecurityGroup(this.nestedStack, 'workspaceSecurityGroup', {
      vpc: this.emrEks.eksCluster.vpc,
      securityGroupName: 'workSpaceSecurityGroup-'+props.studioName,
      allowAllOutbound: false,
    });

    //Tag workSpaceSecurityGroup to be used with EMR Studio
    Tags.of(this.workSpaceSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Create a security group to be attached to the engine for EMR
    //This is mandatory for Amazon EMR Studio although we are not using EMR on EC2
    this.engineSecurityGroup = new SecurityGroup(this.nestedStack, 'engineSecurityGroup', {
      vpc: this.emrEks.eksCluster.vpc,
      securityGroupName: 'engineSecurityGroup-'+props.studioName,
      allowAllOutbound: false,
    });

    //Tag engineSecurityGroup to be used with EMR Studio
    Tags.of(this.engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Create S3 bucket to store EMR Studio workspaces
    //Bucket is kept after destroying the construct
    this.workspacesBucket = new Bucket(this.nestedStack, 'WorkspacesBucket' + props.studioName, {
      bucketName: 'ara-workspaces-bucket-' + Aws.ACCOUNT_ID + '-' + Utils.stringSanitizer(props.studioName),
      enforceSSL: true,
      encryptionKey: this.notebookPlatformEncryptionKey,
      encryption: BucketEncryption.KMS,
    });

    //Create a Managed policy for Studio service role
    this.studioServicePolicy.push(ManagedPolicy.fromManagedPolicyArn(this.nestedStack,
      'StudioServiceManagedPolicy', createStudioServiceRolePolicy(this.nestedStack, this.notebookPlatformEncryptionKey.keyArn, this.workspacesBucket.bucketName,
        props.studioName),
    ));

    //Create a role for the Studio
    this.studioServiceRole = new Role(this.nestedStack, 'studioServiceRole', {
      assumedBy: new ServicePrincipal(NotebookPlatform.STUDIO_PRINCIPAL),
      roleName: 'studioServiceRole+' + Utils.stringSanitizer(props.studioName),
      managedPolicies: this.studioServicePolicy,
    });

    // Create an EMR Studio user role only if the user uses SSO as authentication mode
    if (props.studioAuthMode === 'SSO') {
      //Get Managed policy for Studio user role and put it in an array to be assigned to a user role
      this.studioUserPolicy.push(ManagedPolicy.fromManagedPolicyArn(this.nestedStack,
        'StudioUserManagedPolicy',
        createStudioUserRolePolicy(this.nestedStack, props.studioName, this.studioServiceRole.roleName),
      ));

      //Create a role for the EMR Studio user, this roles is further restricted by session policy for each user
      this.studioUserRole = new Role(this.nestedStack, 'studioUserRole', {
        assumedBy: new ServicePrincipal(NotebookPlatform.STUDIO_PRINCIPAL),
        roleName: 'studioUserRole+' + Utils.stringSanitizer(props.studioName),
        managedPolicies: this.studioUserPolicy,
      });
    }
    // Create the EMR Studio
    this.studioInstance = new CfnStudio(this.nestedStack, 'Studio', <CfnStudioProps>{
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
    if (this.nestedStack.nestedStackParent != undefined) {
      new CfnOutput(this.nestedStack.nestedStackParent, `URL for EMR Studio: ${this.studioName}`, {
        value: this.studioInstance.attrUrl,
      });
    }
  }

  /**
   * Method to add users, take a list of userDefinition and will create a managed endpoints for each user
   * and create an IAM Policy scoped to the list managed endpoints
   * @param {StudioUserDefinition} userList list of users
   * @return {string[] } return a list of users that were created and their temporary passwords if IAM_AUTHENTICATED is used
   */
  public addUser(userList: NotebookUserOptions []): string[] {
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
      user.executionPolicies.forEach( (executionPolicy, index) => {

        //Check if the managedendpoint is already used in role which is created for a managed endpoint
        //if there is no managedendpointArn create a new managedendpoint
        //else get managedendpoint and push it to  @managedEndpointArns
        if (!this.managedEndpointExecutionPolicyArnMapping.has(executionPolicy.managedPolicyName)) {

          //For each user or group, create a new managedEndpoint
          //ManagedEndpoint ARN is used to update and scope the session policy of the user or group
          let managedEndpoint = this.emrEks.addManagedEndpoint(
            this.nestedStack,
            `${this.studioName}${Utils.stringSanitizer(executionPolicy.managedPolicyName)}`,
            {
              managedEndpointName: Utils.stringSanitizer(`${this.studioName}-${executionPolicy.managedPolicyName}`),
              virtualClusterId: this.emrVirtCluster.attrId,
              executionRole: this.emrEks.createExecutionRole(
                this,
                `${user.identityName}${index}`,
                executionPolicy,
              ),
              emrOnEksVersion: user.emrOnEksVersion ? user.emrOnEksVersion : undefined,
              configurationOverrides: user.configurationOverrides ? user.configurationOverrides : undefined,
            },

          );

          managedEndpoint.node.addDependency(this.emrEks);

          //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
          let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(
            this.nestedStack,
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
          // TODO check multiple users/notebooks can share a JEG and trigger multiple spark apps
          this.managedEndpointExecutionPolicyArnMapping.set(executionPolicy.managedPolicyName, managedEndpoint.getAttString('arn'));

          //Push the managedendpoint arn to be used in to build the policy to attach to it
          managedEndpointArns.push(managedEndpoint.getAttString('arn'));
        } else {
          managedEndpointArns.push(<string> this.managedEndpointExecutionPolicyArnMapping.get(executionPolicy.managedPolicyName));
        }
      });

      if (this.authMode === 'IAM' && this.federatedIdPARN === undefined) {
        //Create the role policy and gets its ARN
        iamRolePolicy = createIAMRolePolicy(this.nestedStack, user, this.studioServiceRole.roleName,
          managedEndpointArns, this.studioId);

        let iamUserCredentials: string = createIAMUser(this.nestedStack, iamRolePolicy!, user.identityName);

        if (this.nestedStack.nestedStackParent != undefined) {
          new CfnOutput(this.nestedStack.nestedStackParent, `${user.identityName}`, {
            value: iamUserCredentials,
          });
        }

      } else if (this.authMode === 'IAM' && this.federatedIdPARN != undefined) {
        //Create the role policy and gets its ARN
        iamRolePolicy = createIAMRolePolicy(this.nestedStack, user, this.studioServiceRole.roleName,
          managedEndpointArns, this.studioId);

        createIAMFederatedRole(this.nestedStack, iamRolePolicy!, this.federatedIdPARN!, user.identityName, this.studioId);

      } else if (this.authMode === 'SSO') {
        //Create the session policy and gets its ARN
        let sessionPolicyArn = createUserSessionPolicy(this.nestedStack, user, this.studioServiceRole.roleName,
          managedEndpointArns, this.studioId);

        if (user.identityType == 'USER' || user.identityType == 'GROUP') {
          //Map a session to user or group
          new CfnStudioSessionMapping(this.nestedStack, 'studioUser' + user.identityName + user.identityName, {
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

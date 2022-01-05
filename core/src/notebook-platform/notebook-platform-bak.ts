// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ISecurityGroup, IVpc, Peer, Port, SecurityGroup, SubnetType } from '@aws-cdk/aws-ec2';
import { KubernetesVersion } from '@aws-cdk/aws-eks';
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

/**
 * The properties of Data Platform Infrastructure where the notebook infrastructure should be deployed
 * @internal
 */
export interface DataPlatformNotebookInfra {
  /**
   * Required the props of the notebooks dataplatform to be deployed
   * */
  readonly dataPlatformProps: DataPlatformNotebookProps;
  /**
   * Required the EmrEks infrastructure used for the deployment
   * */
  readonly emrEks: EmrEksCluster;
}

/**
 * The properties for DataPlatformNotebook Construct.
 */
export interface DataPlatformNotebookProps {
  /**
   * Required the be given to the name of Amazon EMR Studio
   * Must be unique across the AWS account
   * */
  readonly studioName: string;
  /**
   * Required the authentication mode of Amazon EMR Studio
   * Either 'SSO' or 'IAM_FEDERATED' or 'IAM_AUTHENTICATED' defined in the Enum {@linkcode studioAuthMode}
   * */
  readonly studioAuthMode: string;
  /**
   * the namespace where to deploy the EMR Virtual Cluster
   * */
  readonly emrVCNamespace: string;
  /**
   * The version of kubernetes to deploy
   * @default - v1.20 version is used
   * */
  readonly kubernetesVersion?: KubernetesVersion;
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
 * The properties for defining a user.
 * The interface is used to create and assign a user or a group to a Amazon EMR Studio
 */

export interface StudioUserDefinition {
  /**
   * Name of the identity as it appears in AWS SSO console, or the name to be given to a user in IAM_AUTHENTICATED
   * */
  readonly identityName: string;

  /**
   * Type of the identity either GROUP or USER, to be used when SSO is used as an authentication mode
   * */
  readonly identityType?: string;

  /**
   * The name of the policy to be used for the execution Role to pass to ManagedEndpoint,
   * this role should allow access to any resource needed for the job including: Amazon S3 buckets, Amazon DynamoDB
   * */
  readonly executionPolicyNames: string [];

  /**
   * The version of Amazon EMR to deploy
   * */
  readonly emrOnEksVersion?: string;

  /**
   * The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint
   * @default - Configuration related to the [default nodegroup for notebook]{@link EmrEksNodegroup.NOTEBOOK_EXECUTOR}
   */
  readonly configurationOverrides?: string;

}

/**
 * Enum to define authentication mode for Amazon EMR Studio
 */
export enum StudioAuthMode {
  IAM = 'IAM',
  SSO = 'SSO',
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
export class DataPlatformNotebook extends Construct {
  private static readonly STUDIO_PRINCIPAL: string = 'elasticmapreduce.amazonaws.com';
  public readonly studioUrl: string;
  public readonly studioId: string;
  private readonly studioSubnetList: string[] | undefined ;
  private readonly studioName: string;
  private readonly emrVcName: string;
  private readonly workSpaceSecurityGroup: SecurityGroup;
  private readonly engineSecurityGroup: ISecurityGroup | undefined;
  private readonly emrVpc: IVpc;
  private readonly workspacesBucket: Bucket;
  private readonly studioUserRole: IRole | undefined;
  private readonly studioServicePolicy: IManagedPolicy [];
  private readonly studioUserPolicy: IManagedPolicy [];
  private readonly studioInstance: CfnStudio;
  private readonly emrEks: EmrEksCluster;
  private readonly emrVirtCluster: CfnVirtualCluster;
  private readonly dataPlatformEncryptionKey: Key;
  private readonly managedEndpointExecutionPolicyArnMapping: Map<string, string>;
  private readonly federatedIdPARN : string | undefined;
  private readonly authMode :string;
  private readonly nestedStack: NestedStack;
  private studioServiceRole: IRole;

  /**
   * @access private
   * @hidden
   * Constructs a new instance of the DataGenerator class
   * @param {Construct} scope the Scope of the AWS CDK Construct
   * @param {string} id the ID of the AWS CDK Construct
   * @param {DataPlatformNotebookInfra} props the DataPlatformNotebooks [properties]{@link DataPlatformNotebookInfra}
   */

  constructor(scope: Construct, id: string, props: DataPlatformNotebookInfra) {
    super(scope, id);

    this.studioServicePolicy = [];
    this.studioUserPolicy = [];
    this.studioSubnetList = [];
    this.managedEndpointExecutionPolicyArnMapping = new Map<string, string>();
    this.authMode = props.dataPlatformProps.studioAuthMode;

    this.nestedStack = new NestedStack(scope, `${props.dataPlatformProps.studioName}-stack`);

    if (props.dataPlatformProps.idpArn !== undefined) {
      this.federatedIdPARN = props.dataPlatformProps.idpArn;
    }

    //Create encryption key to use with cloudwatch loggroup and S3 bucket storing notebooks and
    this.dataPlatformEncryptionKey = new Key(
      this.nestedStack,
      'KMS-key-'+ Utils.stringSanitizer(props.dataPlatformProps.studioName),
    );

    //EMR Virtual Cluster Name
    this.emrVcName = 'emr-vc-' + Utils.stringSanitizer(props.dataPlatformProps.studioName);

    //Create new Amazon EKS cluster for Amazon EMR or get one already create for previous EMR on EKS cluster
    //This avoid creating a new cluster everytime an object is initialized
    this.emrEks = props.emrEks;

    //Get the list of private subnets in VPC
    this.studioSubnetList = this.emrEks.eksCluster.vpc.selectSubnets({
      onePerAz: true,
      subnetType: SubnetType.PRIVATE_WITH_NAT,
    }).subnetIds;


    //Create a virtual cluster a give it a name of 'emr-vc-'+studioName provided by user
    this.emrVirtCluster = this.emrEks.addEmrVirtualCluster(this.nestedStack, {
      createNamespace: true,
      eksNamespace: props.dataPlatformProps.emrVCNamespace,
      name: Utils.stringSanitizer(this.emrVcName),
    });

    //Set Vpc object to be used with SecurityGroup and EMR Studio Creation
    this.emrVpc = this.emrEks.eksCluster.vpc;

    //Create a security group to be attached to the studio workspaces
    this.workSpaceSecurityGroup = new SecurityGroup(this.nestedStack, 'workspaceSecurityGroup', {
      vpc: this.emrVpc,
      securityGroupName: 'workSpaceSecurityGroup-'+props.dataPlatformProps.studioName,
      allowAllOutbound: false,
    });

    //Tag workSpaceSecurityGroup to be used with EMR Studio
    Tags.of(this.workSpaceSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Create a security group to be attached to the engine for EMR
    //This is mandatory for Amazon EMR Studio although we are not using EMR on EC2
    this.engineSecurityGroup = new SecurityGroup(this.nestedStack, 'engineSecurityGroup', {
      vpc: this.emrVpc,
      securityGroupName: 'engineSecurityGroup-'+props.dataPlatformProps.studioName,
      allowAllOutbound: false,
    });

    //Tag engineSecurityGroup to be used with EMR Studio
    Tags.of(this.engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Create S3 bucket to store EMR Studio workspaces
    //Bucket is kept after destroying the construct
    this.workspacesBucket = new Bucket(this.nestedStack, 'WorkspacesBucket' + props.dataPlatformProps.studioName, {
      bucketName: 'ara-workspaces-bucket-' + Aws.ACCOUNT_ID + '-' + Utils.stringSanitizer(props.dataPlatformProps.studioName),
      enforceSSL: true,
      encryptionKey: this.dataPlatformEncryptionKey,
      encryption: BucketEncryption.KMS,
    });

    //Create a Managed policy for Studio service role
    this.studioServicePolicy.push(ManagedPolicy.fromManagedPolicyArn(this.nestedStack,
      'StudioServiceManagedPolicy', createStudioServiceRolePolicy(this.nestedStack, this.dataPlatformEncryptionKey.keyArn, this.workspacesBucket.bucketName,
        props.dataPlatformProps.studioName),
    ));

    //Create a role for the Studio
    this.studioServiceRole = new Role(this.nestedStack, 'studioServiceRole', {
      assumedBy: new ServicePrincipal(DataPlatformNotebook.STUDIO_PRINCIPAL),
      roleName: 'studioServiceRole+' + Utils.stringSanitizer(props.dataPlatformProps.studioName),
      managedPolicies: this.studioServicePolicy,
    });

    // Create an EMR Studio user role only if the user uses SSO as authentication mode
    if (props.dataPlatformProps.studioAuthMode === 'SSO') {
      //Get Managed policy for Studio user role and put it in an array to be assigned to a user role
      this.studioUserPolicy.push(ManagedPolicy.fromManagedPolicyArn(this.nestedStack,
        'StudioUserManagedPolicy',
        createStudioUserRolePolicy(this.nestedStack, props.dataPlatformProps.studioName, this.studioServiceRole.roleName),
      ));

      //Create a role for the EMR Studio user, this roles is further restricted by session policy for each user
      this.studioUserRole = new Role(this.nestedStack, 'studioUserRole', {
        assumedBy: new ServicePrincipal(DataPlatformNotebook.STUDIO_PRINCIPAL),
        roleName: 'studioUserRole+' + Utils.stringSanitizer(props.dataPlatformProps.studioName),
        managedPolicies: this.studioUserPolicy,
      });

      //create a new instance of EMR studio
      this.studioInstance = this.studioInstanceBuilder(props.dataPlatformProps,
        this.engineSecurityGroup.securityGroupId,
        this.studioUserRole.roleArn);

    } else {

      //create a new instance of EMR studio
      this.studioInstance = this.studioInstanceBuilder(props.dataPlatformProps, this.engineSecurityGroup.securityGroupId);
    }

    // Set the Studio URL and Studio Id this is used in session Mapping for
    // EMR Studio when {@linkcode addFederatedUsers} or {@linkcode addSSOUsers} are called
    this.studioName = props.dataPlatformProps.studioName;

    //Set the Studio URL and Studio Id to return as CfnOutput later
    this.studioUrl = this.studioInstance.attrUrl;
    this.studioId = this.studioInstance.attrStudioId;
  }

  /**
   * @internal
   * Constructs a new object of CfnStudio
   * @param {DataPlatformNotebookProp} props the DataPlatformNotebooks [properties]{@link DataPlatformNotebookProp}
   * @param {string} securityGroupId engine SecurityGroupId
   * @param {string} studioUserRoleRoleArn if used in SSO mode pass the user role that is by Amazon EMR Studio
   */
  private studioInstanceBuilder (props: DataPlatformNotebookProps, securityGroupId: string, studioUserRoleRoleArn?: string ): CfnStudio {

    let studioInstance: CfnStudio;

    if (props.studioAuthMode === 'SSO' ||
        props.studioAuthMode === 'IAM') {
      studioInstance = new CfnStudio(this.nestedStack, 'Studio', <CfnStudioProps>{
        authMode: props.studioAuthMode,
        defaultS3Location: 's3://' + this.workspacesBucket.bucketName + '/',
        engineSecurityGroupId: securityGroupId,
        name: props.studioName,
        serviceRole: this.studioServiceRole.roleArn,
        subnetIds: this.studioSubnetList,
        userRole: studioUserRoleRoleArn,
        vpcId: this.emrVpc.vpcId,
        workspaceSecurityGroupId: this.workSpaceSecurityGroup.securityGroupId,
        idpAuthUrl: props.idpAuthUrl ? props.idpAuthUrl : undefined,
        idpRelayStateParameterName: props.idpRelayStateParameterName ? props.idpRelayStateParameterName: undefined,
      });

    } else {
      throw new Error( 'Authentication mode should be either SSO or IAM');
    }

    return studioInstance!;
  }

  /**
   * Method to add users, take a list of userDefinition and will create a managed endpoints for each user
   * and create an IAM Policy scoped to the list managed endpoints
   * @param {StudioUserDefinition} userList list of users
   * @return {string[] } return a list of users that were created and their temporary passwords if IAM_AUTHENTICATED is used
   * @internal
   */
  public addUser(userList: StudioUserDefinition []): string[] {
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
      for (let executionPolicyName of user.executionPolicyNames) {

        //Check if the managedendpoint is already used in role which is created for a managed endpoint
        //if there is no managedendpointArn create a new managedendpoint
        //else get managedendpoint and push it to  @managedEndpointArns
        if (!this.managedEndpointExecutionPolicyArnMapping.has(executionPolicyName)) {
          // load the policy
          let managedPolicy = ManagedPolicy.fromManagedPolicyName(this, `Policy`, executionPolicyName);

          //For each user or group, create a new managedEndpoint
          //ManagedEndpoint ARN is used to update and scope the session policy of the user or group
          let managedEndpoint = this.emrEks.addManagedEndpoint(
            this.nestedStack,
            this.studioName + '-' + Utils.stringSanitizer(executionPolicyName), {
              virtualClusterId: this.emrVirtCluster.attrId,
              executionRole: this.emrEks.createExecutionRole(
                this,
                executionPolicyName,
                managedPolicy,
              ),
              emrOnEksVersion: user.emrOnEksVersion ? user.emrOnEksVersion : undefined,
              configurationOverrides: user.configurationOverrides ? user.configurationOverrides : undefined,
            },

          );

          managedEndpoint.node.addDependency(this.emrEks);

          //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
          let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(
            this.nestedStack,
            'engineSecurityGroup-' + this.studioName + executionPolicyName.replace(/[^\w\s]/gi, ''),
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
          this.managedEndpointExecutionPolicyArnMapping.set(executionPolicyName, managedEndpoint.getAttString('arn'));

          //Push the managedendpoint arn to be used in to build the policy to attach to it
          managedEndpointArns.push(managedEndpoint.getAttString('arn'));
        } else {
          managedEndpointArns.push(<string> this.managedEndpointExecutionPolicyArnMapping.get(executionPolicyName));
        }
      }

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
            identityName: user.identityName!,
            identityType: user.identityType!,
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

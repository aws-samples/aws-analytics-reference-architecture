// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';

import { SecurityGroup, ISecurityGroup, IVpc, Port, SubnetType } from '@aws-cdk/aws-ec2';
import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { CfnStudioSessionMapping, CfnStudio, CfnStudioProps } from '@aws-cdk/aws-emr';
import { Rule, IRuleTarget, EventPattern } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import {
  Role,
  IManagedPolicy,
  ManagedPolicy,
  ServicePrincipal,
  IRole,
  PolicyStatement,
} from '@aws-cdk/aws-iam';
import { Key } from '@aws-cdk/aws-kms';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { Construct, Tags, Aws, Duration } from '@aws-cdk/core';


import {
  createLambdaNoteBookAddTagPolicy,
  buildManagedEndpointExecutionRole,
  createUserSessionPolicy,
  createStudioUserRolePolicy,
  createStudioServiceRolePolicy,
  createIAMFederatedRole,
  createIAMUserPolicy,
} from './dataplatform-notebook-helpers';

import { EmrEksCluster } from './emr-eks-cluster';
import { EmrEksNodegroup } from './emr-eks-nodegroup';
import { EmrVirtualCluster } from './emr-virtual-cluster';

import * as eventPattern from './studio/create-editor-event-pattern.json';
import * as kmsLogPolicyTemplate from './studio/kms-key-policy.json';
import { Utils } from './utils';


/**
 * The properties for DataPlatformNotebooks Construct.
 */

export interface DataPlatformNotebooksProps {
  /**
   *
   * */
  readonly studioName: string;
  /**
   * Required the authentication mode of Amazon EMR Studio
   * Either 'SSO' or 'IAM'
   * For now only SSO is implemented, kept for future compatibility when Amazon IAM auth is available
   * */
  readonly studioAuthMode: string;
  /**
   * The version of kubernetes to deploy
   * @default - v1.20 version is used
   * */
  readonly kubernetesVersion?: KubernetesVersion;
  /**
   * Amazon EKS Admin Role
   * */
  readonly eksAdminRoleArn: string;
  /**
   * Amazon ACM Certificate ARN
   */
  readonly acmCertificateArn: string;
  /**
   * Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio
   * This is is the URL used to sign in the AWS console
   * */
  readonly idpAuthUrl?: string;
  /**
   * Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio
   * */
  readonly idpRelayStateParameterName?: string;
  /**
   * Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio
   * this is the name of the identity provider that is going to be used
   * */
  readonly idPName?: string;
  /**
   * Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio
   * Value taken from the IAM console in the Identity providers console
   * */
  readonly idPArn?: string;
  /**
   * The version of Amazon EMR to deploy
   * @default - v6.3 version is used
   * */
  readonly emrOnEksVersion?: string;
}

/**
 * The properties for defining a user.
 * The interface is used to create and assign a user or a group to a Amazon EMR Studio
 * used in {@linkcode addUser}
 */

export interface StudioUserDefinition {
  /**
   * Name of the identity as it appears in AWS SSO console, to be used when SSO is used as an authentication mode
   * */
  readonly mappingIdentityName?: string;

  /**
   * Type of the identity either GROUP or USER, to be used when SSO is used as an authentication mode
   * */
  readonly mappingIdentityType?: string;

  /**
   * execution Role to pass to ManagedEndpoint, this role should allow access to any resource needed for the job
   * Including Amazon S3 buckets, Amazon DynamoDB
   * */
  readonly executionPolicyArns: string [];

}

/**
 * Enum to define authentication mode for Amazon EMR Studio
 */
export enum StudioAuthMode {
  IAM_FEDERATED = 'IAM_FEDERATED',
  IAM_AUTHENTICATED = 'IAM_AUTHENTICATED',
  SSO = 'SSO',
}
/**
 * Construct to create an Amazon EKS cluster, Amazon EMR virtual cluster and Amazon EMR Studio
 * Construct can also take as parameters Amazon EKS id, Amazon VPC Id and list of subnets then create Amazon EMR virtual cluster and Amazon EMR Studio
 * Construct is then used to assign users to the create EMR Studio with {@linkcode addSSOUsers} or {@linkcode addFederatedUsers}
 */

export class DataPlatformNotebook extends Construct {

  public static readonly DEFAULT_EKS_VERSION: KubernetesVersion = KubernetesVersion.V1_20;
  public static readonly DEFAULT_EMR_VERSION = 'emr-6.3.0-latest';

  private readonly studioSubnetList: string[] | undefined ;
  public readonly studioUrl: string;
  public readonly studioId: string;
  private readonly studioPrincipal: string = 'elasticmapreduce.amazonaws.com';
  private readonly lambdaPrincipal: string = 'lambda.amazonaws.com';
  private readonly certificateArn: string;
  private readonly studioName: string;
  private readonly emrOnEksVersion: string;

  private readonly workSpaceSecurityGroup: SecurityGroup;
  private readonly engineSecurityGroup: ISecurityGroup | undefined;
  private readonly emrVpc: IVpc;
  private readonly workspacesBucket: Bucket;
  private studioServiceRole: Role | IRole;
  private readonly studioUserRole: Role | IRole | undefined;
  private readonly studioServicePolicy: IManagedPolicy [];
  private readonly studioUserPolicy: IManagedPolicy [];

  private readonly studioInstance: CfnStudio;
  private readonly emrEks: EmrEksCluster;

  private readonly emrVirtCluster: EmrVirtualCluster;

  private readonly lambdaNotebookTagOnCreatePolicy: IManagedPolicy [];
  private readonly lambdaNotebookAddTagOnCreate: Role;

  private readonly dataPlatformEncryptionKey: Key;

  private readonly managedEndpointExcutionPolicyArnMapping: Map<string, string>;

  /**
   * Constructs a new instance of the DataGenerator class
   * @param {Construct} scope the Scope of the AWS CDK Construct
   * @param {string} id the ID of the AWS CDK Construct
   * @param {DataPlatformNotebooksProps} props the DataPlatformNotebooks [properties]{@link DataPlatformNotebooksProps}
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataPlatformNotebooksProps) {
    super(scope, id);

    this.studioServicePolicy = [];
    this.studioUserPolicy = [];
    this.lambdaNotebookTagOnCreatePolicy = [];
    this.studioSubnetList = [];
    this.certificateArn = props.acmCertificateArn;
    this.managedEndpointExcutionPolicyArnMapping = new Map<string, string>();
    this.emrOnEksVersion = props.emrOnEksVersion || DataPlatformNotebook.DEFAULT_EMR_VERSION;


    //Create encryption key to use with cloudwatch loggroup and S3 bucket storing notebooks and
    this.dataPlatformEncryptionKey = new Key(
      this,
      'KMS-key-'+ Utils.stringSanitizer(props.studioName), {
        alias: props.studioName.toLowerCase().replace(/[^\w\s]/gi, '') + '-Encryption-key',
      },
    );

    //Create new Amazon EKS cluster for Amazon EMR
    this.emrEks = new EmrEksCluster(this, 'EmrEks', {
      kubernetesVersion: props.kubernetesVersion || DataPlatformNotebook.DEFAULT_EKS_VERSION,
      eksAdminRoleArn: props.eksAdminRoleArn,
      eksClusterName: 'job-test-' + props.studioName,
    });

    //Get the list of private subnets in VPC
    this.studioSubnetList = this.emrEks.eksCluster.vpc.selectSubnets({
      onePerAz: true,
      subnetType: SubnetType.PRIVATE_WITH_NAT,
    }).subnetIds;


    //Create a virtual cluster a give it a name of 'ec2VirtCluster'+studioName provided by user
    this.emrVirtCluster = this.emrEks.addEmrVirtualCluster({
      createNamespace: false,
      eksNamespace: 'default',
      name: 'multi-stack-' + props.studioName,
    });

    //Add a nodegroup for notebooks
    this.emrEks.addEmrEksNodegroup(EmrEksNodegroup.NOTEBOOK_DRIVER);
    this.emrEks.addEmrEksNodegroup(EmrEksNodegroup.NOTEBOOK_EXECUTOR);

    //Set Vpc object to be used with SecurityGroup and EMR Studio Creation
    this.emrVpc = this.emrEks.eksCluster.vpc;

    //Create a security group to be attached to the studio workspaces
    this.workSpaceSecurityGroup = new SecurityGroup(this, 'workspaceSecurityGroup', {
      vpc: this.emrVpc,
      securityGroupName: 'workSpaceSecurityGroup',
      allowAllOutbound: false,
    });

    //Tag workSpaceSecurityGroup to be used with EMR Studio
    Tags.of(this.workSpaceSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    this.engineSecurityGroup = new SecurityGroup(this, 'engineSecurityGroup', {
      vpc: this.emrVpc,
      securityGroupName: 'engineSecurityGroup',
      allowAllOutbound: false,
    });

    //Tag engineSecurityGroup to be used with EMR Studio
    Tags.of(this.engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Create S3 bucket to store EMR Studio workspaces
    //Bucket is kept after destroying the construct
    this.workspacesBucket = new Bucket(this, 'WorkspacesBucket' + props.studioName, {
      bucketName: 'ara-workspaces-bucket-' + Aws.ACCOUNT_ID + '-' + Utils.stringSanitizer(props.studioName),
      enforceSSL: true,
      encryptionKey: this.dataPlatformEncryptionKey,
      encryption: BucketEncryption.KMS,
    });

    //Wait until the EKS key is created then create the S3 bucket
    this.workspacesBucket.node.addDependency(this.dataPlatformEncryptionKey);

    //Wait until the EMR Virtual cluster is deployed then create an S3 bucket
    this.workspacesBucket.node.addDependency(this.emrVirtCluster);

    //Create a Managed policy for Studio service role
    this.studioServicePolicy.push(ManagedPolicy.fromManagedPolicyArn(this,
      'StudioServiceManagedPolicy', createStudioServiceRolePolicy(this, this.dataPlatformEncryptionKey.keyArn, this.workspacesBucket.bucketName,
        props.studioName),
    ));

    //Create a role for the Studio
    this.studioServiceRole = new Role(this, 'studioServiceRole', {
      assumedBy: new ServicePrincipal(this.studioPrincipal),
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
        assumedBy: new ServicePrincipal(this.studioPrincipal),
        roleName: 'studioUserRole+' + Utils.stringSanitizer(props.studioName),
        managedPolicies: this.studioUserPolicy,
      });

      //create a new instance of EMR studio
      this.studioInstance = this.studioInstanceBuilder(props,
        this.engineSecurityGroup.securityGroupId,
        this.studioUserRole.roleArn);

    } else {

      //create a new instance of EMR studio
      this.studioInstance = this.studioInstanceBuilder(props, this.engineSecurityGroup.securityGroupId);
    }

    //Set the Studio URL and Studio Id this is used in session Mapping for
    // EMR Studio when {@linkcode addFederatedUsers} or {@linkcode addSSOUsers} are called
    this.studioName = props.studioName;

    //Set the Studio URL and Studio Id to return as CfnOutput later
    this.studioUrl = this.studioInstance.attrUrl;
    this.studioId = this.studioInstance.attrStudioId;

    /**
     * The next code block is to tag an EMR notebook to restrict who can access it
     * once workspaces have the tag-on-create it should be deleted
     * */

    //Create LogGroup for lambda which tag the EMR Notebook (EMR Studio Workspaces)
    let lambdaNotebookTagOnCreateLog = new LogGroup(this, 'lambdaNotebookTagOnCreateLog' + props.studioName, {
      logGroupName: '/aws/lambda/' + 'lambdaNotebookCreateTagOnCreate' + props.studioName,
      encryptionKey: this.dataPlatformEncryptionKey,
      retention: RetentionDays.ONE_MONTH,
    });

    //Wait until the EMR virtual cluser and kms key are succefully created before creating the LogGroup
    lambdaNotebookTagOnCreateLog.node.addDependency(this.dataPlatformEncryptionKey);
    //lambdaNotebookTagOnCreateLog.node.addDependency(this.managedEndpoint);

    let kmsLogPolicy = JSON.parse(JSON.stringify(kmsLogPolicyTemplate));

    //Create resource policy for KMS to allow Cloudwatch loggroup access to access the key
    kmsLogPolicy.Principal.Service = kmsLogPolicy.Principal.Service.replace(/region/gi, Aws.REGION);

    kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0] =
        kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0].replace(/region/gi, Aws.REGION);

    kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0] =
        kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0].replace(/account-id/gi, Aws.ACCOUNT_ID);

    kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0] =
        kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0].replace(/log-group-name/gi, '/aws/lambda/' + 'lambdaNotebookCreateTagOnCreate' + props.studioName);

    //Applying the policy to the KMS key
    this.dataPlatformEncryptionKey.addToResourcePolicy(PolicyStatement.fromJson(kmsLogPolicy));

    //Create Policy for Lambda to put logs in LogGroup
    //Create Policy for Lambda to AddTags to EMR Notebooks
    this.lambdaNotebookTagOnCreatePolicy.push(ManagedPolicy.fromManagedPolicyArn(
      this,
      'lambdaNotebookTagOnCreatePolicy'+ props.studioName,
      createLambdaNoteBookAddTagPolicy(this, lambdaNotebookTagOnCreateLog.logGroupArn, props.studioName)),
    );

    //Create IAM role for Lambda and attach policy
    this.lambdaNotebookAddTagOnCreate = new Role(this, 'addLambdaTagRole' + props.studioName, {
      assumedBy: new ServicePrincipal(this.lambdaPrincipal),
      roleName: 'lambdaRoleNotebookAddTagOnCreate' + props.studioName,
      managedPolicies: this.lambdaNotebookTagOnCreatePolicy,
    });

    //set the path for the lambda code
    let lambdaPath = 'lambdas/studio-workspace-tag-on-create';

    //Create lambda to tag EMR notebook with UserID of the IAM principal that created it
    let workspaceTaggingLambda = new Function(this, 'CreateTagHandler', {
      runtime: Runtime.NODEJS_14_X, // execution environment
      code: Code.fromAsset(path.join(__dirname, lambdaPath)), // code loaded from "lambda" directory
      handler: 'index.handler', // file is "index", function is "handler"
      role: this.lambdaNotebookAddTagOnCreate,
      timeout: Duration.seconds(10),
      functionName: 'lambdaNotebookCreateTagOnCreate' + props.studioName,
    });

    //Create an event Target for event Bridge
    let createTagEventTarget: IRuleTarget [] = [];

    //Create the lambda as a target for event bridge
    let eventTriggerLambda: LambdaFunction = new LambdaFunction(workspaceTaggingLambda);

    //Register the lambda as a target for event bridge
    createTagEventTarget.push(eventTriggerLambda);

    //Create the event pattern to trigger the lambda
    //Event trigger lambda on the CreateEditor API call
    let createTagEventPattern: EventPattern = JSON.parse(JSON.stringify(eventPattern));

    //Create Event on EventBridge/Cloudwatch Event
    let eventRule: Rule = new Rule(this, props.studioName + 'eventRule', {
      enabled: true,
      eventPattern: createTagEventPattern,
      targets: createTagEventTarget,
    });

    //Event should not be created unless the lambda has been successfully created
    eventRule.node.addDependency(workspaceTaggingLambda);

  }

  /**
   * method to add users, take a list of userDefinition and will create a managed endpoint
   * and create a session Policy scoped to the managed endpoint
   * then assign a user with the created session policy to the created studio
   * @param {StudioUserDefinition} userList list of users
   * @access public
   */
  public addSSOUsers(userList: StudioUserDefinition[]) {

    //Initialize the managedEndpointArns
    //Used to store the arn of managed endpoints after creation for each users
    //This is used to update the session policy
    let managedEndpointArns : string [] = [];

    //Loop through each user and create its managed endpoint(s) as defined by the user
    for (let user of userList) {

      //For each policy create a role and then pass it to addManageEndpoint to create an endpoint
      for ( let executionPolicyArn of user.executionPolicyArns ) {

        //Check if the managedendpoint policy has already is already used in role which is created for a managed endpoint
        //if it there is no managedendpointArn create a new managedendpoint
        //else get managedendpoint and push it to  @managedEndpointArns
        if (!this.managedEndpointExcutionPolicyArnMapping.has(executionPolicyArn)) {
          //For each user or group, create a new managedEndpoint
          //ManagedEndpoint ARN is used to update and scope the session policy of the user or group
          let managedEndpoint = this.emrEks.addManagedEndpoint(
            this.studioName + + '-' +
                user.mappingIdentityName!.replace(/[^\w\s]/gi, '') +
                user.executionPolicyArns.indexOf(executionPolicyArn).toString(),
            this.emrVirtCluster.instance.attrId,
            this.certificateArn,
            this.emrOnEksVersion,
            buildManagedEndpointExecutionRole(this, executionPolicyArn, this.emrEks),
          );

          //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
          let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(this,
            'engineSecurityGroup' + this.studioName + user.mappingIdentityName!.replace(/[^\w\s]/gi, '') + user.executionPolicyArns.indexOf(executionPolicyArn).toString(),
            managedEndpoint.getAttString('securityGroup'));

          //Update workspace Security Group to allow outbound traffic on port 18888 toward Engine Security Group
          this.workSpaceSecurityGroup.addEgressRule(engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);

          //Tag the Security Group of the ManagedEndpoint to be used with EMR Studio
          Tags.of(engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

          //Add the managedendpointArn to @managedEndpointExcutionPolicyArnMapping
          //This is to avoid the creation an endpoint with the same policy twice
          //Save resources and reduce the deployment time
          this.managedEndpointExcutionPolicyArnMapping.set(executionPolicyArn, managedEndpoint.getAttString('arn'));

          //Store the managedendpointArn so it can be used for the session policy
          managedEndpointArns.push(managedEndpoint.getAttString('arn'));
        } else {
          //get the managedendpointArn from the @managedEndpointExcutionPolicyArnMapping
          //and store it in managedendpointArn so it can be used for the session policy
          managedEndpointArns.push(<string> this.managedEndpointExcutionPolicyArnMapping.get(executionPolicyArn));
        }
      }

      //Create the session policy and gets its ARN
      let sessionPolicyArn = createUserSessionPolicy(this, user, this.studioServiceRole.roleName,
        managedEndpointArns, this.studioId);

      //Map a session to user or group
      new CfnStudioSessionMapping(this, 'studioUser' + user.mappingIdentityName + user.mappingIdentityName, {
        identityName: user.mappingIdentityName!,
        identityType: user.mappingIdentityType!,
        sessionPolicyArn: sessionPolicyArn,
        studioId: this.studioId,
      });

    }
  }

  /**
   * Method to add users when IAM auth with an external IdP is used, take a list of userDefinition and will create a managed endpoint
   * and create a session Policy scoped to the managed endpoint
   * then assign a user with the created session policy to the created studio
   * @param {StudioUserDefinition} userList list of users
   * @param {federatedIdpArn} the Arn of the IdP provider as it appears in the IAM console
   * @access public
   */
  public addFederatedUsers(userList: StudioUserDefinition[], federatedIdpArn: string) {

    //Initialize the managedEndpointArns
    //Used to store the arn of managed endpoints after creation for each users
    //This is used to update the session policy
    let managedEndpointArns : string [] = [];

    let iamRolePolicy: ManagedPolicy;

    for (let user of userList) {

      for ( let executionPolicyArn of user.executionPolicyArns ) {

        //For each user or group, create a new managedEndpoint
        //ManagedEndpoint ARN is used to update and scope the session policy of the user or group
        let managedEndpoint = this.emrEks.addManagedEndpoint(
          this.studioName + '-' + Utils.stringSanitizer(user.mappingIdentityName!),
          this.emrVirtCluster.instance.attrId,
          this.certificateArn,
          this.emrOnEksVersion,
          buildManagedEndpointExecutionRole(this, executionPolicyArn, this.emrEks),
        );

        //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
        let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(this,
          'engineSecurityGroup' + this.studioName + executionPolicyArn.replace(/[^\w\s]/gi, ''),
          managedEndpoint.getAttString('securityGroup'));

        //Update workspace Security Group to allow outbound traffic on port 18888 toward Engine Security Group
        this.workSpaceSecurityGroup.addEgressRule(engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);

        //Tag the Security Group of the ManagedEndpoint to be used with EMR Studio
        Tags.of(engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

        //Push the managedendpoint arn to be used in to build the policy to attach to it
        managedEndpointArns.push(managedEndpoint.getAttString('arn'));
      }

      //Create the role policy and gets its ARN
      iamRolePolicy = createIAMUserPolicy(this, user, this.studioServiceRole.roleName,
        managedEndpointArns, this.studioId);

      createIAMFederatedRole(this, iamRolePolicy!, federatedIdpArn, user.executionPolicyArns[0]);
    }

  }

  /**
   * @hidden
   * Constructs a new object of CfnStudio
   * @param {DataPlatformNotebooksProps} props the DataPlatformNotebooks [properties]{@link DataPlatformNotebooksProps}
   * @param {securityGroupId} engine SecurityGroupId
   * @param {studioUserRoleRoleArn} if used in SSO mode pass the user role that is by Amazon EMR Studio
   * @access private
   */
  private studioInstanceBuilder (props: DataPlatformNotebooksProps, securityGroupId: string, studioUserRoleRoleArn?: string ): CfnStudio {

    let studioInstance: CfnStudio;

    if (props.studioAuthMode === 'SSO') {
      studioInstance = new CfnStudio(this, 'Studio', <CfnStudioProps>{
        authMode: 'SSO',
        defaultS3Location: 's3://' + this.workspacesBucket.bucketName + '/',
        engineSecurityGroupId: securityGroupId,
        name: props.studioName,
        serviceRole: this.studioServiceRole.roleArn,
        subnetIds: this.studioSubnetList,
        userRole: studioUserRoleRoleArn,
        vpcId: this.emrVpc.vpcId,
        workspaceSecurityGroupId: this.workSpaceSecurityGroup.securityGroupId,
      });

    } else if (props.studioAuthMode === 'IAM_FEDERATED') {
      studioInstance = new CfnStudio(this, 'Studio', <CfnStudioProps>{
        authMode: 'IAM',
        defaultS3Location: 's3://' + this.workspacesBucket.bucketName + '/',
        engineSecurityGroupId: securityGroupId,
        name: props.studioName,
        serviceRole: this.studioServiceRole.roleArn,
        subnetIds: this.studioSubnetList,
        vpcId: this.emrVpc.vpcId,
        workspaceSecurityGroupId: this.workSpaceSecurityGroup.securityGroupId,
        idpAuthUrl: props.idpAuthUrl,
        idpRelayStateParameterName: 'RelayState',
      });

    } else if (props.studioAuthMode === 'IAM_AUTHENTICATED') {
      studioInstance = new CfnStudio(this, 'Studio', <CfnStudioProps>{
        authMode: 'IAM',
        defaultS3Location: 's3://' + this.workspacesBucket.bucketName + '/',
        engineSecurityGroupId: securityGroupId,
        name: props.studioName,
        serviceRole: this.studioServiceRole.roleArn,
        subnetIds: this.studioSubnetList,
        vpcId: this.emrVpc.vpcId,
        workspaceSecurityGroupId: this.workSpaceSecurityGroup.securityGroupId,
      });
    }

    return studioInstance!;
  }

}

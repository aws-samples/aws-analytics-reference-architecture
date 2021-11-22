// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';

import { SecurityGroup, ISecurityGroup, IVpc, SubnetType, Port } from '@aws-cdk/aws-ec2';
import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { CfnStudio, CfnStudioProps, CfnStudioSessionMapping } from '@aws-cdk/aws-emr';
import { CfnVirtualCluster } from '@aws-cdk/aws-emrcontainers';
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
import { Construct, Tags, Aws, Duration, NestedStack } from '@aws-cdk/core';


import { EmrEksCluster } from '../emr-eks-data-platform/emr-eks-cluster';
import { Utils } from '../utils';
import {
  createLambdaNoteBookAddTagPolicy,
  createStudioUserRolePolicy,
  createStudioServiceRolePolicy,
  createUserSessionPolicy,
  createIAMFederatedRole,
  createIAMRolePolicy,
  createIAMUser,
  buildManagedEndpointExecutionRole,
} from './dataplatform-notebook-helpers';

import * as eventPattern from './resources/studio/create-editor-event-pattern.json';
import * as kmsLogPolicyTemplate from './resources/studio/kms-key-policy.json';

/**
 * The properties of Data Platform Infrastructure where the notebook infrastructure should be deployed
 * @internal
 */
export interface DataPlatformNotebookInfra {
  /**
   * Required the props of the notebooks dataplatform to be deployed
   * */
  readonly dataPlatformProps: DataPlatformNotebookProp;
  /**
   * Required the EmrEks infrastructure used for the deployment
   * */
  readonly emrEks: EmrEksCluster;
  /**
   * Required service token of the addManagedEndpoint Custom Resource
   * This used to create the CR deployed in the EMR on EKS stack
   * */
  readonly serviceToken: string;
}

/**
 * The properties for DataPlatformNotebooks Construct.
 */
export interface DataPlatformNotebookProp {
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
   * Value can be set with {@linkcode idpRelayState} Enum or through a value provided by the user
   * */
  readonly idpRelayStateParameterName?: string;
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

  public static readonly DEFAULT_EMR_VERSION = 'emr-6.3.0-latest';

  private readonly studioSubnetList: string[] | undefined ;
  public readonly studioUrl: string;
  public readonly studioId: string;
  private readonly studioPrincipal: string = 'elasticmapreduce.amazonaws.com';
  private readonly lambdaPrincipal: string = 'lambda.amazonaws.com';
  private readonly certificateArn: string;
  private readonly studioName: string;
  private readonly emrOnEksVersion: string;
  private readonly emrVcName: string;

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

  private readonly emrVirtCluster: CfnVirtualCluster;

  private readonly lambdaNotebookTagOnCreatePolicy: IManagedPolicy [];
  private readonly lambdaNotebookAddTagOnCreate: Role;

  private readonly dataPlatformEncryptionKey: Key;

  private readonly managedEndpointExcutionPolicyArnMapping: Map<string, string>;
  private readonly federatedIdPARN : string | undefined;
  private readonly authMode :string;
  private readonly serviceToken: string;

  private readonly nestedStack: NestedStack;

  /**
   * @access private
   * @hidden
   * Constructs a new instance of the DataGenerator class
   * @param {Construct} scope the Scope of the AWS CDK Construct
   * @param {string} id the ID of the AWS CDK Construct
   * @param {DataPlatformNotebookProp} props the DataPlatformNotebooks [properties]{@link DataPlatformNotebookProp}
   */

  constructor(scope: Construct, id: string, props: DataPlatformNotebookInfra) {
    super(scope, id);

    this.studioServicePolicy = [];
    this.studioUserPolicy = [];
    this.lambdaNotebookTagOnCreatePolicy = [];
    this.studioSubnetList = [];
    this.certificateArn = props.dataPlatformProps.acmCertificateArn;
    this.managedEndpointExcutionPolicyArnMapping = new Map<string, string>();
    this.emrOnEksVersion = props.dataPlatformProps.emrOnEksVersion || DataPlatformNotebook.DEFAULT_EMR_VERSION;
    this.authMode = props.dataPlatformProps.studioAuthMode;
    this.serviceToken = props.serviceToken;

    this.nestedStack = new NestedStack(scope, props.dataPlatformProps.studioName + '-stack');

    if (props.dataPlatformProps.idPArn !== undefined) {
      this.federatedIdPARN = props.dataPlatformProps.idPArn;
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


    //Create a virtual cluster a give it a name of 'multi-stack-'+studioName provided by user
    this.emrVirtCluster = this.emrEks.addEmrVirtualCluster({
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

    //Wait until the EMR Virtual cluster is deployed then create an S3 bucket
    //this.workspacesBucket.node.addDependency(this.emrVirtCluster);

    //Create a Managed policy for Studio service role
    this.studioServicePolicy.push(ManagedPolicy.fromManagedPolicyArn(this.nestedStack,
      'StudioServiceManagedPolicy', createStudioServiceRolePolicy(this.nestedStack, this.dataPlatformEncryptionKey.keyArn, this.workspacesBucket.bucketName,
        props.dataPlatformProps.studioName),
    ));

    //Create a role for the Studio
    this.studioServiceRole = new Role(this.nestedStack, 'studioServiceRole', {
      assumedBy: new ServicePrincipal(this.studioPrincipal),
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
        assumedBy: new ServicePrincipal(this.studioPrincipal),
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

    //Set the Studio URL and Studio Id this is used in session Mapping for
    // EMR Studio when {@linkcode addFederatedUsers} or {@linkcode addSSOUsers} are called
    this.studioName = props.dataPlatformProps.studioName;

    //Set the Studio URL and Studio Id to return as CfnOutput later
    this.studioUrl = this.studioInstance.attrUrl;
    this.studioId = this.studioInstance.attrStudioId;

    /**
     * The next code block is to tag an EMR notebook to restrict who can access it
     * once workspaces have the tag-on-create it should be deleted
     * */

    //Create LogGroup for lambda which tag the EMR Notebook (EMR Studio Workspaces)
    let lambdaNotebookTagOnCreateLog = new LogGroup(this.nestedStack, 'lambdaNotebookTagOnCreateLog' + props.dataPlatformProps.studioName, {
      logGroupName: '/aws/lambda/' + 'lambdaNotebookCreateTagOnCreate' + props.dataPlatformProps.studioName,
      encryptionKey: this.dataPlatformEncryptionKey,
      retention: RetentionDays.ONE_MONTH,
    });

    //Wait until the EMR virtual cluser and kms key are succefully created before creating the LogGroup
    //lambdaNotebookTagOnCreateLog.node.addDependency(this.dataPlatformEncryptionKey);

    let kmsLogPolicy = JSON.parse(JSON.stringify(kmsLogPolicyTemplate));

    //Create resource policy for KMS to allow Cloudwatch loggroup access to access the key
    kmsLogPolicy.Principal.Service = kmsLogPolicy.Principal.Service.replace(/region/gi, Aws.REGION);

    kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0] =
        kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0].replace(/region/gi, Aws.REGION);

    kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0] =
        kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0].replace(/account-id/gi, Aws.ACCOUNT_ID);

    kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0] =
        kmsLogPolicy.Condition.ArnEquals['kms:EncryptionContext:aws:logs:arn'][0].replace(/log-group-name/gi, '/aws/lambda/' + 'lambdaNotebookCreateTagOnCreate' + props.dataPlatformProps.studioName);

    //Applying the policy to the KMS key
    this.dataPlatformEncryptionKey.addToResourcePolicy(PolicyStatement.fromJson(kmsLogPolicy));

    //Create Policy for Lambda to put logs in LogGroup
    //Create Policy for Lambda to AddTags to EMR Notebooks
    this.lambdaNotebookTagOnCreatePolicy.push(ManagedPolicy.fromManagedPolicyArn(
      this.nestedStack,
      'lambdaNotebookTagOnCreatePolicy'+ props.dataPlatformProps.studioName,
      createLambdaNoteBookAddTagPolicy(this.nestedStack, lambdaNotebookTagOnCreateLog.logGroupArn, props.dataPlatformProps.studioName)),
    );

    //Create IAM role for Lambda and attach policy
    this.lambdaNotebookAddTagOnCreate = new Role(this.nestedStack, 'addLambdaTagRole' + props.dataPlatformProps.studioName, {
      assumedBy: new ServicePrincipal(this.lambdaPrincipal),
      roleName: 'lambdaRoleNotebookAddTagOnCreate' + props.dataPlatformProps.studioName,
      managedPolicies: this.lambdaNotebookTagOnCreatePolicy,
    });

    //set the path for the lambda code
    let lambdaPath = 'lambdas/';

    //Create lambda to tag EMR notebook with UserID of the IAM principal that created it
    let workspaceTaggingLambda = new Function(this.nestedStack, 'CreateTagHandler', {
      runtime: Runtime.NODEJS_14_X, // execution environment
      code: Code.fromAsset(path.join(__dirname, lambdaPath)), // code loaded from "lambda" directory
      handler: 'index.handler', // file is "index", function is "handler"
      role: this.lambdaNotebookAddTagOnCreate,
      timeout: Duration.seconds(10),
      functionName: 'lambdaNotebookCreateTagOnCreate' + props.dataPlatformProps.studioName,
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
    /*let eventRule: Rule = */
    new Rule(this.nestedStack, this.studioName + 'eventRule', {
      enabled: true,
      eventPattern: createTagEventPattern,
      targets: createTagEventTarget,
    });

    //Event should not be created unless the lambda has been successfully created
    //eventRule.node.addDependency(workspaceTaggingLambda);

  }

  /**
   * @internal
   * Constructs a new object of CfnStudio
   * @param {DataPlatformNotebookProp} props the DataPlatformNotebooks [properties]{@link DataPlatformNotebookProp}
   * @param {string} securityGroupId engine SecurityGroupId
   * @param {string} studioUserRoleRoleArn if used in SSO mode pass the user role that is by Amazon EMR Studio
   */
  private studioInstanceBuilder (props: DataPlatformNotebookProp, securityGroupId: string, studioUserRoleRoleArn?: string ): CfnStudio {

    let studioInstance: CfnStudio;

    if (props.studioAuthMode === 'SSO') {
      studioInstance = new CfnStudio(this.nestedStack, 'Studio', <CfnStudioProps>{
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
      studioInstance = new CfnStudio(this.nestedStack, 'Studio', <CfnStudioProps>{
        authMode: 'IAM',
        defaultS3Location: 's3://' + this.workspacesBucket.bucketName + '/',
        engineSecurityGroupId: securityGroupId,
        name: props.studioName,
        serviceRole: this.studioServiceRole.roleArn,
        subnetIds: this.studioSubnetList,
        vpcId: this.emrVpc.vpcId,
        workspaceSecurityGroupId: this.workSpaceSecurityGroup.securityGroupId,
        idpAuthUrl: props.idpAuthUrl,
        idpRelayStateParameterName: props.idpRelayStateParameterName,
      });

    } else if (props.studioAuthMode === 'IAM_AUTHENTICATED') {
      studioInstance = new CfnStudio(this.nestedStack, 'Studio', <CfnStudioProps>{
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

  /**
   * Method to add users, take a list of userDefinition and will create a managed endpoints for each user
   * and create an IAM Policy scoped to the list managed endpoints
   * @param {StudioUserDefinition} userList list of users
   * @return {string[] } return a list of users that were created and their temporary passwords if IAM_AUTHENTICATED is used
   * @internal
   */
  public addUser (userList: StudioUserDefinition[]): string [] {
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
        if (!this.managedEndpointExcutionPolicyArnMapping.has(executionPolicyName)) {
          //For each user or group, create a new managedEndpoint
          //ManagedEndpoint ARN is used to update and scope the session policy of the user or group


          let managedEndpoint = this.emrEks.addManagedEndpoint(
            this.nestedStack,
            this.serviceToken,
            this.studioName + '-' + Utils.stringSanitizer(executionPolicyName),
            this.emrVirtCluster.attrId,
            buildManagedEndpointExecutionRole(this, executionPolicyName,
              this.emrEks.eksCluster.openIdConnectProvider.openIdConnectProviderArn,
              this.studioName, this.emrVcName),
            this.certificateArn,
            this.emrOnEksVersion,
          );

          managedEndpoint.node.addDependency(this.emrEks);

          //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
          let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(
            this.nestedStack,
            'engineSecurityGroup-' + this.studioName + executionPolicyName.replace(/[^\w\s]/gi, ''),
            managedEndpoint.getAttString('securityGroup'));

          Tags.of(engineSecurityGroup).add('for-use-by-analytics-reference-architecture', 'true');

          //Update workspace Security Group to allow outbound traffic on port 18888 toward Engine Security Group
          this.workSpaceSecurityGroup.addEgressRule(engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);

          //Tag the Security Group of the ManagedEndpoint to be used with EMR Studio
          Tags.of(engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

          //Add the managedendpointArn to @managedEndpointExcutionPolicyArnMapping
          //This is to avoid the creation an endpoint with the same policy twice
          //Save resources and reduce the deployment time
          this.managedEndpointExcutionPolicyArnMapping.set(executionPolicyName, managedEndpoint.getAttString('arn'));

          //Push the managedendpoint arn to be used in to build the policy to attach to it
          managedEndpointArns.push(managedEndpoint.getAttString('arn'));
        } else {
          managedEndpointArns.push(<string> this.managedEndpointExcutionPolicyArnMapping.get(executionPolicyName));
        }
      }

      if (this.authMode === 'IAM_AUTHENTICATED') {
        //Create the role policy and gets its ARN
        iamRolePolicy = createIAMRolePolicy(this.nestedStack, user, this.studioServiceRole.roleName,
          managedEndpointArns, this.studioId);

        iamUserList.push(createIAMUser(this.nestedStack, iamRolePolicy!, user.identityName));
      } else if (this.authMode === 'IAM_FEDERATED') {
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

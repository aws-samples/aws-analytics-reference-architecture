import * as path from 'path';

import { SecurityGroup, ISecurityGroup, IVpc, Peer, Port, Vpc, SubnetType } from '@aws-cdk/aws-ec2';
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
import { Construct, Tags, Aws, Duration, CustomResource } from '@aws-cdk/core';

import { stringSanitizer } from './dataplatform-notebook-helper';
import {
  createLambdaNoteBookAddTagPolicy,
  buildManagedEndpointExecutionRole,
  createUserSessionPolicy,
  createStudioUserRolePolicy,
  addServiceRoleInlinePolicy,
  createStudioServiceRolePolicy,
  createIAMFederatedRole,
  createIAMUserPolicy,
} from './dataplatform-notebook-iamRoleAndPolicyHelper';

import { EmrEksCluster } from './emr-eks-cluster';
import { EmrEksNodegroup } from './emr-eks-nodegroup';
import { EmrVirtualCluster } from './emr-virtual-cluster';


import * as eventPattern from './studio/create-editor-event-pattern.json';
import * as kmsLogPolicyTemplate from './studio/kms-key-policy.json';


/**
 * The properties for DataPlatformNotebooks Construct.
 */

export interface DataPlatformNotebooksProps {
  /**
   *The Id of the VPC where EKS is deployed
   * If not provided the construct will create a VPC, an EKS cluster, EMR virtual cluster
   * Then create an EMR Studio and assign users
   **/
  readonly vpcId?: string;

  /**
   * Security Group Id of the EMR Cluster
   * It must be provided if the virtual cluster is provided or
   * It is created if no cluster is provided
   * */
  readonly engineSecurityGroupId?: string;

  /**
   * List of subnets where EMR Studio can deploy the workspaces
   * Must be provided if VPC Id is provided
   * */
  readonly subnetList?: string[];

  /**
   * The name of EMR Studio
   * */
  readonly studioName: string;

  /**
   * Required the authentication mode of EMR Studio
   * Either 'SSO' or 'IAM'
   * For now only SSO is implemented, kept for future compatibility when IAM auth is available
   * */
  readonly studioAuthMode: string;

  /**
   * The Id of EKS cluster, it is used to create EMR virtual cluster if provided
   * */
  readonly eksId?: string;

  /**
   * The ARN of the service role for EMR studio
   * */
  readonly emrStudioServiceRoleArn?: string;


  /**
   * The ARN of the user role for EMR studio
   * */
  readonly emrStudioUserRoleArn?: string;

  /**
   * The version of kubernete to deploy
   * */
  readonly kubernetesVersion?: string;

  /**
   * EKS Admin Role
   * */
  readonly eksAdminRoleArn: string;

  /**
   * ACM Certificate ARN
   */
  readonly acmCertificateArn: string;

  /**
   * Used for IAM Auth when an IdP is provided
   * */
  readonly idpAuthUrl?: string;

  /**
   * Used for IAM auth when IdP is provided
   * */
  readonly idpRelayStateParameterName?: string;

  /**
   * The name of the identity provider that is going to be used
   * */
  readonly idPName?: string;

  /**
   * The the ARN of the IdP to be used
   * */
  readonly idPArn?: string;
}

/**
 * The properties for defining a user.
 * The interface is used to create assign a user or a group to a Studio
 * used in {@linkcode addUser}
 */

export interface StudioUserDefinition {
  /**
   * Name of the identity as it appears in SSO console
   * */
  readonly mappingIdentityName?: string;

  /**
   * Type of the identity either GROUP or USER
   * */
  readonly mappingIdentityType?: string;

  /**
   * execution Role to pass to ManagedEndpoint
   * */
  readonly executionPolicyArn: string;

}


export enum StudioAuthMode {
  IAM_FEDERATED = 'IAM_FEDERATED',
  IAM_AUTHENTICATED = 'IAM_AUTHENTICATED',
  SSO = 'SSO',
}
/**
 * Construct to create an EKS cluster, EMR virtual cluster and EMR Studio
 * Construct can also take as parameters EKS id, VPC Id and list of subnets then create EMR virtual cluster and EMR Studio
 * Construct is then used to assign users to the create EMR Studio with {@linkcode addUsers}
 */

export class DataPlatformNotebook extends Construct {

  private readonly studioSubnetList: string[] | undefined ;
  private readonly studioServiceRoleName: string;
  public readonly studioUrl: string;
  public readonly studioId: string;
  private readonly studioPrincipal: string = 'elasticmapreduce.amazonaws.com';
  private readonly lambdaPrincipal: string = 'lambda.amazonaws.com';
  private readonly certificateArn: string;
  private readonly emrOnEksVersion: string = 'emr-6.2.0-latest'
  private readonly studioName: string;

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

  private managedEndpoint: CustomResource;
  private readonly emrVirtCluster: EmrVirtualCluster;


  private readonly lambdaNotebookTagOnCreatePolicy: IManagedPolicy [];
  private readonly lambdaNotebookAddTagOnCreate: Role;

  private readonly dataPlatformEncryptionKey: Key;

  /**
   * Constructs a new instance of the DataGenerator class
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
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


    //Create encryption key to be used with cloudwatch loggroup and S3 bucket storing notebooks and
    this.dataPlatformEncryptionKey = new Key(
      this,
      'KMS-key-'+ stringSanitizer(props.studioName), {
        alias: props.studioName.toLowerCase().replace(/[^\w\s]/gi, '') + '-Encryption-key',
      },
    );

    //Create new EKS cluster
    this.emrEks = new EmrEksCluster(this, 'EmrEks', {
      kubernetesVersion: KubernetesVersion.V1_20,
      eksAdminRoleArn: props.eksAdminRoleArn,
      eksClusterName: 'multi-stack' + props.studioName,
    });

    //Get the list of private subnets in VPC
    if (this.emrEks !== undefined) {
      this.studioSubnetList = this.emrEks.eksCluster.vpc.selectSubnets({
        onePerAz: true,
        subnetType: SubnetType.PRIVATE_WITH_NAT,
      }).subnetIds;
    } else {
      this.studioSubnetList = props.subnetList;
    }

    //Create a virtual cluster a give it a name of 'ec2VirtCluster'+studioName provided by user
    this.emrVirtCluster = this.emrEks.addEmrVirtualCluster({
      createNamespace: false,
      eksNamespace: 'default',
      name: 'multi-stack-' + props.studioName,
    });

    //Add a nodegroup for notebooks
    this.emrEks.addEmrEksNodegroup(EmrEksNodegroup.NOTEBOOK_DRIVER);
    this.emrEks.addEmrEksNodegroup(EmrEksNodegroup.NOTEBOOK_EXECUTOR);

    //Add a managed endpoint, used to populate the engineSG in EMR Studio
    this.managedEndpoint = this.emrEks.addManagedEndpoint(
      'endpoint',
      this.emrVirtCluster.instance.attrId,
      props.acmCertificateArn,
      this.emrOnEksVersion,
    );

    //Wait until the EMR Virtual cluster is deployed then create a managedendpoint
    this.managedEndpoint.node.addDependency(this.emrVirtCluster);

    //Set Vpc object to be used with SecurityGroup and EMR Studio Creation
    if (props.vpcId !== undefined) {
      //Get the IVpc from the VPC Id of EKS/EMR virtual cluster
      this.emrVpc = Vpc.fromLookup(this, 'vpcId', { vpcId: props.vpcId });
    } else {
      this.emrVpc = this.emrEks.eksCluster.vpc;
    }

    //Create a security group to be attached to the studio workspaces
    this.workSpaceSecurityGroup = new SecurityGroup(this, 'workspaceSecurityGroup', {
      vpc: this.emrVpc,
      securityGroupName: 'workSpaceSecurityGroup',
      allowAllOutbound: false,
    });

    //Tag workSpaceSecurityGroup to be used with EMR Studio
    Tags.of(this.workSpaceSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Get the Engine Security group
    //This is for future use when customer can bring their own EKS/EMR ManagedEndpoint Security Group
    //For now it executes the else statement straight
    if (props.engineSecurityGroupId !== undefined) {

      //Get the EMR security group object from its security group Id
      this.engineSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'engineSecurityGroup', props.engineSecurityGroupId);

      //Update security group to allow network traffic to EMR cluster on port 18888 and internet on 443
      this.workSpaceSecurityGroup.addEgressRule(this.engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);
      this.workSpaceSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow outbound traffic to internet, can be used for github');
    } else {
      //For testing purpose only. This need to be removed once EKS/EMR construct is ready for use
      //Get the Engine Security group object
      this.engineSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'engineSecurityGroup', this.managedEndpoint.getAttString('securityGroup'));
      //Update security group to allow network traffic to EMR cluster on port 18888 and internet on 443
      this.workSpaceSecurityGroup.addEgressRule(this.engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);
      this.workSpaceSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow outbound traffic to internet, can be used for github');
    }

    //Create S3 bucket to store EMR Studio workspaces
    //Bucket is kept after destroying the construct
    this.workspacesBucket = new Bucket(this, 'WorkspacesBucket' + props.studioName, {
      bucketName: 'ara-workspaces-bucket-' + Aws.ACCOUNT_ID + '-' + stringSanitizer(props.studioName),
      enforceSSL: true,
      encryptionKey: this.dataPlatformEncryptionKey,
      encryption: BucketEncryption.KMS,
    });

    this.workspacesBucket.node.addDependency(this.dataPlatformEncryptionKey);

    //Wait until the EMR Virtual cluster is deployed then create an S3 bucket
    this.workspacesBucket.node.addDependency(this.emrVirtCluster);

    //Check if the construct prop has an EMRStudio Service Role ARN
    //update the role with an inline policy to allow access to the S3 bucket created above
    //If no ARN is supplied construct creates a new role
    if (props.emrStudioServiceRoleArn !== undefined) {

      this.studioServiceRole = addServiceRoleInlinePolicy(this, props.emrStudioServiceRoleArn, this.workspacesBucket.bucketName);

    } else {
      //Create a Managed policy for Studio service role
      this.studioServicePolicy.push(ManagedPolicy.fromManagedPolicyArn(this,
        'StudioServiceManagedPolicy', createStudioServiceRolePolicy(this, this.dataPlatformEncryptionKey.keyArn, this.workspacesBucket.bucketName,
          props.studioName),
      ));

      //Create a role for the Studio
      this.studioServiceRole = new Role(this, 'studioServiceRole', {
        assumedBy: new ServicePrincipal(this.studioPrincipal),
        roleName: 'studioServiceRole+' + stringSanitizer(props.studioName),
        managedPolicies: this.studioServicePolicy,
      });

    }

    //Set the serviceRole name, to be used by the CfnStudioConstruct
    this.studioServiceRoleName = this.studioServiceRole.roleName;


    // Create an EMR Studio user role only if the user uses SSO as authentication mode
    if (props.studioAuthMode === 'SSO') {
      //Get Managed policy for Studio user role and put it in an array to be assigned to a user role
      this.studioUserPolicy.push(ManagedPolicy.fromManagedPolicyArn(this,
        'StudioUserManagedPolicy',
        createStudioUserRolePolicy(this, props.studioName, this.studioServiceRoleName),
      ));

      //Create a role for the EMR Studio user, this roles is further restricted by session policy for each user
      this.studioUserRole = new Role(this, 'studioUserRole', {
        assumedBy: new ServicePrincipal(this.studioPrincipal),
        roleName: 'studioUserRole+' + stringSanitizer(props.studioName),
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
    lambdaNotebookTagOnCreateLog.node.addDependency(this.emrVirtCluster);

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

    for (let user of userList) {

      //For each user or group, create a new managedEndpoint
      //ManagedEndpoint ARN is used to update and scope the session policy of the user or group
      let managedEndpoint = this.emrEks.addManagedEndpoint(
        'endpoint'+ this.studioName + user.mappingIdentityName!.replace(/[^\w\s]/gi, ''),
        this.emrVirtCluster.instance.attrId,
        this.certificateArn,
        this.emrOnEksVersion,
        buildManagedEndpointExecutionRole(this, user.executionPolicyArn, this.emrEks),
      );

      //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
      let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(this,
        'engineSecurityGroup' + this.studioName + user.mappingIdentityName!.replace(/[^\w\s]/gi, ''),
        managedEndpoint.getAttString('securityGroup'));

      //Update workspace Security Group to allow outbound traffic on port 18888 toward Engine Security Group
      this.workSpaceSecurityGroup.addEgressRule(engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);

      //Tag the Security Group of the ManagedEndpoint to be used with EMR Studio
      Tags.of(engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

      //Create the session policy and gets its ARN
      let sessionPolicyArn = createUserSessionPolicy(this, user, this.studioServiceRoleName,
        managedEndpoint.getAttString('arn'), managedEndpoint, this.studioId);

      //Map a session to user or group
      new CfnStudioSessionMapping(this, 'studioUser' + user.mappingIdentityName + user.mappingIdentityName, {
        identityName: user.mappingIdentityName!,
        identityType: user.mappingIdentityType!,
        sessionPolicyArn: sessionPolicyArn,
        studioId: this.studioId,
      });

    }
  }

  public addFederatedUsers(userList: StudioUserDefinition[], federatedIdpArn: string) {

    for (let user of userList) {

      //For each user or group, create a new managedEndpoint
      //ManagedEndpoint ARN is used to update and scope the session policy of the user or group
      let managedEndpoint = this.emrEks.addManagedEndpoint(
        this.studioName + '-' + stringSanitizer(user.mappingIdentityName!),
        this.emrVirtCluster.instance.attrId,
        this.certificateArn,
        this.emrOnEksVersion,
        buildManagedEndpointExecutionRole(this, user.executionPolicyArn, this.emrEks),
      );

      //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
      let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(this,
        'engineSecurityGroup' + this.studioName + user.executionPolicyArn.replace(/[^\w\s]/gi, ''),
        managedEndpoint.getAttString('securityGroup'));

      //Update workspace Security Group to allow outbound traffic on port 18888 toward Engine Security Group
      this.workSpaceSecurityGroup.addEgressRule(engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);

      //Tag the Security Group of the ManagedEndpoint to be used with EMR Studio
      Tags.of(engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

      //Create the role policy and gets its ARN
      let iamRolePolicy: ManagedPolicy = createIAMUserPolicy(this, user, this.studioServiceRoleName,
        managedEndpoint.getAttString('arn'), managedEndpoint, this.studioId);

      createIAMFederatedRole(this, iamRolePolicy, federatedIdpArn, user.executionPolicyArn);
    }
  }

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

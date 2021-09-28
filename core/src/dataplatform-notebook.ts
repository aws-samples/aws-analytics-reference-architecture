import * as path from 'path';
import { SecurityGroup, ISecurityGroup, IVpc, Peer, Port, Vpc, ISubnet } from '@aws-cdk/aws-ec2';
import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { CfnStudioSessionMapping, CfnStudio, CfnStudioProps } from '@aws-cdk/aws-emr';
import { Rule, IRuleTarget, EventPattern } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Role, IManagedPolicy, ManagedPolicy, ServicePrincipal, PolicyDocument, Policy, IRole } from '@aws-cdk/aws-iam';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { LogGroup } from '@aws-cdk/aws-logs';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct, Tags, Aws, Duration, CustomResource } from '@aws-cdk/core';
//import { Key } from '@aws-cdk/aws-kms';

import { EmrEksCluster } from './emr-eks-cluster';
import { EmrVirtualCluster } from './emr-virtual-cluster';

import * as eventPattern from './studio/create-editor-event-pattern.json';
import * as studioS3Policy from './studio/emr-studio-s3-policy.json';
import * as lambdaNotebookTagPolicy from './studio/notenook-add-tag-on-create-lambda-policy.json';
import * as studioServiceRolePolicy from './studio/studio-service-role-policy.json';
import * as studioUserPolicy from './studio/studio-user-role-policy.json';
import * as studioSessionPolicy from './studio/studio-user-session-policy.json';


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
  readonly authMode: string;

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
  readonly mappingIdentityName: string;

  /**
   * Type of the identity either GROUP or USER
   * */
  readonly mappingIdentityType: string;

  /**
   * execution Role to pass to ManagedEndpoint
   * */
  readonly executionRoleArn?: string;

}

/**
 * Construct to create an EKS cluster, EMR virtual cluster and EMR Studio
 * Construct can also take as parameters EKS id, VPC Id and list of subnets then create EMR virtual cluster and EMR Studio
 * Construct is then used to assign users to the create EMR Studio with {@linkcode addUsers}
 */

export class DataPlatformNotebook extends Construct {

  /**
   * Gets a list of Subnet objects
   * Create an array of string from the list of Subnet objects
   * @returns Return the array of string of the subnet
   */
  static privateSubnetList (subnetList: ISubnet []): string[] {

    let privateSubnetListId : string[] = [];

    for (let subnet of subnetList) {
      privateSubnetListId.push(subnet.subnetId);
    }

    return privateSubnetListId;
  }

  private readonly studioSubnetList: string[] | undefined ;
  private readonly studioServiceRoleName: string;
  public readonly studioUrl: string;
  public readonly studioId: string;
  private readonly studioPrincipal: string = 'elasticmapreduce.amazonaws.com';
  private readonly lambdaPrincipal: string = 'lambda.amazonaws.com';
  private readonly certificateArn: string;
  private readonly emrOnEksVersion: string = 'emr-6.2.0-latest'

  private readonly workSpaceSecurityGroup: SecurityGroup;
  private readonly engineSecurityGroup: ISecurityGroup | undefined;
  private readonly emrVpc: IVpc;
  private readonly workspacesBucket: Bucket;
  private studioServiceRole: Role | IRole;
  private readonly studioUserRole: Role | IRole;
  private readonly studioServicePolicy: IManagedPolicy [];
  private readonly studioUserPolicy: IManagedPolicy [];

  private readonly studioInstance: CfnStudio;
  private readonly emrEks: EmrEksCluster;

  private managedEndpoint: CustomResource;
  private readonly emrVirtCluster: EmrVirtualCluster;


  private readonly lambdaNotebookTagOnCreatePolicy: IManagedPolicy [];
  private readonly lambdaNotebookAddTagOnCreate: Role;

  //private encryptionKey: Key;

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

    //Create new EKS cluster
    this.emrEks = new EmrEksCluster(this, 'EmrEks', {
      kubernetesVersion: KubernetesVersion.V1_20,
      eksAdminRoleArn: props.eksAdminRoleArn,
      eksClusterName: 'EmrEksCluster' + props.studioName,
    });

    //Get the list of private subnets in VPC
    if (this.emrEks !== undefined) {
      this.studioSubnetList = DataPlatformNotebook.privateSubnetList(this.emrEks.eksCluster.vpc.privateSubnets);
    } else {
      this.studioSubnetList = props.subnetList;
    }

    //Create a virtual cluster a give it a name of 'ec2VirtCluster'+studioName provided by user
    this.emrVirtCluster = this.emrEks.addEmrVirtualCluster({
      createNamespace: false,
      eksNamespace: 'default',
      name: 'ec2VirtCluster' + props.studioName,
    });

    this.managedEndpoint = this.emrEks.addManagedEndpoint(
      'endpoint',
      this.emrVirtCluster.instance.attrId,
      {
        acmCertificateArn: props.acmCertificateArn,
        emrOnEksVersion: this.emrOnEksVersion,
      },
    );

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

    this.managedEndpoint.node.addDependency(this.emrVirtCluster);

    //Tag workSpaceSecurityGroup to be used with EMR Studio
    Tags.of(this.workSpaceSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Subnets list can be either shared by user or created by EKS cluster
    if (props.subnetList != null) {
      this.studioSubnetList = props.subnetList;
    }

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
      bucketName: 'ara-workspaces-bucket-' + Aws.ACCOUNT_ID + props.studioName.toLowerCase().replace(/[^\w\s]/gi, ''),
      enforceSSL: true,
    });

    //Check if the construct prop has an EMRStudio Service Role ARN
    //update the role with an inline policy to allow access to the S3 bucket created above
    //If no ARN is supplied construct creates a new role
    if (props.emrStudioServiceRoleArn !== undefined) {

      this.addServiceRoleInlinePolicy(props.emrStudioServiceRoleArn, this.workspacesBucket.bucketName);

      this.studioServiceRole = Role.fromRoleArn(this, 'StudioServiceManagedPolicy', props.emrStudioServiceRoleArn);

    } else {
      //Create a Managed policy for Studio service role
      this.studioServicePolicy.push(ManagedPolicy.fromManagedPolicyArn(this,
        'StudioServiceManagedPolicy', this.createStudioServiceRolePolicy(this.workspacesBucket.bucketName,
          props.studioName),
      ));

      //Create a role for the Studio
      this.studioServiceRole = new Role(this, 'studioServiceRole', {
        assumedBy: new ServicePrincipal(this.studioPrincipal),
        roleName: 'studioServiceRole'+ this.emrVpc.vpcId,
        managedPolicies: this.studioServicePolicy,
      });

    }

    //Set the serviceRole name, to be used by the CfnStudioConstruct
    this.studioServiceRoleName = this.studioServiceRole.roleName;

    //Get Managed policy for Studio user role and put it in an array to be assigned to a user role
    this.studioUserPolicy.push(ManagedPolicy.fromManagedPolicyArn(this, 'StudioUserManagedPolicy', this.createStudioUserRolePolicy(props.studioName)));

    //Create a role for the EMR Studio user, this roles is further restricted by session policy for each user
    this.studioUserRole = new Role(this, 'studioUserRole', {
      assumedBy: new ServicePrincipal(this.studioPrincipal),
      roleName: 'studioUserRole',
      managedPolicies: this.studioUserPolicy,
    });

    //create a new instance of EMR studio
    this.studioInstance = new CfnStudio(this, 'Studio', <CfnStudioProps>{
      authMode: props.authMode,
      defaultS3Location: 's3://' + this.workspacesBucket.bucketName + '/',
      engineSecurityGroupId: this.engineSecurityGroup.securityGroupId,
      name: props.studioName,
      serviceRole: this.studioServiceRole.roleArn,
      subnetIds: this.studioSubnetList,
      userRole: this.studioUserRole.roleArn,
      vpcId: this.emrVpc.vpcId,
      workspaceSecurityGroupId: this.workSpaceSecurityGroup.securityGroupId,
    });

    //Set the Studio URL and Studio Id to return as CfnOutput later
    this.studioUrl = this.studioInstance.attrUrl;
    this.studioId = this.studioInstance.attrStudioId;


    //Create LogGroup for lambda which tag the EMR Notebook (EMR Studio Workspaces)
    let lambdaNotebookTagOnCreateLog = new LogGroup(this, 'lambdaNotebookTagOnCreateLog' + props.studioName, {
      logGroupName: '/aws/lambda/' + 'lambdaNotebookCreateTagOnCreate' + props.studioName,
    });

    //Create Policy for Lambda to put logs in LogGroup
    //Create Policy for Lambda to AddTags to EMR Notebooks
    this.lambdaNotebookTagOnCreatePolicy.push(ManagedPolicy.fromManagedPolicyArn(
      this,
      'lambdaNotebookTagOnCreatePolicy'+ props.studioName,
      this.createLambdaNoteBookAddTagPolicy(lambdaNotebookTagOnCreateLog.logGroupArn, props.studioName)),
    );

    //Create IAM role for Lambda and attach policy
    this.lambdaNotebookAddTagOnCreate = new Role(this, 'addLambdaTagRole' + props.studioName, {
      assumedBy: new ServicePrincipal(this.lambdaPrincipal),
      roleName: 'lambdaRoleNotebookAddTagOnCreate' + props.studioName,
      managedPolicies: this.lambdaNotebookTagOnCreatePolicy,
    });

    //set the path for the lambda code
    let lambdaPath = 'studio';

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
   * @param {string} studioName The name of the EMR studio where the user should be added
   * @access public
   */
  public addUsers(userList: StudioUserDefinition[], studioName: string) {

    for (let user of userList) {

      //For each user or group, create a new managedEndpoint
      //ManagedEndpoint ARN is used to update and scope the session policy of the user or group
      let managedEndpoint = this.emrEks.addManagedEndpoint(
        'endpoint'+ studioName + user.mappingIdentityName.replace(/[^\w\s]/gi, ''),
        this.emrVirtCluster.instance.attrId,
        {
          acmCertificateArn: this.certificateArn,
          emrOnEksVersion: this.emrOnEksVersion,
        },
      );

      //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
      let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(this,
        'engineSecurityGroup' + studioName + user.mappingIdentityName.replace(/[^\w\s]/gi, ''),
        managedEndpoint.getAttString('securityGroup'));

      //Update workspace Security Group to allow outbound traffic on port 18888 toward Engine Security Group
      this.workSpaceSecurityGroup.addEgressRule(engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);

      //Tag the Security Group of the ManagedEndpoint to be used with EMR Studio
      Tags.of(engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

      //Create the session policy and gets its ARN
      let sessionPolicyArn = this.createUserSessionPolicy(user, managedEndpoint.getAttString('arn'), managedEndpoint);

      //Map a session to user or group
      new CfnStudioSessionMapping(this, 'studioUser' + user.mappingIdentityName + user.mappingIdentityName, {
        identityName: user.mappingIdentityName,
        identityType: user.mappingIdentityType,
        sessionPolicyArn: sessionPolicyArn,
        studioId: this.studioId,
      });

    }
  }

  /**
   * @hidden
   * Create a policy for the EMR Service Role
   * The policy allow access only to a single bucket to store notebooks
   * @returns Return the ARN of the policy created
   */
  private createStudioServiceRolePolicy(bucketName: string, studioName: string): string {

    //Get policy from a JSON template
    let policy = JSON.parse(JSON.stringify(studioServiceRolePolicy));

    //Update the policy with the bucketname to scope it down
    policy.Statement[12].Resource[0] = policy.Statement[12].Resource[0].replace(/<your-amazon-s3-bucket>/gi, bucketName);
    policy.Statement[12].Resource[1] = policy.Statement[12].Resource[1].replace(/<your-amazon-s3-bucket>/gi, bucketName);

    //Create a the policy of service role
    let serviceRolePolicy = new ManagedPolicy(this, 'studioServicePolicy' + studioName, {
      document: PolicyDocument.fromJson(policy),
      managedPolicyName: 'studioServicePolicy' + this.emrVpc.vpcId,
    });

    return serviceRolePolicy.managedPolicyArn;
  }

  /**
   * @hidden
   * Add an inline policy to the role passed by the user
   */
  private addServiceRoleInlinePolicy (studioServiceRoleArn: string, bucketName: string ): void {

    //Get policy from a JSON template
    let policy = JSON.parse(JSON.stringify(studioS3Policy));

    //Update the service role provided by the user with an inline policy
    //to access the S3 bucket and store notebooks
    policy.Statement[0].Resource[0] = policy.Statement[0].Resource[0].replace(/<your-amazon-s3-bucket>/gi, bucketName);
    policy.Statement[0].Resource[1] = policy.Statement[0].Resource[1].replace(/<your-amazon-s3-bucket>/gi, bucketName);

    this.studioServiceRole = Role.fromRoleArn(this, 'studioServiceRoleInlinePolicy', studioServiceRoleArn);

    this.studioServiceRole.attachInlinePolicy(new Policy(this, 'studioServiceInlinePolicy', {
      document: PolicyDocument.fromJson(policy),
    }));

  }

  /**
   * @hidden
   * Create a policy for the EMR USER Role
   * @returns Return the ARN of the policy created
   */
  private createStudioUserRolePolicy(studioName: string): string {

    let policyTemplate: string = JSON.stringify(studioUserPolicy);
    let policy = JSON.parse(policyTemplate);

    //replace the <your-emr-studio-service-role> with the service role created above
    policy.Statement[5].Resource[0] = policy.Statement[5].Resource[0].replace(/<your-emr-studio-service-role>/gi, this.studioServiceRoleName);

    //replace the log bucket
    policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
    policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<region>/gi, Aws.REGION);

    let userRolePolicy = new ManagedPolicy(this, 'studioUserPolicy' + studioName, {
      document: PolicyDocument.fromJson(policy),
      managedPolicyName: 'studioServicePolicy' + studioName + this.emrVpc.vpcId,
    });

    return userRolePolicy.managedPolicyArn;
  }

  /**
   * @hidden
   * Create a session policy for each user scoped down to the managed endpoint
   * @returns Return the ARN of the policy created
   */
  private createUserSessionPolicy(user: StudioUserDefinition, managedEndpointArn: string, managedEndpoint: CustomResource): string {

    let policy = JSON.parse(JSON.stringify(studioSessionPolicy));

    //replace the <your-emr-studio-service-role> with the service role created above
    policy.Statement[5].Resource[0] = policy.Statement[5].Resource[0].replace(/<your-emr-studio-service-role>/gi, this.studioServiceRoleName);

    //replace the region and account for log bucket
    policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
    policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<region>/gi, Aws.REGION);

    //replace the region and account for list virtual cluster
    policy.Statement[8].Resource[0] = policy.Statement[8].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
    policy.Statement[8].Resource[0] = policy.Statement[8].Resource[0].replace(/<region>/gi, Aws.REGION);

    //add restrictions on the managedEndpoint that user of group is allowed to attach to
    policy.Statement[9].Resource[0] = managedEndpointArn;
    policy.Statement[10].Resource[0] = managedEndpointArn;

    //sanitize the userName from any special characters, userName used to name the session policy
    //if any special character the sessionMapping will fail with "SessionPolicyArn: failed validation constraint for keyword [pattern]"
    let userName = user.mappingIdentityName.replace(/[^\w\s]/gi, '');

    //create the policy
    let userSessionPolicy = new ManagedPolicy(this, 'studioSessionPolicy' + user.mappingIdentityName, {
      document: PolicyDocument.fromJson(policy),
      managedPolicyName: 'studioSessionPolicy' + userName + this.studioId,
    });

    userSessionPolicy.node.addDependency(managedEndpoint);

    return userSessionPolicy.managedPolicyArn;
  }

  /**
   * @hidden
   * Create a policy for Lambda function
   * @returns Return a string with IAM policy ARN
   */

  private createLambdaNoteBookAddTagPolicy (logArn: string, studioName: string): string {
    let policy = JSON.parse(JSON.stringify(lambdaNotebookTagPolicy));

    policy.Statement[0].Resource[0] = logArn;
    policy.Statement[1].Resource[0] = policy.Statement[1].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);

    let lambdaPolicy = new ManagedPolicy(this, 'lambdaPolicy', {
      document: PolicyDocument.fromJson(policy),
      managedPolicyName: 'lambdaPolicy' + studioName,
    });

    return lambdaPolicy.managedPolicyArn;
  }

}

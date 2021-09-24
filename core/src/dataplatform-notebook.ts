import * as path from 'path';
import { SecurityGroup, ISecurityGroup, IVpc, Peer, Port, Vpc, ISubnet } from '@aws-cdk/aws-ec2';
import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { CfnStudioSessionMapping, CfnStudio, CfnStudioProps } from '@aws-cdk/aws-emr';
import { Rule, IRuleTarget, EventPattern } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Role, IManagedPolicy, ManagedPolicy, ServicePrincipal, PolicyDocument, Policy, IRole } from '@aws-cdk/aws-iam';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct, Tags, Aws } from '@aws-cdk/core';
import { EmrEksCluster } from './emr-eks-cluster';

import * as eventPattern from './studio/create-editor-event-pattern.json';
import * as studioS3Policy from './studio/emr-studio-s3-policy.json';
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

  public workspaceSecurityGroup: SecurityGroup;
  private readonly engineSecurityGroup: ISecurityGroup | undefined;
  private readonly emrVpc: IVpc;
  private workspacesBucket: Bucket;
  // @ts-ignore
  private studioServiceRole: Role | IRole;
  private studioUserRole: Role | IRole;
  private readonly studioServicePolicy: IManagedPolicy [];
  private readonly studioUserPolicy: IManagedPolicy [];

  private readonly studioInstance: CfnStudio;
  public emrEks: EmrEksCluster;

  private managedEndpoint: unknown;
  private readonly emrVirtCluster: unknown;

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
    this.studioSubnetList = [];

    //Create new EKS cluster
    this.emrEks = new EmrEksCluster(this, 'EmrEks', {
      kubernetesVersion: KubernetesVersion.V1_20,
      eksAdminRoleArn: '<EKS Admin Role>',
      eksClusterName: 'EmrEksCluster' + props.studioName,
    });

    //Get the list of private subnets in VPC
    // @ts-ignore
    if (this.emrEks !== undefined) {
      this.studioSubnetList = this.privateSubnetList(this.emrEks.eksCluster.vpc.privateSubnets);
    } else {
      this.studioSubnetList = props.subnetList;
    }

    //Create a virtual cluster a give it a name of 'ec2VirtCluster'+studioName provided by user
    if (this.emrEks !== undefined) {
      this.emrVirtCluster = this.emrEks.addEmrVirtualCluster({
        createNamespace: false,
        eksNamespace: 'default',
        name: 'ec2VirtCluster' + props.studioName,
      });

      this.managedEndpoint = this.emrEks.addManagedEndpoint(
        'endpoint',
        // @ts-ignore
        this.emrVirtCluster.instance.attrId,
        {
          acmCertificateArn: '<certificate ARN>',
          emrOnEksVersion: 'emr-6.2.0-latest',
        },
      );
    }

    //Set Vpc object to be used with SecurityGroup and EMR Studio Creation
    if (props.vpcId !== undefined) {
      //Get the IVpc from the VPC Id of EKS/EMR virtual cluster
      this.emrVpc = Vpc.fromLookup(this, 'vpcId', { vpcId: props.vpcId });
    } else {
      this.emrVpc = this.emrEks.eksCluster.vpc;
    }

    //Create a security group to be attached to the studio workspaces
    this.workspaceSecurityGroup = new SecurityGroup(this, 'workspaceSecutiyGroup', {
      vpc: this.emrVpc,
      securityGroupName: 'workspaceSecurityGroup',
      allowAllOutbound: false,
    });

    // @ts-ignore
    this.managedEndpoint.node.addDependency(this.emrVirtCluster);

    //Tag workspaceSecurityGroup to be used with EMR Studio
    Tags.of(this.workspaceSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Subnets list can be either shared by user or created by EKS cluster
    if (props.subnetList != null) {
      this.studioSubnetList = props.subnetList;
    }

    //Get the Engine Security group
    if (props.engineSecurityGroupId !== undefined) {

      //Get the EMR security group object from its security group Id
      this.engineSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'engineSecurityGroup', props.engineSecurityGroupId);

      //Update security group to allow network traffic to EMR cluster on port 18888 and internet on 443
      this.workspaceSecurityGroup.addEgressRule(this.engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);
      this.workspaceSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow outbound traffic to internet, can be used for github');
    } else {
      //For testing purpose only. This need to be removed once EKS/EMR construct is ready for use
      //Get the Engine Security group object
      // @ts-ignore
      this.engineSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'engineSecurityGroup', this.managedEndpoint.getAttString('securityGroup'));
      //Update security group to allow network traffic to EMR cluster on port 18888 and internet on 443
      this.workspaceSecurityGroup.addEgressRule(this.engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);
      this.workspaceSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow outbound traffic to internet, can be used for github');
    }

    //Create S3 bucket to store EMR Studio workspaces
    //Bucket is kept after destroying the construct
    this.workspacesBucket = new Bucket(this, 'WorksapcesBucket', {
      bucketName: 'ara-workspaces-bucket-' + Aws.ACCOUNT_ID + this.emrVpc.vpcId,
      enforceSSL: true,
    });

    //Check if the construct prop has an EMRStudio Service Role ARN
    //update the role with an inline policy to allow access to the S3 bucket created above
    //If no ARN is supplied construct creates a new role
    if (props.emrStudioServiceRoleArn !== undefined) {

      this.addServiceRoleInlinePolicy(props.emrStudioServiceRoleArn, this.workspacesBucket.bucketName);

    } else {
      //Create a Managed policy for Studio service role
      this.studioServicePolicy.push(ManagedPolicy.fromManagedPolicyArn(this, 'StudioServiceManagedPolicy', this.createStudioServiceRolePolicy(this.workspacesBucket.bucketName, props.studioName)));

      //Create a role for the Studio
      this.studioServiceRole = new Role(this, 'studioServiceRole', {
        assumedBy: new ServicePrincipal(this.studioPrincipal),
        roleName: 'studioServiceRole'+ this.emrVpc.vpcId,
        managedPolicies: this.studioServicePolicy,
      });

    }

    //Set the serviceRole name, to be used by the CfnStudioConstruct
    // @ts-ignore
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
      // @ts-ignore
      serviceRole: this.studioServiceRole.roleArn,
      subnetIds: this.studioSubnetList,
      userRole: this.studioUserRole.roleArn,
      vpcId: this.emrVpc.vpcId,
      workspaceSecurityGroupId: this.workspaceSecurityGroup.securityGroupId,
    });

    //Set the Studio URL and Studio Id to return as CfnOutput later
    this.studioUrl = this.studioInstance.attrUrl;
    this.studioId = this.studioInstance.attrStudioId;

    let lambdaPath = 'studio';

    let workspaceTaggingLambda = new Function(this, 'CreateTagHandler', {
      runtime: Runtime.NODEJS_14_X, // execution environment
      code: Code.fromAsset(path.join(__dirname, lambdaPath)), // code loaded from "lambda" directory
      handler: 'index.handler', // file is "index", function is "handler"
    });

    let createTagEventTarget: IRuleTarget [] = [];

    let eventTriggerLambda: LambdaFunction = new LambdaFunction(workspaceTaggingLambda);

    createTagEventTarget.push(eventTriggerLambda);

    let createTagEventPattern: EventPattern = JSON.parse(JSON.stringify(eventPattern));

    let eventRule: Rule = new Rule(this, props.studioName + 'eventRule', {
      enabled: true,
      eventPattern: createTagEventPattern,
      targets: createTagEventTarget,
    });

    eventRule.node.addDependency(workspaceTaggingLambda);

  }

  /**
   * method to add users, take a list of userDefintion and will create a session Policy
   * then assign a user to the created studio
   * @param {StudioUserDefinition} userList list of users
   * @access public
   */
  public addUsers(userList: StudioUserDefinition[], emrEks: EmrEksCluster, workSpaceSecurityGroup: SecurityGroup, studioName: string) {
    for (let user of userList) {

      //For each user or group it, create a new managedEndpoint
      //ManagedEndpoint ARN is used to update the session policy of the user
      let managedEndpoint = emrEks.addManagedEndpoint(
        'endpoint'+ studioName + user.mappingIdentityName.replace(/[^\w\s]/gi, ''),
        // @ts-ignore
        this.emrVirtCluster.instance.attrId,
        {
          acmCertificateArn: '<certificate ARN>',
          emrOnEksVersion: 'emr-6.2.0-latest',
        },
      );

      //Get the Security Group of the ManagedEndpoint which is the Engine Security Group
      let engineSecurityGroup: ISecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'engineSecurityGroup' + studioName + user.mappingIdentityName.replace(/[^\w\s]/gi, ''), managedEndpoint.getAttString('securityGroup'));

      //Update workspace Security Group to allow outbound traffic on port 18888 toward Engine Security Group
      workSpaceSecurityGroup.addEgressRule(engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);

      //Tag the Security Group of the ManagedEndpoint to be used with EMR Studio
      Tags.of(engineSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

      // @ts-ignore
      managedEndpoint.node.addDependency(this.emrVirtCluster);

      let sessionPolicyArn = this.createUserSessionPolicy(user, managedEndpoint.getAttString('arn'), managedEndpoint);

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
   * @returns Return the ARN of the policy created
   */
  private createStudioServiceRolePolicy(bucketName: string, studioName: string): string {

    let policy = JSON.parse(JSON.stringify(studioServiceRolePolicy));

    policy.Statement[12].Resource[0] = policy.Statement[12].Resource[0].replace(/<your-amazon-s3-bucket>/gi, bucketName);
    policy.Statement[12].Resource[1] = policy.Statement[12].Resource[1].replace(/<your-amazon-s3-bucket>/gi, bucketName);
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

    let policy = JSON.parse(JSON.stringify(studioS3Policy));

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

    let policy = JSON.parse(JSON.stringify(studioUserPolicy));

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
   * Create a session policy for each user
   * @returns Return the ARN of the policy created
   */
  private createUserSessionPolicy(user: StudioUserDefinition, managedEndpointArn: string, managedEndpoint: unknown): string {

    // @ts-ignore
    let policy = JSON.parse(JSON.stringify(studioSessionPolicy));

    //replace the <your-emr-studio-service-role> with the service role created above
    policy.Statement[5].Resource[0] = policy.Statement[5].Resource[0].replace(/<your-emr-studio-service-role>/gi, this.studioServiceRoleName);

    //replace the region and account for log bucket
    policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
    policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<region>/gi, Aws.REGION);

    //replace the region and account for list virtual cluster
    policy.Statement[8].Resource[0] = policy.Statement[8].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
    policy.Statement[8].Resource[0] = policy.Statement[8].Resource[0].replace(/<region>/gi, Aws.REGION);

    //add restrictions on the managedEnpoint that user of group is allowed to attach to
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

    // @ts-ignore
    userSessionPolicy.node.addDependency(managedEndpoint);

    return userSessionPolicy.managedPolicyArn;
  }

  /**
   * @hidden
   * Gets a list of Subnet objects
   * Create an array of string from the list of Subnet objects
   * @returns Return the array of string of the subnet
   */
  private privateSubnetList (subnetList: ISubnet []): string[] {

    let privateSubnetListId : string[] = [];

    for (let subnet of subnetList) {
      privateSubnetListId.push(subnet.subnetId);
    }

    return privateSubnetListId;
  }


}

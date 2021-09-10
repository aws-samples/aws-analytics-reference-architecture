import { SecurityGroup, ISecurityGroup, IVpc, Peer, Port, Vpc } from '@aws-cdk/aws-ec2';
import { CfnStudioSessionMapping, CfnStudio } from '@aws-cdk/aws-emr';
import { Role, IManagedPolicy, ManagedPolicy, ServicePrincipal, PolicyDocument, Policy, IRole } from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct, Tags, Aws } from '@aws-cdk/core';
import * as studioS3Policy from './studio/emr-studio-s3-policy.json';
import * as studioServiceRolePolicy from './studio/studio-service-role-policy.json';
import * as studioUserPolicy from './studio/studio-user-role-policy.json';

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

  private readonly vpcId: string;
  private readonly studioSubnetList: string [];
  private readonly studioServiceRoleName: string;
  public readonly studioUrl: string;
  public readonly studioId: string;
  private readonly studioPrincipal: string = 'elasticmapreduce.amazonaws.com';

  private workspaceSecurityGroup: SecurityGroup;
  private readonly engineSecurityGroup: ISecurityGroup;
  private readonly emrVpc: IVpc;
  private workspacesBucket: Bucket;
  // @ts-ignore
  private studioServiceRole: Role | IRole;
  private studioUserRole: Role | IRole;
  private readonly studioServicePolicy: IManagedPolicy [];
  private readonly studioUserPolicy: IManagedPolicy [];

  private readonly studioInstance: CfnStudio;

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

    //TODO Launch an EKS cluster
    //TODO provision an EMR virtual cluster

    //Will be removed once emr-eks construct is not ready
    this.vpcId = '';

    //Set vpcId to be used with SecurityGroup and EMR Studio Creation
    if (props.vpcId != null) {
      this.vpcId = props.vpcId;
    }

    //Get the IVpc from the VPC Id of EKS/EMR virtual cluster
    this.emrVpc = Vpc.fromLookup(this, 'vpcId', { vpcId: this.vpcId });

    //Create a security group to be attached to the studio workspaces
    this.workspaceSecurityGroup = new SecurityGroup(this, 'workspaceSecutiyGroup', {
      vpc: this.emrVpc,
      securityGroupName: 'workspaceSecurityGroup',
      allowAllOutbound: false,
    });

    //TODO modify EMR security group to allow traffic from Studio

    //Tag workspaceSecurityGroup to be used with EMR Studio
    Tags.of(this.workspaceSecurityGroup).add('for-use-with-amazon-emr-managed-policies', 'true');

    //Subnets list can be either shared by user or created by EKS cluster
    if (props.subnetList != null) {
      this.studioSubnetList = props.subnetList;
    }

    //Get the Engine Security group
    if (props.engineSecurityGroupId != null) {

      //Get the EMR security group object from its security group Id
      this.engineSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'engineSecurityGroup', props.engineSecurityGroupId);

      //Update security group to allow network traffic to EMR cluster on port 18888 and internet on 443
      this.workspaceSecurityGroup.addEgressRule(this.engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);
      this.workspaceSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow outbound traffic to internet, can be used for github');
    } else {
    //For testing purpose only. This need to be removed once EKS/EMR construct is ready for use
    //Get the Engine Security group object
      this.engineSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'engineSecurityGroup', 'sg-');
      //Update security group to allow network traffic to EMR cluster on port 18888 and internet on 443
      this.workspaceSecurityGroup.addEgressRule(this.engineSecurityGroup, Port.tcp(18888), 'Allow traffic to EMR', true);
      this.workspaceSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow outbound traffic to internet, can be used for github');
    }

    //Create S3 bucket to store EMR Studio workspaces
    //Bucket is kept after destroying the construct
    this.workspacesBucket = new Bucket(this, 'WorksapcesBucket', {
      bucketName: 'ara-workspaces-bucket-' + Aws.ACCOUNT_ID,
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
        roleName: 'studioServiceRole',
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
    this.studioInstance = new CfnStudio(this, 'Studio', {
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
  }

  /**
   * method to add users, take a list of userDefintion and will create a session Policy
   * then assign a user to the created studio
   * @param {StudioUserDefinition} userList list of users
   * @access public
   */
  public addUsers(userList: StudioUserDefinition[]) {
    for (let user of userList) {
      let sessionPolicyArn = this.createUserSessionPolicy(user);

      new CfnStudioSessionMapping(this, 'studioUser' + user.mappingIdentityName, {
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
      managedPolicyName: 'studioServicePolicy',
    });
    return serviceRolePolicy.managedPolicyArn;
  }

  /**
   * @hidden
   * Add an inline policy to the role passed by the user
   */
  private addServiceRoleInlinePolicy (studioServiceRoleArn: string, bucketName: string): void {

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
    policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<your-emr-studio-service-role>/gi, this.studioServiceRoleName);
    //replace the log bucket
    policy.Statement[9].Resource[0] = policy.Statement[9].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
    policy.Statement[9].Resource[0] = policy.Statement[9].Resource[0].replace(/<region>/gi, Aws.REGION);
    let userRolePolicy = new ManagedPolicy(this, 'studioUserPolicy' + studioName, {
      document: PolicyDocument.fromJson(policy),
      managedPolicyName: 'studioServicePolicy' + studioName,
    });

    return userRolePolicy.managedPolicyArn;
  }

  /**
   * @hidden
   * Create a session policy for each user
   * @returns Return the ARN of the policy created
   */
  private createUserSessionPolicy(user: StudioUserDefinition): string {

    // @ts-ignore
    let policy = JSON.parse(JSON.stringify(studioUserPolicy));

    //replace the <your-emr-studio-service-role> with the service role created above
    policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<your-emr-studio-service-role>/gi, this.studioServiceRoleName);

    //replace the log bucket
    policy.Statement[9].Resource[0] = policy.Statement[9].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
    policy.Statement[9].Resource[0] = policy.Statement[9].Resource[0].replace(/<region>/gi, Aws.REGION);

    //TODO Add restrictions on the endpoint a user can connect to, to be implemented once emr-eks construct is ready

    //sanitize the userName from any special characters, userName used to name the session policy
    //if any special character the sessionMapping will fail with "SessionPolicyArn: failed validation constraint for keyword [pattern]"
    let userName = user.mappingIdentityName.replace(/[^\w\s]/gi, '');

    //create the policy
    let userSessionPolicy = new ManagedPolicy(this, 'studioSessionPolicy' + user.mappingIdentityName, {
      document: PolicyDocument.fromJson(policy),
      managedPolicyName: 'studioSessionPolicy' + userName + this.studioId,
    });
    return userSessionPolicy.managedPolicyArn;
  }

}

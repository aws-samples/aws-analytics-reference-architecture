// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  Effect,
  FederatedPrincipal,
  IRole,
  ManagedPolicy,
  IManagedPolicy,
  Policy,
  PolicyDocument,
  PolicyStatement,
  Role,
  User,
} from '@aws-cdk/aws-iam';
import { Aws, Construct, SecretValue, Stack } from '@aws-cdk/core';
import { Utils } from '../utils';
import { NotebookUserOptions } from './notebook-user';
import { iamPolicyActionEvaluator } from './iamEmrStudioPolicyEvaluator';

import * as studioS3Policy from './resources/studio/emr-studio-s3-policy.json';
import * as studioServiceRolePolicy from './resources/studio/studio-service-role-policy.json';
import * as studioUserRolePolicy from './resources/studio/studio-user-iam-role-policy.json';
import * as studioSessionPolicy from './resources/studio/studio-user-session-policy.json';
import * as studioUserPolicy from './resources/studio/studio-user-sso-role-policy.json';
import { IKey } from '@aws-cdk/aws-kms';
import { IBucket } from '@aws-cdk/aws-s3';


/**
 * @internal
 * Create a session policy for each user scoped down to the managed endpoints
 * @returns Return the ARN of the policy created
 */
export function createUserSessionPolicy(scope: Construct, user: NotebookUserOptions,
  studioServiceRole: IRole,
  managedEndpointArns: string [], studioId: string): IManagedPolicy {

  let stack = Stack.of(scope);

  const iamActionsToValidate: string [] = [
    'iam:PassRole',
    's3:GetObject',
    'emr-containers:DescribeVirtualCluster',
    'emr-containers:CreateAccessTokenForManagedEndpoint',
    'emr-containers:DescribeManagedEndpoint',
  ];

  let policy = user.userIamPolicy? user.userIamPolicy : PolicyDocument.fromJson(JSON.parse(JSON.stringify(studioSessionPolicy)));

  let statementPosition: Map<string, number> | undefined = iamPolicyActionEvaluator(
    policy, iamActionsToValidate);

  let jsonPolicy = policy.toJSON();


  if (statementPosition === undefined) {
    throw new Error ('The IAM policy does not have sufficient  to pass role, connect to a managedendpoint or read from the Amazon EMR logs');
  } else {
    //replace the <your-emr-studio-service-role> with the service role created above
    jsonPolicy.Statement[statementPosition.get('iam:PassRole')!].Resource = studioServiceRole.roleArn;

    //replace the region and account for log bucket
    jsonPolicy.Statement[statementPosition.get('s3:GetObject')!].Resource = stack.formatArn({
      region: '',
      account: '',
      service: 's3',
      resource: `aws-logs-${Aws.ACCOUNT_ID}-${Aws.REGION}`,
      resourceName: 'elasticmapreduce/*',
    });

    //replace the region and account for list virtual cluster
    jsonPolicy.Statement[statementPosition.get('emr-containers:DescribeVirtualCluster')!].Resource = stack.formatArn({
      region: Aws.REGION,
      account: Aws.ACCOUNT_ID,
      service: 'emr-containers',
      resource: 'virtualclusters',
      resourceName: '*',
    });

    //add restrictions on the managedEndpoint that user of group is allowed to attach to
    jsonPolicy.Statement[statementPosition.get('emr-containers:CreateAccessTokenForManagedEndpoint')!].Resource = managedEndpointArns;
    jsonPolicy.Statement[statementPosition.get('emr-containers:DescribeManagedEndpoint')!].Resource = managedEndpointArns;
  }

  //create the policy
  let userSessionPolicy = new ManagedPolicy(scope, 'studioSessionPolicy' + Utils.stringSanitizer(user.identityName), {
    document: PolicyDocument.fromJson(jsonPolicy),
    managedPolicyName: 'studioSessionPolicy' + Utils.stringSanitizer(user.identityName) + studioId,
  });

  return userSessionPolicy;
}

/**
 * @internal
 * Create a policy for the EMR USER Role
 * @returns Return the ARN of the policy created
 */
export function createStudioUserRolePolicy(scope: Construct,
  studioName: string,
  studioServiceRole: IRole,
  policyDocument?: PolicyDocument): IManagedPolicy {

  let stack = Stack.of(scope);

  const iamActionsToValidate: string [] = [
    'iam:PassRole',
    's3:GetObject',
  ];

  let policy = policyDocument? policyDocument : PolicyDocument.fromJson(JSON.parse(JSON.stringify(studioUserPolicy)));

  let statementPosition: Map<string, number> | undefined = iamPolicyActionEvaluator(
    policy, iamActionsToValidate);

  let jsonPolicy = policy.toJSON();

  if (statementPosition === undefined) {
    throw new Error ('The IAM policy does not have sufficient permissions to pass role or read from the Amazon EMR logs');
  } else {
    //replace the <your-emr-studio-service-role> with the service role created above
    jsonPolicy.Statement[statementPosition.get('iam:PassRole')!].Resource = studioServiceRole.roleArn;

    //replace the region and account for log bucket
    jsonPolicy.Statement[statementPosition.get('s3:GetObject')!].Resource = stack.formatArn({
      region: '',
      account: '',
      service: 's3',
      resource: `aws-logs-${Aws.ACCOUNT_ID}-${Aws.REGION}`,
      resourceName: 'elasticmapreduce/*',
    });
  }

  let userRolePolicy = new ManagedPolicy(scope, 'studioUserPolicy' + studioName, {
    document: PolicyDocument.fromJson(jsonPolicy),
    managedPolicyName: 'studioUserPolicy' + studioName,
  });

  return userRolePolicy;
}

/**
 * @internal
 * Add an inline policy to the role passed by the user
 */
export function addServiceRoleInlinePolicy (scope: Construct, studioServiceRole: IRole, bucketName: string ): IRole {

  let stack = Stack.of(scope);

  // actions to validates
  const iamActionsToValidate: string [] = [
    's3:PutObject',
    's3:GetObject',
    's3:GetEncryptionConfiguration',
    's3:ListBucket',
    's3:DeleteObject'
  ];

  let policy = PolicyDocument.fromJson(JSON.parse(JSON.stringify(studioS3Policy)));

  let statementPosition: Map<string, number> | undefined = iamPolicyActionEvaluator(
    policy, iamActionsToValidate);

  let jsonPolicy = policy.toJSON();

  if (statementPosition === undefined) {
    throw new Error ('The IAM ServiceRoleInlinePolicy does not have sufficient permissions');
  } else {
    // Update the service role provided by the user with an inline policy
    // to access the S3 bucket and store notebooks
    const bucketArn = stack.formatArn({
      region: '',
      account: '',
      service: 's3',
      resource: bucketName,
    });
    jsonPolicy.Statement[statementPosition.get('s3:GetObject')!].Resource = [ bucketArn , bucketArn+'/*'];
  }

  studioServiceRole.attachInlinePolicy(new Policy(scope, 'studioServiceInlinePolicy', {
    document: PolicyDocument.fromJson(jsonPolicy),
  }));

  return studioServiceRole;
}

/**
 * @internal
 * Create a policy for the EMR Service Role
 * The policy allow access only to a single bucket to store notebooks
 * @returns Return the ARN of the policy created
 */
export function createStudioServiceRolePolicy(scope: Construct, kmsKey: IKey, bucket: IBucket, studioName: string): IManagedPolicy {

  // actions to validates
  const iamActionsToValidate: string [] = [
    'ec2:CreateNetworkInterfacePermission',
    'ec2:DeleteNetworkInterface',
    'ec2:ModifyNetworkInterfaceAttribute',
    'ec2:AuthorizeSecurityGroupEgress',
    'ec2:AuthorizeSecurityGroupIngress',
    'ec2:RevokeSecurityGroupEgress',
    'ec2:RevokeSecurityGroupIngress',
    'ec2:DeleteNetworkInterfacePermission',
    'ec2:CreateSecurityGroup',
    'ec2:CreateTags',
    'ec2:CreateNetworkInterface',
    'ec2:DescribeSecurityGroups',
    'ec2:DescribeNetworkInterfaces',
    'ec2:DescribeTags',
    'ec2:DescribeInstances',
    'ec2:DescribeSubnets',
    'ec2:DescribeVpcs',
    'secretsmanager:GetSecretValue',
    's3:PutObject',
    's3:GetObject',
    's3:GetEncryptionConfiguration',
    's3:ListBucket',
    's3:DeleteObject',
    'kms:Decrypt',
    'kms:GenerateDataKey',
    'kms:ReEncrypt',
    'kms:DescribeKey',
    'iam:GetUser',
    'iam:GetRole',
    'iam:ListUsers',
    'iam:ListRoles',
    'sso:GetManagedApplicationInstance',
    'sso-directory:SearchUsers',
  ];

  let policy = PolicyDocument.fromJson(JSON.parse(JSON.stringify(studioServiceRolePolicy)));

  let statementPosition: Map<string, number> | undefined = iamPolicyActionEvaluator(
    policy, iamActionsToValidate);

  let jsonPolicy = policy.toJSON();

  if (statementPosition === undefined) {
    throw new Error ('The IAM StudioServiceRolePolicy does not have sufficient permissions');
  } else {
    jsonPolicy.Statement[statementPosition.get('s3:GetObject')!].Resource = [ bucket.bucketArn , bucket.bucketArn+'/*'];

    // put the right KMS key ARN in the policy
    jsonPolicy.Statement[statementPosition.get('kms:Decrypt')!].Resource = kmsKey.keyArn;
  }

  //Create the policy of service role
  let serviceRolePolicy = new ManagedPolicy(scope, 'studioServicePolicy' + studioName, {
    document: PolicyDocument.fromJson(jsonPolicy),
    managedPolicyName: 'studioServicePolicy' + studioName,
  });

  return serviceRolePolicy;
}

/**
 * @internal
 * Create a policy for the role to which a user federate
 * Called when working in IAM auth mode with Federated IdP
 * @returns Return the ARN of the policy created
 */
export function createIAMRolePolicy(scope: Construct,
  user: NotebookUserOptions,
  studioServiceRole: IRole,
  managedEndpointArns: string [],
  studioId: string): ManagedPolicy {

  let stack = Stack.of(scope);

  const iamActionsToValidate: string [] = [
    'iam:PassRole',
    's3:GetObject',
    'emr-containers:DescribeVirtualCluster',
    'emr-containers:CreateAccessTokenForManagedEndpoint',
    'emr-containers:DescribeManagedEndpoint',
    'elasticmapreduce:CreateStudioPresignedUrl',
  ];

  let policy = user.userIamPolicy? user.userIamPolicy : PolicyDocument.fromJson(JSON.parse(JSON.stringify(studioUserRolePolicy)));

  let statementPosition: Map<string, number> | undefined = iamPolicyActionEvaluator(
    policy, iamActionsToValidate);

  let jsonPolicy = policy.toJSON();


  if (statementPosition === undefined) {
    throw new Error ('The IAM Role Policy does not have sufficient permissions');
  } else {
    //replace the <your-emr-studio-service-role> with the service role created above
    jsonPolicy.Statement[statementPosition.get('iam:PassRole')!].Resource = studioServiceRole.roleArn;

    //replace the region and account for log bucket
    jsonPolicy.Statement[statementPosition.get('s3:GetObject')!].Resource = stack.formatArn({
      region: '',
      account: '',
      service: 's3',
      resource: `aws-logs-${Aws.ACCOUNT_ID}-${Aws.REGION}`,
      resourceName: 'elasticmapreduce/*',
    });


    //CreateStudioPresignedUrl
    jsonPolicy.Statement[statementPosition.get('elasticmapreduce:CreateStudioPresignedUrl')!].Resource = stack.formatArn({
      region: Aws.REGION,
      account: Aws.ACCOUNT_ID,
      service: 'elasticmapreduce',
      resource: 'CreateStudioPresignedUrl',
      resourceName: studioId,
    });

    //add restrictions on the managedEndpoint that user of group is allowed to attach to
    jsonPolicy.Statement[statementPosition.get('emr-containers:CreateAccessTokenForManagedEndpoint')!].Resource = managedEndpointArns;
    jsonPolicy.Statement[statementPosition.get('emr-containers:DescribeManagedEndpoint')!].Resource = managedEndpointArns;


    //replace the region and account for list virtual cluster
    jsonPolicy.Statement[statementPosition.get('emr-containers:DescribeVirtualCluster')!].Resource = stack.formatArn({
      region: Aws.REGION,
      account: Aws.ACCOUNT_ID,
      service: 'emr-containers',
      resource: 'virtualclusters',
      resourceName: '*',
    });
  }

  //create the policy
  return new ManagedPolicy(scope, 'studioSessionPolicy' + Utils.stringSanitizer(user.identityName), {
    document: PolicyDocument.fromJson(jsonPolicy),
    managedPolicyName: 'studioIAMRolePolicy-' + Utils.stringSanitizer(user.identityName) + '-' + studioId,
  });

}

/**
 * @internal
 * Create the role to which a user federate
 * Called when working in IAM auth mode with Federated IdP
 * @returns Return the ARN of the policy created
 */

export function createIAMFederatedRole(scope: Construct,
  iamRolePolicy: ManagedPolicy,
  federatedIdPArn: string,
  identityName: string,
  studioId: string): Role {

  return new Role(scope, identityName.replace(/[^\w\s]/gi, '') + studioId.replace(/[^\w\s]/gi, ''), {
    assumedBy: new FederatedPrincipal(
      federatedIdPArn,
      {
        StringEquals: {
          'SAML:aud': 'https://signin.aws.amazon.com/saml',
        },
      },
      'sts:AssumeRoleWithSAML',
    ),
    roleName: 'Role-' + identityName + studioId,
    managedPolicies: [iamRolePolicy],
  });
}

/**
 * @internal
 * Create an IAM user and its role then attach the policy for the role
 * Called when working in IAM auth mode with users are authenticated through IAM
 * @returns {string} Return the user created and its password
 */

export function createIAMUser(scope: Construct,
  iamRolePolicy: ManagedPolicy,
  identityName: string): string {

  let userPassword: SecretValue = SecretValue.plainText(Utils.randomize(identityName));

  new User(scope, 'user' + identityName.replace(/[^\w\s]/gi, ''), {
    userName: identityName,
    passwordResetRequired: true,
    password: userPassword,
    managedPolicies: [iamRolePolicy],
  });

  //Add policy for user to be able to change password
  iamRolePolicy.addStatements(new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['iam:ChangePassword'],
    resources: ['arn:aws:iam::' + Aws.ACCOUNT_ID + ':user/' + identityName],
  }));


  return 'AWS account: ' + Aws.ACCOUNT_ID + ' ,' + ' userName: ' + identityName + ',' +
    'userPassword: ' + userPassword.toString();

}

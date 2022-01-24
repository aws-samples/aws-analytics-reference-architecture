// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  Effect,
  FederatedPrincipal,
  IRole,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  User,
} from '@aws-cdk/aws-iam';
import { Aws, Construct, SecretValue, Stack } from '@aws-cdk/core';
import { Utils } from '../utils';
import { iamPolicyActionEvaluator } from './iamEmrStudioPolicyEvaluator';
import { NotebookUserOptions } from './notebook-user';

import * as studioServiceRolePolicy from './resources/studio/studio-service-role-policy.json';
import * as studioUserRolePolicy from './resources/studio/studio-user-iam-role-policy.json';
import * as studioSessionPolicy from './resources/studio/studio-user-session-policy.json';
import * as studioUserPolicy from './resources/studio/studio-user-sso-role-policy.json';


/**
 * @internal
 * Create a session policy for each user scoped down to the managed endpoint
 * @returns Return the ARN of the policy created
 */
export function createUserSessionPolicy(scope: Construct, user: NotebookUserOptions,
  studioServiceRole: IRole,
  managedEndpointArns: string [], studioId: string): string {

  let stack = Stack.of(scope);

  const iamActionsToValidate: string [] = [
    'iam:PassRole',
    's3:GetObject',
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


  return userSessionPolicy.managedPolicyArn;
}

/**
 * @internal
 * Create a policy for the EMR USER Role
 * @returns Return the ARN of the policy created
 */
export function createStudioUserRolePolicy(scope: Construct,
  studioName: string,
  studioServiceRole: IRole,
  policyDocument?: PolicyDocument): string {

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
    throw new Error ('The IAM policy does not have sufficient  to pass role or read from the Amazon EMR logs');
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

  console.log(jsonPolicy);

  let userRolePolicy = new ManagedPolicy(scope, 'studioUserPolicy' + studioName, {
    document: PolicyDocument.fromJson(jsonPolicy),
    managedPolicyName: 'studioUserPolicy' + studioName,
  });

  return userRolePolicy.managedPolicyArn;
}

/**
 * @internal
 * Create a policy for the EMR Service Role
 * The policy allow access only to a single bucket to store notebooks
 * @returns Return the ARN of the policy created
 */
export function createStudioServiceRolePolicy(scope: Construct, keyArn: string, bucketName: string, studioName: string): string {

  //Get policy from a JSON template
  let policy = JSON.parse(JSON.stringify(studioServiceRolePolicy));

  //Update the policy with the bucketname to scope it down
  policy.Statement[11].Resource[0] = policy.Statement[11].Resource[0].replace(/<your-amazon-s3-bucket>/gi, bucketName);
  policy.Statement[11].Resource[1] = policy.Statement[11].Resource[1].replace(/<your-amazon-s3-bucket>/gi, bucketName);

  //Update with KMS key ARN encrypting the bucket
  policy.Statement[12].Resource[0] = keyArn;

  //Create a the policy of service role
  let serviceRolePolicy = new ManagedPolicy(scope, 'studioServicePolicy' + studioName, {
    document: PolicyDocument.fromJson(policy),
    managedPolicyName: 'studioServicePolicy' + studioName,
  });

  return serviceRolePolicy.managedPolicyArn;
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
  ];

  let policy = user.userIamPolicy? user.userIamPolicy : PolicyDocument.fromJson(JSON.parse(JSON.stringify(studioUserRolePolicy)));

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
    document: PolicyDocument.fromJson(policy),
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

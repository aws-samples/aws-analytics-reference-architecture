// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  Effect,
  FederatedPrincipal,
  IRole,
  ManagedPolicy,
  Policy,
  PolicyDocument,
  PolicyStatement,
  Role,
  User,
} from '@aws-cdk/aws-iam';
import { Aws, Construct, SecretValue } from '@aws-cdk/core';
import { Utils } from '../utils';
import { NotebookUserOptions } from './notebook-user';

import * as studioS3Policy from './resources/studio/emr-studio-s3-policy.json';
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
  studioServiceRoleName: string,
  managedEndpointArns: string [], studioId: string): string {

  let policy = JSON.parse(JSON.stringify(studioSessionPolicy));

  //replace the <your-emr-studio-service-role> with the service role created above
  policy.Statement[5].Resource[0] = policy.Statement[5].Resource[0].replace(/<your-emr-studio-service-role>/gi, studioServiceRoleName);

  //replace the region and account for log bucket
  policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
  policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<region>/gi, Aws.REGION);

  //replace the region and account for list virtual cluster
  policy.Statement[8].Resource[0] = policy.Statement[8].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
  policy.Statement[8].Resource[0] = policy.Statement[8].Resource[0].replace(/<region>/gi, Aws.REGION);

  //add restrictions on the managedEndpoint that user of group is allowed to attach to
  for (let managedEndpointArn of managedEndpointArns) {
    policy.Statement[9].Resource[managedEndpointArns.indexOf(managedEndpointArn)] = managedEndpointArn;
    policy.Statement[10].Resource[managedEndpointArns.indexOf(managedEndpointArn)] = managedEndpointArn;
  }

  //create the policy
  let userSessionPolicy = new ManagedPolicy(scope, 'studioSessionPolicy' + Utils.stringSanitizer(user.identityName), {
    document: PolicyDocument.fromJson(policy),
    managedPolicyName: 'studioSessionPolicy' + Utils.stringSanitizer(user.identityName) + studioId,
  });


  return userSessionPolicy.managedPolicyArn;
}

/**
 * @internal
 * Create a policy for the EMR USER Role
 * @returns Return the ARN of the policy created
 */
export function createStudioUserRolePolicy(scope: Construct, studioName: string, studioServiceRoleName: string): string {

  let policyTemplate: string = JSON.stringify(studioUserPolicy);
  let policy = JSON.parse(policyTemplate);

  //replace the <your-emr-studio-service-role> with the service role created above
  policy.Statement[5].Resource[0] = policy.Statement[5].Resource[0].replace(/<your-emr-studio-service-role>/gi, studioServiceRoleName);

  //replace the log bucket
  policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
  policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<region>/gi, Aws.REGION);

  let userRolePolicy = new ManagedPolicy(scope, 'studioUserPolicy' + studioName, {
    document: PolicyDocument.fromJson(policy),
    managedPolicyName: 'studioUserPolicy' + studioName,
  });

  return userRolePolicy.managedPolicyArn;
}

/**
 * @internal
 * Add an inline policy to the role passed by the user
 */
export function addServiceRoleInlinePolicy (scope: Construct, studioServiceRoleArn: string, bucketName: string ): IRole {

  //Get policy from a JSON template
  let policy = JSON.parse(JSON.stringify(studioS3Policy));

  //Update the service role provided by the user with an inline policy
  //to access the S3 bucket and store notebooks
  policy.Statement[0].Resource[0] = policy.Statement[0].Resource[0].replace(/<your-amazon-s3-bucket>/gi, bucketName);
  policy.Statement[0].Resource[1] = policy.Statement[0].Resource[1].replace(/<your-amazon-s3-bucket>/gi, bucketName);

  let studioServiceRole = Role.fromRoleArn(scope, 'studioServiceRoleInlinePolicy', studioServiceRoleArn);

  studioServiceRole.attachInlinePolicy(new Policy(scope, 'studioServiceInlinePolicy', {
    document: PolicyDocument.fromJson(policy),
  }));

  return studioServiceRole;
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
  studioServiceRoleName: string,
  managedEndpointArns: string [],
  studioId: string): ManagedPolicy {

  let policy = JSON.parse(JSON.stringify(studioUserRolePolicy));

  //replace the <your-emr-studio-service-role> with the service role created above
  policy.Statement[5].Resource[0] = policy.Statement[5].Resource[0].replace(/<your-emr-studio-service-role>/gi, studioServiceRoleName);

  //replace the region and account for log bucket
  policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
  policy.Statement[7].Resource[0] = policy.Statement[7].Resource[0].replace(/<region>/gi, Aws.REGION);

  //replace the region and account for list virtual cluster
  policy.Statement[8].Resource[0] = policy.Statement[8].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
  policy.Statement[8].Resource[0] = policy.Statement[8].Resource[0].replace(/<region>/gi, Aws.REGION);

  //add restrictions on the managedEndpoint that user of group is allowed to attach to
  for (let managedEndpointArn of managedEndpointArns) {
    policy.Statement[9].Resource[managedEndpointArns.indexOf(managedEndpointArn)] = managedEndpointArn;
    policy.Statement[10].Resource[managedEndpointArns.indexOf(managedEndpointArn)] = managedEndpointArn;
  }

  //Restrict the studio to which a federated user or iam user can access
  policy.Statement[12].Resource[0] = policy.Statement[12].Resource[0].replace(/<aws-account-id>/gi, Aws.ACCOUNT_ID);
  policy.Statement[12].Resource[0] = policy.Statement[12].Resource[0].replace(/<region>/gi, Aws.REGION);
  policy.Statement[12].Resource[0] = policy.Statement[12].Resource[0].replace(/<your-studio-id>/gi, studioId);

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

  let userPassword: SecretValue = SecretValue.unsafePlainText(Utils.randomize(identityName));

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

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Construct, Stack } from '@aws-cdk/core';

/**
 * SingletonGlueDefaultRole Construct to automatically setup a new Amazon IAM role to use with AWS Glue jobs.
 * The role is created with AWSGlueServiceRole policy and authorize all actions on S3.
 * If you would like to scope down the permission you should create a new role with a scoped down policy
 * The Construct provides a getOrCreate method for SingletonInstantiation
 */

export class GlueDefaultRole extends Construct {

  public static getOrCreate(scope: Construct) {
    const stack = Stack.of(scope);
    const id = 'GlueDefaultRole';
    return stack.node.tryFindChild(id) as GlueDefaultRole || new GlueDefaultRole(stack, id);
  }

  public readonly iamRole: Role;

  /**
   * Constructs a new instance of the GlueDefaultRole class
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @access private
   */

  private constructor(scope: Construct, id: string) {
    super(scope, id);

    const stack = Stack.of(this);

    this.iamRole = new Role(this, 'GlueDefaultRole', {
      assumedBy: new ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole')],
      inlinePolicies: {
        DataAccess: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: [
                stack.formatArn({
                  region: '',
                  account: '',
                  service: 's3',
                  resource: '*',
                  resourceName: '*',
                }),
              ],
              actions: [
                's3:ListBucket',
                's3:*Object*',
                's3:AbortMultipartUpload',
                's3:ListBucketMultipartUploads',
                's3:ListMultipartUploadParts',
              ],
            }),
            new PolicyStatement({
              resources: ['*'],
              actions: ['lakeformation:GetDataAccess'],
            }),
          ],
        }),
      },
    });
  }
}

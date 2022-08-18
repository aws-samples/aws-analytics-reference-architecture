// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Aws, Stack, Duration, ArnFormat, CustomResource } from 'aws-cdk-lib';
import { IRole, IUser, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { PreBundledFunction } from '../common/pre-bundled-function';

/**
 * Properties for the lakeFormationAdmin Construct
 */

export interface LakeFormationAdminProps {
  /**
  * The principal to declare as an AWS Lake Formation administrator
  */
  readonly principal: IRole | IUser;
  /**
  * The catalog ID to create the administrator in
  * @default - The account ID
  */
  readonly catalogId?: string;
}

/**
 * An AWS Lake Formation administrator with privileges to do all the administration tasks in AWS Lake Formation.
 * The principal is an Amazon IAM user or role and is added/removed to the list of AWS Lake Formation administrator
 * via the Data Lake Settings API.
 * Creation/deleting first retrieves the current list of administrators and then add/remove the principal to this list.
 * These steps are done outside of any transaction. Concurrent modifications between retrieving and updating can lead to inconsistent results.
 */
export class LakeFormationAdmin extends Construct {

  public catalogId: string;
  public principal: IRole | IUser;

  /**
   * Construct a new instance of LakeFormationAdmin.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {LakeFormationAdminProps} props the LakeFormationAdminProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: LakeFormationAdminProps) {
    super(scope, id);

    this.catalogId = props.catalogId || Aws.ACCOUNT_ID;
    this.principal = props.principal;

    // Check if the principal is an Amazon IAM Role or User and extract the arn and name
    const principalArn = (this.principal as IRole).roleArn ? (this.principal as IRole).roleArn : (this.principal as IUser).userArn;
    const principalName = (this.principal as IRole).roleName ? (this.principal as IRole).roleName : (this.principal as IUser).userName;

    const stack = Stack.of(this);

    // AWS Lambda function for the AWS CDK Custom Resource responsible for creating the AWS Lake Formation tag
    const createLfAdminFn = new PreBundledFunction(this, 'lfAdminCreateFn', {
      runtime: Runtime.PYTHON_3_9,
      codePath: 'lake-formation/resources/lambdas/admin',
      handler: 'lambda.on_event',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(20),
    });

    createLfAdminFn.addToRolePolicy(new PolicyStatement({
      resources: [
        stack.formatArn({
          service: 'lakeformation',
          resource: 'catalog',
          resourceName: Aws.ACCOUNT_ID,
          arnFormat: ArnFormat.COLON_RESOURCE_NAME,
        }),
      ],
      actions: [
        'lakeformation:PutDataLakeSettings',
        'lakeformation:GetDataLakeSettings',
      ],
    }));

    // AWS CDK Custom Resource Provider for creating the AWS Lake Formation tag
    const createLfAdminCrp = new Provider(this, 'lfAdminCreateCrp', {
      onEventHandler: createLfAdminFn,
      logRetention: RetentionDays.ONE_DAY,
    });

    // Create an AWS CDK Custom Resource for starting the source crawler and waiting for completion
    new CustomResource(this, 'lfAdminCreateCr', {
      serviceToken: createLfAdminCrp.serviceToken,
      properties: {
        CatalogId: this.catalogId,
        PrincipalArn: principalArn,
        PrincipalName: principalName,
      },
    });
  }
}
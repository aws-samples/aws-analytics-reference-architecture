// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { CustomResource, Duration, Construct, Stack, Aws, ArnFormat } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';
import { PreBundledFunction } from '../common/pre-bundled-function';


export interface LakeFormationTagProps {
  /**
  * The key value of the AWS Lake Formation tag
  */
  readonly key: string;
  /**
  * The list of values of the AWS Lake Formation tag
  */
  readonly values: string[];
  /**
  * The catalog ID to create the tag in
  */
  readonly catalogId: string;

}

export class LakeFormationTag extends Construct {

  public catalogId: string;
  public key: string;
  public values: string[];

  constructor(scope: Construct, id: string, props: LakeFormationTagProps) {
    super(scope, id);

    this.catalogId = props.catalogId;
    this.key = props.key;
    this.values = props.values;

    const stack = Stack.of(this);

    // AWS Lambda function for the AWS CDK Custom Resource responsible for creating the AWS Lake Formation tag
    const createLfTagFn = new PreBundledFunction(this, 'lfTagCreateFn', {
      runtime: Runtime.PYTHON_3_8,
      codePath: 'lake-formation/resources/lambdas/tag',
      handler: 'lambda.on_event',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(20),
    });

    createLfTagFn.addToRolePolicy(new PolicyStatement({
      resources: [
        stack.formatArn({
          service: 'lakeformation',
          resource: 'catalog',
          resourceName: Aws.ACCOUNT_ID,
          arnFormat: ArnFormat.COLON_RESOURCE_NAME,
        }),
      ],
      actions: [
        'lakeformation:CreateLFTag',
        'lakeformation:DeleteLFTag',
      ],
    }));

    // AWS CDK Custom Resource Provider for creating the AWS Lake Formation tag
    const synchronousAthenaQueryCRP = new Provider(this, 'lfTagCreateCRP', {
      onEventHandler: createLfTagFn,
      logRetention: RetentionDays.ONE_DAY,
    });

    // Create an AWS CDK Custom Resource for starting the source crawler and waiting for completion
    new CustomResource(this, 'lfTagCreateCr', {
      serviceToken: synchronousAthenaQueryCRP.serviceToken,
      properties: {
        CatalogId: this.catalogId,
        TagKey: this.key,
        TagValues: this.values,
      },
    });
  }
}
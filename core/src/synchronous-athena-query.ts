// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Construct, Aws, CustomResource, Duration, Stack } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';

/**
 * The properties for SynchronousAthenaQuery Construct.
 */
export interface SynchronousAthenaQueryProps {
  /**
   * The name of the Athena query to execute
   */
  readonly statement: string;
  /**
   * The timeout in seconds to wait for query success
   * @default - 60 seconds
   */
  readonly timeout?: number;
  /**
   * The Amazon S3 path for the query results
   */
  readonly resultsPath: string;
}

/**
 * SynchronousAthenaQuery Construct to execute an Amazon Athena query synchronously
 */

export class SynchronousAthenaQuery extends Construct {

  /**
  * Constructs a new instance of the SynchronousAthenaQuery class
  * @param {Construct} scope the Scope of the CDK Construct
  * @param {string} id the ID of the CDK Construct
  * @param {SynchronousAthenaQueryProps} props the CrawlerStartWait [properties]{@link SynchronousAthenaQueryProps}
  * @access public
  */

  constructor(scope: Construct, id: string, props: SynchronousAthenaQueryProps) {
    super(scope, id);

    const stack = Stack.of(this);

    // AWS Lambda function for the AWS CDK Custom Resource responsible to start crawler
    const athenaQueryStartFn = new Function(this, 'athenaQueryStartFn', {
      runtime: Runtime.PYTHON_3_8,
      code: Code.fromAsset('./src/lambdas/synchronous-athena-query'),
      handler: 'lambda.on_event',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(20),
    });

    // Add permissions to the Function
    athenaQueryStartFn.addToRolePolicy(new PolicyStatement({
      resources: [
        stack.formatArn({
          region: Aws.REGION,
          account: Aws.ACCOUNT_ID,
          service: 'athena',
          resource: 'workgroup',
          resourceName: 'primary',
        }),
      ],
      actions: [
        'athena:StartQueryExecution',
      ],
    }));

    // AWS Lambda function for the AWS CDK Custom Resource responsible to wait for crawler completion
    const athenaQueryWaitFn = new Function(this, 'athenaQueryStartWaitFn', {
      runtime: Runtime.PYTHON_3_8,
      code: Code.fromAsset('./src/lambdas/synchronous-athena-query'),
      handler: 'lambda.is_complete',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(20),
    });

    // Add permissions to the Function
    athenaQueryWaitFn.addToRolePolicy(new PolicyStatement({
      resources: [
        stack.formatArn({
          region: Aws.REGION,
          account: Aws.ACCOUNT_ID,
          service: 'athena',
          resource: 'workgroup',
          resourceName: 'primary',
        }),
      ],
      actions: [
        'athena:GetQueryExecution',
        'athena:GetQueryResults',
      ],
    }));

    // Create an AWS CDK Custom Resource Provider for starting the source crawler and waiting for completion
    const synchronousAthenaQueryCRP = new Provider(this, 'synchronousAthenaQueryCRP', {
      onEventHandler: athenaQueryStartFn,
      isCompleteHandler: athenaQueryWaitFn,
      queryInterval: Duration.seconds(10),
      totalTimeout: Duration.minutes(props.timeout || 60),
      logRetention: RetentionDays.ONE_DAY,
    });

    // Create an AWS CDK Custom Resource for starting the source crawler and waiting for completion
    new CustomResource(this, 'synchronousAthenaQueryCR', {
      serviceToken: synchronousAthenaQueryCRP.serviceToken,
      properties: {
        Statement: props.statement,
        ResultsPath: props.resultsPath,
      },
    });
  }
}
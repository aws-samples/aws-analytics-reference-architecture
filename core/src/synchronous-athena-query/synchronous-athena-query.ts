// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Bucket, Location } from '@aws-cdk/aws-s3';
import { Construct, Aws, CustomResource, Duration, Stack } from '@aws-cdk/core';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { ScopedIamProvider } from '../common/scoped-iam-customer-resource';

/**
 * The properties for the SynchronousAthenaQuery construct.
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
   * The Amazon S3 Location for the query results (without trailing slash)
   */
  readonly resultPath: Location;
  /**
   * The Amazon IAM Policy Statements used to run the query
   * @default - No Policy Statements are added to the execution role
   */
  readonly executionRoleStatements?: PolicyStatement[];
}

/**
 * Execute an Amazon Athena query synchronously during CDK deployment
 */

export class SynchronousAthenaQuery extends Construct {

  /**
  * Constructs a new instance of the SynchronousAthenaQuery class
  * @param {Construct} scope the Scope of the CDK Construct
  * @param {string} id the ID of the CDK Construct
  * @param {SynchronousAthenaQueryProps} props the CrawlerStartWait [properties]{@link SynchronousAthenaQueryProps}
  */

  constructor(scope: Construct, id: string, props: SynchronousAthenaQueryProps) {
    super(scope, id);

    const stack = Stack.of(this);

    let athenaQueryStartFnPolicy: PolicyStatement [] = [];

    // Add permissions from the Amazon IAM Policy Statements
    props.executionRoleStatements?.forEach( (element) => {
      athenaQueryStartFnPolicy.push(element);
    });

    // Add permissions to the Function for starting the query
    athenaQueryStartFnPolicy.push(new PolicyStatement({
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

    // add permissions to the Function to store result in the result path
    athenaQueryStartFnPolicy.push(new PolicyStatement({
      resources: [
        stack.formatArn({
          region: '',
          account: '',
          service: 's3',
          resource: props.resultPath.bucketName,
          resourceName: props.resultPath.objectKey,
        }),
        stack.formatArn({
          region: '',
          account: '',
          service: 's3',
          resource: props.resultPath.bucketName,
          resourceName: props.resultPath.objectKey + '/*',
        }),
        stack.formatArn({
          region: '',
          account: '',
          service: 's3',
          resource: props.resultPath.bucketName,
        }),
      ],
      actions: [
        's3:GetBucketLocation',
        's3:GetObject',
        's3:ListBucket',
        's3:ListBucketMultipartUploads',
        's3:ListMultipartUploadParts',
        's3:AbortMultipartUpload',
        's3:PutObject',
        's3:CreateBucket',
      ],
    }));


    // AWS Lambda function for the AWS CDK Custom Resource responsible to start query
    const athenaQueryStartFn = new PreBundledFunction(this, 'AthenaQueryStartFn', {
      runtime: Runtime.PYTHON_3_8,
      codePath: 'synchronous-athena-query/resources/lambdas',
      name: 'SynchronousAthenaCrStart',
      lambdaPolicyStatements: athenaQueryStartFnPolicy,
      handler: 'lambda.on_event',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(20),
    });

    let athenaQueryWaitFnPolicy: PolicyStatement [] = [];

    // AWS Lambda function for the AWS CDK Custom Resource responsible to wait for query completion
    const athenaQueryWaitFn = new PreBundledFunction(this, 'AthenaQueryStartWaitFn', {
      runtime: Runtime.PYTHON_3_8,
      codePath: 'synchronous-athena-query/resources/lambdas',
      name: 'SynchronousAthenaCrWait',
      lambdaPolicyStatements: athenaQueryWaitFnPolicy,
      handler: 'lambda.is_complete',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(20),
    });

    // Add permissions to the Function
    athenaQueryWaitFnPolicy.push(new PolicyStatement({
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
    const synchronousAthenaQueryCRP = new ScopedIamProvider(this, 'SynchronousAthenaQueryCRP', {
      onEventHandler: athenaQueryStartFn,
      isCompleteHandler: athenaQueryWaitFn,
      onEventFnName: 'SynchronousAthenaCrStart',
      isCompleteFnName: 'SynchronousAthenaCrWait',
      queryInterval: Duration.seconds(10),
      totalTimeout: Duration.minutes(props.timeout || 1),
      logRetention: RetentionDays.ONE_WEEK,
    });

    const resultPathBucket = Bucket.fromBucketName(this, 'ResultPathBucket', props.resultPath.bucketName);

    // Create an AWS CDK Custom Resource for starting the source crawler and waiting for completion
    new CustomResource(this, 'SynchronousAthenaQueryCR', {
      serviceToken: synchronousAthenaQueryCRP.serviceToken,
      properties: {
        Statement: props.statement,
        ResultPath: resultPathBucket.s3UrlForObject(props.resultPath.objectKey),
      },
    });
  }
}

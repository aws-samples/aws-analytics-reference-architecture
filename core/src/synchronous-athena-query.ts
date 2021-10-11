// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Bucket, Location } from '@aws-cdk/aws-s3';
import { Construct, Aws, CustomResource, Duration, Stack } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';
import { PreBundledFunction } from './pre-bundled-function';

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

    // Amazon S3 IBucket containing the AWS Lambda code for custom resources
    const binaryBucket = Bucket.fromBucketArn(this, 'binaryBucket', 'arn:aws:s3:::aws-analytics-reference-architecture');

    // AWS Lambda function for the AWS CDK Custom Resource responsible to start query
    const athenaQueryStartFn = new PreBundledFunction(this, 'athenaQueryStartFn', {
      runtime: Runtime.PYTHON_3_8,
      codePath: 'resources/lambdas/synchronous-athena-query',
      handler: 'lambda.on_event',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(20),
    });

    // Add permissions from the Amazon IAM Policy Statements
    props.executionRoleStatements?.forEach( (element) => {
      athenaQueryStartFn.addToRolePolicy(element);
    });

    // Add permissions to the Function fro starting the query
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

    // add permissions to the Function to store result in the result path
    athenaQueryStartFn.addToRolePolicy(new PolicyStatement({
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

    // AWS Lambda function for the AWS CDK Custom Resource responsible to wait for query completion
    const athenaQueryWaitFn = new Function(this, 'athenaQueryStartWaitFn', {
      runtime: Runtime.PYTHON_3_8,
      code: Code.fromBucket(binaryBucket, 'binaries/custom-resources/synchronous-athena-query.zip'),
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
      totalTimeout: Duration.minutes(props.timeout || 1),
      logRetention: RetentionDays.ONE_DAY,
    });

    const resultPathBucket = Bucket.fromBucketName(this, 'resultPathBucket', props.resultPath.bucketName);

    // Create an AWS CDK Custom Resource for starting the source crawler and waiting for completion
    new CustomResource(this, 'synchronousAthenaQueryCR', {
      serviceToken: synchronousAthenaQueryCRP.serviceToken,
      properties: {
        Statement: props.statement,
        ResultPath: resultPathBucket.s3UrlForObject(props.resultPath.objectKey),
      },
    });
  }
}
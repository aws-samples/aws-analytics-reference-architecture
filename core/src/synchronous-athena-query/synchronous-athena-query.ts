// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket, Location } from 'aws-cdk-lib/aws-s3';
import { Aws, CustomResource, Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { PreBundledLayer } from '../common/pre-bundled-layer';
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
      runtime: Runtime.PYTHON_3_9,
      codePath: 'synchronous-athena-query/resources/lambdas',
      name: 'SynchronousAthenaCrStart',
      layers: [PreBundledLayer.getOrCreate(scope, 'common/resources/lambdas/pre-bundled-layer')],
      lambdaPolicyStatements: athenaQueryStartFnPolicy,
      handler: 'lambda.on_event',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(20),
    });

    let athenaQueryWaitFnPolicy: PolicyStatement [] = [];

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

    // AWS Lambda function for the AWS CDK Custom Resource responsible to wait for query completion
    const athenaQueryWaitFn = new PreBundledFunction(this, 'AthenaQueryWaitFn', {
      runtime: Runtime.PYTHON_3_9,
      codePath: 'synchronous-athena-query/resources/lambdas',
      name: 'SynchronousAthenaCrWait',
      layers: [PreBundledLayer.getOrCreate(scope, 'common/resources/lambdas/pre-bundled-layer')],
      lambdaPolicyStatements: athenaQueryWaitFnPolicy,
      handler: 'lambda.is_complete',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(20),
    });

    /*const providerManagedPolicy = new ManagedPolicy(this, 'providerManagedPolicy', {
      statements: [new PolicyStatement({
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:*`],
        effect: Effect.ALLOW,
      })],
    });

    const providerRole = new Role(this, 'providerRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [providerManagedPolicy],
    });*/

    // Create an AWS CDK Custom Resource Provider for starting the source crawler and waiting for completion
    const synchronousAthenaQueryCRP = new Provider(this, 'customresourceprovider', {
      onEventHandler: athenaQueryStartFn,
      isCompleteHandler: athenaQueryWaitFn,
      queryInterval: Duration.seconds(10),
      totalTimeout: Duration.minutes(props.timeout || 1),
      logRetention: RetentionDays.ONE_WEEK,
    });

    synchronousAthenaQueryCRP.node.addDependency(athenaQueryStartFn);
    synchronousAthenaQueryCRP.node.addDependency(athenaQueryWaitFn);

    const resultPathBucket = Bucket.fromBucketName(this, 'ResultPathBucket', props.resultPath.bucketName);

    // Create an AWS CDK Custom Resource for starting the source crawler and waiting for completion
    const myCR = new CustomResource(this, 'SynchronousAthenaQueryCR', {
      serviceToken: synchronousAthenaQueryCRP.serviceToken,
      properties: {
        Statement: props.statement,
        ResultPath: resultPathBucket.s3UrlForObject(props.resultPath.objectKey),
      },
    });

    myCR.node.addDependency(synchronousAthenaQueryCRP);
  }
}

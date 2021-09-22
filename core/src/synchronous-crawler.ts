// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Role, ServicePrincipal, PolicyStatement, ManagedPolicy } from '@aws-cdk/aws-iam';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Construct, Aws, CustomResource, Duration, Stack } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';

/**
 * The properties for SynchronousCrawler Construct.
 */
export interface SynchronousCrawlerProps {
  /**
   * The name of the Crawler to use
   */
  readonly crawlerName: string;
  /**
   * The timeout in seconds to wait for the Crawler success
   * @default - 300 seconds
   */
  readonly timeout?: number;
}

/**
 * CrawlerStartWait Construct to start an AWS Glue Crawler execution and asynchronously wait for completion
 */

export class SynchronousCrawler extends Construct {

  /**
  * Constructs a new instance of the DataGenerator class
  * @param {Construct} scope the Scope of the CDK Construct
  * @param {string} id the ID of the CDK Construct
  * @param {SynchronousCrawlerProps} props the CrawlerStartWait [properties]{@link SynchronousCrawlerProps}
  * @access public
  */

  constructor(scope: Construct, id: string, props: SynchronousCrawlerProps) {
    super(scope, id);

    const stack = Stack.of(this);

    // Create an Amazon IAM Role for the AWS CDK Custom Resource starting the AWS Glue Crawler
    const crawlerStartWaitFnRole = new Role(this, 'synchronousCrawler', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    crawlerStartWaitFnRole.addToPolicy(new PolicyStatement({
      resources: [
        stack.formatArn({
          region: Aws.REGION,
          account: Aws.ACCOUNT_ID,
          service: 'glue',
          resource: 'crawler',
          resourceName: props.crawlerName,
        }),
      ],
      actions: [
        'glue:StartCrawler',
        'glue:GetCrawler',
      ],
    }));
    crawlerStartWaitFnRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

    // AWS Lambda function for the AWS CDK Custom Resource responsible to start crawler
    const crawlerStartFn = new Function(this, 'crawlerStartFn', {
      runtime: Runtime.PYTHON_3_8,
      code: Code.fromAsset('./src/lambdas/synchronous-crawler'),
      handler: 'lambda.on_event',
      role: crawlerStartWaitFnRole,
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(20),
    });

    // AWS Lambda function for the AWS CDK Custom Resource responsible to wait for crawler completion
    const crawlerWaitFn = new Function(this, 'crawlerWaitFn', {
      runtime: Runtime.PYTHON_3_8,
      code: Code.fromAsset('./src/lambdas/synchronous-crawler'),
      handler: 'lambda.is_complete',
      role: crawlerStartWaitFnRole,
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(20),
    });

    // Create an AWS CDK Custom Resource Provider for starting the source crawler and waiting for completion
    const crawlerStartWaitCRP = new Provider(this, 'synchronousCrawlerCRP', {
      onEventHandler: crawlerStartFn,
      isCompleteHandler: crawlerWaitFn,
      queryInterval: Duration.seconds(60),
      totalTimeout: Duration.seconds(props.timeout || 300),
      logRetention: RetentionDays.ONE_DAY,
    });

    // Create an AWS CDK Custom Resource for starting the source crawler and waiting for completion
    new CustomResource(this, 'synchronousCrawlerCR', {
      serviceToken: crawlerStartWaitCRP.serviceToken,
      properties: {
        CrawlerName: props.crawlerName,
      },
    });
  }
}
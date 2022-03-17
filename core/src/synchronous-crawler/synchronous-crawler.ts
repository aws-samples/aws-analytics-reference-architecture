// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Construct, Aws, CustomResource, Duration, Stack } from '@aws-cdk/core';
import { PreBundledFunction } from '../common/pre-bundled-function';
import {ScopedIamProvider} from "../common/scoped-iam-customer-resource";

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

    //Lambda policy to allow starting a crawler
    const lambdaCRPolicy : PolicyStatement []= [new PolicyStatement({
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
    })];

    // AWS Lambda function for the AWS CDK Custom Resource responsible to start crawler
    const crawlerStartFn = new PreBundledFunction(this, 'crawlerStartFn', {
      runtime: Runtime.PYTHON_3_8,
      codePath: 'synchronous-crawler/resources/lambdas',
      name: 'SynchronousCrawlerStartFn',
      lambdaPolicyStatements: lambdaCRPolicy,
      handler: 'lambda.on_event',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(20),
    });

    // AWS Lambda function for the AWS CDK Custom Resource responsible to wait for crawler completion
    const crawlerWaitFn = new PreBundledFunction(this, 'crawlerWaitFn', {
      runtime: Runtime.PYTHON_3_8,
      codePath: 'synchronous-crawler/resources/lambdas',
      name: 'SynchronousCrawlerWaitFn',
      lambdaPolicyStatements: lambdaCRPolicy,
      handler: 'lambda.is_complete',
      logRetention: RetentionDays.ONE_DAY,
      timeout: Duration.seconds(20),
    });

    // Create an AWS CDK Custom Resource Provider for starting the source crawler and waiting for completion
    const crawlerStartWaitCRP = new ScopedIamProvider(this, 'synchronousCrawlerCRP', {
      onEventFnName: 'SynchronousCrawlerStartFn',
      isCompleteFnName: 'SynchronousCrawlerWaitFn',
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

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Aws, CustomResource, Duration, Stack, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { PreBundledLayer } from '../common/pre-bundled-layer';
import { Job, JobProps } from '@aws-cdk/aws-glue-alpha';


/**
 * SynchronousGlueJob Construct to start an AWS Glue Job execution and wait for completion during CDK deploy
 */

export class SynchronousGlueJob extends Construct {

  /**
   * The Glue job logstream to check potential errors
   */
  readonly glueJobLogStream: string;  

  /**
   * Constructs a new instance of the DataGenerator class
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {JobProps} props the SynchronousGlueJob properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: JobProps) {
    super(scope, id);

    const stack = Stack.of(this);
    
    const glueJob = new Job(scope, 'SynchronousGlueJob', props );
    Tags.of(glueJob).add('for-use-with', 'synchronous-glue-job')

    //Lambda policy to allow starting a Glue job
    const lambdaCRPolicy: PolicyStatement[] = [new PolicyStatement({
      resources: [
        stack.formatArn({
          region: Aws.REGION,
          account: Aws.ACCOUNT_ID,
          service: 'glue',
          resource: 'job',
          resourceName: '*',
        }),
      ],
      conditions: { StringEquals: { 'aws:ResourceTag/for-use-with': 'synchronous-glue-job' } },
      actions: [
        'glue:StartJobRun',
        'glue:GetJobRun',
        'glue:BatchStopJobRun', 
      ],
    })];

    // AWS Lambda function for the AWS CDK Custom Resource responsible to start the job
    const glueJobStartFn = new PreBundledFunction(this, 'StartFn', {
      runtime: Runtime.PYTHON_3_9,
      codePath: 'synchronous-glue-job/resources/lambdas',
      layers: [PreBundledLayer.getOrCreate(scope, 'common/resources/lambdas/pre-bundled-layer')],
      lambdaPolicyStatements: lambdaCRPolicy,
      handler: 'lambda.on_event',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(20),
    });

    // AWS Lambda function for the AWS CDK Custom Resource responsible to wait for crawler completion
    const glueJobWaitFn = new PreBundledFunction(this, 'WaitFn', {
      runtime: Runtime.PYTHON_3_9,
      codePath: 'synchronous-glue-job/resources/lambdas',
      layers: [PreBundledLayer.getOrCreate(scope, 'common/resources/lambdas/pre-bundled-layer')],
      lambdaPolicyStatements: lambdaCRPolicy,
      handler: 'lambda.is_complete',
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.seconds(20),
    });

    // Create an AWS CDK Custom Resource Provider for starting the source crawler and waiting for completion
    const glueJobStartWaitCRP = new Provider(this, 'SynchronousGlueJobCRP', {
      onEventHandler: glueJobStartFn,
      isCompleteHandler: glueJobWaitFn,
      queryInterval: Duration.seconds(120),
      totalTimeout: props.timeout,
      logRetention: RetentionDays.ONE_WEEK,
    });

    // Create an AWS CDK Custom Resource for starting the source crawler and waiting for completion
    const customResource = new CustomResource(this, 'SynchronousGlueJobCR', {
      serviceToken: glueJobStartWaitCRP.serviceToken,
      properties: {
        JobName: glueJob.jobName,
      },
    });

    this.glueJobLogStream = customResource.getAttString('LogGroupName');

    // Force the dependency because jobName could be known at synth time
    customResource.node.addDependency(glueJob);
  }
}

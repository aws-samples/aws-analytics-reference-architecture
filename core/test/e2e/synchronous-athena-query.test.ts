// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SynchronousAthenaQuery
 *
 * @group integ/synchronous-athena-query
 */

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';

import { SynchronousAthenaQuery } from '../../src/synchronous-athena-query';

jest.setTimeout(300000);
// GIVEN
const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'SynchronousAthenaQueryE2eTest');

const resultsBucket = new Bucket(stack, 'ResultsBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const sourceBucket = Bucket.fromBucketName(stack, 'SourceBucket', `athena-examples-${cdk.Aws.REGION}`);

const synchronousAthenaQuery = new SynchronousAthenaQuery(stack, 'SynchronousAthenaQuery', {
  statement: 'SELECT * FROM sampledb.elb_logs limit 10;',
  resultPath: {
    bucketName: resultsBucket.bucketName,
    objectKey: 'query-results',
  },
  executionRoleStatements: [
    new PolicyStatement({
      resources: [
        stack.formatArn({
          region: cdk.Aws.REGION,
          account: cdk.Aws.ACCOUNT_ID,
          service: 'glue',
          resource: 'catalog',
        }),
        stack.formatArn({
          region: cdk.Aws.REGION,
          account: cdk.Aws.ACCOUNT_ID,
          service: 'glue',
          resource: 'database',
          resourceName: 'sampledb',
        }),
        stack.formatArn({
          region: cdk.Aws.REGION,
          account: cdk.Aws.ACCOUNT_ID,
          service: 'glue',
          resource: 'table',
          resourceName: 'sampledb/elb_logs',
        }),
      ],
      actions: [
        'glue:GetTable',
        'glue:GetPartitions',
      ],
    }),
    new PolicyStatement({
      resources: [
        sourceBucket.arnForObjects('elb/plaintext/*'),
        sourceBucket.bucketArn,
      ],
      actions: [
        's3:GetObject',
        's3:ListBucket',
      ],
    }),
  ],
});

new cdk.CfnOutput(stack, 'SynchronousAthenaQueryResource', {
  value: synchronousAthenaQuery.toString(),
  exportName: 'SynchronousAthenaQueryResource',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // GIVEN
    const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      profile: process.env.AWS_PROFILE,
    });
    const cloudFormation = new CloudFormationDeployments({ sdkProvider });

    // WHEN
    /*const deployResult =*/ await cloudFormation.deployStack({
      stack: stackArtifact,
    });

    // THEN
    expect(true);

  }, 9000000);
});

afterAll(async () => {
  const stackArtifact = integTestApp.synth().getStackByName(stack.stackName);

  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    profile: process.env.AWS_PROFILE,
  });
  const cloudFormation = new CloudFormationDeployments({ sdkProvider });

  await cloudFormation.destroyStack({
    stack: stackArtifact,
  });
});

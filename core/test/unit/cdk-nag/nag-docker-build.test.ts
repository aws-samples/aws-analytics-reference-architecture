// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests EmrEksCluster
 *
 * @group unit/best-practice/emr-eks-image-builder
 */


import { App, RemovalPolicy, Stack, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { EmrEksImageBuilder } from '../../../src/docker-builder';
import { Annotations, Match } from 'aws-cdk-lib/assertions';

const app = new App();

const account = '111111111111';
const region = 'eu-west-1';

const stack = new Stack(app, 'docker-build', {
    env: { account: account, region: region },
  });

const publish = new EmrEksImageBuilder(stack, 'test', {
    repositoryName: 'my-repo',
    ecrRemovalPolicy: RemovalPolicy.RETAIN
  });
  
publish.publishImage('./', 'vNAG');
  

Aspects.of(app).add(new AwsSolutionsChecks({verbose:true}));


NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/framework-onTimeout/ServiceRole/Resource',
    [{
      id: 'AwsSolutions-IAM4',
      reason: 'the use of AWS managed policy is for cloudwatch log creation, unable to change it as the logs are created at runtime',
    }],
  );
  
  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/framework-isComplete/ServiceRole/Resource',
    [{
      id: 'AwsSolutions-IAM4',
      reason: 'the use of AWS managed policy is for cloudwatch log creation, unable to change it as the logs are created at runtime',
    }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/framework-isComplete/ServiceRole/DefaultPolicy/Resource',
    [{
      id: 'AwsSolutions-IAM5',
      reason: 'Cannot scope the policy further resource name generated at run time',
    }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/framework-onTimeout/ServiceRole/DefaultPolicy/Resource',
    [{
      id: 'AwsSolutions-IAM5',
      reason: 'Cannot scope the policy further resource name generated at run time',
    }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/framework-onTimeout/Resource',
    [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/framework-isComplete/Resource',
    [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/codebuildarn/DefaultPolicy/Resource',
    [{ id: 'AwsSolutions-IAM5', reason: 'Wild card put on actions or resources because those are defined at runtime by the user' }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
    [{
      id: 'AwsSolutions-IAM5',
      reason: 'Cannot scope the policy further resource name generated at run time',
    }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/waiter-state-machine/Role/DefaultPolicy/Resource',
    [{
      id: 'AwsSolutions-IAM5',
      reason: 'Cannot scope the policy further resource name generated at run time',
    }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/LambdaExecutionRolePolicytestIsComplete/Resource',
    [{
      id: 'AwsSolutions-IAM5',
      reason: 'Cannot scope the policy further resource name generated at run time',
    }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/LambdaExecutionRolePolicytestOnEvent/Resource',
    [{
      id: 'AwsSolutions-IAM5',
      reason: 'Cannot scope the policy further resource name generated at run time',
    }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/LogRetentionLambdaExecutionRolePolicytestOnEvent/Resource',
    [{
      id: 'AwsSolutions-IAM5',
      reason: 'Cannot scope the policy further resource name generated at run time',
    }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/LogRetentionLambdaExecutionRoletestOnEvent/DefaultPolicy/Resource',
    [{
      id: 'AwsSolutions-IAM5',
      reason: 'Cannot scope the policy further resource name generated at run time',
    }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/LogRetentionLambdaExecutionRolePolicytestIsComplete/Resource',
    [{
      id: 'AwsSolutions-IAM5',
      reason: 'Cannot scope the policy further resource name generated at run time',
    }],
  );
  
  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/framework-onEvent/Resource',
    [{ id: 'AwsSolutions-L1', reason: 'Runtime set the by the L2 construct, cannot be changed' }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/DockerImageDeployProject-my-repo/Resource',
    [{ id: 'AwsSolutions-CB3', reason: 'Priviliged mode needed for building docker images' }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/DockerImageDeployProject-my-repo/Resource',
    [{ id: 'AwsSolutions-CB4', reason: 'Custom image needed for building docker image' }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/dockerbuild-ara-docker-assets/Resource',
    [{ id: 'AwsSolutions-S1', reason: 'Log disabled the bucket hold asset needed for build no data' }],
  );
  
  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/test/CustomResourceProvider/framework-onEvent/ServiceRole/Resource',
    [{ id: 'AwsSolutions-IAM4', reason: 'CDK does not provide an interface to modify the AWS managed policy' }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C/ServiceRole/DefaultPolicy/Resource',
    [{ id: 'AwsSolutions-IAM4', reason: 'Policy managed by L2 construct' }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C/ServiceRole/Resource',
    [{ id: 'AwsSolutions-IAM4', reason: 'Policy managed by L2 construct' }],
  );

  NagSuppressions.addResourceSuppressionsByPath(
    stack,
    'docker-build/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C/ServiceRole/DefaultPolicy/Resource',
    [{ id: 'AwsSolutions-IAM5', reason: 'Policy managed by L2 construct' }],
  );

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(stack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(stack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

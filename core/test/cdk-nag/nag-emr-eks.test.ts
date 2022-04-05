// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests emr-eks
 *
 * @group best-practice/emr-eks
 */


//import { ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { Annotations, Match } from '@aws-cdk/assertions';
import { App, Stack, Aspects } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { EmrEksCluster } from '../../src/emr-eks-platform';
//import { NotebookPlatform, StudioAuthMode } from '../notebook-platform/';


const mockApp = new App();
const stack = new Stack(mockApp, 'eks-emr-studio');

Aspects.of(mockApp).add(new AwsSolutionsChecks());

EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/gromav',
});

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/awsNodeRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'EKS requires the role to use AWS managed policy, the role is protected with IRSA' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'S3 bucket used for access log' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform-emr-eks-assets/Resource',
  [{
    id: 'AwsSolutions-S1',
    reason: 'access log not activated because the bucket only stores pod templates no data',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'Bucket does not require access log, contains only EKS pod templates' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/Autoscaler/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'These are actions that are of type list and should have a wildcard' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/Resource/Resource/Default',
  [{ id: 'AwsSolutions-EKS1', reason: 'EKS cluster is meant to be public' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/lambdaExecutionRolePolicyara-EmrManagedEndpointProviderOnEvent/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Violation mitigated with tag based access control' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/lambdaExecutionRolePolicyara-EmrEksNodegroupAsgTagOnEventFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wildcard needed and violation mitigated with tag based access control' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/lambdaExecutionRolePolicyara-EmrManagedEndpointProviderIsComplete/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wildcard needed and violation mitigated with tag based access control' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/logRetentionLambdaExecutionRolePolicyara-EmrEksNodegroupAsgTagOnEventFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wildcard needed for puteventlog IAM action' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AWSLoadBalancerControllerIAMPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'IAM policy as provided by the open source community for AWS Load Balancer Controller ' +
            'in https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.3.1/docs/install/iam_policy.json',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ec2InstanceNodeGroupRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'The use of the AWS managed policy is mandatory by the EKS service for nodegroups',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/Resource/CreationRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Role needed by eks cdk construct to deploy a cluster',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/s3BucketDeploymentRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'wild card used put and get S3 actions, and encrypt decrypt actions for KMS key resource',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/s3BucketDeploymentPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'wild card used put and get S3 actions, and encrypt decrypt actions for KMS key resource',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/CustomResourceProvider/framework-onEvent/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'the use of AWS managed policy is for cloudwatch log creation, unable to change it as the logs are created at runtime',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/CustomResourceProvider/framework-isComplete/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'the use of AWS managed policy is for cloudwatch log creation, unable to change it as the logs are created at runtime',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/CustomResourceProvider/framework-onTimeout/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'the use of AWS managed policy is for cloudwatch log creation, unable to change it as the logs are created at runtime',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/Role/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'Service Role used and Required by EKS https://docs.aws.amazon.com/eks/latest/userguide/service_IAM_role.html',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/logRetentionLambdaExcutionRoleara-EmrEksNodegroupAsgTagOnEventFn/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'policy to change log retention cannot be scoped down further',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/lambdaExecutionRolePolicyCustomResourceProvider/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Policy cannot be scoped down further, log group is created at runtime',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/logRetentionLambdaExecutionRolePolicyara-EmrManagedEndpointProviderOnEvent/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Policy cannot be scoped down further, log is created at runtime',
  }],
);


NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/logRetentionLambdaExecutionRolePolicyara-EmrManagedEndpointProviderIsComplete/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Policy cannot be scoped down further, log is created at runtime',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.ClusterResourceProvider/OnEventHandler/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'AWS Managed policy basic lambda execution role used by Clusterprovider',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.ClusterResourceProvider/IsCompleteHandler/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'AWS Managed policy basic lambda execution role used by Clusterprovider',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.ClusterResourceProvider/Provider/framework-onEvent/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'AWS Managed policy basic lambda execution role used by Clusterprovider',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.ClusterResourceProvider/Provider/framework-isComplete/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'AWS Managed policy basic lambda execution role used by Clusterprovider',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.ClusterResourceProvider/Provider/framework-onTimeout/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'AWS Managed policy basic lambda execution role used by Clusterprovider',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.KubectlProvider/Handler/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'AWS Managed policy basic lambda execution role, read access to ECR and access to VPC to send kubectl command to control plan',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/CustomResourceProvider/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Cannot scope the policy further resource name generated at run time',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/CustomResourceProvider/framework-isComplete/ServiceRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Cannot scope the policy further resource name generated at run time',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/CustomResourceProvider/framework-onTimeout/ServiceRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Cannot scope the policy further resource name generated at run time',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/CustomResourceProvider/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Cannot scope the policy further resource name generated at run time',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/lambdaExcutionRoleCRCustomResourceProvider/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Cannot scope the policy further resource name generated at run time',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.KubectlProvider/Provider/framework-onEvent/ServiceRole/Resource',
  [{
    id: 'AwsSolutions-IAM4',
    reason: 'Provide the CR with AWS Managed policy basic lambda execution role, read access to ECR and access to VPC to send kubectl command to control plan',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.ClusterResourceProvider/Provider/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Wild card used for scoped down resource as its is generated at runtime',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.ClusterResourceProvider/Provider/framework-isComplete/ServiceRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Wild card used for scoped down resource as its is generated at runtime',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.ClusterResourceProvider/Provider/framework-onTimeout/ServiceRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Wild card used for scoped down resource as its is generated at runtime',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.ClusterResourceProvider/Provider/waiter-state-machine/Role/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Wild card used for scoped down resource as its is generated at runtime',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/@aws-cdk--aws-eks.KubectlProvider/Provider/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Wild card used for scoped down resource as its is generated at runtime',
  }],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(stack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(stack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  expect(errors).toHaveLength(0);
});

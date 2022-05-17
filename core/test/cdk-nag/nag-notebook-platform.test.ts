// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests NotebookPlatform
 *
 * @group best-practice/notebook-platform
 */


import { Annotations, Match } from '@aws-cdk/assertions';
import { ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam';
import { App, Stack, Aspects, ArnFormat, Aws } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { SSOIdentityType } from '../../lib';
import { EmrEksCluster } from '../../src/emr-eks-platform';
import { NotebookPlatform, StudioAuthMode } from '../../src/notebook-platform';

const mockApp = new App();
const stack = new Stack(mockApp, 'eks-emr-studio');

Aspects.of(mockApp).add(new AwsSolutionsChecks());

const emrEks = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123445678912:role/gromav',
});

const notebookPlatform = new NotebookPlatform(stack, 'eks-emr-studio', {
  emrEks: emrEks,
  eksNamespace: 'platform7ns',
  studioName: 'platform7',
  studioAuthMode: StudioAuthMode.SSO,
});


const policy1 = new ManagedPolicy(stack, 'MyPolicy1', {
  statements: [
    new PolicyStatement({
      resources: ['*'],
      actions: ['s3:*'],
    }),
    new PolicyStatement({
      resources: [
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'logs',
          resource: '*',
          arnFormat: ArnFormat.NO_RESOURCE_NAME,
        }),
      ],
      actions: [
        'logs:*',
      ],
    }),
  ],
});

notebookPlatform.addUser([{
  identityName: 'lotfi-emr-advanced',
  identityType: SSOIdentityType.USER,
  notebookManagedEndpoints: [{
    emrOnEksVersion: 'emr-6.3.0-latest',
    executionPolicy: policy1,
  }],
}]);


NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/eks-emr-studio/engineSecurityGroup-platform7/Resource',
  [{
    id: 'AwsSolutions-EC23',
    reason: 'SG allowing traffic only from its own CIDR range',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/s3-access-logs/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'Bucket used for consolidating access logs' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform-emr-eks-assets/Resource',
  [{ id: 'AwsSolutions-S1', reason: 'Bucket does not need to have access logs activated' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/awsNodeRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'EKS requires the role to use AWS managed policy, the role is protected with IRSA' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/CustomResourceProvider/framework-onEvent/ServiceRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Managed policy used by CDK construct cannot amend it' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/CustomResourceProvider/framework-onEvent/ServiceRole/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Managed policy used by CDK construct cannot amend it' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/LogRetentionLambdaExecutionRoleEmrEksNodegroupAsgTagOnEventFn/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Policy set by Provider in CDK construct cannot amend it' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  '/eks-emr-studio/data-platform/ManagedEndpointProvider/LambdaExecutionRolePolicyEmrManagedEndpointProviderOnEvent/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'wild card mitigated by using tag based access control,  wild card used when not possible to restrict action' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  '/eks-emr-studio/data-platform/ManagedEndpointProvider/LogRetentionLambdaExecutionRolePolicyEmrManagedEndpointProviderOnEvent/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'wild card used as logs are not known until run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  '/eks-emr-studio/data-platform/ManagedEndpointProvider/LogRetentionLambdaExecutionRolePolicyEmrManagedEndpointProviderIsComplete/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'wild card used as logs are not known until run time' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  '/eks-emr-studio/data-platformCluster/Autoscaler/Role/DefaultPolicy/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'wild card used for list and describe, other actions are mitigated using tag based access control' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/Resource/Resource/Default',
  [{ id: 'AwsSolutions-EKS1', reason: 'EKS cluster is meant to be public' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/NodegroupsharedDriver-0/NodeGroupRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Nodegroups are using AWS Managed Policies' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/NodegroupsharedDriver-1/NodeGroupRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Nodegroups are using AWS Managed Policies' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/NodegroupsharedExecutor-0/NodeGroupRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Nodegroups are using AWS Managed Policies' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/NodegroupsharedExecutor-1/NodeGroupRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Nodegroups are using AWS Managed Policies' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/NodegroupnotebookDriver-0/NodeGroupRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Nodegroups are using AWS Managed Policies' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/NodegroupnotebookDriver-1/NodeGroupRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Nodegroups are using AWS Managed Policies' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/NodegroupnotebookExecutor-0/NodeGroupRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Nodegroups are using AWS Managed Policies' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platformCluster/NodegroupnotebookExecutor-1/NodeGroupRole/Resource',
  [{ id: 'AwsSolutions-IAM4', reason: 'Nodegroups are using AWS Managed Policies' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/LambdaExecutionRolePolicyEmrEksNodegroupAsgTagOnEventFn/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wildcard needed and violation mitigated with tag based access control' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/ManagedEndpointProvider/LambdaExecutionRolePolicyEmrManagedEndpointProviderIsComplete/Resource',
  [{ id: 'AwsSolutions-IAM5', reason: 'Wildcard needed and violation mitigated with tag based access control' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/data-platform/AsgTagProvider/LogRetentionLambdaExecutionRolePolicyEmrEksNodegroupAsgTagOnEventFn/Resource',
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

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/eks-emr-studio/studioServicePolicyplatform7/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Policy used in a role assumed by EMR. It is used to create the infrastructure for EMR Studio. This policy is defined in EMR documentation and will be used as is.',
  }],
);


NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/eks-emr-studio/studioUserPolicyplatform7/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Wild card used as some resources are only known at run time. Policy used in a role assumed by EMR Studio. This role is then scoped at runtime with a session policy',
  }],
);

NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/eks-emr-studio/studioSessionPolicylotfiemradvanced/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Wild card used as some resources are only known at run time. Policy is used by EMR studio user as session policy, it is scoped to only the resources the user needs to access',
  }],
);


NagSuppressions.addResourceSuppressionsByPath(
  stack,
  'eks-emr-studio/MyPolicy1/Resource',
  [{
    id: 'AwsSolutions-IAM5',
    reason: 'Policy not relevant, it used for the cdk-nag test. The user will have to provide its own',
  }],
);

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(stack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

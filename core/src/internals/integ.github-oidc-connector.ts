import { ManagedPolicy } from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import { Provider } from '@pahud/cdk-github-oidc';

const githubOIDCConnector = new cdk.App();
const stack = new cdk.Stack(githubOIDCConnector, 'GithubOIDCConnector');

// create a new provider
const provider = new Provider(stack, 'GithubOpenIdConnectProvider');
// create an IAM role from this provider
const role = provider.createRole('integ-test-role',
  // sharing this role across multiple repositories
  [
    { owner: 'aws-samples', repo: 'aws-analytics-reference-architecture' },
  ],
);
// TODO: restrict role to proper permissions to only deploy integ test resources, maybe boundaries ?
role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

new cdk.CfnOutput(stack, 'GithubActionIntegTestsRoleArn', {
  value: role.roleArn,
});

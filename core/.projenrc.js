
const { AwsCdkConstructLibrary, DependenciesUpgradeMechanism, Semver } = require('projen');

const project = new AwsCdkConstructLibrary({

  authorName: 'Amazon Web Services',
  authorUrl: 'https://aws.amazon.com',
  authorOrganization: true,
  homepage: 'https://aws-samples.github.io/aws-analytics-reference-architecture/',
  copyrightPeriod: `2021-${new Date().getFullYear()}`,
  copyrightOwner: 'Amazon.com, Inc. or its affiliates. All Rights Reserved.',

  keywords: [
    'aws',
    'constructs',
    'cdk',
    'analytics',
  ],

  cdkVersion: '1.111.0',
  defaultReleaseBranch: 'main',
  license: 'MIT',
  name: 'aws-analytics-reference-architecture',
  repositoryUrl: 'https://github.com/aws-samples/aws-analytics-reference-architecture.git',
  repositoryDirectory: 'core',
  workflow: false,
  buildWorkflow: false,
  releaseWorkflow: false,
  depsUpgrade: DependenciesUpgradeMechanism.NONE,
  pullRequestTemplate: false,
  docgen: true,

  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-eks',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-emrcontainers',
    '@aws-cdk/aws-autoscaling',
  ],

  devDeps: [
    '@types/js-yaml',
    '@types/jest',
  ],

  peerDependencies: {
    'js-yaml': Semver.caret('3.14.1'),
  },

  python: {
    distName: 'aws-analytics-reference-architecture',
    module: 'aws-analytics-reference-architecture',
  },

  stability: 'experimental',

});
project.synth();
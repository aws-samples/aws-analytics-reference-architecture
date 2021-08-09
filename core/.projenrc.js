// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { AwsCdkConstructLibrary, DependenciesUpgradeMechanism } = require('projen');
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

  cdkVersion: '1',
  defaultReleaseBranch: 'main',
  license: 'MIT',
  name: 'aws-analytics-reference-architecture',
  repositoryUrl: 'https://github.com/aws-samples/aws-analytics-reference-architecture.git',
  repositoryDirectory: 'core',
  workflow: false,
  buildWorkflow: false,
  releaseWorkflow: false,
  depsUpgrade: DependenciesUpgradeMechanism.NONE,
  stale: false,
  pullRequestTemplate: false,

  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-kinesis',
    '@aws-cdk/aws-iam',
  ],
  devDeps: [
  ],

  python: {
    distName: 'aws-analytics-reference-architecture',
    module: 'aws-analytics-reference-architecture',
  },

  stability: 'experimental',

});
project.synth();
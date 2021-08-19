// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const PROJECT_NAME = 'aws-analytics-reference-architecture'

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

  cdkVersion: '1.119',
  defaultReleaseBranch: 'main',
  license: 'MIT',
  name: PROJECT_NAME,
  repositoryUrl: 'https://github.com/aws-samples/aws-analytics-reference-architecture.git',
  repositoryDirectory: 'core',
  workflow: false,
  buildWorkflow: false,
  releaseWorkflow: true,
  depsUpgrade: DependenciesUpgradeMechanism.NONE,
  stale: false,
  pullRequestTemplate: false,

  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-iam',
  ],
  bundledDeps: [
    'xmldom@github:xmldom/xmldom#0.7.0',
  ],

  python: {
    distName: 'aws_analytics_reference_architecture',
    module: PROJECT_NAME,
  },

  stability: 'experimental',

});
project.synth();
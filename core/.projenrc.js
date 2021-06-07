<<<<<<< HEAD
const { AwsCdkConstructLibrary } = require('projen');
=======
const { AwsCdkConstructLibrary, DependenciesUpgradeMechanism } = require('projen');
>>>>>>> main
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

<<<<<<< HEAD
  cdkVersion: '1.106',
=======
  cdkVersion: '1',
>>>>>>> main
  defaultReleaseBranch: 'main',
  license: 'MIT',
  name: 'aws-analytics-reference-architecture',
  repositoryUrl: 'https://github.com/aws-samples/aws-analytics-reference-architecture.git',
  repositoryDirectory: 'core',
<<<<<<< HEAD
  buildWorkflow: false,
  releaseWorkflow: false,
  dependabot: false,
=======
  workflow: false,
  buildWorkflow: false,
  releaseWorkflow: false,
  depsUpgrade: DependenciesUpgradeMechanism.NONE,
>>>>>>> main
  pullRequestTemplate: false,
  docgen: true,

  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-s3',
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
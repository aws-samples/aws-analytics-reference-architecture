// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { dirname } = require('path');
const glob = require('glob');
const { AwsCdkConstructLibrary } = require('projen');

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
  cdkVersion: '1.125.0',
  defaultReleaseBranch: 'main',
  license: 'MIT',
  name: 'aws-analytics-reference-architecture',
  repositoryUrl: 'https://github.com/aws-samples/aws-analytics-reference-architecture.git',
  repositoryDirectory: 'core',
  workflow: false,
  buildWorkflow: false,
  releaseWorkflow: true,
  depsUpgrade: false,
  stale: false,
  pullRequestTemplate: false,
  cdkVersionPinning: true,

  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/custom-resources',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-python',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-kinesis',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-athena',
    '@aws-cdk/aws-glue',
    '@aws-cdk/aws-stepfunctions',
    '@aws-cdk/aws-stepfunctions-tasks',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-s3-deployment',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-redshift',
    '@aws-cdk/aws-secretsmanager',
  ],
  bundledDeps: [
    'xmldom@github:xmldom/xmldom#0.7.0',
    'aws-sdk',
  ],

  devDeps: [
    'esbuild',
  ],

  python: {
    distName: 'aws_analytics_reference_architecture',
    module: 'aws_analytics_reference_architecture',
  },

  stability: 'experimental',

});

const testDeploy = project.addTask('test:deploy', {
  exec: 'cdk deploy --app=./lib/db-migration/integ.default.js --profile ara',
});

testDeploy.prependExec('npx projen build');

project.addTask('test:destroy', {
  exec: 'cdk destroy --app=./lib/db-migration/integ.default.js --profile ara',
});

project.addDevDeps('glob');

/**
 * Task to copy `resources` directories from `src` to `lib`
 */

const copyResourcesToLibTask = project.addTask('copy-resources', {
  description: 'Copy all resources directories from src to lib',
});

for (const from of glob.sync('src/**/resources')) {
  const to = dirname(from.replace('src', 'lib'));
  const cpCommand = `cp -r ${from} ${to}`;
  copyResourcesToLibTask.exec(cpCommand);
}


/**
 * Run `copy-resources` and `pip-install` as part of compile
 */
project.compileTask.exec('npx projen copy-resources');

project.synth();
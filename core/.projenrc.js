// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { basename, join, dirname, relative } = require('path');
const glob = require('glob');


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

  cdkVersion: '1.124',
  defaultReleaseBranch: 'main',
  license: 'MIT-0',
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
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-python',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-eks',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-emrcontainers',
    '@aws-cdk/aws-autoscaling',
    '@aws-cdk/lambda-layer-awscli',
    '@aws-cdk/aws-kinesisfirehose',
    '@aws-cdk/aws-kinesisfirehose-destinations',
    '@aws-cdk/aws-kinesis',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-glue',
    '@aws-cdk/aws-athena',
    '@aws-cdk/aws-stepfunctions',
    '@aws-cdk/aws-stepfunctions-tasks',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-s3-deployment',
    '@aws-cdk/aws-emr',
    '@aws-cdk/aws-kms',
  ],

  devDeps: [
    '@types/js-yaml',
    '@types/jest',
    'esbuild',
  ],

  bundledDeps: [
    'js-yaml',
    'uuid',
    'xmldom@github:xmldom/xmldom#0.7.0',
    'aws-sdk',
  ],

  python: {
    distName: 'aws_analytics_reference_architecture',
    module: 'aws_analytics_reference_architecture',
  },

  tsconfig: {
    compilerOptions: {
      resolveJsonModule: true,
      esModuleInterop: true,
    },
    include: ['src/**/*.json', 'src/**/*.ts'],
  },

  stability: 'experimental',

});

const testDeploy = project.addTask('test:deploy', {
  exec: 'cdk deploy --app=./lib/integ.default.js',
});

testDeploy.prependExec('npx projen build');

project.addTask('test:destroy', {
  exec: 'cdk destroy --app=./lib/integ.default.js',
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
 * Task to pip install all Python Lambda functions in lib folder
 */

const pipInstallTask = project.addTask('pip-install', {
  description: 'pip install all folders in lib that has requirements.txt',
});

for (const dirPath of findAllPythonLambdaDir('src')) {
  // Assume that all folders with 'requirements.txt' have been copied to lib
  // by the task 'copy-resources'
  const dirPathInLib = dirPath.replace('src', 'lib');
  const target = dirname(dirPathInLib);
  const pipCmd = `pip3 install -r ${dirPathInLib} --target ${target}`;

  pipInstallTask.exec(pipCmd);
}

/**
 * Run `copy-resources` and `pip-install` as part of compile
 */
project.compileTask.exec('npx projen copy-resources');
project.compileTask.exec('npx projen pip-install');

/**
 * Find all directory that has a Python package.
 * Assume that they have requirements.txt
 *
 * @param rootDir Root directory to begin finding
 * @returns Array of directory paths
 */
function findAllPythonLambdaDir(rootDir) {

  return glob.sync(`${rootDir}/**/requirements.txt`).map((pathWithReq) => {
    return pathWithReq;
  });
}

project.synth();

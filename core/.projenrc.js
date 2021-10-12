// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const { basename, join, dirname, relative } = require('path');
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
  cdkVersion: '1.121.0',
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
  exec: 'cdk deploy --app=./lib/integ.default.js',
});

testDeploy.prependExec('npx projen build');

project.addTask('test:destroy', {
  exec: 'cdk destroy --app=./lib/integ.default.js',
});

/**
 * Task to bundle all Python Lambda functions in the LAMBDA_RESOURCE_DIR
 */
const LAMBDA_RESOURCE_DIR = 'resources/lambdas';
const bundleAllLambdaTask = project.addTask('bundle', {
  cwd: LAMBDA_RESOURCE_DIR,
  description: 'Bundle all lambda functions',
});

paths = findAllPythonLambdaDir(LAMBDA_RESOURCE_DIR);
for (const dirPath of paths) {
  const dirName = basename(dirPath);
  const taskName = `bundle:${dirName}`;

  console.log(`Generating task "${taskName}"...`);
  const lambdaBundleTask = addPythonLambdaFunctionBundleTask(taskName, LAMBDA_RESOURCE_DIR, dirName);


  console.log(`Add task "${taskName}" as a part of "bundle" target`);
  bundleAllLambdaTask.spawn(lambdaBundleTask);
}

/**
 * By default, Build tasks have these steps
 * project.buildTask.steps [
 *   { exec: 'npx projen' },
 *   { spawn: 'test' },
 *   { spawn: 'compile' },
 *   { spawn: 'package' }
 * ]
 * We will add 'bundle' in the second step.
 * By the time we run tests, the bundle file should be there.
 */
project.buildTask.steps = project.buildTask._steps.splice(1, 0, {
  exec: 'npx projen bundle',
});
console.log('Modified build task to include "bundle" step:\n', project.buildTask.steps);


// Ignore all build files (Python dependencies, Lambda package zip file )
project.gitignore.addPatterns(`${LAMBDA_RESOURCE_DIR}/build`);
project.npmignore.addPatterns(`${LAMBDA_RESOURCE_DIR}/build`);
project.gitignore.addPatterns(`${LAMBDA_RESOURCE_DIR}/*.zip`);

/**
 * Find all directory that has a Python package.
 * Assume that they all are in the first level of given root directory
 *
 * @param rootDir Root directory to begin finding
 * @returns Array of directory paths
 */
function findAllPythonLambdaDir(rootDir) {
  project.addDevDeps('glob');
  return glob.sync(`${rootDir}/*/requirements.txt`).map((pathWithReq) => {
    return dirname(pathWithReq);
  });
}

/**
 * Add a projen task for bundling a Python Lambda.
 *
 * The function use Docker to pip install dependencies into `./package`.
 * Docker is required for some libraries that needs compilation during intallation.
 * If we compile it on our OS (Mac or Windows), it won't work on Lambda.
 *
 * We use a Docker from SAM as it's more stable (changed less often)
 * and simpler to use than CDK's build image.
 *
 * After that, we zip the whole directory next to this directory.
 *
 * @param taskName Name of the task to be added
 * @param cwd Current workign directory
 * @param dirName Directory name of the Python Lambda function
 */
function addPythonLambdaFunctionBundleTask(taskName, cwd, dirName) {
  const tmpBuildDir = `build/${dirName}`;

  const bundleTask = project.addTask(taskName, {
    description: `Install dependency and package Python file into for Lambda function:${dirName}`,
    cwd: cwd,
  });


  console.log('Install dependencies and package into a zip file');

  // Clean up existing build files and output zip file
  bundleTask.exec(`rm -rf ${dirName}.zip`);
  bundleTask.exec(`rm -rf ${tmpBuildDir}`);
  bundleTask.exec(`cp -r ${dirName} build/`);

  // Pip install and compiles dependencies via Docker SAM image
  bundleTask.exec([
    `[ -f build/${dirName}/requirements.txt ] &&`, // Only build if requirements.txt exists
    'docker run',
    `-v $PWD/build/${dirName}:/var/task`, // Mapping from host full path to Docker container
    '"public.ecr.aws/sam/build-python3.8"', //Image name
    '/bin/sh -c "pip install -r requirements.txt -t ./; exit"', //Commands to run in the image
  ].join(' '));

  // Zip file to next to the lambda directory
  bundleTask.exec(`cd ${tmpBuildDir} && zip -q -r ../../${dirName}.zip .`);

  return bundleTask;
}

project.synth();
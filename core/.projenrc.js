// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { basename, join, dirname, relative } = require('path');
const fs = require('fs');
const glob = require('glob');


const { awscdk } = require('projen');

const CDK_VERSION = '2.84.0';
const CDK_CONSTRUCTS_VERSION = '10.2.55';
const project = new awscdk.AwsCdkConstructLibrary({
  majorVersion: 2,
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

  cdkVersion: CDK_VERSION,
  jsiiVersion: '~5.0.0',
  constructsVersion: CDK_CONSTRUCTS_VERSION,
  defaultReleaseBranch: 'main',
  license: 'MIT-0',
  name: 'aws-analytics-reference-architecture',
  repositoryUrl: 'https://github.com/aws-samples/aws-analytics-reference-architecture.git',
  repositoryDirectory: 'core',
  workflow: false,
  buildWorkflow: false,
  release: true,
  depsUpgrade: true,
  stale: false,
  pullRequestTemplate: false,
  cdkVersionPinning: true,
  githubOptions: {
    pullRequestLint: false,
  },
  //workflowContainerImage: 'jsii/superchain:1-buster-slim',

  deps: [
    '@exodus/schemasafe',
    `@aws-cdk/aws-redshift-alpha@${CDK_VERSION}-alpha.0`,
    `@aws-cdk/aws-glue-alpha@${CDK_VERSION}-alpha.0`,
  ],

  devDeps: [
    '@types/js-yaml',
    '@types/jest',
    'esbuild',
    'cdk-nag@^2.0.0',
    'constructs',
    'aws-cdk-lib',
    `aws-cdk@${CDK_VERSION}`,
    `cdk-assets@${CDK_VERSION}`,
    `@aws-cdk/cx-api@${CDK_VERSION}`,
    `@aws-cdk/cloudformation-diff@${CDK_VERSION}`,
    'jest-runner-groups',
    'promptly',
    'proxy-agent',
    'glob',
    '@types/prettier@2.6.0',
    `@aws-cdk/aws-redshift-alpha@${CDK_VERSION}-alpha.0`,
    `@aws-cdk/aws-glue-alpha@${CDK_VERSION}-alpha.0`,
    '@aws-cdk/lambda-layer-kubectl-v22',
    '@aws-cdk/lambda-layer-kubectl-v25'
  ],

  peerDeps: [
    `@aws-cdk/aws-redshift-alpha@${CDK_VERSION}-alpha.0`,
    `@aws-cdk/aws-glue-alpha@${CDK_VERSION}-alpha.0`,
  ],

  jestOptions: {
    jestConfig: {
      runner: 'groups',
    },
  },

  bundledDeps: [
    'js-yaml',
    'uuid',
    'aws-sdk',
    '@exodus/schemasafe',
    'simple-base',
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
    include: ['src/**/*.json'],
  },

  stability: 'experimental',

});

project.testTask.reset('jest --group=unit');

project.testTask.spawn('eslint');

project.addTask('test:best-practice', {
  exec: 'jest --group=best-practice',
});

project.addTask('test:unit', {
  exec: 'jest --group=unit',
});

project.addTask('test:integ', {
  exec: 'jest --group=integ',
});

const testDeploy = project.addTask('test:deploy', {
  exec: 'cdk --version && cdk deploy --app=./lib/integ.default.js',
});

testDeploy.prependExec('npx projen build');

project.packageTask.spawn(project.tasks.tryFind('package-all'));

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
  const cpCommand = `rsync -avr --exclude '*.ts' --exclude '*.js' ${from} ${to}`;
  copyResourcesToLibTask.exec(cpCommand);
}
const workaroundCommand = `perl -i -pe 's/flyway-all.jar//g' lib/db-schema-manager/resources/flyway-lambda/.gitignore`;
copyResourcesToLibTask.exec(workaroundCommand);

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
  const pipCmd = `pip3 install -r ${dirPathInLib} --target ${target} --upgrade`;

  pipInstallTask.exec(pipCmd);
}

/**
 * Task to build java lambda jar with gradle
 */
const gradleBuildTask = project.addTask('gradle-build', {
  description: './gradlew shadowJar all folders in lib that has requirements.txt',
});

for (const gradlePath of findAllGradleLambdaDir('src')) {
  console.log('loop over gradle dir');
  const dirPath = dirname(gradlePath);
  const gradleCmd = `cd ${dirPath} && ./gradlew shadowJar && cp build/libs/*.jar ./ && rm -rf build 2> /dev/null`;

  gradleBuildTask.exec(gradleCmd);
}

/**
 * Run `copy-resources` and `pip-install` as part of compile
 */
project.compileTask.exec('npx projen gradle-build');
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

/**
 * Find all directory that has a gradle package.
 * Assume that they have build.gradle
 *
 * @param rootDir Root directory to begin finding
 * @returns Array of directory paths
 */
function findAllGradleLambdaDir(rootDir) {
  console.log('findAllGradleLambdaDir');

  return glob.sync(`${rootDir}/**/build.gradle`).map((pathWithGradle) => {
    return pathWithGradle;
  });
}

project.synth();

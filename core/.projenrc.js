// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { basename, join, dirname, relative } = require('path');
const glob = require('glob');


const { awscdk } = require('projen');

const project = new awscdk.AwsCdkConstructLibrary({

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

  cdkVersion: '1.155.0',
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

  cdkDependencies: [
    '@aws-cdk/assertions',
    '@aws-cdk/aws-athena',
    '@aws-cdk/aws-autoscaling',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-emrcontainers',
    '@aws-cdk/aws-eks',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-glue',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-kinesis',
    '@aws-cdk/aws-kinesisfirehose',
    '@aws-cdk/aws-kinesisfirehose-destinations',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-python',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-redshift',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-s3-assets',
    '@aws-cdk/aws-s3-deployment',
    '@aws-cdk/aws-secretsmanager',
    '@aws-cdk/aws-stepfunctions',
    '@aws-cdk/aws-stepfunctions-tasks',
    '@aws-cdk/core',
    '@aws-cdk/custom-resources',
    '@aws-cdk/lambda-layer-awscli',
    '@aws-cdk/aws-emr',
    '@aws-cdk/aws-kms',
    '@aws-cdk/aws-lakeformation',
  ],

  deps: [
    '@exodus/schemasafe',
  ],

  devDeps: [
    '@types/js-yaml',
    '@types/jest',
    'esbuild',
    'aws-cdk@1.155.0',
    'cdk-nag@^1.0.0',
    'cdk-assets@1.155.0',
    'jest-runner-groups',
    'promptly',
    'proxy-agent',
    'glob',
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

project.addTask('test:integ/data-lake', {
  exec: 'jest --group=integ/data-lake',
});

project.addTask('test:integ/redshift', {
  exec: 'jest --group=integ/redshift',
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
  const gradleCmd = `cd ${dirPath} && ./gradlew shadowJar && cp build/libs/*.jar ./ 2> /dev/null`;

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

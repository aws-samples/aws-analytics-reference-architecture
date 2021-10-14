// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const { basename, join, dirname, relative, sep } = require('path');
const glob = require('glob');


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
  cdkVersion: '1.121.0',
  defaultReleaseBranch: 'main',
  license: 'MIT',
  name: 'aws-analytics-reference-architecture',
  repositoryUrl: 'https://github.com/aws-samples/aws-analytics-reference-architecture.git',
  repositoryDirectory: 'core',
  workflow: false,
  buildWorkflow: false,
  releaseWorkflow: true,
  depsUpgrade: DependenciesUpgradeMechanism.NONE,
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
 * Task to pip install all Python Lambda functions inlib
 */


const pipInstallTask = project.addTask('bundle', {
  description: 'pip install all folders in lib that has requirements.txt',
});

for (const dirPath of findAllPythonLambdaDir('src')) {
  // const dirPathInLib = dirPath.replace('src', 'lib');
  // const target = dirname(dirPathInLib);
  // const pipCmd = `pip3 install -r ${dirPathInLib} --target ${target}`;

  // pipInstallTask.exec(pipCmd);

  // dirPath can be in the form of 
  // 1. /src/<construct-name>/resources/lambdas 
  // 2. /src/<construct-name>/resources/lambdas/<lambda-name>
  const dirName = basename(dirPath);
  const constructName = dirPath.split(sep)[1];
  const uniqueName = `${constructName}-${dirName}`;
  const taskName = `bundle:${uniqueName}`;

  console.log(`Generating task "${taskName}"...`);
  const lambdaBundleTask = addPythonLambdaFunctionBundleTask(taskName, uniqueName, dirPath);

  console.log(`Add task "${taskName}" as a part of "bundle" target`);
  pipInstallTask.spawn(lambdaBundleTask);
}

project.gitignore.addPatterns(`build`);
project.npmignore.addPatterns(`build`);
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
 * @param dirPath Directory name of the Python Lambda function
 */
 function addPythonLambdaFunctionBundleTask(taskName, uniqueName, dirPath) {
   // cwd is the /core folder
  console.log('process.cwd()', process.cwd());
  console.log('taskName', taskName);
  console.log('uniqueName', uniqueName);
  console.log('dirPath', dirPath);
  

  const bundleTask = project.addTask(taskName, {
    description: `Install dependency and package Python file into for Lambda function:${dirPath}`,
  });
  
  const volumeBindFolder = join('build', 'docker-vol');
  bundleTask.exec(`rm -rf ${volumeBindFolder}`)
  bundleTask.exec(`mkdir -p ${volumeBindFolder}`);


  // Copy all files ('<dirpath>/.') to 'volumeBindFolder'
  bundleTask.exec(`cp -r ${dirPath + '/.'} ${volumeBindFolder}`);

  // Pip install and compiles dependencies via Docker SAM image
  bundleTask.exec([
    'docker run',
    `-v $PWD/${volumeBindFolder}:/var/task`, // Mapping from host full path to Docker container //TODO: only local
    '"public.ecr.aws/sam/build-python3.8"', //Image name
    // '/bin/sh -c "pip install -r requirements.txt -t ./; exit"', //Commands to run in the image
    '/bin/sh -c "ls -la; exit"', //Commands to run in the image
  ].join(' '));

  // todo: copy result out

  // Zip file to next to the lambda directory

  return bundleTask;
}

project.synth();
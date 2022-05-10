// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Code, Function, FunctionProps, ILayerVersion } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { Aws } from '@aws-cdk/core';
import { PreBundledLayer } from './pre-bundled-layer';

/**
 * The properties for the PreBundledFunction construct.
 * It extends existing FunctionProps as optional using `Partial`
 * (as we don't require `Code` prop)
 */
export interface PreBundledFunctionProps extends Partial<FunctionProps>{
  codePath: string;
  name: string;
  lambdaPolicyStatements?: PolicyStatement [];
  lambdaLayers?: ILayerVersion [];
}

/**
 * A Lambda function with prebundled dependencies
 *
 * It changes of the code path by based on the environment that `cdk synth` is running on.
 *
 * This class is used together with a Projen custom task "copy-resources", and "pip-install".
 * The tasks will ensure that all Python and libraries files are available in "lib" folder,
 * with the same relative path
 *
 * When this construct is being run in JSII, this file will be in `node_modules` folder
 * (as it's installed as a 3rd party library.) So we need to change reference based on __dirname.
 * 
 *  * Usage example:
 * ```typescript
 * import { PreBundledFunction } from 'aws-analytics-reference-architecture';
 * 
 * new PreBundledFunction(this, 'PreBundledFunction', {
 *   codePath: 'construct-dir/resources/lambdas/lambda_dir',
 *   // you can use any property available in Function CDK Construct including
 *   name: 'myFunctionName',
 *   memorySize: 1024,
 *   runtime: Runtime.PYTHON_3_8,
 *   handler: 'lmabda-file-name.handler',
 *   logRetention: RetentionDays.ONE_WEEK,
 *   timeout: Duration.minutes(15),
 *   lambdaPolicyStatements: findFilePathsFnPolicy,
 * });
 * ```
 */
export class PreBundledFunction extends Function {
  constructor(scope: cdk.Construct, id: string, props: PreBundledFunctionProps) {

    if (props.code) {
      throw new Error('Pass "codePath" prop instead of "code" . See CONTRIB_FAQ.md on how to create prebundled Lambda function.');
    }

    let functionProps:any = { ...props };

    // __dirname is where this file is. In JSII, it is <jsii_tmp_path>/lib/common.
    // When running unit tests, it is ./src/common). In both case, we need to go up one level.
    let assetPath = path.join(__dirname, `../${props.codePath}`);

    functionProps.code = Code.fromAsset(assetPath);
    functionProps.functionName = props.name.slice();

    let lambdaPolicyStatement: PolicyStatement [] = [];

    lambdaPolicyStatement.push(new PolicyStatement({
      actions: ['logs:CreateLogGroup'],
      resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/lambda/${functionProps.functionName}`],
      effect: Effect.ALLOW,
    }));

    lambdaPolicyStatement.push(new PolicyStatement({
      actions: ['logs:CreateLogStream'],
      resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/lambda/${functionProps.functionName}*`],
      effect: Effect.ALLOW,
    }));

    lambdaPolicyStatement.push(new PolicyStatement({
      actions: ['logs:PutLogEvents'],
      resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/lambda/${functionProps.functionName}:log-stream:*`],
      effect: Effect.ALLOW,
    }));

    functionProps.lambdaPolicyStatements?.forEach((element: PolicyStatement) => {
      lambdaPolicyStatement.push(element);
    });

    //Policy to allow lambda access to cloudwatch logs
    const lambdaExecutionRolePolicy = new ManagedPolicy(scope, 'LambdaExecutionRolePolicy' + functionProps.functionName, {
      statements: lambdaPolicyStatement,
      description: 'Policy similar to lambda execution role but scoped down',
    });

    //Create an execution role for the lambda and attach to it a policy formed from user input
    const lambdaExecutionRole = new Role (scope,
      'LambdaExecutionRole' + functionProps.functionName, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role used by lambda in createManagedEndpoint CR',
        managedPolicies: [lambdaExecutionRolePolicy],
        roleName: 'LambdaExecutionRole' + functionProps.functionName,
      });

    let logRetentionLambdaPolicyStatement: PolicyStatement [] = [];

    logRetentionLambdaPolicyStatement.push(new PolicyStatement({
      actions: ['logs:PutRetentionPolicy', 'logs:DeleteRetentionPolicy'],
      resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/lambda/${functionProps.functionName}`],
      effect: Effect.ALLOW,
    }));

    logRetentionLambdaPolicyStatement.push(new PolicyStatement({
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:*`],
      effect: Effect.ALLOW,
    }));

    //Policy to allow lambda access to cloudwatch logs
    const logRetentionLambdaExecutionRolePolicy = new ManagedPolicy(scope, 'LogRetentionLambdaExecutionRolePolicy' + functionProps.functionName, {
      statements: logRetentionLambdaPolicyStatement,
      description: 'Policy used to allow CR for log retention',
    });

    //Create an execution role for the lambda and attach to it a policy formed from user input
    const logRetentionLambdaExecutionRole = new Role (scope,
      'LogRetentionLambdaExecutionRole' + functionProps.functionName, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role used by lambda to modify log retention',
        managedPolicies: [logRetentionLambdaExecutionRolePolicy],
        roleName: 'LogRetLambdaExec' + functionProps.functionName,
      });

    functionProps.role = lambdaExecutionRole;
    functionProps.logRetentionRole = logRetentionLambdaExecutionRole;

    functionProps.layers = [PreBundledLayer.getOrCreate(scope, 'common/resources/lambdas/pre-bundled-layer')];

    functionProps.lambdaLayers?.forEach((layer: ILayerVersion) => {
      functionProps.layers.push(layer);
    });

    //delete props that were added to force user input
    delete functionProps.codePath;
    delete functionProps.name;
    delete functionProps.lambdaPolicyStatements;
    delete functionProps.lambdaLayers;

    super(scope, id, { ...(functionProps as FunctionProps) });

  }
}

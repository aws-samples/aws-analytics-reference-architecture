// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Code, Function, FunctionProps } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { Aws } from '@aws-cdk/core';

/**
 * Extends existing FunctionProps as optional using `Partial`
 * (as we don't require `Code` prop)
 */
export interface PreBundledFunctionProps extends Partial<FunctionProps>{
  codePath: string;
  name: string;
  lambdaPolicyStatements?: PolicyStatement [];
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
    functionProps.functionName = `ara-${props.name.slice()}`;

    let lambdaPolicyStatement: PolicyStatement [] = [];

    lambdaPolicyStatement.push(new PolicyStatement({
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream'],
      resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/lambda/${functionProps.functionName}`],
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
    const lambdaExecutionRolePolicy = new ManagedPolicy(scope, 'lambdaExecutionRolePolicy' + functionProps.functionName, {
      statements: lambdaPolicyStatement,
      description: 'Policy used to allow CR Provider to access log and not use managed policy',
    });

    //Create an execution role for the lambda and attach to it a policy formed from user input
    const lambdaExcutionRole = new Role (scope,
      'lambdaExcutionRole' + functionProps.functionName, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role used by lambda in createManagedEndpoint CR',
        managedPolicies: [lambdaExecutionRolePolicy],
        roleName: 'lambdaExcutionRole' + functionProps.functionName,
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
    const logRetentionLambdaExecutionRolePolicy = new ManagedPolicy(scope, 'logRetentionLambdaExecutionRolePolicy' + functionProps.functionName, {
      statements: logRetentionLambdaPolicyStatement,
      description: 'Policy used to allow CR for log retention',
    });

    //Create an execution role for the lambda and attach to it a policy formed from user input
    const logRetentionLambdaExcutionRole = new Role (scope,
      'logRetentionLambdaExcutionRole' + functionProps.functionName, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role used by lambda to modify log retention',
        managedPolicies: [logRetentionLambdaExecutionRolePolicy],
        roleName: 'logRetLambdaExec' + functionProps.functionName,
      });

    functionProps.role = lambdaExcutionRole;
    functionProps.logRetentionRole = logRetentionLambdaExcutionRole;

    //delete props that were added to force user input
    delete functionProps.codePath;
    delete functionProps.name;
    delete functionProps.lambdaPolicyStatements;

    super(scope, id, { ...(functionProps as FunctionProps) });

  }
}

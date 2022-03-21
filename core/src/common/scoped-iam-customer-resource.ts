// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

//import * as path from 'path';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
//import { Code, Function, FunctionProps } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { Aws, Stack } from '@aws-cdk/core';
import { Provider, ProviderProps } from '@aws-cdk/custom-resources';

/**
 * Extends existing FunctionProps as optional using `Partial`
 * (as we don't require `Code` prop)
 */
export interface ScopedIamProviderProps extends Partial<ProviderProps>{
  readonly onEventFnName: string;
  readonly isCompleteFnName?: string;
}

/**
 * Provide a custom resource provider with a custom IAM role scoped down for cloudwatch
 */
export class ScopedIamProvider extends Provider {
  constructor(scope: cdk.Construct, id: string, props: ScopedIamProviderProps) {

    const stack = Stack.of(scope);

    let lambdaPolicyStatement: PolicyStatement [] = [];

    lambdaPolicyStatement.push(new PolicyStatement({
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:*`],
      effect: Effect.ALLOW,
    }));

    lambdaPolicyStatement.push(new PolicyStatement({
      resources: [
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'lambda',
          resource: 'function',
          resourceName: `ara-${props.onEventFnName}`,
        }),
      ],
      actions: [
        'lambda:InvokeFunction',
      ],
      effect: Effect.ALLOW,
    }));

    if (props.isCompleteFnName != undefined) {
      lambdaPolicyStatement.push(new PolicyStatement({
        resources: [
          stack.formatArn({
            account: Aws.ACCOUNT_ID,
            region: Aws.REGION,
            service: 'lambda',
            resource: 'function',
            resourceName: `ara-${props.isCompleteFnName}`,
          }),
        ],
        actions: [
          'lambda:InvokeFunction',
        ],
        effect: Effect.ALLOW,
      }));
    }

    //Policy to allow lambda access to cloudwatch logs
    const lambdaExecutionRolePolicy = new ManagedPolicy(scope, 'lambdaExecutionRolePolicy' + id, {
      statements: lambdaPolicyStatement,
      description: 'Policy used to allow Provider lambda to access log and not use managed policy',
    });

    //Create an execution role for the lambda and attach to it a policy formed from user input
    const lambdaExcutionRole = new Role (scope,
      'lambdaExcutionRoleCR' + id, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role used by lambda in CR',
        managedPolicies: [lambdaExecutionRolePolicy],
      });

    let scopedIamCRProps: any = { ...props };

    scopedIamCRProps.role = lambdaExcutionRole;

    super(scope, id, { ...(scopedIamCRProps as ProviderProps) });

  }
}

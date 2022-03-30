// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct, Duration, Aws } from '@aws-cdk/core';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { AccountPrincipal, Effect, PolicyStatement, ServicePrincipal, Role } from '@aws-cdk/aws-iam';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from '@aws-cdk/custom-resources';
import { Runtime } from '@aws-cdk/aws-lambda';
import { LambdaInvoke } from "@aws-cdk/aws-stepfunctions-tasks";
import { StateMachine, JsonPath } from "@aws-cdk/aws-stepfunctions";
import {
    HttpApi,
    CfnIntegration,
    HttpIntegrationType,
    HttpConnectionType,
    PayloadFormatVersion,
    HttpMethod,
    CfnRoute,
} from "@aws-cdk/aws-apigatewayv2";
import * as logs from '@aws-cdk/aws-logs';
import { PreBundledFunction } from '../common/pre-bundled-function';

/**
 * Properties for the ProducerWorkflow Construct
 */

export interface ProducerWorkflowProps {
    /**
    * Central data mesh account Id
    */
    readonly centralAccId: string;

    /**
    * LakeFormation admin role
    */
    readonly lfAdminRole: Role;
}

/**
 * ProducerWorkflow Construct to create a workflow for Producer account.
 * The workflow is a Step Functions state machine that is invoked from the central data mesh account via API GW endpoint.
 * The endpoint is protected via IAM policy and is available onlfy from the central account.
 * It checks and accepts pending RAM shares (tables), and creates resource links in LF Catalog. 
 */
export class ProducerWorkflow extends Construct {
    /**
     * Construct a new instance of ProducerWorkflow.
     * @param {Construct} scope the Scope of the CDK Construct
     * @param {string} id the ID of the CDK Construct
     * @param {ProducerWorkflowProps} props the ProducerWorkflowProps properties
     * @access public
     */

    constructor(scope: Construct, id: string, props: ProducerWorkflowProps) {
        super(scope, id);

        const lfAdminRoleArn = props.lfAdminRole.roleArn;

        // AWS Lambda function to check for pending RAM shares and accept if from central account
        const ramShareFn = new PreBundledFunction(this, 'ramShareFn', {
            runtime: Runtime.PYTHON_3_8,
            codePath: 'data-mesh/resources/lambdas/ram-share',
            handler: 'lambda.on_event',
            logRetention: RetentionDays.ONE_DAY,
            timeout: Duration.seconds(20),
            environment: {
                CENTRAL_ACC_ID: props.centralAccId,
            },
        });

        ramShareFn.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "ram:GetResourceShareInvitations",
                "ram:AcceptResourceShareInvitation",
            ],
            resources: ["*"],
            conditions: {
                "StringEqualsIfExists": {
                    "ram:ShareOwnerAccountId": props.centralAccId,
                },
            },
        }));

        // AWS Lambda function to create a resource-link for shared table
        const createResourceLinkFn = new PreBundledFunction(this, 'createResourceLinkFn', {
            runtime: Runtime.PYTHON_3_8,
            codePath: 'data-mesh/resources/lambdas/resource-link',
            handler: 'lambda.on_event',
            logRetention: RetentionDays.ONE_DAY,
            timeout: Duration.seconds(20),
            environment: {
                CENTRAL_ACC_ID: props.centralAccId,
            },
        });

        createResourceLinkFn.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "glue:createDatabase",
                "glue:createTable",
            ],
            resources: ["*"],
        }));

        // State Machine workflow to accept RAM share and create resource-link for shared table
        const crossAccStateMachine = new StateMachine(this, 'CrossAccStateMachine', {
            definition: new LambdaInvoke(this, "acceptRamShare", {
                lambdaFunction: ramShareFn,
                resultPath: JsonPath.DISCARD,
            }).next(new LambdaInvoke(this, "createResourceLink", {
                lambdaFunction: createResourceLinkFn,
            }))
        });

        // AWS API GW HTTP endpoint to enable cross account workflow
        const httpApi = new HttpApi(this, "ProducerWorkflowApi");
        const apiRole = new Role(this, "ProducerWorkflowApiApiRole", {
            assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
        });

        const apiId = httpApi.httpApiId;
        const workflowApiIntegration = new CfnIntegration(
            this,
            "workflowApiIntegration",
            {
                apiId,
                integrationType: HttpIntegrationType.AWS_PROXY,
                integrationSubtype: "StepFunctions-StartExecution",
                connectionType: HttpConnectionType.INTERNET,
                credentialsArn: apiRole.roleArn,
                description: "Trigger Producer's crossAccStateMachine",
                payloadFormatVersion: PayloadFormatVersion.VERSION_1_0.version,
                requestParameters: {
                    StateMachineArn: crossAccStateMachine.stateMachineArn,
                    Input: "$request.body.input",
                },
                timeoutInMillis: 1000 * 10,
            },
        );

        const workflowPath = "/execute";
        new CfnRoute(this, "workflowApiIntegrationRoute", {
            apiId: httpApi.httpApiId,
            routeKey: `${HttpMethod.POST} ${workflowPath}`,
            authorizationType: 'AWS_IAM',
            target: `integrations/${workflowApiIntegration.ref}`,
        });

        crossAccStateMachine.grantStartExecution(apiRole);

        // Cross account role with policy to enable central account to invoke API
        const centralAccApiRole = new Role(this, "centralAccInvokeApiRole", {
            assumedBy: new AccountPrincipal(props.centralAccId),
        });

        centralAccApiRole.addToPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "execute-api:Invoke"
                ],
                resources: [`arn:aws:execute-api:${Aws.REGION}:${Aws.ACCOUNT_ID}:${apiId}/*/POST/execute`]
            }),
        );

        // Grant createResourceLinkFn permission to CREATE_DATABASE in LakeFormation
        const grantLf = new AwsCustomResource(this, 'Grant', {
            logRetention: logs.RetentionDays.ONE_DAY,
            onCreate: {
                assumedRoleArn: lfAdminRoleArn,
                action: 'grantPermissions',
                service: 'LakeFormation',
                parameters: {
                    Permissions: ["CREATE_DATABASE"],
                    Principal: {
                        DataLakePrincipalIdentifier: createResourceLinkFn.role?.roleArn,
                    },
                    Resource: {
                        "Catalog": {}
                    },
                },
                physicalResourceId: PhysicalResourceId.of(id),
            },
            onDelete: {
                assumedRoleArn: lfAdminRoleArn,
                action: 'revokePermissions',
                service: 'LakeFormation',
                parameters: {
                    Permissions: ["CREATE_DATABASE"],
                    Principal: {
                        DataLakePrincipalIdentifier: createResourceLinkFn.role?.roleArn,
                    },
                    Resource: {
                        "Catalog": {},
                    },
                },
                physicalResourceId: PhysicalResourceId.of(id),
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
        });

        grantLf.node.addDependency(createResourceLinkFn);
    }
}

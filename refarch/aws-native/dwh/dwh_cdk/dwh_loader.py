# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0


from constructs import Construct
from aws_cdk import (
    Aws,
    Duration,
    aws_iam as _iam,
    aws_stepfunctions as _sfn,
    aws_stepfunctions_tasks as _sfn_tasks,
    aws_events as _events,
    aws_events_targets as _events_targets
)

from aws_cdk.aws_secretsmanager import Secret
from aws_cdk import Stack
import aws_cdk.aws_lambda as _lambda
import subprocess

import common.common_cdk.config as _config


class DwhLoader(Construct):

    def __init__(self,
                 scope: Construct,
                 id: str,
                 redshift_cluster_name: str,
                 user_secret: Secret) -> None:
        super().__init__(scope, id)

        stack = Stack.of(self)

        subprocess.call(
            ['pip', 'install', '-t', 'dwh/dwh_loader_layer/python/lib/python3.8/site-packages', '-r',
             'dwh/dwh_loader/requirements.txt', '--platform', 'manylinux1_x86_64', '--only-binary=:all:',
             '--upgrade'])

        requirements_layer = _lambda.LayerVersion(scope=self,
                                                  id='PythonRequirementsTemplate',
                                                  code=_lambda.Code.from_asset('dwh/dwh_loader_layer'),
                                                  compatible_runtimes=[_lambda.Runtime.PYTHON_3_8])

        dwh_loader_role = _iam.Role(
            self, 'Role',
            assumed_by=_iam.ServicePrincipal('lambda.amazonaws.com')
        )

        dwh_loader_role.add_managed_policy(_iam.ManagedPolicy.from_aws_managed_policy_name(
            'service-role/AWSLambdaBasicExecutionRole'
        ))

        dwh_loader_role.attach_inline_policy(
            _iam.Policy(
                self, 'InlinePolicy',
                statements=[
                    _iam.PolicyStatement(
                        actions=[
                            "redshift-data:ExecuteStatement",
                            "redshift-data:CancelStatement",
                            "redshift-data:ListStatements",
                            "redshift-data:GetStatementResult",
                            "redshift-data:DescribeStatement",
                            "redshift-data:ListDatabases",
                            "redshift-data:ListSchemas",
                            "redshift-data:ListTables",
                            "redshift-data:DescribeTable"
                        ],
                        resources=['*']
                    ),
                    _iam.PolicyStatement(
                        actions=["secretsmanager:GetSecretValue"],
                        resources=[user_secret.secret_arn]
                    ),
                    _iam.PolicyStatement(
                        actions=["redshift:GetClusterCredentials"],
                        resources=[
                            "arn:aws:redshift:*:*:dbname:*/*",
                            "arn:aws:redshift:*:*:dbuser:*/"+_config.Redshift.ETL_USER
                        ]
                    ),
                    _iam.PolicyStatement(
                        effect=_iam.Effect('DENY'),
                        actions=["redshift:CreateClusterUser"],
                        resources=["arn:aws:redshift:*:*:dbuser:*/"+_config.Redshift.ETL_USER]
                    ),
                    _iam.PolicyStatement(
                        conditions={
                            'StringLike': {
                                "iam:AWSServiceName": "redshift-data.amazonaws.com"
                            }
                        },
                        actions=["iam:CreateServiceLinkedRole"],
                        resources=["arn:aws:iam::*:role/aws-service-role/redshift-data.amazonaws.com/AWSServiceRoleForRedshift"]
                    ),
                ]
            )
        )

        dwh_loader_function = _lambda.Function(
            self, 'Lambda',
            runtime=_lambda.Runtime.PYTHON_3_8,
            code=_lambda.Code.from_asset('dwh/dwh_loader'),
            handler='dwh_loader.handler',
            function_name='dwh-loader',
            environment={
                'CLUSTER_NAME': redshift_cluster_name,
                'PROCEDURE': _config.Redshift.ETL_PROCEDURE,
                'SECRET_ARN': user_secret.secret_arn,
                'DATABASE': _config.Redshift.DATABASE,
                'REGION': Aws.REGION,
                'SCHEMA': _config.Redshift.SCHEMA
            },
            layers=[requirements_layer],
            timeout=Duration.seconds(30),
            role=dwh_loader_role
        )

        dwh_loader_submit = _sfn_tasks.LambdaInvoke(
            self, 'Submit',
            lambda_function=dwh_loader_function,
            payload_response_only=True
        )

        dwh_loader_wait = _sfn.Wait(
            self, 'Wait',
            time=_sfn.WaitTime.duration(Duration.seconds(30))
        )

        dwh_loader_complete = _sfn.Choice(
            self, 'Complete'
        )

        dwh_loader_failed = _sfn.Fail(
            self, 'Fail',
            cause="Redshift Data API statement failed",
            error="$.Result.Error"
        )

        dwh_loader_status = _sfn_tasks.LambdaInvoke(
            self, 'Status',
            lambda_function=dwh_loader_function,
            result_path='$.Result',
            payload_response_only=True
        )

        definition = dwh_loader_submit \
            .next(dwh_loader_wait) \
            .next(dwh_loader_status) \
            .next(dwh_loader_complete
                  .when(_sfn.Condition.string_equals('$.Result.Status', 'FAILED'), dwh_loader_failed)
                  .when(_sfn.Condition.string_equals('$.Result.Status', 'FINISHED'), _sfn.Succeed(self, 'DwhLoaderSuccess'))
                  .otherwise(dwh_loader_wait))

        dwh_loader_stepfunctions = _sfn.StateMachine(
            self, 'StepFunctions',
            definition=definition,
            timeout=Duration.minutes(30)
        )

        step_trigger = _events.Rule(
            self, 'StepTrigger',
            schedule=_events.Schedule.cron(minute='0/30',
                                           hour='*',
                                           month='*',
                                           week_day='*',
                                           year='*')
        )

        step_trigger.add_target(
            _events_targets.SfnStateMachine(
                machine=dwh_loader_stepfunctions,
            )
        )

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

#!/usr/bin/env python3
import os
from aws_cdk import App, Stack, Annotations
from constructs import Construct
from common.common_cdk.data_lake import DataLake
from cicd.pipeline import PipelineStack, AnalyticsEnvironment
from aws_analytics_reference_architecture import CdkDeployer


def make_env(scope: Construct, context_key: str):
    env_params = scope.node.try_get_context(context_key)

    if env_params is None:
        raise ValueError(f'Please provide {context_key} account information on cdk.context.json')
    else:
        return AnalyticsEnvironment(
            name=env_params.get("name"),
            region=env_params.get("region"),
            account=env_params.get("account")
        )


# Initialize the CDK App and PipelineStack
app = App()

CdkDeployer( app, 'CdkDeployer', 
    github_repository='aws-samples/aws-analytics-reference-architecture',
    stack_name='ara',
    cdk_app_location='refarch/aws-native',
    cdk_parameters= {
        'QuickSightUsername': {
            'type': 'String',
        },
        'QuickSightIdentityRegion': {
            'type': 'String',
        },
    },
)

if app.node.try_get_context('EnableCICD') == 'true':
    deploy_envs = []

    cicd_account_context = app.node.try_get_context('CICD')
    if cicd_account_context is None:
        raise ValueError('Please provide CICD account information on cdk.context.json')

    dev_env = make_env(app, 'DEV')
    deploy_envs.append(dev_env)

    # Comment out to deploy only to dev environment
    prod_env = make_env(app, 'PROD')
    deploy_envs.append(prod_env)

    PipelineStack(app, "araPipelineStack",
                  env={
                      'account': cicd_account_context.get('account'),
                      'region': cicd_account_context.get('region')
                  },
                  deploy_envs=deploy_envs)
else:
    DataLake(app, "ara")

app.synth()

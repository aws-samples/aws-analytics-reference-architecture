# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

#!/usr/bin/env python3
import os

from aws_cdk import core
from aws_cdk.core import Construct, Annotations
from common_cdk.data_lake import DataLake

from cicd.pipeline import PipelineStack, AnalyticsEnvironment


def make_env(scope: Construct, context_key: str):
    env_params = scope.node.try_get_context(context_key)

    if env_params is None:
        Annotations.of(scope).add_warning("No environment found for context {}, using default".format(context_key))
        return AnalyticsEnvironment(
            name=context_key,
            region=os.getenv("CDK_DEFAULT_REGION"),
            account=os.getenv("CDK_DEFAULT_ACCOUNT")
        )
    else:
        return AnalyticsEnvironment(
            name=env_params.get("name"),
            region=env_params.get("region"),
            account=env_params.get("account")
        )


# Initialize the CDK App and PipelineStack
app = core.App()

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

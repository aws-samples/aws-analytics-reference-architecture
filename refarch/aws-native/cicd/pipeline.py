# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
from aws_cdk.core import Stack, Construct, Environment
from aws_cdk.pipelines import CodePipeline, CodePipelineSource, CodeBuildStep

from cicd.pipeline_stage import PipelineStage


class AnalyticsEnvironment:

    def __init__(self, name: str, account: str, region: str):
        self.name = name
        self.account = account
        self.region = region


class PipelineStack(Stack):

    def __init__(self, scope: Construct, id: str, deploy_envs: list, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        cicd_params = self.node.try_get_context('CICDParameters')

        connection_arn = cicd_params.get('ConnectionArn')
        repo = cicd_params.get("RepositoryName")
        branch = cicd_params.get("RepositoryBranch")

        if connection_arn in [None, '', '<CONNECTION_ARN>']:
            raise ValueError('"ConnectionArn" must be set in "cdk.json" to create CICD pipelines')

        if repo in [None, '', '<REPOSITORY_NAME>']:
            raise ValueError('"RepositoryName" must be set in "cdk.json" to create CICD pipelines')

        if branch in [None, '', '<REPOSITORY_BRANCH>']:
            raise ValueError('"RepositoryBranch" must be set in "cdk.json" to create CICD pipelines')

        pipeline = CodePipeline(self, 'AnalyticsPipeline',
                                synth=CodeBuildStep('Synth',
                                                input=CodePipelineSource.connection(
                                                    repo_string=repo,
                                                    branch=branch,
                                                    connection_arn=connection_arn),
                                                commands=[
                                                    'cd refarch/aws-native',
                                                    'pip install -r requirements.txt',
                                                    'which npx',
                                                    'npm install -g aws-cdk',
                                                    'cdk synth'
                                                ],
                                                primary_output_directory='refarch/aws-native/cdk.out'),
                                cross_account_keys=True,

                                )

        for env in deploy_envs:
            pipeline.add_stage(stage=PipelineStage(self, 'AnalyticsPipelineStage', env=Environment(
                account=env.account,
                region=env.region
            )))

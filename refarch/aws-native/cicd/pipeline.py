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

        connection_arn = self.node.try_get_context('ConnectionArn')
        repo = self.node.try_get_context("RepositoryName")
        branch = self.node.try_get_context("RepositoryBranch")

        if connection_arn is None or connection_arn == '<CONNECTION_ARN>':
            raise Exception('Connection ARN must be set in order to enable CICD pipelines')

        if repo is None or repo == '<REPOSITORY_NAME>':
            raise Exception('Repository name must be set in order to enable CICD pipelines')

        if branch is None or branch == '<REPOSITORY_BRANCH>':
            raise Exception('Repository branch must be set in order to enable CICD pipelines')

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

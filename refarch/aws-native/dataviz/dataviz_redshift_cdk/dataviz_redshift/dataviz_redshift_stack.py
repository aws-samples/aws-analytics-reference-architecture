# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk import core
import aws_cdk.aws_iam as iam
import aws_cdk.aws_secretsmanager as sm
import aws_cdk.custom_resources as cr
import aws_cdk.aws_lambda as lambda_

from dataviz_redshift.redshift_config import Config as cfg
from dataviz_redshift.qs_redshift_dataset import QuickSightRedshiftDataset
from dataviz_redshift.qs_redshift_analysis import QuickSightRedshiftAnalysis

class DataVizRedshiftStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Add the VPC connection arn as an input parameter
        vpc_conn_arn = core.CfnParameter(self, "VpcConnectionArn", type="String",
            description="The Arn of the VPC connection to use for Redshift.")

        quicksight_group_arn = core.Fn.import_value('ara-QuickSight-Group-Arn')
        secret_arn = core.Fn.import_value('ara-QuickSight-Redshift-Secret-Arn')

        # Create the custom resource policy with the necessary permissions
        iam_policy = cr.AwsCustomResourcePolicy.from_statements(
            [
                iam.PolicyStatement(
                    actions=cfg.CDK_POLICY_ACTIONS,
                    resources=['*']),
            ]
        )


        redshift_datasource_lambda = lambda_.SingletonFunction(self,
                                            id='RedshiftDatasourceLambda',
                                            uuid='b438edeb-f5dc-486a-ac2d-bc0918b975b8',
                                            runtime=lambda_.Runtime.PYTHON_3_8,
                                            code=lambda_.Code.from_asset('dataviz_redshift/lambda'),
                                            handler='redshift_datasource.handler',
                                            function_name='ara_redshift_datasource'
                                            )

        redshift_datasource_lambda.role.add_to_policy(iam.PolicyStatement(
            actions=['secretsmanager:GetSecretValue'],
            resources=[secret_arn])
        )

        redshift_datasource_lambda.role.add_to_policy(iam.PolicyStatement(
            actions=['quicksight:CreateDataSource', 'quicksight:DeleteDataSource'],
            resources=['*'])
        )

        lambda_provider = cr.Provider(self, id='LambdaProvider', on_event_handler=redshift_datasource_lambda)

        responseLamb = core.CustomResource(self, 'RedshiftDatasourceResource',
                                          service_token=lambda_provider.service_token,
                                          properties={
                                                'Secret_arn': secret_arn,
                                                'Datasource_name': cfg.REDSHIFT_DATASOURCE_NAME,
                                                'Aws_account_id': self.account,
                                                'Quicksight_group_arn': quicksight_group_arn,
                                                'Datasource_actions': cfg.DATASOURCE_ACTIONS,
                                                'Vpc_conn_arn': vpc_conn_arn.value_as_string
                                                })

        redshift_datasource_arn = responseLamb.get_att_string('datasource_arn')

        core.CfnOutput(
            self, "RedshiftDataSourceArn",
            description="Redshift Data Source Arn",
            value=redshift_datasource_arn
        )



        # Create a Redshift dataset with custom SQL
        redshift_dataset_arn = QuickSightRedshiftDataset(self,
                                                     'RedshiftDataset',
                                                     iam_policy=iam_policy,
                                                     quicksight_group_arn=quicksight_group_arn,
                                                     redshift_datasource_arn=redshift_datasource_arn,
                                                     redshift_dataset_name=cfg.REDSHIFT_DATASET_NAME,
                                                     dataset_actions=cfg.DATASET_ACTIONS,
                                                     redshift_custom_sql=cfg.REDSHIFT_CUSTOM_SQL,
                                                     redshift_columns=cfg.REDSHIFT_COLUMNS,
                                                     redshift_data_transformations=cfg.REDSHIFT_DATA_TRANSFORMATIONS
                                                     ).redshift_dataset_arn

        QuickSightRedshiftAnalysis(self,
                                 'RedshiftAnalysis',
                                 iam_policy=iam_policy,
                                 quicksight_group_arn=quicksight_group_arn,
                                 redshift_dataset_arn=redshift_dataset_arn,
                                 redshift_analysis_name=cfg.REDSHIFT_ANALYSIS_NAME,
                                 redshift_analysis_template_alias=cfg.REDSHIFT_ANALYSIS_TEMPLATE_ALIAS,
                                 analysis_actions=cfg.ANALYSIS_ACTIONS
                                 )





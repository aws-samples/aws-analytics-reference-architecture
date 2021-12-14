# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import aws_cdk.aws_ec2 as ec2
import aws_cdk.aws_glue as glue
import aws_cdk.aws_iam as iam
import aws_cdk.core as core
import aws_cdk.custom_resources as cr

from common.common_cdk.config import DataVizConfig as cfg
from dataviz.dataviz_cdk.qs_athena_analysis import QuickSightAthenaAnalysis
from dataviz.dataviz_cdk.qs_athena_dataset import QuickSightAthenaDataset
from dataviz.dataviz_cdk.qs_athena_datasource import QuickSightAthenaDatasource
from dataviz.dataviz_cdk.qs_group import QuickSightGroup
from dataviz.dataviz_cdk.qs_vpc_conn_reqs import QuickSightVpcConnectionReqs


class DataVizModule(core.NestedStack):

    @property
    def quicksight_group_arn(self):
        return self.__quicksight_group_arn

    @property
    def quicksight_security_group_id(self):
        return self.__quicksight_security_group_id

    def __init__(self, scope: core.Construct, id: str,
                 vpc: ec2.IVpc, clean_glue_db_name: glue.Database,
                 redshift_sg_id: str, quicksight_username: str,
                 quicksight_identity_region: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create the custom resource policy with the necessary permissions
        iam_policy = cr.AwsCustomResourcePolicy.from_statements(
            [
                iam.PolicyStatement(
                    actions=cfg.CDK_POLICY_ACTIONS,
                    resources=['*']),
            ]
        )

        # Create a QuickSight group to grant permission to created resources
        self.__quicksight_group_arn = QuickSightGroup(self,
                                           'QuickSightGroup',
                                           iam_policy=iam_policy,
                                           group_name=cfg.QS_GROUP_NAME,
                                           username=quicksight_username,
                                           identity_region=quicksight_identity_region,
                                           ).group_arn

        # Create an Athena datasource
        athena_datasource_arn = QuickSightAthenaDatasource(self,
                                                'AthenaDatasource',
                                                iam_policy=iam_policy,
                                                quicksight_group_arn=self.__quicksight_group_arn,
                                                athena_datasource_name=cfg.ATHENA_DATASOURCE_NAME,
                                                datasource_actions=cfg.DATASOURCE_ACTIONS
                                                ).datasource_arn

        # Create an Athena dataset with custom SQL
        athena_dataset_arn = QuickSightAthenaDataset(self,
                                                   'AthenaDataset',
                                                     iam_policy=iam_policy,
                                                     quicksight_group_arn=self.__quicksight_group_arn,
                                                     athena_datasource_arn=athena_datasource_arn,
                                                     athena_dataset_name=cfg.ATHENA_DATASET_NAME,
                                                     dataset_actions=cfg.DATASET_ACTIONS,
                                                     athena_custom_sql=cfg.ATHENA_CUSTOM_SQL.format(clean_glue_db_name),
                                                     athena_columns=cfg.ATHENA_COLUMNS,
                                                     athena_data_transformations=cfg.ATHENA_DATA_TRANSFORMATIONS
                                                     ).dataset_arn

        QuickSightAthenaAnalysis(self,
                                 'AthenaAnalysis',
                                 iam_policy=iam_policy,
                                 quicksight_group_arn=self.__quicksight_group_arn,
                                 athena_dataset_arn=athena_dataset_arn,
                                 athena_analysis_name=cfg.ATHENA_ANALYSIS_NAME,
                                 athena_analysis_template_alias=cfg.ATHENA_ANALYSIS_TEMPLATE_ALIAS,
                                 analysis_actions=cfg.ANALYSIS_ACTIONS
                                 )

        self.__quicksight_security_group_id = QuickSightVpcConnectionReqs(self, 'VpcConnReqs', vpc=vpc,
                                                                          redshift_security_group_id=redshift_sg_id,
                                                                          quicksight_security_group_name='quicksight-sg').security_group_id

        core.Tags.of(self).add('module-name', 'dataviz')

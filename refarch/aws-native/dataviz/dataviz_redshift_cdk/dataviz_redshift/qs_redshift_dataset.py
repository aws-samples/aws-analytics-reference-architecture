# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import datetime

from constructs import Construct
from aws_cdk import (
    Aws,
    CfnOutput,
    custom_resources as cr
)

class QuickSightRedshiftDataset(Construct):

    @property
    def redshift_dataset_arn(self):
        return self.__redshift_dataset_arn

    def __init__(
            self,
            scope: Construct,
            id: str,
            iam_policy: cr.AwsCustomResourcePolicy,
            quicksight_group_arn: str,
            redshift_datasource_arn: str,
            redshift_dataset_name: str,
            dataset_actions: list,
            redshift_custom_sql: str,
            redshift_columns: list,
            redshift_data_transformations: list,
            **kwargs):

        super().__init__(scope, id, **kwargs)

        aws_account_id = Aws.ACCOUNT_ID
        uniquestring = datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')
        dataset_id = redshift_dataset_name + uniquestring
        dataset_physical_id = redshift_dataset_name + uniquestring

        quicksight_data_set = cr.AwsCustomResource(self, 'RedshiftDataSet',
                                                   on_create={
                                                       "service": "QuickSight",
                                                       "action": "createDataSet",
                                                       "parameters": {
                                                           "AwsAccountId": aws_account_id,
                                                           "DataSetId": dataset_id,
                                                           "Name": redshift_dataset_name,
                                                           "ImportMode": "DIRECT_QUERY",
                                                           "PhysicalTableMap": {
                                                               "RedshiftPhysicalTable": {
                                                                   "CustomSql": {
                                                                       "DataSourceArn": redshift_datasource_arn,
                                                                       "Name": redshift_dataset_name,
                                                                       "SqlQuery": redshift_custom_sql,
                                                                       "Columns": redshift_columns
                                                                   }
                                                               }
                                                           },
                                                           "LogicalTableMap": {
                                                               "RedshiftLogicalTable": {
                                                                   "Alias": redshift_dataset_name,
                                                                   "DataTransforms": redshift_data_transformations,
                                                                   "Source": {
                                                                       "PhysicalTableId": "RedshiftPhysicalTable"
                                                                   }
                                                               }
                                                           },
                                                           "Permissions": [
                                                               {
                                                                   "Principal": quicksight_group_arn,
                                                                   "Actions": dataset_actions
                                                               }
                                                           ],

                                                       },
                                                       "physical_resource_id": cr.PhysicalResourceId.of(
                                                           dataset_physical_id)},
                                                   on_delete={
                                                       "service": "QuickSight",
                                                       "action": "deleteDataSet",
                                                       "parameters": {
                                                           "AwsAccountId": aws_account_id,
                                                           "DataSetId": dataset_id
                                                       },
                                                       "physical_resource_id": cr.PhysicalResourceId.of(
                                                           dataset_physical_id)},
                                                   policy=iam_policy
                                                   )

        self.__redshift_dataset_arn = quicksight_data_set.get_response_field("Arn")

        CfnOutput(
            self, "RedshiftDataSetArn",
            description="Redshift Data Set Arn",
            value=self.__redshift_dataset_arn
        )
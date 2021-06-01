# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import datetime

from aws_cdk import (
    core,
    custom_resources as cr
)

class QuickSightAthenaDataset(core.Construct):

    @property
    def dataset_arn(self):
        return self.__dataset_arn

    def __init__(
            self,
            scope: core.Construct,
            id: str,
            iam_policy: cr.AwsCustomResourcePolicy,
            quicksight_group_arn: str,
            athena_datasource_arn: str,
            athena_dataset_name: str,
            dataset_actions: list,
            athena_custom_sql: str,
            athena_columns: list,
            athena_data_transformations: list,
            **kwargs):

        super().__init__(scope, id, **kwargs)

        aws_account_id = core.Aws.ACCOUNT_ID
        uniquestring = datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')
        athena_dataset_id = athena_dataset_name + uniquestring
        athena_dataset_physical_id = athena_dataset_name + uniquestring

        quicksight_athena_dataset = cr.AwsCustomResource(self, 'AthenaDataSet',
                                                   on_create={
                                                       "service": "QuickSight",
                                                       "action": "createDataSet",
                                                       "parameters": {
                                                           "AwsAccountId": aws_account_id,
                                                           "DataSetId": athena_dataset_id,
                                                           "Name": athena_dataset_name,
                                                           "ImportMode": "DIRECT_QUERY",
                                                           "PhysicalTableMap": {
                                                               "PhysicalAthenaTable": {
                                                                   "CustomSql": {
                                                                       "DataSourceArn": athena_datasource_arn,
                                                                       "Name": athena_dataset_name,
                                                                       "SqlQuery": athena_custom_sql,
                                                                       "Columns": athena_columns
                                                                   }
                                                               }
                                                           },
                                                           "LogicalTableMap": {
                                                               "LogicalAthenaTable": {
                                                                   "Alias": athena_dataset_name,
                                                                   "DataTransforms": athena_data_transformations,
                                                                   "Source": {
                                                                       "PhysicalTableId": "PhysicalAthenaTable"
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
                                                           athena_dataset_physical_id)},
                                                   on_delete={
                                                       "service": "QuickSight",
                                                       "action": "deleteDataSet",
                                                       "parameters": {
                                                           "AwsAccountId": aws_account_id,
                                                           "DataSetId": athena_dataset_id
                                                       },
                                                       "physical_resource_id": cr.PhysicalResourceId.of(
                                                           athena_dataset_physical_id)},
                                                   policy=iam_policy
                                                   )

        self.__dataset_arn = quicksight_athena_dataset.get_response_field("Arn")
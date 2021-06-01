# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk import (
    core,
    custom_resources as cr
)

class QuickSightAthenaDatasource(core.Construct):

    @property
    def datasource_arn(self):
        return self.__datasource_arn

    def __init__(
            self,
            scope: core.Construct,
            id: str,
            iam_policy: cr.AwsCustomResourcePolicy,
            quicksight_group_arn: str,
            athena_datasource_name: str,
            datasource_actions: list,
            **kwargs):

        super().__init__(scope, id, **kwargs)

        aws_account_id = core.Aws.ACCOUNT_ID
        athena_datasource_id = athena_datasource_name
        athena_datasource_physical_id = id + athena_datasource_name

        quicksight_data_source = cr.AwsCustomResource(self, 'AthenaDataSource',
                                                      on_create={
                                                          "service": "QuickSight",
                                                          "action": "createDataSource",
                                                          "parameters": {
                                                              "AwsAccountId": aws_account_id,
                                                              "DataSourceId": athena_datasource_id,
                                                              "Name": athena_datasource_name,
                                                              "Type": "ATHENA",
                                                              "DataSourceParameters": {
                                                                  "AthenaParameters": {
                                                                      "WorkGroup": "primary"
                                                                  }
                                                              },
                                                              "Permissions": [
                                                                  {
                                                                      'Principal': quicksight_group_arn,
                                                                      'Actions': datasource_actions
                                                                  },
                                                              ]

                                                          },
                                                          "physical_resource_id": cr.PhysicalResourceId.of(
                                                              athena_datasource_physical_id)},
                                                      on_delete={
                                                          "service": "QuickSight",
                                                          "action": "deleteDataSource",
                                                          "parameters": {
                                                              "AwsAccountId": aws_account_id,
                                                              "DataSourceId": athena_datasource_id
                                                          },
                                                          "physical_resource_id": cr.PhysicalResourceId.of(
                                                              athena_datasource_physical_id)},
                                                      policy=iam_policy
                                                      )

        self.__datasource_arn = quicksight_data_source.get_response_field("Arn")
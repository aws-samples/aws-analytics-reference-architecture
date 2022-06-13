# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import datetime

from constructs import Construct
from aws_cdk import (
    Aws,
    custom_resources as cr
)

class QuickSightAthenaAnalysis(Construct):

    def __init__(
            self,
            scope: Construct,
            id: str,
            iam_policy: cr.AwsCustomResourcePolicy,
            quicksight_group_arn: str,
            athena_dataset_arn: str,
            athena_analysis_name: str,
            athena_analysis_template_alias: str,
            analysis_actions: list,
            **kwargs):


        super().__init__(scope, id, **kwargs)

        aws_account_id = Aws.ACCOUNT_ID
        uniquestring = datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')
        athena_analysis_id = athena_analysis_name + uniquestring
        athena_analysis_physical_id = athena_analysis_name + uniquestring

        athena_analysis = cr.AwsCustomResource(self, 'AthenaAnalysis',
                                                      on_create={
                                                          "service": "QuickSight",
                                                          "action": "createAnalysis",
                                                          "parameters": {
                                                              "AwsAccountId": aws_account_id,
                                                              "Name": athena_analysis_name,
                                                              "AnalysisId": athena_analysis_id,
                                                              "Permissions": [
                                                                  {
                                                                      'Principal': quicksight_group_arn,
                                                                      'Actions': analysis_actions
                                                                  },
                                                              ],
                                                              "SourceEntity": {
                                                                  "SourceTemplate": {
                                                                      "Arn": athena_analysis_template_alias,
                                                                      "DataSetReferences": [
                                                                          {
                                                                              "DataSetArn": athena_dataset_arn,
                                                                              "DataSetPlaceholder": "MainDataset"
                                                                          }
                                                                      ]
                                                                  }
                                                              }
                                                          },
                                                          "physical_resource_id": cr.PhysicalResourceId.of(
                                                              athena_analysis_physical_id)},
                                                      on_delete={
                                                          "service": "QuickSight",
                                                          "action": "deleteAnalysis",
                                                          "parameters": {
                                                              "AwsAccountId": aws_account_id,
                                                              "AnalysisId": athena_analysis_id,
                                                              "ForceDeleteWithoutRecovery": True
                                                          },
                                                          "physical_resource_id": cr.PhysicalResourceId.of(
                                                              athena_analysis_physical_id)},
                                                      policy=iam_policy
                                                      )

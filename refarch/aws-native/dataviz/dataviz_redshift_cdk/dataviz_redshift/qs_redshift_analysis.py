# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import datetime

from constructs import Construct
from aws_cdk import (
    Aws,
    custom_resources as cr
)

class QuickSightRedshiftAnalysis(Construct):

    def __init__(
            self,
            scope: Construct,
            id: str,
            iam_policy: cr.AwsCustomResourcePolicy,
            quicksight_group_arn: str,
            redshift_dataset_arn: str,
            redshift_analysis_name: str,
            redshift_analysis_template_alias: str,
            analysis_actions: list,
            **kwargs):


        super().__init__(scope, id, **kwargs)

        aws_account_id = Aws.ACCOUNT_ID
        uniquestring = datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')
        redshift_analysis_id = redshift_analysis_name + uniquestring
        redshift_analysis_physical_id = redshift_analysis_name + uniquestring

        redshift_analysis = cr.AwsCustomResource(self, 'RedshiftAnalysis',
                                                      on_create={
                                                          "service": "QuickSight",
                                                          "action": "createAnalysis",
                                                          "parameters": {
                                                              "AwsAccountId": aws_account_id,
                                                              "Name": redshift_analysis_name,
                                                              "AnalysisId": redshift_analysis_id,
                                                              "Permissions": [
                                                                  {
                                                                      'Principal': quicksight_group_arn,
                                                                      'Actions': analysis_actions
                                                                  },
                                                              ],
                                                              "SourceEntity": {
                                                                  "SourceTemplate": {
                                                                      "Arn": redshift_analysis_template_alias,
                                                                      "DataSetReferences": [
                                                                          {
                                                                              "DataSetArn": redshift_dataset_arn,
                                                                              "DataSetPlaceholder": "MainDataset"
                                                                          }
                                                                      ]
                                                                  }
                                                              }
                                                          },
                                                          "physical_resource_id": cr.PhysicalResourceId.of(
                                                              redshift_analysis_physical_id)},
                                                      on_delete={
                                                          "service": "QuickSight",
                                                          "action": "deleteAnalysis",
                                                          "parameters": {
                                                              "AwsAccountId": aws_account_id,
                                                              "AnalysisId": redshift_analysis_id,
                                                              "ForceDeleteWithoutRecovery": True
                                                          },
                                                          "physical_resource_id": cr.PhysicalResourceId.of(
                                                              redshift_analysis_physical_id)},
                                                      policy=iam_policy
                                                      )

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
from aws_cdk.core import Stage, Construct
from common_cdk.data_lake import DataLake


class PipelineStage(Stage):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        DataLake(self, "ara")

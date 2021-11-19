# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

#!/usr/bin/env python3

from aws_cdk import core
from common.common_cdk.data_lake import DataLake

app = core.App()

DataLake(app, "ara-v2")

app.synth()

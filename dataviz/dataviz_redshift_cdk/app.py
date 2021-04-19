# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

#!/usr/bin/env python3

from aws_cdk import core

from dataviz_redshift.dataviz_redshift_stack import DataVizRedshiftStack


app = core.App()
DataVizRedshiftStack(app, "ara-dataviz-redshift")

app.synth()

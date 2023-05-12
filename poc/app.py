#!/usr/bin/env python3
import os

import aws_cdk as cdk

from poc.poc_stack import PocStack


app = cdk.App()
PocStack(app, "PocStack",
    env=cdk.Environment(account='111111111111', region='')
    )

app.synth()

#!/usr/bin/env python3
import os

import aws_cdk as cdk

from ara_py.ara_py_stack import AraPyStack


app = cdk.App()
AraPyStack(app, "AraPyStack",
    env=cdk.Environment(account='111111111111', region='')
    )

app.synth()

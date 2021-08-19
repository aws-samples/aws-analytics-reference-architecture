# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import logging
import datetime


log = logging.getLogger()
log.setLevel(logging.INFO)

def handler(event, ctx):
    offset = int(event['Offset'])
    frequency = int(event['Frequency'])
    statement = event['Statement']
    now = datetime.datetime.now()
    min = (now - datetime.timedelta(seconds = frequency + offset)).isoformat(sep='T', timespec='milliseconds') + 'Z'
    max = (now - datetime.timedelta(seconds = offset)).isoformat(sep='T', timespec='milliseconds') + 'Z'
    return statement.replace('\{\{MIN\}\}', min).replace('\{\{MAX\}\}', max)
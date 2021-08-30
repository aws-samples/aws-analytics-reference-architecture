# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import logging
import datetime


log = logging.getLogger()
log.setLevel(logging.INFO)

def handler(event, ctx):
    offset = event['Offset']
    log.info('offset: %s', offset)
    frequency = int(event['Frequency'])
    log.info('frequency: %s', frequency)
    statement = event['Statement']
    log.info('statement: %s', statement)
    now = datetime.datetime.now()
    min = (now - datetime.timedelta(seconds = frequency + int(offset))).isoformat(sep='T', timespec='milliseconds') + 'Z'
    max = (now - datetime.timedelta(seconds = int(offset))).isoformat(sep='T', timespec='milliseconds') + 'Z'
    new_statement = statement.replace('{{OFFSET}}', offset).replace('{{MIN}}', min).replace('{{MAX}}', max)
    log.info('new statement: %s', new_statement)
    return new_statement
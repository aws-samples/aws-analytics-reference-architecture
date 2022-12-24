# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import os
import logging
import uuid
import json

emrcontainers = boto3.client('emr-containers', os.getenv('AWS_REGION'))
log = logging.getLogger()
log.setLevel(logging.INFO)


def on_event(event, ctx):
    log.info(event)
    request_type = event['RequestType'].lower()
    if request_type == 'create':
        return on_create(event)
    if request_type == 'update':
        return on_update(event)
    if request_type == 'delete':
        return on_delete(event)
    raise Exception(f'Invalid request type: {request_type}')


def on_create(event):
    log.info(event)
    log.info(boto3.__version__)
    log.info(event['ResourceProperties']['jobTemplateData'])

    response = emrcontainers.create_job_template(
        name=event['ResourceProperties']['name'],
        jobTemplateData=event['ResourceProperties']['jobTemplateData'],
        clientToken=str(uuid.uuid4()),
        tags={'for-use-with':'cdk-analytics-reference-architecture'}
    )

    log.info(response)
    return {
        'PhysicalResourceId': response['id'],
    }


def on_update(event):
    return on_create(event)


def on_delete(event):
    log.info(event)

    response = emrcontainers.delete_job_template(
        id=event['PhysicalResourceId']
    )

    log.info(response)
    return {
        'PhysicalResourceId': response['id'],
    }

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from lib2to3.pytree import Base
import boto3
import os
import logging
from botocore.exceptions import ClientError

glue_client = boto3.client('glue', os.getenv('AWS_REGION'))
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
    job_name = event['ResourceProperties']['JobName']
    response_start = glue_client.start_job_run(JobName=job_name)
    log.info(response_start)
    return {
        'PhysicalResourceId': response_start['JobRunId']
    }

def on_update(event):
    log.info(event)
    job_run_id = event['PhysicalResourceId']
    return {
        'PhysicalResourceId': job_run_id
    }

def on_delete(event):
    log.info(event)
    job_name = event['ResourceProperties']['JobName']
    job_run_id = event['PhysicalResourceId']
    try:
        response_stop = glue_client.batch_stop_job_run(JobName=job_name, JobRunIds=[job_run_id])
        log.info(response_stop)
    except ClientError as e:
        if e.response['Error']['Code'] == 'CrawlerNotRunningException':
            pass
        else:
            raise e
    return {
        'PhysicalResourceId': job_run_id,
    }

def is_complete(event, ctx):
    log.info(event)
    job_name = event['ResourceProperties']['JobName']
    job_run_id = event['PhysicalResourceId']
    response_get = glue_client.get_job_run(JobName=job_name, RunId=job_run_id)
    log.info(response_get)
    # Possible states: STARTING | RUNNING | STOPPING | STOPPED | SUCCEEDED | FAILED | TIMEOUT | ERROR | WAITING 
    state = response_get["JobRun"]["JobRunState"]
    log.info(f"Job run {job_name} {job_run_id} is {state.lower()}.")
    if state == 'SUCCEEDED':
        return { 'IsComplete': True }
    elif state in ['STOPPED', 'FAILED', 'TIMEOUT', 'ERROR']:
        raise BaseException(f'Glue job run is in {state} state')
    return {
        'IsComplete': False
    }
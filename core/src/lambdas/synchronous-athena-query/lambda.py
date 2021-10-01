# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import os
import logging

athena = boto3.client('athena', os.getenv('AWS_REGION'))
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
    statement = event['ResourceProperties']['Statement']
    result_path = event['ResourceProperties']['ResultPath']
    # Check if the the result path has trailing slash and add it
    if not result_path.endswith('/'):
        log.info('adding / at the end of the result path')
        result_path += '/'
    response_start = athena.start_query_execution(
        QueryString = statement,
        ResultConfiguration = {
            'OutputLocation': result_path
        }
    )
    log.info(response_start)
    return {
        'PhysicalResourceId': response_start['QueryExecutionId'],
    }

def on_update(event):
    return on_create(event)

def on_delete(event):
    log.info(event)
    return {
        'PhysicalResourceId': event['PhysicalResourceId']
    }

def is_complete(event, ctx):    
    log.info(event)
    query_id = event['PhysicalResourceId']
    response_get = athena.get_query_execution(QueryExecutionId=query_id)
    log.info(response_get)
    status = response_get["QueryExecution"]["Status"]["State"]
    # Possible status: QUEUED, RUNNING, SUCCEEDED, FAILED, CANCELLED
    log.info(f"Query {query_id} status is {status.lower()}.")
    if status == 'QUEUED' or status == 'RUNNING':
        return {
            'IsComplete': False
        }
    elif status == 'SUCCEEDED':
        return {
            'IsComplete': True
        }
    else:
        raise RuntimeError('Query execution: %s', status )
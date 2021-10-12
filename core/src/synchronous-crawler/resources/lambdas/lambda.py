# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import os
import time
import logging

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
    crawler_name = event['ResourceProperties']['CrawlerName']
    response_start = glue_client.start_crawler(Name=crawler_name)
    log.info(response_start)
    return {
        'PhysicalResourceId': crawler_name,
        'Data': {
            'StartResponse': response_start
        }
    }

def on_update(event):
    log.info(event)
    crawler_name = event['ResourceProperties']['CrawlerName']
    return {
        'PhysicalResourceId': crawler_name
    }

def on_delete(event):
    log.info(event)
    crawler_name = event['ResourceProperties']['CrawlerName']
    response_stop = glue_client.stop_crawler(Name=crawler_name)
    log.info(response_stop)
    return {
        'PhysicalResourceId': crawler_name,
        'Data': {
            'StartResponse': response_stop
        }
    }

def is_complete(event, ctx):
    log.info(event)
    crawler_name = event['ResourceProperties']['CrawlerName']
    response_get = glue_client.get_crawler(Name=crawler_name)
    log.info(response_get)
    state = response_get["Crawler"]["State"]
    status = response_get['Crawler']['LastCrawl']['Status']
    # Possible states: RUNNING, STOPPING, READY
    # Possible status: SUCCEEDED, CANCELLED, FAILED
    log.info(f"Crawler {crawler_name} is {state.lower()}.")
    if state != 'READY' and status != 'SUCCEEDED': 
        return {
            'IsComplete': False
        }
    else:
        return {
            'IsComplete': True
        }
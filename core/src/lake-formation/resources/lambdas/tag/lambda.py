# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0


import boto3
import os
import logging

lakeformation = boto3.client('lakeformation', os.getenv('AWS_REGION'))
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
    catalog_id = event['ResourceProperties']['CatalogId']
    tag_key = event['ResourceProperties']['TagKey']
    tag_values = event['ResourceProperties']['TagValues']
    response = lakeformation.create_lf_tag(
        CatalogId=catalog_id,
        TagKey=tag_key,
        TagValues=tag_values,
    )
    log.info(response)
    return {
        'PhysicalResourceId': catalog_id+tag_key,
    }

def on_update(event):
    log.info(event)
    catalog_id = event['ResourceProperties']['CatalogId']
    tag_key = event['ResourceProperties']['TagKey']
    tag_values = event['ResourceProperties']['TagValues']
    response_current = lakeformation.get_lf_tag(
        CatalogId=catalog_id,
        TagKey=tag_key,
    )
    log.info(response_current)
    current_values = response_current['TagValues']
    response = lakeformation.update_lf_tag(
        CatalogId=catalog_id,
        TagKey=tag_key,
        TagValuesToDelete=current_values,
        TagValuesToAdd=tag_values
    )
    log.info(response)
    return {
        'PhysicalResourceId': catalog_id+tag_key,
    }

def on_delete(event):
    log.info(event)
    catalog_id = event['ResourceProperties']['CatalogId']
    tag_key = event['ResourceProperties']['TagKey']
    response = lakeformation.delete_lf_tag(
        CatalogId=catalog_id,
        TagKey=tag_key,
    )
    log.info(response)
    return {
        'PhysicalResourceId': event['PhysicalResourceId']
    }
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
    principal_arn = event['ResourceProperties']['PrincipalArn']
    principal_name = event['ResourceProperties']['PrincipalName']
    response = lakeformation.get_data_lake_settings(
        CatalogId=catalog_id,
    )
    log.info(response)
    admins = response['DataLakeSettings']['DataLakeAdmins']
    admins.append({'DataLakePrincipalIdentifier': principal_arn})
    response = lakeformation.put_data_lake_settings(
        CatalogId=catalog_id,
        DataLakeSettings={
            'DataLakeAdmins': admins,
        }
    )
    log.info(response)
    return {
        'PhysicalResourceId': catalog_id+principal_name,
    }

def on_update(event):
    return on_create(event)

def on_delete(event):
    catalog_id = event['ResourceProperties']['CatalogId']
    principal_arn = event['ResourceProperties']['PrincipalArn']
    principal_name = event['ResourceProperties']['PrincipalName']
    response = lakeformation.get_data_lake_settings(
        CatalogId=catalog_id,
    )
    log.info(response)
    admins = response['DataLakeSettings']['DataLakeAdmins']
    admins.remove({'DataLakePrincipalIdentifier': principal_arn})
    response = lakeformation.put_data_lake_settings(
        CatalogId=catalog_id,
        DataLakeSettings={
            'DataLakeAdmins': admins
        }
    )
    log.info(response)
    return {
        'PhysicalResourceId': catalog_id+principal_name,
    }
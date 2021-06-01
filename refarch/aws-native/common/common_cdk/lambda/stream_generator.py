# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import csv
import json
import logging
import os
import uuid
from urllib.parse import unquote_plus

import boto3

region = os.getenv("REGION")
stream_name = os.getenv("STREAM_NAME")
s3_client = boto3.client('s3')
kinesis_client = boto3.client('kinesis', region_name=region)

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        logger.info(event)
        for record in event['Records']:
            bucket = record['s3']['bucket']['name']
            key = unquote_plus(record['s3']['object']['key'])
            csv_file = s3_client.get_object(Bucket=bucket, Key=key)
            csv_content = csv_file['Body'].read().decode('utf-8').splitlines(True)
            csv_data = csv.DictReader(csv_content)

            records = []
            i = 0
            for row in csv_data:
                i += 1
                records.append({
                    'Data': json.dumps(row),
                    'PartitionKey': str(uuid.uuid4())
                })
                if i % 500 == 0:
                    kinesis_client.put_records(
                        Records=records,
                        StreamName=stream_name
                    )
                    records = []
            logger.debug(i)
            if i % 500 != 0:
                kinesis_client.put_records(
                    Records=records,
                    StreamName=stream_name
                )
            s3_client.delete_object(Bucket=bucket, Key=key)

    except Exception as e:
        raise e

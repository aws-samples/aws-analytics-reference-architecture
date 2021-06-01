# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import json
import os
import decimal
from datetime import datetime, timedelta


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return int(obj)
        # Let the base class default method raise the TypeError
        return json.JSONEncoder.default(self, obj)


def handler(event, context):
    try:

        table_name = os.getenv("TABLE_NAME")
        jar_location = os.getenv("JAR_LOCATION")
        param = str(event['Param'])
        current = datetime.now()
        start_date = (current - timedelta(minutes=10)).strftime("%Y-%m-%dT%H:%M:%S")
        end_date = (current + timedelta(minutes=5)).strftime("%Y-%m-%dT%H:%M:%S")

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)
        response = table.get_item(
            Key={
                'param': param
            }
        )
        if 'Item' in response:
            iterator = json.dumps(response['Item']['iterator'], cls=DecimalEncoder)
        else:
            iterator = '0'

        step_param = ["spark-submit", "--deploy-mode", "cluster", "--conf", "spark.executor.memory=10G",
                      "--conf", "spark.executor.cores=4", "--conf", "spark.dynamicAllocation.enabled=true",
                      "--class", "DataGenerator", jar_location, str(event['Module']), "/home/hadoop/tpcds-kit/tools",
                      "hdfs:///user/hadoop/tmp", str(event['SinkBucket']), str(event['DataSize']),
                      "parquet", str(event['Parallelism']), "false", "false", "0",
                      start_date, end_date, str(event['TmpBucket'])]

        print(step_param)
        return {'Param': param, 'StepParam': step_param}
    except Exception as e:
        print(e)
        raise e

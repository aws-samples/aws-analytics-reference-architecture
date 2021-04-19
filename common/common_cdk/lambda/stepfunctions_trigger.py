# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import traceback

import boto3
import cfnresponse


def handler(event, context):
    try:
        stepArn = event['ResourceProperties']['stepArn']
        client = boto3.client('stepfunctions')
        if event['RequestType'] == 'Create':
            client.start_execution(
                stateMachineArn=stepArn,
                input='{}'
            )
        cfnresponse.send(event, context, cfnresponse.SUCCESS, {})
    except Exception as e:
        traceback.print_exc()
        cfnresponse.send(event, context, cfnresponse.FAILED, {})

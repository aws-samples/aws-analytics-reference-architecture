# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import traceback
import cfnresponse


def handler(event, context):

    try:
        bucket_name = event['ResourceProperties']['bucket_name']
        if event['RequestType'] == 'Delete':
            print("empty bucket: " + bucket_name)
            bucket = boto3.resource('s3').Bucket(bucket_name)
            bucket.object_versions.delete()
        cfnresponse.send(event, context, cfnresponse.SUCCESS, {})

    except Exception:
        traceback.print_exc()
        cfnresponse.send(event, context, cfnresponse.FAILED, {})

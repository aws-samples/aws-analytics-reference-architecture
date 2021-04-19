# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import traceback

import boto3
import cfnresponse


def handler(event, context):
    secgroup_name = event['ResourceProperties']['secgroup_name']

    try:
        if event['RequestType'] == 'Delete':
            print("deleting rules for security group: " + secgroup_name)
            sg = boto3.resource('ec2').SecurityGroup(secgroup_name)
            sg.revoke_ingress(IpPermissions=sg.ip_permissions)
        cfnresponse.send(event, context, cfnresponse.SUCCESS, {})

    except Exception:
        traceback.print_exc()
        cfnresponse.send(event, context, cfnresponse.FAILED, {})

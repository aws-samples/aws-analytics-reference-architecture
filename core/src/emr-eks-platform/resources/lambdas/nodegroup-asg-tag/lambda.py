# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import os
import logging

client = boto3.client('autoscaling', os.getenv('AWS_REGION'))
log = logging.getLogger()
log.setLevel(logging.INFO)
eks_cluster_name = os.getenv('EKS_CLUSTER_NAME')


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
    # Get the EC2 Auto Scaling Group name based on the nodegroup name
    asg_name = get_asg_name(event['ResourceProperties']['nodegroupName'])

    # Add the tag to the EC2 Auto Scaling Group
    tag_key = event['ResourceProperties']['tagKey']
    tag_value = event['ResourceProperties']['tagValue']
    response = client.create_or_update_tags(
        Tags=[
            {
                'Value': str(tag_value),
                'ResourceType': 'auto-scaling-group',
                'ResourceId': asg_name,
                'Key': tag_key,
                'PropagateAtLaunch': True
            }
        ]
    )
    return {
        'PhysicalResourceId': asg_name + tag_key,
    }


def on_update(event):
    # Update is the same as create because the API overwrite the value if it changes
    return on_create(event)


def on_delete(event):
    log.info(event)
    # Get the EC2 Auto Scaling Group name based on the Nodegroup name
    asg_name = get_asg_name(event['ResourceProperties']['nodegroupName'])
    tag_key = event['ResourceProperties']['tagKey']
    tag_value = event['ResourceProperties']['tagValue']
    # Delete the tag from the EC2 Auto Scaling Group
    response = client.delete_tags(
        Tags=[
            {
                'Value': str(tag_value),
                'ResourceType': 'auto-scaling-group',
                'ResourceId': asg_name,
                'Key': tag_key,
                'PropagateAtLaunch': True
            }
        ]
    )
    log.info(response)
    return {
        'PhysicalResourceId': event['PhysicalResourceId'],
    }


def get_asg_name(nodegroup_name):
    response = client.describe_auto_scaling_groups(
        MaxRecords=100,
        Filters=[
            {
                'Name':'tag:eks:cluster-name',
                'Values':[eks_cluster_name],
            },
            {
                'Name':'tag:eks:nodegroup-name',
                'Values': [nodegroup_name],
            },
        ],
    )
    log.info(response)
    return response['AutoScalingGroups'][0]['AutoScalingGroupName']


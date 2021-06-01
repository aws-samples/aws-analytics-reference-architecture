# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import logging

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

client = boto3.client('kinesisanalyticsv2')


def handler(event, context):
    if event['RequestType'] == 'Create':
        # Start the application
        start_response = client.start_application(ApplicationName=app_name,
                                                  RunCOnfiguration=app_config)
        pass
    elif event['RequestType'] == 'Delete':
        # Describe the application to get the current version ID
        describe_response = client.describe_application(ApplicationName=app_name)

        # Disable snapshots
        update_response = client.update_application(ApplicationName=app_name,
                                                    CurrentApplicationVersionId=app_version,
                                                    ApplicationConfigurationUpdate={

                                                    })

        # Stop the application
        stop_response = client.stop_application(ApplicationName=app_name)
        pass

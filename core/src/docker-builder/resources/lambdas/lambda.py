# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import os
import logging

codebuild = boto3.client('codebuild', os.getenv('AWS_REGION'))
ecr = boto3.client('ecr', os.getenv('AWS_REGION'))

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

    request_type = event['RequestType'].lower()

    project_name = event['ResourceProperties']['codebuildProjectName']
    s3_path = event['ResourceProperties']['s3Path']
    ecr_uri = event['ResourceProperties']['ecrURI']
    tag = event['ResourceProperties']['tag']

    response = codebuild.start_build(
        projectName=project_name,
        environmentVariablesOverride=[
            {
                'name': 'DOCKER_FILE_S3_PATH',
                'value': s3_path,
                'type': 'PLAINTEXT'
            },
            {
                'name': 'ecrURI',
                'value': ecr_uri,
                'type': 'PLAINTEXT'
            },
            {
                'name': 'tag',
                'value': tag,
                'type': 'PLAINTEXT'
            },
        ],
    )

    log.info(response)
    return { 'PhysicalResourceId': response['build']['id'] } if request_type == 'create' else { 'PhysicalResourceId': event['PhysicalResourceId'] }


def on_update(event):
    return on_create(event)


def on_delete(event):
    log.info(event)

    return {
        'PhysicalResourceId': event['PhysicalResourceId'],
    }


def is_complete(event, ctx):
    log.info(event)

    build_id = event['PhysicalResourceId']

    response = codebuild.batch_get_builds(
        ids=[
            build_id
        ])
    build = response['builds'][0]

    build_status = build['buildStatus']
    current_phase = build['currentPhase']

    if build_status == "SUCCEEDED" and current_phase == "COMPLETED":
        # Reducing the data returned to the custom resource
        ecr_uri = event['ResourceProperties']['ecrURI']
        tag = event['ResourceProperties']['tag']

        data = {
            "ContainerUri": f'{ecr_uri}:{tag}'
        }

        log.info({"IsComplete": True, "Data": data})
        return {"IsComplete": True, "Data": data}

    elif build_status == "FAILED" and current_phase == "COMPLETED":
        raise Exception('build failed.')
    else:
        return {"IsComplete": False}

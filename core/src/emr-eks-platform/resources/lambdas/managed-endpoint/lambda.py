# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import os
import logging
import uuid
import json

emrcontainers = boto3.client('emr-containers', os.getenv('AWS_REGION'))
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

    response = emrcontainers.create_managed_endpoint(
        name=event['ResourceProperties']['endpointName'],
        virtualClusterId=event['ResourceProperties']['clusterId'],
        type='JUPYTER_ENTERPRISE_GATEWAY',
        releaseLabel=event['ResourceProperties']['releaseLabel'],
        executionRoleArn=event['ResourceProperties']['executionRoleArn'],
        configurationOverrides=json.loads(event['ResourceProperties']['configurationOverrides']) if
        event['ResourceProperties']['configurationOverrides'] else None,
        clientToken=str(uuid.uuid4())
    )

    ##log.info(json.load(event['ResourceProperties']['configurationOverrides']))

    log.info(response)
    return {
        'PhysicalResourceId': response['id'],
    }


def on_update(event):
    return on_create(event)


def on_delete(event):
    log.info(event)

    response = emrcontainers.delete_managed_endpoint(
        virtualClusterId=event['ResourceProperties']['clusterId'],
        id=event['PhysicalResourceId']
    )

    log.info(response)
    return {
        'PhysicalResourceId': response['id'],
    }


def is_complete(event, ctx):
    log.info(event)
    requestType = '_DELETE' if event['RequestType'] == 'Delete' else '_CREATEUPDATE'

    log.info(requestType)

    endpoint_id = event['PhysicalResourceId']

    response = emrcontainers.describe_managed_endpoint(
        id=endpoint_id,
        virtualClusterId=event['ResourceProperties']['clusterId']
    )

    log.info(response)
    log.info(response['endpoint'])

    if (response['endpoint'] == None):
        return json.dumps({"IsComplete": False})

    log.info("current endpoint " + endpoint_id)

    state = response['endpoint']['state'] + requestType

    log.info(state)

    response['endpoint']['createdAt'] = ""

    log.info(response['endpoint']['createdAt'])

    if state == "ACTIVE_CREATEUPDATE":
        ##Reducing the data returned to the custom resource
        if (state == "ACTIVE_CREATEUPDATE"):
            data = {
                "securityGroup": response['endpoint']['securityGroup'],
                "subnetIds": response['endpoint']['securityGroup'],
                "id": response['endpoint']['id'],
                "arn": response['endpoint']['arn']
            }

        log.info({"IsComplete": True, "Data": data})
        return {"IsComplete": True, "Data": data}
    elif state == "TERMINATED_DELETE":
        return {"IsComplete": True}
    elif state == "TERMINATED_CREATEUPDATE" or state == "TERMINATED_WITH_ERRORS_CREATEUPDATE" or state == "TERMINATED_WITH_ERRORS_DELETE" or state == "TERMINATING_CREATEUPDATE":
        raise Exception('managed endpoint failed.')
    else:
        return {"IsComplete": False}


# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import json
import logging
import os

import boto3
import requests
from jinja2 import Template
from requests_aws4auth import AWS4Auth

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-assume-iam-role/
sts_connection = boto3.client('sts')

session = requests.Session()


def put_to_es(path: str, payload):
    """
    Executes the action by temporary taking the master role
    :param path: URI
    :param payload: The body of the call
    :return:
    """
    host = os.environ['DOMAIN']
    region = os.environ['REGION']
    url = 'https://' + host + path

    # See https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-request-signing.html
    service = 'es'

    master_role_arn = os.environ['MASTER_ROLE_ARN']
    account = sts_connection.assume_role(RoleArn=master_role_arn,
                                         RoleSessionName='lambda_as_master')

    awsauth = AWS4Auth(account['Credentials']['AccessKeyId'],
                       account['Credentials']['SecretAccessKey'],
                       region,
                       service,
                       session_token=account['Credentials']['SessionToken'])

    r = session.put(url, auth=awsauth, json=payload)  # requests.get, post, and delete have similar syntax

    logger.info(r.text)


def register_mapping(path: str):
    """
    Registers an index template specifying rollover alias, ism policy and mapping
    :param path:
    :return:
    """
    # Read template
    # See https://stackoverflow.com/questions/39477729/aws-lambda-read-contents-of-file-in-zip-uploaded-as-source-code

    print('Reading template at ' + path)
    with open(path) as file_:
        content = file_.read()

    payload = json.loads(content)

    path = '/_template/ara-template'

    put_to_es(path, payload)


def register_role(path: str, role_name: str):
    """
    Registers the AES role 'delivery_role'
    :param role_name:
    :param path:
    :return:
    """
    print('Reading role at ' + path)
    with open(path) as file_:
        content = file_.read()
    payload = json.loads(content)

    path = '/_opendistro/_security/api/roles/' + role_name

    put_to_es(path, payload)


def register_role_mapping(path: str, role_name: str, iam_role: str):
    """
    Registers a mapping between the IAM KDA role and the AES role 'delivery_role'
    :param iam_role:
    :param role_name:
    :param path:
    :return:
    """
    print('Reading role mapping template at ' + path)
    with open(path) as file_:
        content = file_.read()

    template = Template(content)

    payload = template.render(backend_role=iam_role)

    path = '/_opendistro/_security/api/rolesmapping/' + role_name

    put_to_es(path, json.loads(payload))


def register_ism_policy(path: str):
    """
    Registers the policy named 'rollover_policy'
    :param path:
    :return:
    """
    print('Reading ism policy template at ' + path)
    with open(path) as file_:
        content = file_.read()
    payload = json.loads(content)

    path = '/_opendistro/_ism/policies/rollover_policy'

    put_to_es(path, payload)


def lambda_handler(event, context):
    if event['RequestType'] == 'Create':
        mapping_path = os.environ['LAMBDA_TASK_ROOT'] + '/ara-mapping-template.json'
        register_mapping(mapping_path)

        delivery_role_path = os.environ['LAMBDA_TASK_ROOT'] + '/delivery_role.json'
        register_role(delivery_role_path, 'delivery_role')

        delivery_role_mapping_path = os.environ['LAMBDA_TASK_ROOT'] + '/delivery_role_mapping.j2'
        kda_iam_role = os.environ['KDA_ROLE_ARN']
        register_role_mapping(delivery_role_mapping_path, 'delivery_role', kda_iam_role)

        log_delivery_role_path = os.environ['LAMBDA_TASK_ROOT'] + '/log_delivery_role.json'
        register_role(log_delivery_role_path, 'log_delivery')

        ism_policy_path = os.environ['LAMBDA_TASK_ROOT'] + '/rollover_policy.json'
        register_ism_policy(ism_policy_path)

        # Create first index
        put_to_es('/ara-sales-1', payload=None)

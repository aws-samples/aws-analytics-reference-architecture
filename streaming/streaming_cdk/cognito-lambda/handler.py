# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import logging
import os
import time

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    if event['RequestType'] == 'Create':
        user_pool_id = os.environ['USER_POOL_ID']
        region = os.environ['REGION']
        identity_pool_id = os.environ['IDENTITY_POOL_ID']
        role_arn = os.environ['LIMITED_ROLE_ARN']

        # Part 1
        # Get the list of clients
        for _ in range(1, 84):
            auth_provider = find_auth_provider(region, user_pool_id)

            if auth_provider is not None:
                # Update the Federated Identity's authentication provider
                update_identity_pool(auth_provider, identity_pool_id, role_arn)
                break

            time.sleep(10)
        else:
            raise Exception('Could not update the Identity Pool %s' % identity_pool_id)  # Make the lambda fail


def find_auth_provider(region, user_pool_id):
    """
    Find the client with name starting with 'AWSElasticsearch'
    :param region: The region for Cognito
    :param user_pool_id: The User Pool ID
    :return: The Authentication Provider 'cognito-idp.<region>.amazonaws.com/<user_pool_id>:<client>'
    """
    logger.info('Processing UserPool %s' % user_pool_id)

    client_idp = boto3.client('cognito-idp')

    response = client_idp.list_user_pool_clients(
        UserPoolId=user_pool_id
    )

    clients = response['UserPoolClients']

    # Find the client for AESElasticsearch
    for c in clients:
        logger.info('Found App Client %s' % c['ClientName'])

    aes_clients = [c for c in clients if c['ClientName'].startswith('AWSElasticsearch')]

    if len(aes_clients) == 0:
        logging.error('Could not find Amazon Elasticsearch App Client in User Pool %s' % user_pool_id)
        return None

    if len(aes_clients) > 1:
        logging.error('Found multiple Amazon Elasticsearch App Client in User Pool %s' % user_pool_id)
        return None

    client = aes_clients[0]

    return 'cognito-idp.' + region + '.amazonaws.com/' + user_pool_id + ':' + client['ClientId']


def update_identity_pool(auth_provider, identity_pool_id, role_arn):
    """
    Update the authentication provider with to deny access if the user is not in a group
    :param auth_provider: The authentication provider
    :param identity_pool_id: The Identity Pool ID
    """
    client_identity = boto3.client('cognito-identity')
    client_identity.set_identity_pool_roles(
        IdentityPoolId=identity_pool_id,
        Roles={
            'authenticated': role_arn
        },
        RoleMappings={
            auth_provider: {
                'Type': 'Token',
                'AmbiguousRoleResolution': 'Deny'
            }
        }
    )

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import traceback
import json

quicksight = boto3.client('quicksight')

def handler(event, context):

    print(event)

    try:
        secret_arn = event['ResourceProperties']['Secret_arn']
        aws_account_id = event['ResourceProperties']['Aws_account_id']
        datasource_name = event['ResourceProperties']['Datasource_name']
        quicksight_group_arn = event['ResourceProperties']['Quicksight_group_arn']
        datasource_actions = event['ResourceProperties']['Datasource_actions']
        vpc_conn_arn = event['ResourceProperties']['Vpc_conn_arn']

        if event['RequestType'] == 'Create':

            datasource_arn = create_datasource(secret_arn, aws_account_id, datasource_name,
                      quicksight_group_arn, datasource_actions,
                      vpc_conn_arn)

            if datasource_arn is not None:
                return {'PhysicalResourceId': datasource_arn, 'Data': {'datasource_arn': datasource_arn}}
            else:
                raise Exception("Could not create datasource {}".format(datasource_name))

        elif event['RequestType'] == 'Delete':
            deleted = delete_datasource(aws_account_id, datasource_name)

            if deleted:
                print('Resource {} deleted'.format(event["PhysicalResourceId"]))
            else:
                raise Exception("Could not delete datasource {}".format(datasource_name))
    except Exception as e:
        traceback.print_exc()
        raise Exception('Failed {}'.format(e))


def get_secrets(secret_arn):
    print("Get secrets from {}".format(secret_arn))
    sm = boto3.client('secretsmanager')
    secret_info = sm.get_secret_value(SecretId=secret_arn)
    if 'SecretString' in secret_info:
        secret_info = json.loads(secret_info['SecretString'])
        return secret_info
    else:
        return None


def create_datasource(secret_arn, aws_account_id, datasource_name,
                      quicksight_group_arn, datasource_actions,
                      vpc_conn_arn):

    secret_info = get_secrets(secret_arn)

    print(secret_info['host'])

    if secret_info is None:
        return None

    response = quicksight.create_data_source(
        AwsAccountId=aws_account_id,
        DataSourceId=datasource_name,
        Name=datasource_name,
        Type='REDSHIFT',
        Credentials={
            'CredentialPair': {
                'Password': secret_info['password'],
                'Username': secret_info['username']
            }
        },
        DataSourceParameters={
            'RedshiftParameters': {
                'Database': secret_info['dbname'],
                'Host': secret_info['host'],
                'Port': int(secret_info['port'])
            }
        },
        Permissions=[
            {
                'Principal': quicksight_group_arn,
                'Actions': datasource_actions
            },
        ],
        VpcConnectionProperties={
            'VpcConnectionArn': vpc_conn_arn
        }
    )

    print(response)

    return response['Arn']


def delete_datasource(aws_account_id, datasource_name):
    response = quicksight.delete_data_source(
        AwsAccountId=aws_account_id,
        DataSourceId=datasource_name
    )

    print(response)

    return True

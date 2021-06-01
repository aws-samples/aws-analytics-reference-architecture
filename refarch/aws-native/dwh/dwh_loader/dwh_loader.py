# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import logging
import os
import boto3
import json


def handler(event, context):
    try:
        logging.basicConfig()
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.DEBUG)

        region = os.environ['REGION']
        client = boto3.client('redshift-data', region)

        if 'QueryId' in event:
            id = event['QueryId']
            logger.info('Checking statement status: ' + id)
            response = client.describe_statement(Id=id)
            logger.info('Status successfully checked')
            logger.info(response)
            try:
                error = response['Error']
            except KeyError:
                error = 'null'
            return {'Status': response['Status'], 'Error': error}
        else:
            #Required Inputs
            cluster_name = os.environ['CLUSTER_NAME']
            procedure = os.environ['PROCEDURE']
            secret_arn = os.environ['SECRET_ARN']
            database = os.environ['DATABASE']
            schema = os.environ['SCHEMA']
            statement = 'CALL ' + schema + '.' + procedure + '();'

            logger.debug('Secret arn is: %s' % secret_arn)
            logger.debug('Procedure Call Statement is: %s' % statement)

            # Call the procedure via direct
            if statement != '':
                logger.info('Running Statement: --%s--' % statement)
                response = client.execute_statement(
                    SecretArn=secret_arn,
                    ClusterIdentifier=cluster_name,
                    Database=database,
                    Sql=statement
                )
                logger.info('Procedure called successfully')
                logger.info(response['Id'])
            return {'QueryId': response['Id']}

    # catch connection exceptions
    except Exception as e:
        logger.error(e)
        raise e


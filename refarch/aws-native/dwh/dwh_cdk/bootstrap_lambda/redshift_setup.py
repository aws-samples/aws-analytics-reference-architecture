# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import json
import logging
import os
from urllib.parse import urlparse

import boto3
import pg8000

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def build_secrets_dict(secrets_dict, secmgr, secret_name):
    secret_arn = os.environ[secret_name]
    secret_response = secmgr.get_secret_value(SecretId=secret_arn)

    logger.info("Found secret value by arn: " + secret_arn)

    secrets_dict[secret_name] = json.loads(secret_response["SecretString"])['password']

    logger.debug(secrets_dict)
    return secrets_dict


def handler(event, context):
    users_secrets_names = []

    sql_script_location = os.environ['SQL_SCRIPT_LOCATION']
    logger.info("SQL script location " + sql_script_location)

    sql_script_files = os.environ['SQL_SCRIPT_FILES']
    sql_script_files = sql_script_files.split(',')

    for i in range(len(sql_script_files)):
        file_name = sql_script_files[i]
        logger.debug('file: ' + file_name)

    secret_arn = os.environ['SECRET_ARN']
    logger.info("Redshift secret arn " + secret_arn)

    if event['RequestType'] == 'Create':
        try:
            logger.info('Getting Connection Info')

            secmgr = boto3.client('secretsmanager')

            logger.info('Secret manager connected!!!!')

            replace_dict = dict()
            for name in users_secrets_names:
                replace_dict = build_secrets_dict(replace_dict, secmgr, name)

            replace_dict['GLUE_DATABASE'] = os.environ['GLUE_DATABASE']
            replace_dict['REDSHIFT_IAM_ROLE'] = os.environ['REDSHIFT_IAM_ROLE']
            logger.debug(replace_dict)
            secret = secmgr.get_secret_value(SecretId=secret_arn)

            secret_string = json.loads(secret["SecretString"])

            user = secret_string["username"]
            password = secret_string["password"]
            host = secret_string["host"]
            port = secret_string["port"]
            database = secret_string["dbname"]

            logger.info('Connecting to Redshift: %s' % host)
            conn = pg8000.dbapi.connect(database=database, host=host, user=user, password=password, port=port)
            logger.info('Successfully Connected to Cluster')

            cursor = conn.cursor()
            statement = ''

            for i in range(len(sql_script_files)):

                file_name = sql_script_files[i]
                try:
                    s3 = boto3.resource('s3')
                    logger.info("trying to read the file from s3: " + (sql_script_location + file_name))
                    o = urlparse(sql_script_location + file_name)
                    bucket = o.netloc
                    key = o.path
                    obj = s3.Object(bucket, key.lstrip('/'))
                    statements = obj.get()['Body'].read().decode('utf-8')

                    for key in replace_dict.keys():
                        statements = statements.replace('${' + key + '}', "'" + replace_dict[key] + "'")

                    logger.info('Executing file: %s' % file_name)
                    if statements != '':
                        # logger.debug("Running Statement: --%s--" % statements)
                        cursor.execute(statements)
                        conn.commit()

                except Exception as e:
                    logger.error(e)
                    cursor.close()
                    conn.close()
                    raise e

            cursor.close()
            conn.close()

        except Exception as e1:
            logger.debug(e1)
            logger.error(e1)
            raise e1

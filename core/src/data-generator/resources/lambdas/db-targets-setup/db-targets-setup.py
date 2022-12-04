import json
import logging
import psycopg2
import redshift_connector
import boto3
import os

logging.basicConfig(level=logging.INFO)
log = logging.getLogger()
log.setLevel(os.getenv('LOG_LEVEL', logging.INFO))

client = boto3.client('secretsmanager')


def get_secret_as_dict(secret_arn):
    """
    Obtain secret values as a dictionary
    :param secret_arn: Secret ARN
    :return: Dictionary
    """
    try:
        secret_value_response = client.get_secret_value(SecretId=secret_arn)
    except ClientError as e:
        log.info(e)
    else:
        # Depending on whether the secret is a string or binary, one of these fields will be populated
        if 'SecretString' in secret_value_response:
            secret = secret_value_response['SecretString']
        else:
            secret = base64.b64decode(secret_value_response['SecretBinary'])
    return json.loads(secret)


def redshift(secret_arn, schema_name):
    """
    Create schema in Redshift target before data insertion
    :param secret_arn: ARN for secret containing connection details for the database
    :param schema_name: Name of the schema to create
    """
    info = get_secret_as_dict(secret_arn)
    conn = None
    try:
        # Establish connection using Amazon Redshift Python connector
        conn = redshift_connector.connect(host=info['host'],
                               database=info['dbname'],
                               user=info['username'],
                               password=info['password'])
        if conn is not None:
            log.info(f"Connection to {info['host']} successful")
            cursor = conn.cursor()
            # Run SQL query to create schema
            cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {schema_name};",)
            conn.commit()
    except redshift_connector.Error as e:
        log.info(e)
    finally:
        if conn is not None:
            conn.close()


def postgres(secret_arn, schema_name):
    """
    Create schema in Postgres target before data insertion
    :param secret_arn: ARN for secret containing connection details for the database
    :param schema_name: Name of the schema to create
    """
    info = get_secret_as_dict(secret_arn)
    conn = None
    try:
        # Establish connection using Python PostgreSQL driver
        conn = psycopg2.connect(host=info['host'],
                               database=info['dbname'],
                               user=info['username'],
                               password=info['password'])
        if conn is not None:
            log.info(f"Connection to {info['host']} successful")
            cursor = conn.cursor()
            # Run SQL query to create schema
            cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {schema_name};",)
            conn.commit()
    except (Exception, psycopg2.DatabaseError) as e:
        log.info(e)
    finally:
        if conn is not None:
            conn.close()


def aurora_postgres(secret_arn, schema_name):
    postgres(secret_arn, schema_name)


def rds_postgres(secret_arn, schema_name):
    postgres(secret_arn, schema_name)


def handler(event, ctx):
    targets = event.get('targets')
    for target, instance in targets.items():
        # Call relevant setup function depending on target type
        globals()[target](instance['secret_arn'], instance['schema_name'])

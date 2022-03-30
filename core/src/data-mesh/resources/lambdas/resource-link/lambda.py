# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0


import boto3
import os
import logging


lakeformation = boto3.client("lakeformation", os.getenv("AWS_REGION"))
glue = boto3.client("glue", os.getenv("AWS_REGION"))
log = logging.getLogger()
log.setLevel(logging.INFO)

CENTRAL_ACC_ID = os.getenv("CENTRAL_ACC_ID")


def on_event(event, ctx):
    log.info(event)

    db_name = f"_local_{event['database_name']}"
    table_name = event["table_name"]

    # Create a local database for this data product
    try:
        glue.create_database(
            DatabaseInput={
                "Name": db_name,
                "Description": f"This database is {db_name} data product that holds tables registered to data mesh.",
            }
        )
        log.info(f"Created {db_name} database.")
    except glue.exceptions.AlreadyExistsException:
        # No need to create a databse if already exists
        pass
    except Exception as e:
        raise Exception(f"Could not create a databse {db_name}: {e}")

    # Create a resource-link for a shared table
    try:
        glue.create_table(
            DatabaseName=db_name,
            TableInput={
                "Name": f"rl-{table_name}",
                "TargetTable": {
                    "CatalogId": CENTRAL_ACC_ID,
                    "DatabaseName": db_name,
                    "Name": table_name,
                },
            },
        )
    except Exception as e:
        raise Exception(f"Could not create resource link for table {table_name}: {e}")

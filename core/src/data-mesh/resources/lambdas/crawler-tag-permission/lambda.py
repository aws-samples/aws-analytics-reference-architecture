# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0


import boto3
import os
import logging


log = logging.getLogger()
log.setLevel(logging.INFO)

CRAWLER_ROLE_ARN = os.getenv("CRAWLER_ROLE_ARN")
CENTRAL_CATALOG_ID = os.getenv("CENTRAL_CATALOG_ID")
TAG_KEY = os.getenv("TAG_KEY")
DOMAIN_TAG_VALUE = os.getenv("DOMAIN_TAG_VALUE")

lakeformation = boto3.client("lakeformation", os.getenv("AWS_REGION"))


def handler(event, ctx):
    log.info(event)

    response = lakeformation.batch_grant_permissions(
        Entries=[
            {
                "Id": "tableGrant",
                "Resource": {
                    "LFTagPolicy": {
                        "ResourceType": "TABLE",
                        "Expression": [
                            {"TagKey": TAG_KEY, "TagValues": [DOMAIN_TAG_VALUE]}
                        ],
                        "CatalogId": CENTRAL_CATALOG_ID,
                    }
                },
                "Principal": {"DataLakePrincipalIdentifier": CRAWLER_ROLE_ARN},
                "Permissions": ["SELECT", "DESCRIBE", "ALTER"],
            },
            {
                "Id": "databaseGrant",
                "Resource": {
                    "LFTagPolicy": {
                        "ResourceType": "DATABASE",
                        "Expression": [
                            {"TagKey": TAG_KEY, "TagValues": [DOMAIN_TAG_VALUE]}
                        ],
                        "CatalogId": CENTRAL_CATALOG_ID,
                    }
                },
                "Principal": {"DataLakePrincipalIdentifier": CRAWLER_ROLE_ARN},
                "Permissions": ["CREATE_TABLE", "DESCRIBE"],
            },
        ]
    )

    return {
        "Response": response,
    }

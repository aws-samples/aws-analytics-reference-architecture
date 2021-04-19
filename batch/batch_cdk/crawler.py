# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from typing import List

from aws_cdk.aws_glue import CfnCrawler, Database
from aws_cdk.aws_iam import Role, ServicePrincipal, PolicyDocument, PolicyStatement
from aws_cdk.aws_s3 import Bucket
from aws_cdk.core import Aws, Construct


class Crawler(Construct):

    @property
    def crawler(self):
        return self.__crawler

    def __init__(
            self,
            scope: Construct,
            id: str,
            name: str,
            db: Database,
            bucket: Bucket,
            prefix: str,
            hudi_exclusions: List[str] = None,
            **kwargs):
        super().__init__(scope, id, **kwargs)

        crawler_name = 'ara-' + name

        crawler_role = Role(self, 'GenericCrawler',
                            role_name=crawler_name + '-crawler',
                            assumed_by=ServicePrincipal('glue.amazonaws.com'),
                            inline_policies={'CrawlerPermissions': PolicyDocument(statements=[
                                PolicyStatement(
                                    actions=[
                                        "glue:GetDatabase"
                                    ],
                                    resources=[
                                        "arn:aws:glue:{}:{}:catalog".format(Aws.REGION, Aws.ACCOUNT_ID),
                                        "arn:aws:glue:{}:{}:database/{}".format(Aws.REGION, Aws.ACCOUNT_ID,
                                                                                db.database_name)
                                    ]
                                ),
                                PolicyStatement(
                                    actions=[
                                        "glue:BatchCreatePartition",
                                        "glue:BatchGetPartition",
                                        "glue:GetPartition",
                                        "glue:UpdatePartition",
                                        "glue:GetTable",
                                        "glue:CreateTable",
                                        "glue:UpdateTable"
                                    ],
                                    resources=[
                                        "arn:aws:glue:{}:{}:catalog".format(Aws.REGION, Aws.ACCOUNT_ID),
                                        "arn:aws:glue:{}:{}:database/{}".format(Aws.REGION, Aws.ACCOUNT_ID,
                                                                                db.database_name),
                                        "arn:aws:glue:{}:{}:table/{}/*".format(Aws.REGION, Aws.ACCOUNT_ID,
                                                                               db.database_name)
                                    ]
                                ),
                                PolicyStatement(
                                    actions=['s3:GetObject'],
                                    resources=[bucket.arn_for_objects(prefix + '*')]
                                ),
                                PolicyStatement(
                                    actions=["s3:ListBucket"],
                                    resources=[bucket.bucket_arn]
                                ),
                                PolicyStatement(
                                    actions=['logs:CreateLogGroup'],
                                    resources=[
                                        'arn:aws:logs:{}:{}:log-group:/aws-glue/crawlers*'.format(Aws.REGION,
                                                                                                  Aws.ACCOUNT_ID)]
                                ),
                                PolicyStatement(
                                    actions=['logs:CreateLogStream', 'logs:PutLogEvents'],
                                    resources=[
                                        'arn:aws:logs:{}:{}:log-group:/aws-glue/crawlers:log-stream:{}'.format(
                                            Aws.REGION, Aws.ACCOUNT_ID, crawler_name)]
                                )
                            ])}
                            )
        # excluding hudi tables from the crawler because it's not supported
        if hudi_exclusions is not None:
            exclusions = ["**_SUCCESS", "**crc"] + list(map(lambda x: x + '/**', hudi_exclusions))
        else:
            exclusions = ["**_SUCCESS", "**crc"]

        self.__crawler = CfnCrawler(self, 'Generic',
                                    name=crawler_name,
                                    database_name=db.database_name,
                                    role=crawler_role.role_arn,
                                    targets={
                                        "s3Targets": [{"path": f'{bucket.bucket_name}/{prefix}',
                                                       "exclusions": exclusions}]
                                    }
                                    )

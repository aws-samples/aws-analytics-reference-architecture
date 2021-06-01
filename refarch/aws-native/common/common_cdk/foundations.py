# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk.core import Construct, NestedStack
from aws_cdk.aws_ec2 import GatewayVpcEndpointAwsService, SubnetSelection, SubnetType, Vpc, InterfaceVpcEndpointAwsService
from aws_cdk.aws_glue import Database
from aws_cdk.aws_iam import Group

from common.common_cdk.auto_empty_bucket import AutoEmptyBucket
from common.common_cdk.auto_empty_bucket_audited import AutoEmptyAuditedBucket
from common.common_cdk.config import AutoEmptyConfig


class DataLakeFoundations(NestedStack):

    @property
    def raw_s3_bucket(self):
        return self.__raw_s3_bucket

    @property
    def clean_s3_bucket(self):
        return self.__clean_s3_bucket

    @property
    def curated_s3_bucket(self):
        return self.__curated_s3_bucket

    @property
    def raw_glue_db(self):
        return self.__raw_glue_db

    @property
    def clean_glue_db(self):
        return self.__clean_glue_db

    @property
    def curated_glue_db(self):
        return self.__curated_glue_db

    @property
    def audit_glue_db(self):
        return self.__audit_glue_db

    @property
    def logs_s3_bucket(self):
        return self.__logs_s3_bucket

    @property
    def vpc(self):
        return self.__vpc

    @property
    def private_subnets_selection(self):
        return self.__private_subnets

    @property
    def public_subnets_selection(self):
        return self.__public_subnets

    @property
    def admin_group(self):
        return self.__admin_group

    @property
    def analysts_group(self):
        return self.__analysts_group

    @property
    def developers_group(self):
        return self.__developers_group

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # implement the glue data catalog databases used in the data lake
        self.__raw_glue_db = Database(self, 'RawGlueDB', database_name='ara_raw_data_' + self.account)
        self.__clean_glue_db = Database(self, 'CleanGlueDB', database_name='ara_clean_data_' + self.account)
        self.__curated_glue_db = Database(self, 'CuratedGlueDB', database_name='ara_curated_data_' + self.account)
        self.__audit_glue_db = Database(self, 'AuditGlueDB', database_name='ara_audit_data_' + self.account)

        # implement the S3 buckets for the data lake
        self.__logs_s3_bucket = AutoEmptyBucket(
            self, 'Logs',
            bucket_name='ara-logs-' + self.account,
            uuid=AutoEmptyConfig.FOUNDATIONS_UUID
        )

        self.__raw_s3_bucket = AutoEmptyBucket(
            self, 'RawData',
            bucket_name='ara-raw-data-' + self.account,
            uuid=AutoEmptyConfig.FOUNDATIONS_UUID
        )
        self.__clean_s3_bucket = AutoEmptyBucket(
            self, 'CleanData',
            bucket_name='ara-clean-data-' + self.account,
            uuid=AutoEmptyConfig.FOUNDATIONS_UUID
        )
        self.__curated_s3_bucket = AutoEmptyAuditedBucket(
            self, 'CuratedData',
            bucket_name='ara-curated-data-' + self.account,
            uuid=AutoEmptyConfig.FOUNDATIONS_UUID,
            log_bucket=self.__logs_s3_bucket.bucket,
            audit_db=self.__audit_glue_db
        )

        # the vpc used for the overall data lake (same vpc, different subnet for modules)
        self.__vpc = Vpc(self, 'Vpc')
        self.__public_subnets = self.__vpc.select_subnets(subnet_type=SubnetType.PUBLIC)
        self.__private_subnets = self.__vpc.select_subnets(subnet_type=SubnetType.PRIVATE)
        self.__vpc.add_gateway_endpoint("S3GatewayEndpoint",
                                        service=GatewayVpcEndpointAwsService.S3,
                                        subnets=[SubnetSelection(subnet_type=SubnetType.PUBLIC),
                                                 SubnetSelection(subnet_type=SubnetType.PRIVATE)])

        # IAM groups
        self.__admin_group = Group(self, 'GroupAdmins', group_name='ara-admins')
        self.__analysts_group = Group(self, 'GroupAnalysts', group_name='ara-analysts')
        self.__developers_group = Group(self, 'GroupDevelopers', group_name='ara-developers')

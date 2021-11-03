# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk.core import Construct, NestedStack
from aws_cdk.aws_ec2 import GatewayVpcEndpointAwsService, SubnetSelection, SubnetType, Vpc, InterfaceVpcEndpointAwsService
from aws_cdk.aws_glue import Database
from aws_cdk.aws_iam import Group
from aws_analytics_reference_architecture import DataLakeCatalog, DataLakeStorage
from common_cdk.audit_trail_glue import AuditTrailGlue

from common.common_cdk.auto_empty_bucket import AutoEmptyBucket
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
        catalog = DataLakeCatalog(self, 'DataLakeCatalog')
        self.__raw_glue_db = catalog.raw_database
        self.__clean_glue_db = catalog.clean_database
        self.__curated_glue_db = catalog.transform_database
        self.__audit_glue_db = Database(self, 'AuditGlueDB', database_name='ara_audit_data_' + self.account)


        # implement the S3 buckets for the data lake
        storage = DataLakeStorage(self, 'DataLakeStorage')
        self.__logs_s3_bucket = AutoEmptyBucket(
            self, 'Logs',
            bucket_name='ara-logs-' + self.account,
            uuid=AutoEmptyConfig.FOUNDATIONS_UUID
        ).bucket

        self.__raw_s3_bucket = storage.raw_bucket
        self.__clean_s3_bucket = storage.clean_bucket
        self.__curated_s3_bucket = storage.transform_bucket

        AuditTrailGlue(self, 'GlueAudit',
            log_bucket=self.__logs_s3_bucket,
            audit_bucket=self.__curated_s3_bucket,
            audit_db=self.__audit_glue_db,
            audit_table=self.__curated_s3_bucket.bucket_name
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

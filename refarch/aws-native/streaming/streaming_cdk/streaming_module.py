# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from constructs import Construct
from aws_cdk import (
    NestedStack,
    Tags,
    aws_s3 as s3
)
from aws_cdk.aws_iam import Role, ServicePrincipal, PolicyStatement
from aws_cdk.aws_kinesis import Stream
from aws_cdk.aws_kms import Key
from aws_cdk import Fn

from .es_domain import EsDomain
from .kda_application import KdaApplication


class StreamingModule(NestedStack):

    @property
    def sale_stream(self):
        return self.__sale_stream

    @property
    def customer_stream(self):
        return self.__customer_stream

    @property
    def address_stream(self):
        return self.__address_stream

    @property
    def kinesis_kms_key(self):
        return self.__kms_key

    def __init__(self, scope: Construct, id: str, prefix: str,
                 source_bucket: s3.Bucket, dest_bucket: s3.Bucket, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        suffix = Fn.select(4, Fn.split('-', Fn.select(2, Fn.split('/', self.stack_id))))

        # KMS key for Kinesis Data Streams
        self.__kms_key = Key(scope=self,
                             id='kms-kinesis',
                             alias='custom/kinesis',
                             description='KMS key for Kinesis Data Streams',
                             enable_key_rotation=True)

        # Create Kinesis streams
        self.__sale_stream = Stream(scope=self, id="saleStream", stream_name="ara-web-sale", encryption_key=self.__kms_key)
        self.__address_stream = Stream(scope=self, id="addressStream", stream_name="ara-web-customer-address", encryption_key=self.__kms_key)
        self.__customer_stream = Stream(scope=self, id="customerStream", stream_name="ara-web-customer", encryption_key=self.__kms_key)

        # Role for the KDA service
        kda_role = Role(scope=self,
                        id='KinesisAnalyticsRole',
                        assumed_by=ServicePrincipal(service='kinesisanalytics.amazonaws.com'))

        # Grant read on Kinesis streams
        self.__customer_stream.grant_read(kda_role)
        self.__address_stream.grant_read(kda_role)
        self.__sale_stream.grant_read(kda_role)

        # Grant read on source bucket (reference data)
        source_bucket.grant_read(kda_role)
        # Grant write on destination bucket
        dest_bucket.grant_write(kda_role)

        kda_role.add_to_policy(PolicyStatement(actions=['kinesis:ListShards'],
                                               resources=[self.__customer_stream.stream_arn,
                                                          self.__address_stream.stream_arn,
                                                          self.__sale_stream.stream_arn]))

        # Create Elasticsearch domain
        # TODO: use VPC subnets
        es_domain = EsDomain(scope=self,
                             id='EsDomain',
                             application_prefix=prefix,
                             suffix=suffix,
                             kda_role=kda_role)

        # Create the KDA application after the Elasticsearch service
        kda_app = KdaApplication(scope=self,
                                 id='KdaApplication',
                                 es_domain=es_domain.es_domain,
                                 kda_role=kda_role,
                                 source_bucket=source_bucket,
                                 dest_bucket=dest_bucket)

        Tags.of(self).add('module-name', 'streaming')

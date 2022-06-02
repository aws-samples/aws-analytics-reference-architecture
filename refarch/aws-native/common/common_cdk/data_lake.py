# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk import aws_dynamodb as _dynamodb
from aws_cdk import CfnOutput, Stack, Tags
from constructs import Construct

from batch.batch_cdk.batch_module import BatchModule
from common.common_cdk.batch_data_generator import BatchDataGenerator
from common.common_cdk.foundations import DataLakeFoundations
from common.common_cdk.stream_data_generator import StreamDataGenerator
from dataviz.dataviz_cdk.dataviz_module import DataVizModule
from dwh.dwh_cdk.dwh_module import DwhModule
from streaming.streaming_cdk.streaming_module import StreamingModule


def is_module_enabled(param: str):
    return param and (param.lower() in ("yes", "true"))


class DataLake(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:   

        # Set Stack description
        deployment_tracking_param = scope.node.try_get_context("EnableDeploymentTracking")
        stack_description = "Analytics Ref Arch - DataLake stack"
        if is_module_enabled(deployment_tracking_param):
            stack_description = stack_description + " (uksb-1scq97upu)" 

        super().__init__(scope, id, description = stack_description, **kwargs)

        data_lake = DataLakeFoundations(self, "Foundations")

        # Parameters to enable/disable modules
        batch_module_param = self.node.try_get_context("EnableBatch")
        dwh_module_param = self.node.try_get_context("EnableDWH")
        dataviz_module_param = self.node.try_get_context("EnableDataviz")
        streaming_module_param = self.node.try_get_context("EnableStreaming")

        datagen_config_table = _dynamodb.Table(
            self, 'DatagenConfigTable',
            partition_key=_dynamodb.Attribute(name="param", type=_dynamodb.AttributeType.STRING),
            billing_mode=_dynamodb.BillingMode.PAY_PER_REQUEST
        )

        # BATCH module
        if is_module_enabled(batch_module_param):
            BatchModule(self, "Batch",
                        raw_bucket=data_lake.raw_s3_bucket,
                        clean_bucket=data_lake.clean_s3_bucket,
                        raw_db=data_lake.raw_glue_db,
                        clean_db=data_lake.clean_glue_db)

            BatchDataGenerator(
                self, "BatchDatagen",
                config_table=datagen_config_table,
                tshirt_size='SMALL',
                log_bucket=data_lake.logs_s3_bucket,
                sink_bucket=data_lake.raw_s3_bucket,
                vpc=data_lake.vpc
            )

        # DATA WAREHOUSE module
        if is_module_enabled(dwh_module_param):
            dwh_stack = DwhModule(self, "dwh",
                                  vpc=data_lake.vpc,
                                  clean_bucket=data_lake.clean_s3_bucket,
                                  clean_glue_db=data_lake.clean_glue_db)

            CfnOutput(self, 'Redshift-QuickSight-Secret-Arn',
                      value=dwh_stack.quicksight_redshift_secret_arn,
                      export_name='ara-QuickSight-Redshift-Secret-Arn')
            CfnOutput(self, 'bastion_dns',
                      value=dwh_stack.bastion_dns,
                      export_name='ara-Redshift-bastion-dns')
            CfnOutput(self, 'bastion-host-key-pair',
                      export_name='ara-Redshift-bastion-keypair-secret',
                      value=dwh_stack.bastion_keypair_secret)
            CfnOutput(self, 'redshift-hostname',
                      export_name='ara-Redshift-hostname',
                      value=dwh_stack.redshift_endpoint.hostname)
            CfnOutput(self, 'redshift-port',
                      export_name='ara-Redshift-port',
                      value=str(dwh_stack.redshift_endpoint.port))


        # DATA VISUALIZATION module
        if is_module_enabled(dataviz_module_param):
            quicksight_username = self.node.try_get_context('QuickSightUsername')

            quicksight_identity_region = self.node.try_get_context('QuickSightIdentityRegion')

            if quicksight_username is None or quicksight_identity_region is None:
                raise Exception('QuickSightUsername and QuickSightIdentityRegion must be specified if data visualization is enabled')

            dataviz_stack = DataVizModule(self, "dataviz",
                                          vpc=data_lake.vpc,
                                          clean_glue_db_name=data_lake.clean_glue_db.database_name,
                                          redshift_sg_id=dwh_stack.redshift_sg_id,
                                          quicksight_username=quicksight_username,
                                          quicksight_identity_region=quicksight_identity_region)

            CfnOutput(self, 'QuickSight-Security-Group-Id',
                      value=dataviz_stack.quicksight_security_group_id)

            CfnOutput(self, 'QuickSight-Group-Arn',
                      value=dataviz_stack.quicksight_group_arn,
                      export_name='ara-QuickSight-Group-Arn')

        # STREAMING module
        if is_module_enabled(streaming_module_param):
            streaming_stack = StreamingModule(self,
                                              id="Streaming",
                                              prefix=id,
                                              source_bucket=data_lake.raw_s3_bucket,
                                              dest_bucket=data_lake.curated_s3_bucket)

            StreamDataGenerator(
                self, "StreamDatagen",
                config_table=datagen_config_table,
                tshirt_size='SMALL',
                log_bucket=data_lake.logs_s3_bucket,
                sink_bucket=data_lake.raw_s3_bucket,
                web_sale_stream=streaming_stack.sale_stream.stream_name,
                web_customer_stream=streaming_stack.customer_stream.stream_name,
                web_customer_address_stream=streaming_stack.address_stream.stream_name,
                kinesis_key=streaming_stack.kinesis_kms_key,
                vpc=data_lake.vpc
            )

        CfnOutput(self, 'Clean-S3-Bucket', value=data_lake.clean_s3_bucket.bucket_name)
        CfnOutput(self, "VPC-ID", value=data_lake.vpc.vpc_id, export_name='ara-Vpc-Id')

        for idx, val in enumerate(data_lake.private_subnets_selection.subnets):
            CfnOutput(self, 'SUBNET-ID{}'.format(idx), value=val.subnet_id)

        Tags.of(self).add('project-name', 'ara')

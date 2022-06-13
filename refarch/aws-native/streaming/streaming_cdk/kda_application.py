# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from constructs import Construct
from aws_cdk import (
    ArnFormat,
    aws_s3 as s3,
    aws_iam as iam,
    aws_logs as logs
)
from aws_cdk.aws_elasticsearch import CfnDomain
from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.aws_kinesisanalytics import CfnApplicationV2, CfnApplicationCloudWatchLoggingOptionV2
from aws_cdk import RemovalPolicy, Stack
from aws_cdk.custom_resources import AwsCustomResource, AwsCustomResourcePolicy, AwsSdkCall, PhysicalResourceId

import common.common_cdk.config as _config


class KdaApplication(Construct):
    @property
    def app(self):
        return self.__app

    def __init__(self, scope: Construct, id: str, es_domain: CfnDomain, kda_role: iam.Role,
                 source_bucket: s3.Bucket, dest_bucket: s3.Bucket, **kwargs):
        super().__init__(scope, id, **kwargs)

        stack = Stack.of(self)

        kda_role.add_to_policy(PolicyStatement(actions=['cloudwatch:PutMetricData'],
                                               resources=['*']))

        artifacts_bucket_arn = 'arn:aws:s3:::' + _config.ARA_BUCKET.replace("s3://", "")
        kda_role.add_to_policy(PolicyStatement(actions=['s3:GetObject', 's3:GetObjectVersion'],
                                               resources=[artifacts_bucket_arn, artifacts_bucket_arn + '/binaries/*']))
        log_group = logs.LogGroup(scope=self,
                                  id='KdaLogGroup',
                                  retention=logs.RetentionDays.ONE_WEEK,
                                  removal_policy=RemovalPolicy.DESTROY)

        log_stream = logs.LogStream(scope=self,
                                    id='KdaLogStream',
                                    log_group=log_group,
                                    removal_policy=RemovalPolicy.DESTROY)

        log_stream_arn = stack.format_arn(service='logs',
                                          resource='log-group',
                                          resource_name=log_group.log_group_name + ':log-stream:' +
                                                        log_stream.log_stream_name,
                                          arn_format=ArnFormat.COLON_RESOURCE_NAME)

        # TODO: restrict
        kda_role.add_to_policy(PolicyStatement(actions=['logs:*'],
                                               resources=[stack.format_arn(service='logs', resource='*')]))

        kda_role.add_to_policy(PolicyStatement(actions=['logs:DescribeLogStreams', 'logs:DescribeLogGroups'],
                                               resources=[log_group.log_group_arn,
                                                          stack.format_arn(service='logs', resource='log-group',
                                                                           resource_name='*')]))

        kda_role.add_to_policy(PolicyStatement(actions=['logs:PutLogEvents'],
                                               resources=[log_stream_arn]))

        kda_role.add_to_policy(PolicyStatement(actions=['es:ESHttp*'],
                                               resources=[stack.format_arn(service='es', resource='domain',
                                                                           resource_name=es_domain.domain_name + '/*')]))

        # TODO: restrict
        kda_role.add_to_policy(PolicyStatement(actions=['s3:*'],
                                               resources=['arn:aws:s3::::*']))

        # Define delivery stream
        # delivery_stream_name = 'clean_delivery_stream'
        #
        # s3_configuration = {
        #     'bucketArn': '',
        #     'compressionFormat': 'Snappy',
        #     'dataFormatConversionConfiguration': {
        #         'enabled': True,
        #         'inputFormatConfiguration': {'deserializer': },
        #         'outputFormatConfiguration': {'serializer': {'parquetSerDe': }},
        #         'schemaConfiguration': {}
        #     },
        #     'prefix': 'streaming'
        # }
        #
        # delivery_stream = CfnDeliveryStream(scope=self,
        #                                     id='Firehose Delivery Stream',
        #                                     delivery_stream_name=delivery_stream_name,
        #                                     delivery_stream_type='DirectPut',
        #                                     extended_s3_destination_configuration=s3_configuration
        #                                     )

        # Define KDA application
        application_configuration = {
            'environmentProperties': {
                'propertyGroups': [
                    {
                        'propertyGroupId': 'ConsumerConfigProperties',
                        'propertyMap': {
                            'CustomerStream': scope.customer_stream.stream_name,
                            'AddressStream': scope.address_stream.stream_name,
                            'SaleStream': scope.sale_stream.stream_name,
                            'PromoDataPath': source_bucket.s3_url_for_object('promo'),
                            'ItemDataPath': source_bucket.s3_url_for_object('item'),
                            'aws.region': scope.region
                        }
                    },
                    {
                        'propertyGroupId': 'ProducerConfigProperties',
                        'propertyMap': {
                            'ElasticsearchHost': 'https://' + es_domain.attr_domain_endpoint + ':443',
                            'Region': scope.region,
                            'DenormalizedSalesS3Path': dest_bucket.s3_url_for_object() + '/',
                            'IndexName': 'ara-write'
                        }
                    }
                ]
            },
            'applicationCodeConfiguration': {
                'codeContent': {
                    's3ContentLocation': {
                        'bucketArn': artifacts_bucket_arn,
                        'fileKey': 'binaries/stream-processing-1.1.jar'
                    }
                },
                'codeContentType': 'ZIPFILE'
            },
            'flinkApplicationConfiguration': {
                'parallelismConfiguration': {
                    'configurationType': 'DEFAULT'
                },
                'checkpointConfiguration': {
                    'configurationType': 'DEFAULT'
                },
                'monitoringConfiguration': {
                    'logLevel': 'DEBUG',
                    'metricsLevel': 'TASK',
                    'configurationType': 'CUSTOM'
                }
            },
            'applicationSnapshotConfiguration': {
                'snapshotsEnabled': False
            }
        }

        self.__app = CfnApplicationV2(scope=self,
                                      id='KDA application',
                                      runtime_environment='FLINK-1_11',
                                      application_name='KDA-application',
                                      service_execution_role=kda_role.role_arn,
                                      application_configuration=application_configuration)

        logging = CfnApplicationCloudWatchLoggingOptionV2(scope=self, id='KDA application logging',
                                                          application_name=self.__app.ref,
                                                          cloud_watch_logging_option={'logStreamArn': log_stream_arn})

        logging.apply_removal_policy(policy=RemovalPolicy.RETAIN, apply_to_update_replace_policy=True,
                                     default=RemovalPolicy.RETAIN)

        # Use a custom resource to start the application
        create_params = {
            'ApplicationName': self.__app.ref,
            'RunConfiguration': {
                'ApplicationRestoreConfiguration': {
                    'ApplicationRestoreType': 'SKIP_RESTORE_FROM_SNAPSHOT'
                },
                'FlinkRunConfiguration': {
                    'AllowNonRestoredState': True
                }
            }
        }

        # See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/ for service name, actions and parameters
        create_action = AwsSdkCall(service='KinesisAnalyticsV2',
                                   action='startApplication',
                                   parameters=create_params,
                                   physical_resource_id=PhysicalResourceId.of(self.__app.ref + '-start'))

        delete_action = AwsSdkCall(service='KinesisAnalyticsV2',
                                   action='stopApplication',
                                   parameters={'ApplicationName': self.__app.ref, 'Force': True})

        custom_resource = AwsCustomResource(scope=self,
                                            id='KdaStartAndStop',
                                            on_create=create_action,
                                            on_delete=delete_action,
                                            policy=AwsCustomResourcePolicy.from_statements([PolicyStatement(
                                                actions=['kinesisanalytics:StartApplication',
                                                         'kinesisanalytics:StopApplication',
                                                         'kinesisanalytics:DescribeApplication',
                                                         'kinesisanalytics:UpdateApplication'], resources=[
                                                    stack.format_arn(service='kinesisanalytics', resource='application',
                                                                     resource_name=self.app.application_name)])]))

        custom_resource.node.add_dependency(self.app)

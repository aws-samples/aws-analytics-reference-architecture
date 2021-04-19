# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk.aws_glue import CfnJob, Database
from aws_cdk.aws_iam import Role, ServicePrincipal, PolicyDocument, PolicyStatement
from aws_cdk.aws_s3 import Bucket
from aws_cdk.core import Aws, Construct
import common.common_cdk.config as _config


class Raw2CleanJob(Construct):

    @property
    def job(self):
        return self.__job

    def __init__(
            self,
            scope: Construct,
            id: str,
            source_entity: str,
            target_entity: str,
            datetime_column: str,
            date_column: str,
            script_bucket: Bucket,
            script_location: str,
            raw_db: Database,
            clean_db: Database,
            raw_bucket: Bucket,
            clean_bucket: Bucket,
            tshirt_size: str = 'SMALL',
            format: str = 'parquet',
            hudi_primary_key: str = None,
            partition_column: str = 'None',
            **kwargs):
        super().__init__(scope, id, **kwargs)

        job_name = "ara-raw2clean-" + source_entity.replace('_', '-')

        # Create role with least privileges that is used by the glue job to move data from raw to clean zone
        role = Role(self, 'Raw2Clean',
                    role_name='ara-raw2clean-' + source_entity.replace('_', '-') + '-job',
                    assumed_by=ServicePrincipal('glue.amazonaws.com'),
                    inline_policies={'JobPermissions': PolicyDocument(statements=[
                        PolicyStatement(
                            actions=['glue:GetJob'],
                            resources=['arn:aws:glue:{}:{}:job/{}'.format(Aws.REGION, Aws.ACCOUNT_ID,
                                                                          job_name)]
                        ),
                        PolicyStatement(
                            actions=['s3:ListBucket'],
                            resources=[
                                raw_bucket.bucket_arn,
                                clean_bucket.bucket_arn
                            ]
                        ),
                        PolicyStatement(
                            actions=['s3:GetObject'],
                            resources=[raw_bucket.arn_for_objects(source_entity + '/*'),
                                       script_bucket.arn_for_objects(script_location),
                                       script_bucket.arn_for_objects(_config.Raw2CleanConfig.HUDI_EXTRA_JAR_PATH),
                                       script_bucket.arn_for_objects(_config.Raw2CleanConfig.AVRO_EXTRA_JAR_PATH)
                                       ]
                        ),
                        PolicyStatement(
                            actions=['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
                            resources=[clean_bucket.arn_for_objects(target_entity + '_$folder$'),
                                       clean_bucket.arn_for_objects(target_entity + '/*')]
                        ),
                        PolicyStatement(
                            actions=['glue:GetTable', 'glue:GetPartitions'],
                            resources=['arn:aws:glue:{}:{}:catalog'.format(Aws.REGION, Aws.ACCOUNT_ID),
                                       'arn:aws:glue:{}:{}:database/{}'.format(Aws.REGION, Aws.ACCOUNT_ID,
                                                                               raw_db.database_name),
                                       'arn:aws:glue:{}:{}:table/{}/{}'.format(Aws.REGION, Aws.ACCOUNT_ID,
                                                                               raw_db.database_name, source_entity)]
                        ),
                        PolicyStatement(
                            actions=['glue:CreateTable', 'glue:GetTable', 'glue:UpdateTable',
                                     'glue:BatchCreatePartition', 'glue:GetPartitions'],
                            resources=['arn:aws:glue:{}:{}:catalog'.format(Aws.REGION, Aws.ACCOUNT_ID),
                                       'arn:aws:glue:{}:{}:database/{}'.format(Aws.REGION, Aws.ACCOUNT_ID,
                                                                               clean_db.database_name),
                                       'arn:aws:glue:{}:{}:table/{}/{}'.format(Aws.REGION, Aws.ACCOUNT_ID,
                                                                               clean_db.database_name, target_entity)]
                        ),
                        PolicyStatement(
                            actions=['glue:GetDatabase'],
                            resources=[
                                'arn:aws:glue:{}:{}:catalog'.format(Aws.REGION, Aws.ACCOUNT_ID),
                                'arn:aws:glue:{}:{}:database/default'.format(Aws.REGION, Aws.ACCOUNT_ID),
                                'arn:aws:glue:{}:{}:database/{}'.format(Aws.REGION, Aws.ACCOUNT_ID, clean_db.database_name),
                            ]
                        ),
                        PolicyStatement(
                            actions=['cloudwatch:PutMetricData'],
                            resources=['*'],
                            conditions={'StringEquals': {'cloudwatch:namespace': 'Glue'}}
                        ),
                        PolicyStatement(
                            actions=['logs:CreateLogGroup'],
                            resources=[
                                'arn:aws:logs:{}:{}:log-group:/aws-glue/jobs/output*'.format(Aws.REGION,
                                                                                             Aws.ACCOUNT_ID),
                                'arn:aws:logs:{}:{}:log-group:/aws-glue/jobs/error*'.format(Aws.REGION, Aws.ACCOUNT_ID),
                                'arn:aws:logs:{}:{}:log-group:/aws-glue/jobs/logs-v2*'.format(Aws.REGION,
                                                                                              Aws.ACCOUNT_ID)]
                        ),
                        PolicyStatement(
                            actions=['logs:CreateLogStream', 'logs:PutLogEvents'],
                            resources=[
                                'arn:aws:logs:{}:{}:log-group:/aws-glue/jobs/output:log-stream:*'.format(Aws.REGION,
                                                                                                         Aws.ACCOUNT_ID),
                                'arn:aws:logs:{}:{}:log-group:/aws-glue/jobs/error:log-stream:*'.format(Aws.REGION,
                                                                                                        Aws.ACCOUNT_ID),
                                'arn:aws:logs:{}:{}:log-group:/aws-glue/jobs/logs-v2:log-stream:*'.format(Aws.REGION,
                                                                                                          Aws.ACCOUNT_ID)]
                        )
                    ])}
                    )
        # If format is Hudi, we add primary key and parallelism args to the job args
        args = {
            '--job-bookmark-option': 'job-bookmark-enable',
            '--enable-metrics': '',
            '--raw_db_name': raw_db.database_name,
            '--clean_db_name': clean_db.database_name,
            '--source_entity_name': source_entity,
            '--target_entity_name': target_entity,
            '--datetime_column': datetime_column,
            '--date_column': date_column,
            '--partition_column': partition_column,
            '--output_bucket_name': clean_bucket.bucket_name
        }
        if format == 'hudi':
            hudi_args = {
                '--enable-glue-datacatalog': '',
                '--additional-python-modules': 'botocore==1.18.5,boto3==1.15.5',
                '--parallelism': _config.Raw2CleanConfig.PARALLELISM[tshirt_size],
                '--primary_key': hudi_primary_key,
                '--extra-jars': script_bucket.s3_url_for_object(_config.Raw2CleanConfig.HUDI_EXTRA_JAR_PATH) + ','
                                + script_bucket.s3_url_for_object(_config.Raw2CleanConfig.AVRO_EXTRA_JAR_PATH)
            }
            args = {**args, **hudi_args}

        self.__job = CfnJob(
            self, 'Glue',
            name=job_name,
            command=CfnJob.JobCommandProperty(
                name='glueetl',
                python_version='3',
                script_location=script_bucket.s3_url_for_object(script_location)
            ),
            role=role.role_arn,
            allocated_capacity=_config.Raw2CleanConfig.GLUE_DPU_SIZE[tshirt_size],
            default_arguments=args,
            glue_version='2.0',
            tags={'stage': 'raw'}
        )

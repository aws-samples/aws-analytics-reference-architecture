# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk.core import Aws, Construct, Stack
from aws_cdk.aws_cloudtrail import DataResourceType, Trail
from aws_cdk.aws_glue import CfnCrawler, Database, DataFormat, InputFormat, OutputFormat, SerializationLibrary, Table
from aws_cdk.aws_iam import ManagedPolicy, Role, PolicyDocument, PolicyStatement, ServicePrincipal
from aws_cdk.aws_s3 import IBucket

from constructs import Construct
from aws_cdk import App, Stack
from aws_cdk import aws_s3 as s3

import common.common_cdk.config as config


class AuditTrailGlue(Construct):

    def __init__(self, scope: Construct, id: str, audit_db: Database, audit_table: str,
                 log_bucket: IBucket, audit_bucket: IBucket, **kwargs):
        super().__init__(scope, id, **kwargs)

        # CloudTrail - S3 event Logging for the requested bucket
        # CloudFormation has a bug that put double "--" in the trail name
        # This violates the naming constraint of cloudtrail
        self.__trail = Trail(self, 'AuditTrail', 
            bucket=log_bucket,
            trail_name=f'{id}-{Stack.of(self).stack_name}-{Stack.of(self).account}')
        self.__trail.add_event_selector(

            data_resource_type=DataResourceType.S3_OBJECT,
            data_resource_values=['{}/'.format(audit_bucket.bucket_arn)],
            include_management_events=False)

        # Glue Data Catalog - Audit Table
        table_format = DataFormat(
            input_format=InputFormat.CLOUDTRAIL,
            output_format=OutputFormat.HIVE_IGNORE_KEY_TEXT,
            serialization_library=SerializationLibrary.CLOUDTRAIL)

        glue_table = Table(
            self, 'GlueAuditTable',
            bucket=log_bucket,
            columns=config.Glue.AUDIT_TABLE_COLUMNS,
            database=audit_db,
            data_format=table_format,
            partition_keys=config.Glue.AUDIT_TABLE_PARTITIONS,
            s3_prefix='AWSLogs/{}/CloudTrail'.format(Aws.ACCOUNT_ID),
            table_name=audit_table)

        # IAM audit role
        glue_role = Role(
            self, 'GlueAuditRole',
            assumed_by=ServicePrincipal('glue.amazonaws.com'),
            role_name=config.Glue.AUDIT_ROLE_NAME,
            inline_policies={"CrawlerPermissions": PolicyDocument(statements=[
                PolicyStatement(
                    actions=[
                        "glue:BatchCreatePartition",
                        "glue:BatchGetPartition",
                        "glue:GetDatabase",
                        "glue:GetTable"
                    ],
                    resources=[
                        "arn:aws:glue:{}:{}:catalog".format(Aws.REGION, Aws.ACCOUNT_ID),
                        "arn:aws:glue:{}:{}:database/{}".format(Aws.REGION, Aws.ACCOUNT_ID, audit_db.database_name),
                        "arn:aws:glue:{}:{}:table/{}/*".format(Aws.REGION, Aws.ACCOUNT_ID, audit_db.database_name)
                    ]
                ),
                PolicyStatement(
                    actions=[
                        "logs:CreateLogStream",
                        "logs:AssociateKmsKey",
                        "logs:CreateLogGroup",
                        "logs:PutLogEvents",
                    ],
                    resources=["arn:aws:logs:*:*:/aws-glue/*"]
                ),
                PolicyStatement(
                    actions=["s3:ListBucket", "s3:GetBucketLocation"],
                    resources=[log_bucket.bucket_arn]
                ),
                PolicyStatement(
                    actions=["s3:GetObject", ],
                    resources=['{}/*'.format(log_bucket.bucket_arn)]
                )
            ])}
        )

        # Glue Crawler
        audit_target = CfnCrawler.CatalogTargetProperty(
            database_name=audit_db.database_name,
            tables=[glue_table.table_name])
        audit_targets = CfnCrawler.TargetsProperty(catalog_targets=[audit_target])
        audit_policy = CfnCrawler.SchemaChangePolicyProperty(update_behavior='LOG', delete_behavior='LOG')
        audit_schedule = CfnCrawler.ScheduleProperty(schedule_expression='cron(0 */12 * * ? *)')

        CfnCrawler(
            self, 'AuditCrawler',
            name='DatalakeGlueCrawler-audit_table',
            schedule=audit_schedule,
            description='ARA - Refresh CloudTrail audit partitions',
            targets=audit_targets,
            role=glue_role.role_arn,
            schema_change_policy=audit_policy,
            configuration='{"Version":1.0,"CrawlerOutput":{"Partitions":{"AddOrUpdateBehavior":"InheritFromTable"}}}'
        )

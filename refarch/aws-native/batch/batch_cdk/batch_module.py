# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk.aws_glue import Database, CfnWorkflow, CfnTrigger
from aws_cdk.aws_s3 import Bucket
from aws_cdk.core import Construct, NestedStack, Tags

import common.common_cdk.config as _config
from batch.batch_cdk.crawler import Crawler
from batch.batch_cdk.raw2clean_job import Raw2CleanJob


class BatchModule(NestedStack):

    def __init__(
            self,
            scope: Construct,
            id: str,
            raw_bucket: Bucket,
            clean_bucket: Bucket,
            raw_db: Database,
            clean_db: Database,
            **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create crawler to crawl raw bucket
        raw_crawler = Crawler(self, 'Raw',
                              name='raw',
                              db=raw_db,
                              bucket=raw_bucket,
                              prefix=''
                              ).crawler

        # Retrieve existing shared binary bucket
        binary_bucket = Bucket.from_bucket_name(self, 'AraBucketByName', _config.ARA_BUCKET_NAME)

        # Create glue jobs to transform all entities from raw to clean
        raw2clean_jobs = [
            Raw2CleanJob(self, 'Raw2CleanItem', source_entity='item', target_entity='item',
                         datetime_column='item_datetime', date_column='item_date', partition_column='item_date',
                         script_bucket=binary_bucket, script_location=_config.Raw2CleanConfig.PARQUET_GLUE_SCRIPT_LOCATION,
                         raw_db=raw_db, clean_db=clean_db, raw_bucket=raw_bucket, clean_bucket=clean_bucket),
            Raw2CleanJob(self, 'Raw2CleanPromo', source_entity='promo', target_entity='promo',
                         datetime_column='promo_datetime', date_column='promo_date', partition_column='promo_date',
                         script_bucket=binary_bucket, script_location=_config.Raw2CleanConfig.PARQUET_GLUE_SCRIPT_LOCATION,
                         raw_db=raw_db, clean_db=clean_db, raw_bucket=raw_bucket, clean_bucket=clean_bucket),
            Raw2CleanJob(self, 'Raw2CleanStore', source_entity='store', target_entity='store',
                         datetime_column='store_datetime', date_column='store_date', partition_column='store_date',
                         script_bucket=binary_bucket, script_location=_config.Raw2CleanConfig.PARQUET_GLUE_SCRIPT_LOCATION,
                         raw_db=raw_db, clean_db=clean_db, raw_bucket=raw_bucket, clean_bucket=clean_bucket),
            Raw2CleanJob(self, 'Raw2CleanCustomer', source_entity='store_customer', target_entity='store_customer',
                         datetime_column='customer_datetime', date_column='customer_date', script_bucket=binary_bucket,
                         script_location=_config.Raw2CleanConfig.HUDI_GLUE_SCRIPT_LOCATION,
                         raw_db=raw_db, clean_db=clean_db, raw_bucket=raw_bucket, clean_bucket=clean_bucket,
                         format='hudi', hudi_primary_key='customer_id'),
            Raw2CleanJob(self, 'Raw2CleanCustomerAddress', source_entity='store_customer_address', target_entity='store_customer_address',
                         datetime_column='address_datetime', date_column='address_date',
                         script_bucket=binary_bucket, script_location=_config.Raw2CleanConfig.HUDI_GLUE_SCRIPT_LOCATION,
                         raw_db=raw_db, clean_db=clean_db, raw_bucket=raw_bucket, clean_bucket=clean_bucket, format='hudi',
                         hudi_primary_key='address_id'),
            Raw2CleanJob(self, 'Raw2CleanStoreSale1', source_entity='store_sale1', target_entity='store_sale',
                         datetime_column='sale_datetime', date_column='sale_date', partition_column='sale_date',
                         script_bucket=binary_bucket, script_location=_config.Raw2CleanConfig.PARQUET_GLUE_SCRIPT_LOCATION,
                         raw_db=raw_db, clean_db=clean_db, raw_bucket=raw_bucket, clean_bucket=clean_bucket)]

        # Create a glue workflow that triggers every 30 minutes to execute crawler and all jobs
        raw2clean_wf = CfnWorkflow(self, 'Raw2Clean', name='ara-raw2clean')

        CfnTrigger(self, 'Raw2CleanWorkflowStart',
                   name='ara-raw2clean-workflow-start',
                   description='Trigger that starts the workflow every 30 minutes by triggering the raw crawler',
                   type='SCHEDULED',
                   schedule='cron(*/30 * * * ? *)',
                   start_on_creation=True,
                   actions=[{'crawlerName': raw_crawler.ref}],
                   workflow_name=raw2clean_wf.ref
                   )

        # Add all raw2clean jobs to the predicate condition and actions of the corresponding trigger
        pre_job_trigger_actions = []
        post_job_trigger_predicate_conditions = []
        for r2c_job in raw2clean_jobs:
            pre_job_trigger_actions.append({'jobName': r2c_job.job.ref})
            post_job_trigger_predicate_conditions.append(
                {'jobName': r2c_job.job.ref, 'state': 'SUCCEEDED', 'logicalOperator': 'EQUALS'})

        CfnTrigger(self, 'Raw2CleanJobs',
                   name='ara-raw2clean-jobs',
                   description='Trigger that starts the transformation from raw to clean',
                   type='CONDITIONAL',
                   start_on_creation=True,
                   predicate={'conditions': [
                       {'crawlerName': raw_crawler.ref, 'crawlState': 'SUCCEEDED', 'logicalOperator': 'EQUALS'}]},
                   actions=pre_job_trigger_actions,
                   workflow_name=raw2clean_wf.ref
                   )

        Tags.of(self).add('module-name', 'batch')

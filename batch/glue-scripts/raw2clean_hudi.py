# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import sys
from datetime import datetime, timezone

import pyspark.sql.functions as f
from awsglue.context import GlueContext
from awsglue.dynamicframe import DynamicFrame
from awsglue.job import Job
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from pyspark.sql.session import SparkSession
from pyspark.sql.functions import *

import boto3
from botocore.exceptions import ClientError


def main():
    ## @params: [JOB_NAME, db_name, entity_name, partition_column, output_bucket_name, datetime_column,date_column]
    args = getResolvedOptions(sys.argv,
                              ['JOB_NAME', 'raw_db_name', 'clean_db_name', 'source_entity_name', 'target_entity_name',
                               'partition_column', 'output_bucket_name', 'primary_key', 'parallelism', 'date_column',
                               'datetime_column'])
    job_name = args['JOB_NAME']
    raw_db_name = args['raw_db_name']
    clean_db_name = args['clean_db_name']
    source_entity_name = args['source_entity_name']
    target_entity_name = args['target_entity_name']
    partition_column = args['partition_column']
    date_column = args['date_column']
    datetime_column = args['datetime_column']
    hudi_primary_key = args['primary_key']
    output_bucket_name = args['output_bucket_name']
    parallelism = args['parallelism']

    # Constants derived from parameters
    raw_table_name = source_entity_name
    clean_table_name = target_entity_name

    processing_start_datetime = datetime.now(timezone.utc)

    # Initialization of contexts and job
    spark = SparkSession.builder.config('spark.serializer','org.apache.spark.serializer.KryoSerializer').getOrCreate()
    glue_context = GlueContext(SparkContext.getOrCreate())
    job = Job(glue_context)
    job.init(job_name, args)
    logger = glue_context.get_logger()
    logger.info('Initialization.')

    # Initialization of Glue client to connect to Glue Catalog and retrieve table information
    glueClient = boto3.client('glue')

    ## @type: DataSource
    ## @args: [database = "<db_name>", table_name = "raw_<entity_name>", transformation_ctx = "raw_data"]
    ## @return: raw_data
    ## @inputs: []
    raw_data: DynamicFrame = glue_context.create_dynamic_frame.from_catalog(database=raw_db_name,
                                                                            table_name=raw_table_name,
                                                                            transformation_ctx="raw_data")

    # Terminate early if there is no data to process
    if raw_data.toDF().head() is None:
        job.commit()
        return

    ## @type: CleanDataset
    ## @args: []
    ## @return: cleaned_data
    ## @inputs: [frame = raw_data]
    input_data = raw_data.toDF()
    cleaned_data = input_data.select(*[from_unixtime(c).alias(c) if c == 'processing_datetime' else col(c) for c in input_data.columns])
    cleaned_data = cleaned_data.select(*[to_timestamp(c).alias(c) if c.endswith('_datetime') else col(c) for c in input_data.columns])
    cleaned_data = cleaned_data.select(*[to_date(c).alias(c) if c.endswith('_date') else col(c) for c in input_data.columns])
    cleaned_data = cleaned_data.select(*[col(c).cast('string').alias(c) if c == 'zip' else col(c) for c in input_data.columns])
    cleaned_data = cleaned_data.select(*[col(c).cast('decimal(15,2)').alias(c) if dict (input_data.dtypes) [c] == 'double' else col(c) for c in input_data.columns])

    ## @type: EnrichDataset
    ## @args: []
    ## @return: enriched_data
    ## @inputs: [frame = cleaned_data]
    enriched_data = cleaned_data.withColumn('etl_processing_datetime', unix_timestamp(f.lit(processing_start_datetime), 'yyyy-MM-dd HH:mm:ss').cast("timestamp")) \
        .withColumn(date_column, f.date_format(f.col(datetime_column), "yyyy-MM-dd").cast("date"))

    isTableExists = False
    try:
        glueClient.get_table(DatabaseName=clean_db_name,Name=target_entity_name)
        isTableExists = True
        logger.info(clean_db_name + '.' + target_entity_name + ' exists.')
    except ClientError as e:
        if e.response['Error']['Code'] == 'EntityNotFoundException':
            isTableExists = False
            logger.info(clean_db_name + '.' + target_entity_name + ' does not exist. Table will be created.')

    partition_path = '' if partition_column == 'None' else partition_column

    common_config = {
        'className': 'org.apache.hudi',
        'hoodie.datasource.hive_sync.use_jdbc': 'false',
        'hoodie.index.type': 'GLOBAL_BLOOM',
        'hoodie.datasource.write.precombine.field': datetime_column,
        'hoodie.datasource.write.recordkey.field': hudi_primary_key,
        'hoodie.table.name': target_entity_name,
        'hoodie.consistency.check.enabled': 'true',
        'hoodie.datasource.hive_sync.database': clean_db_name,
        'hoodie.datasource.hive_sync.table': target_entity_name,
        'hoodie.datasource.hive_sync.enable': 'true',
        'hoodie.datasource.write.partitionpath.field': partition_path,
        'hoodie.datasource.hive_sync.partition_fields': partition_path,
        'hoodie.datasource.hive_sync.partition_extractor_class': 'org.apache.hudi.hive.NonPartitionedExtractor' if partition_column == 'None' else 'org.apache.hudi.MultiPartKeysValueExtractor',
        'hoodie.datasource.write.hive_style_partitioning': 'false' if partition_column == 'None' else 'true',
        'hoodie.datasource.write.keygenerator.class': 'org.apache.hudi.keygen.NonpartitionedKeyGenerator' if partition_column == 'None' else 'org.apache.hudi.keygen.SimpleKeyGenerator'
    }

    incremental_config = {
        'hoodie.upsert.shuffle.parallelism': parallelism,
        'hoodie.datasource.write.operation': 'upsert',
        'hoodie.cleaner.policy': 'KEEP_LATEST_COMMITS',
        'hoodie.cleaner.commits.retained': 10
    }

    initLoad_config = {
        'hoodie.bulkinsert.shuffle.parallelism': parallelism,
        'hoodie.datasource.write.operation': 'upsert'
    }

    if (isTableExists):
        logger.info('Incremental upsert.')
        combinedConf = {**common_config, **incremental_config}
        enriched_data.write.format('org.apache.hudi').options(**combinedConf).mode('Append').save("s3://" + output_bucket_name + "/" + clean_table_name)
    else:
        logger.info('Inital load.')
        combinedConf = {**common_config, **initLoad_config}
        enriched_data.write.format('org.apache.hudi').options(**combinedConf).mode('Overwrite').save("s3://" + output_bucket_name + "/" + clean_table_name)

    job.commit()


if __name__ == '__main__':
    main()

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
from pyspark.sql.functions import *

def main():
    ## @params: [JOB_NAME, db_name, entity_name, datetime_column, date_column, partition_column, output_bucket_name]
    args = getResolvedOptions(sys.argv,
                              ['JOB_NAME', 'raw_db_name', 'clean_db_name', 'source_entity_name', 'target_entity_name',
                               'datetime_column', 'date_column', 'partition_column', 'output_bucket_name'])
    job_name = args['JOB_NAME']
    raw_db_name = args['raw_db_name']
    clean_db_name = args['clean_db_name']
    source_entity_name = args['source_entity_name']
    target_entity_name = args['target_entity_name']
    partition_column = args['partition_column']
    datetime_column = args['datetime_column']
    date_column = args['date_column']
    output_bucket_name = args['output_bucket_name']

    # Constants derived from parameters
    raw_table_name = source_entity_name
    clean_table_name = target_entity_name

    processing_start_datetime = datetime.now(timezone.utc)

    # Initialization of contexts and job
    glue_context = GlueContext(SparkContext.getOrCreate())
    job = Job(glue_context)
    job.init(job_name, args)

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

    ## @type: DataSink
    ## @args: [connection_type = "s3", connection_options = {"path": "s3://<output_bucket_name>/clean/<entity_name>", "enableUpdateCatalog": "True", "updateBehavior": "UPDATE_IN_DATABASE", "partitionKeys" : "[<partition_key>]"}, format = "glueparquet"]
    ## @return: sink
    ## @inputs: [frame = enriched_data]

    sink = glue_context.getSink(connection_type="s3", path="s3://" + output_bucket_name + "/" + clean_table_name,
                                enableUpdateCatalog=True, updateBehavior="UPDATE_IN_DATABASE",
                                partitionKeys=[partition_column])
    sink.setFormat("glueparquet")
    sink.setCatalogInfo(catalogDatabase=clean_db_name, catalogTableName=clean_table_name)
    sink.writeFrame(DynamicFrame.fromDF(enriched_data, glue_context, 'result'))

    job.commit()


if __name__ == '__main__':
    main()

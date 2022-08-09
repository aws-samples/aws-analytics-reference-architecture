# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql import functions as F
from urllib.parse import urlparse
import boto3
import json
  
sc = SparkContext.getOrCreate()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
logger = glueContext.get_logger()

logger.info("Getting the job parameters...")
args = getResolvedOptions(sys.argv, [
    's3_input_path',
    's3_output_path',
    'input_format',
    'datetime_column',
    'partition_range'
])
s = urlparse(args['s3_input_path'], allow_fragments=False)
o = urlparse(args['s3_output_path'], allow_fragments=False)
s3_input_bucket = s.netloc
s3_input_prefix = s.path.lstrip('/')
s3_output_bucket = o.netloc
s3_output_prefix = o.path.lstrip('/')
datetime_column = args['datetime_column']
partition_range  = args['partition_range']
input_format = args['input_format']

logger.info('Calculating the size of the source...')
total_size = 0
client = boto3.client('s3')
pages = client.get_paginator('list_objects_v2').paginate(Bucket=s3_input_bucket, Prefix=s3_input_prefix, RequestPayer='requester')
for page in pages:
    for obj in page['Contents']:
        total_size += obj["Size"]
logger.info('source total size is '+ total_size/1024 +' MB')

# reading the input files
df = spark\
    .read.option("header","true")\
    .format(input_format).path("s3://"+s3_input_bucket+"/"+ s3_input_prefix)

# Adding the column with the right time based partition
df2 = df.withColumn("time_range", F.window(F.col(datetime_column), +partition_range+" minutes"))\
    .withColumn("time_range_start",F.unix_timestamp(F.col("time_range.start")))\
    .drop("time_range")\
    .repartition(F.col("time_range_start"))\
    .sortWithinPartitions(datetime_column)

# Caching the dataframe for reuse 
df2.cache()

# Writing the output in S3
df2.write.mode("OVERWRITE").partitionBy("time_range_start").option("header", "true").csv('s3://'+ s3_output_bucket +'/'+ s3_output_prefix)

# Generating the manifest file
df2.selectExpr("time_range_start as start")\
    .withColumn("path", F.input_file_name())\
    .distinct()\
    .coalesce(1)\
    .write.mode("OVERWRITE").option("header", "true")\
    .csv('s3://'+ s3_output_bucket +'/'+ s3_output_prefix + '_manifest')


# Cleaning the manifest file from spark generated filename to proper name
s3 = boto3.resource('s3')
bucket = s3.Bucket(s3_output_bucket)
manifest = bucket.objects.filter(Prefix=s3_output_prefix+ '_manifest/part')
for obj in manifest:
    print(obj)
    copy_source = {
        'Bucket': s3_output_bucket,
        'Key': obj.key
    }
    bucket.copy(copy_source, s3_output_prefix + '-manifest.csv')
bucket.objects.filter(Prefix= s3_output_prefix + '_manifest').delete()


job.commit()
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
from datetime import datetime
  
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
    'partition_range',
    'ssm_parameter'
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
ssm_parameter = args['ssm_parameter']

# logger.info('Calculating the size of the source...')
# total_size = 0
# client = boto3.client('s3')
# pages = client.get_paginator('list_objects_v2').paginate(Bucket=s3_input_bucket, Prefix=s3_input_prefix, RequestPayer='requester')
# for page in pages:
#     for obj in page['Contents']:
#         total_size += obj["Size"]
# logger.info('source total size is '+ total_size/1024/1024 +' MB')

# reading the input files
df = spark\
    .read.option("header","true")\
    .format(input_format).load("s3://"+s3_input_bucket+"/"+ s3_input_prefix)


# updating Null and wrong format to current timestamp
df=df.withColumn(datetime_column, F.date_format(F.coalesce(F.to_timestamp(F.col(datetime_column)), F.lit(F.current_timestamp())), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"))

# Adding the column with the right time based partition
df2 = df.withColumn("time_range", F.window(F.col(datetime_column), partition_range+" minutes"))\
    .withColumn("time_range_start",F.unix_timestamp(F.col("time_range.start")))\
    .drop("time_range")\
    .repartition(F.col("time_range_start"))\
    .sortWithinPartitions(datetime_column)

# Caching the dataframe for reuse 
df2.cache()

# Get the minimum Datetime value from Datetime column and store it in SSM parameter so CDK can retrieve the value after job execution
min_datetime = df2.select(F.min(datetime_column)).collect()[0].__getitem__(f'min({datetime_column})')
offset = round((datetime.now() - datetime.strptime(min_datetime, '%Y-%m-%dT%H:%M:%S.%fZ')).total_seconds())
logger.info("offset "+ str(offset))
ssm_client = boto3.client('ssm')
ssm_client.put_parameter(Name=ssm_parameter, Value=str(offset), Overwrite=True, Type='String')

# Writing the output in S3
df2.write.mode("OVERWRITE").partitionBy("time_range_start").option("header", "true").csv('s3://'+ s3_output_bucket +'/'+ s3_output_prefix)

# Generating the manifest file
df3 = spark.read.option("header", "true").csv('s3://'+ s3_output_bucket +'/'+ s3_output_prefix).selectExpr("time_range_start as start")\
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
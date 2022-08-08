import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql import functions as F
import boto3
import json
  
sc = SparkContext.getOrCreate()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)


S3InputBucket="byod-saas-sales-cdk-test"
S3OutputBucket="byod-saas-sales-cdk-test"
Table_name="saas-test1"
DatetimeColName="datetime"
partitionRange="1"


def get_folder_size():
    total_size = 0
    for obj in boto3.resource('s3').Bucket(S3InputBucket).objects.filter(Prefix=Table_name):
        total_size += obj.size
    return total_size

tot_size=get_folder_size()
print(tot_size)


df = spark.read.option("header","true").csv("s3://"+S3InputBucket+"/"+ Table_name)
df2 = df.withColumn("time_range", F.window(F.col(DatetimeColName), +partitionRange+" minutes")).withColumn("time_range_start",F.unix_timestamp(F.col("time_range.start"))).drop("time_range")
df2.repartition(F.col("time_range_start")).sortWithinPartitions(DatetimeColName).write.mode("OVERWRITE").partitionBy("time_range_start").option("header", "true").csv("s3://"+S3OutputBucket+"/"+"/tmp/"+ Table_name)



df3 = df2.cache()


df3.selectExpr("time_range_start as start").withColumn("path", F.input_file_name()).distinct().coalesce(1).write.mode("OVERWRITE").option("header", "true").csv("s3://"+S3OutputBucket+"/"+"/tmp/"+ Table_name+ "_manifest")






s3 = boto3.resource('s3')
bucket = s3.Bucket(S3OutputBucket)
manifest = bucket.objects.filter(Prefix='tmp/'+ Table_name + '_manifest/part')
for obj in manifest:
    print(obj)
    copy_source = {
        'Bucket': S3OutputBucket,
        'Key': obj.key
    }
    bucket.copy(copy_source, 'tmp/'+ Table_name + '-manifest.csv')
bucket.objects.filter(Prefix='tmp/'+ Table_name + '_manifest').delete()
job.commit()
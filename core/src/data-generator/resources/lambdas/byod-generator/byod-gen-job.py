import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
import pyspark.sql.functions as F


args = getResolvedOptions(sys.argv, ["JOB_NAME"])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
args = getResolvedOptions(sys.argv, ["JOB_NAME","S3InputBucket","S3OutputBucket","DatetimeColName","PartitionTimerange"])
job.init(args["JOB_NAME"], args)

# Script generated for node S3 bucket
S3bucket_node1 = glueContext.create_dynamic_frame.from_options(
    format_options={
        "withHeader": True,
        "separator": ",",
        "optimizePerformance": False,
    },
    connection_type="s3",
    format="csv",
    connection_options={
        "paths": [args["S3InputBucket"]],
        "recurse": True,
    },
    transformation_ctx="S3bucket_node1",
)

#df=spark.read.format("csv").option("header","true").load(args["S3InputBucket"])

#min_date, max_date = df.select(min(args["DatetimeColName"]), max(args["DatetimeColName"])).first()

# Script generated for node S3 bucket
S3bucket_node3 = glueContext.write_dynamic_frame.from_options(
    frame=S3bucket_node1,
    connection_type="s3",
    format="csv",
    connection_options={
        "path": args["S3OutputBucket"],
        "partitionKeys": [args["DatetimeColName"]],
    },
    transformation_ctx="S3bucket_node3",
)

job.commit()

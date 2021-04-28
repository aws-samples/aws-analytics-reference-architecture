## Keeping the Data Catalog Up-To-Date

### Challenge/Issue
To create a data lake, you must catalog the data stored within the lake.
As described in the [data lake section of the high-level design](../../high-level-design/modules/data-lake), MyStore utilizes the [Glue Data Catalog](https://docs.aws.amazon.com/glue/latest/dg/populate-data-catalog.html) for keeping track of the location, schema, and statistics of the data.
There are different ways to populate the metadata in the Data Catalog.
A crawler can be used to take inventory of the data in your data stores, but there are [various methods](https://docs.aws.amazon.com/glue/latest/dg/tables-described.html) to define and update objects manually.
Factors like latency in visibility of newly arrived data, dependency management, and cost have to be considered when looking for the right approach to keep your Data Catalog up-to-date. 

### Solution
MyStore new raw data arrives periodically every 30 minutes in the *raw* S3 bucket.
The only process consuming from the *raw* S3 bucket is the data preparation process, which relies on up-to-date Data Catalog information about all entity types stored in that data lake location.
For that reason, the Data Catalog gets updated as the first step in the workflow orchestrating the data preparation process.
A single crawler is used and executed for all the entities to avoid multiple code changes in case of newly added entity types, as well as to lower the cost. The crawler is configured to identify any new and all changes to existing entity types and update the Data Catalog accordingly.

After the processing of the data (one job per entity), each job updates the Data Catalog to keep the metadata related to the *clean* S3 bucket up-to-date.
The following extract of the data preparation ETL script demonstrate how to [create tables, update schemas, and add new partitions in the Data Catalog from AWS Glue ETL Jobs](https://docs.aws.amazon.com/glue/latest/dg/update-from-job.html): 
```
sink = glue_context.getSink(connection_type="s3", path="s3://" + output_bucket_name + "/" + clean_table_name,
                                enableUpdateCatalog=True, updateBehavior="UPDATE_IN_DATABASE",
                                partitionKeys=[partition_key])
sink.setFormat("glueparquet")
sink.setCatalogInfo(catalogDatabase=clean_db_name, catalogTableName=clean_table_name)
sink.writeFrame(DynamicFrame.fromDF(enriched_data, glue_context, 'result'))
```

Updating the Data Catalog from within the AWS Glue ETL Job has the benefit that the consumers that rely on the Data Catalog will have immediate access to the newly produced data sets.
Furthermore, this approach can lower the cost if no additional crawler has to be executed. To understand the cost of running a crawler, refer to the [Glue Pricing](https://aws.amazon.com/glue/pricing/) page.
When evaluating this approach for your use case, please check your requirements against the existing [restrictions](https://docs.aws.amazon.com/glue/latest/dg/update-from-job.html#update-from-job-restrictions).
As MyStore stores the clean data in Parquet format, two of the restrictions also apply in their use case.
First, the output has to be writen using the `glueparquet` format, because `parquet` is not supported when leveraging the Data Catalog update feature from within the job.
Furthermore, tables created or updated with the `glueparquet` classification cannot be used as data sources for other jobs. So MyStore runs an additional crawler on the *clean* S3 bucket, once all data preparation jobs finished successfully.
This crawler will classify the data as `parquet` and adds statistics metadata to the Glue Data Catalog. 

While this approach increases the cost by another crawler execution per data preparation workflow execution, it ensures that data is immediately accessible and compatible with any type of downstream consumers. 
Even though, having a single crawler scanning all entity types within the *clean* S3 bucket introduces an unnecessary dependency between all entity types, it reduces the crawling cost significantly.

In summary, tradeoffs have to be made between:

  * **Latency in data visibility**: Strictly separating the cataloging process for each entity type vs. introducing artificial dependencies between the independent entity types.
  * **Cost**: Running no, one, or multiple crawlers to update the Data Catalog.
  * **Complexity**: Updating the Data Catalog manually vs. only via crawlers vs. using a mix of manual updates and crawlers. 

## Orchestrating a serverless batch analytics pipeline
### Challenge/Issue
The usage of a workflow management product is required to schedule and monitor the individual steps of batch processing pipelines, and to manage dependencies between steps. 
AWS provides different workflow management tools including [AWS Step Functions](https://aws.amazon.com/step-functions/), 
[Amazon Managed Workflows for Apache Airflow](https://aws.amazon.com/managed-workflows-for-apache-airflow/) and [AWS Glue Workflows](https://docs.aws.amazon.com/glue/latest/dg/workflows_overview.html).
Also, 3rd party products are available via the [AWS Marketplace](https://aws.amazon.com/marketplace). Choosing the right workflow management product can be challenging.

### Solution
Looking at the various different workflow management products, you can easily categorize them into general purpose solutions and platform/service-specific solutions.
While AWS Step Functions and Amazon Managed Workflows for Apache Airflow can be used for a wide variety of use cases and applications, AWS Glue Workflow is targeted to ease the definition, execution management, and monitoring of workflows consisting of AWS Glue activities, such as crawlers, jobs, and triggers.

MyStore's data preparation process is completely decoupled from all up- and down-stream systems via the interfaces of the *raw* and *clean* S3 buckets, as well as metadata provided in the Glue Data Catalog, so its workflow management platform choice can be made in isolation from other processes.
Furthermore, all individual steps of the data preparation process have been designed and implemented as AWS Glue activities, namely two AWS Glue crawlers and a single AWS Glue ETL Job for each entity type, as described in the [data lake section of the high-level design](../../high-level-design/modules/batch).
Operating solely within the context of AWS Glue, MyStore has chosen to use AWS Glue Workflows, which natively supports all the described requirements that MyStore has for their data preparation process.
Leveraging AWS Glue Workflows, all data preparation related processing elements can be found within the AWS Glue console.  

## Creating a reusable ETL Script
### Challenge/Issue
The data preparation process cleanses and transforms a variety of entity types, like the customer, customer address, and sales entities.
Each entity type defines its own schema, consisting of different number of fields, field names, and data types.
While creating a separate ETL script for each entity type would solve the issue, using a reusable approach that can process any entity type brings benefits on development and maintenance costs.

### Solution
MyStore is using a single parameterized Glue ETL script for each type of data storage format. Currently, MyStore is relying on a combination of Apache Parquet files for event logs data and Apache Hudi for updatable data. 
(see the reasons why MyStore is using this solution [here](../data-warehouse#optimizing-load-performance-for-slowly-changing-dimensions-in-the-data-warehouse)). In consequence, the Batch Analytics pipeline is limited to two ETL scripts.

Any entity-type-specific source or target information gets defined within the parameters, whose default values are specified in the entity-type-related AWS Glue Job definition.
It is important to note that the script does not require to define the entity-type-specific schema. 
The script defines and leverages the following parameters:

``` python
args = getResolvedOptions(sys.argv,
                          ['JOB_NAME', 'raw_db_name', 'clean_db_name', 'source_entity_name', 'target_entity_name', 'datetime_partition_column',
                           'partition_key', 'output_bucket_name'])
job_name = args['JOB_NAME']
raw_db_name = args['raw_db_name']
clean_db_name = args['clean_db_name']
source_entity_name = args['source_entity_name']
target_entity_name = args['target_entity_name']
datetime_partition_column = args['datetime_partition_column']
partition_key = args['partition_key']
output_bucket_name = args['output_bucket_name']

raw_table_name = source_entity_name
clean_table_name = target_entity_name
```

To read the data from the *raw* S3 bucket, the variables `raw_db_name` and `raw_table_name` are used to refer to the entity-type-specific raw data table in the AWS Glue Data Catalog.
Using AWS Glue's [DynamicFrameReader](https://docs.aws.amazon.com/glue/latest/dg/aws-glue-api-crawler-pyspark-extensions-dynamic-frame.html)'s method to read data from the specified table name, there is no need to specify any reader schema within the script.
``` python
raw_data: DynamicFrame = glue_context.create_dynamic_frame.from_catalog(database=raw_db_name, table_name=raw_table_name, transformation_ctx="raw_data")
```

After reading the data, the script transforms and enriches the raw data.
For that, it first gets converted into a DataFrame.
``` python
input_data = raw_data.toDF()
```

Each source, independent of the entity type, carries the `processing_datetime` in form of a unix timestamp from the ingestion system along.
To ease the consumption of the data, the data type is transformed into a timestamp.
``` python
cleaned_data = input_data.select(*[from_unixtime(c).alias(c) if c == 'processing_datetime' else col(c) for c in input_data.columns])
```

As time-related information in the *raw* is stored as String to allow any ingestion to succeed, the data preparation script transforms these fields accordingly.
By convention, any field ending with `_datetime` gets transformed into a timestamp, and any field ending with `_date` gets transformed into a date.
``` python
cleaned_data = cleaned_data.select(*[to_timestamp(c).alias(c) if c.endswith('_datetime') else col(c) for c in input_data.columns])
cleaned_data = cleaned_data.select(*[to_date(c).alias(c) if c.endswith('_date') else col(c) for c in input_data.columns])
```

For a few exceptional cases, the automatic data type detection and conversion gets to its limits.
As `zip` codes are detected as numeric numbers, an explicit cast into String has to be performed.
``` python
cleaned_data = cleaned_data.select(*[col(c).cast('string').alias(c) if c == 'zip' else col(c) for c in input_data.columns])
```

Before being able to write the transformed raw data to the target location, two additional fields have to be added.
To be able to track down a record has been touched by each process in the data pipeline, the script adds an `etl_processing_datetime` fields, which carries the timestamp of when the ETL script has been started.
The second fields to be added is required, as the output of the data preparation process in the *clean* S3 bucket should be partitioned by event time's date.
As the source field of the event time, as well as the partition key, is entity-type-specific, the value of the `datetime_partition_column` parameter determines the name of the source field, and the value of the 'partition_key' parameter defines the name of the newly created partition key column.  
``` python
enriched_data = cleaned_data.withColumn('etl_processing_datetime', unix_timestamp(f.lit(processing_start_datetime), 'yyyy-MM-dd HH:mm:ss').cast("timestamp")).withColumn(partition_key, f.date_format(f.col(datetime_partition_column), "yyyy-MM-dd").cast("date"))
```

Finally, the script stores the enriched data sets partitioned by the `partition_key` column in the *clean* S3 bucket, which is defined in the `output_bucket_name` parameter.
The `clean_table_name` parameter is used to prefix the object paths of the output and update the meta data in the AWS Glue Data Catalog (in combination with `clean_db_name` parameter) as described in [Keeping the Data Catalog Up-To-Date](#keeping-the-data-catalog-up-to-date).
``` python
sink = glue_context.getSink(connection_type="s3", path="s3://" + output_bucket_name + "/" + clean_table_name,
                            enableUpdateCatalog=True, updateBehavior="UPDATE_IN_DATABASE",
                            partitionKeys=[partition_key])
sink.setFormat("glueparquet")
sink.setCatalogInfo(catalogDatabase=clean_db_name, catalogTableName=clean_table_name)
sink.writeFrame(DynamicFrame.fromDF(enriched_data, glue_context, 'result'))
```

With the provided approach of implementing the ETL script, MyStore ends up in just having a single version of the ETL script stored in S3 and all AWS Glue Jobs referencing to it.
The entity-type-specific configuration is defined within the AWS Glue Jobs.
However, as seen with the example of the zip code, this approach still requires non-generic code fragments to be placed within the reusable script.
Given the simplicity of the variation in the source data schema and formats, this approach is working well for the given scenario of MyStore.

## Handling of late arriving events
### Challenge/Issue
Data from the source systems can arrive with delays in the *raw* S3 bucket.
At the same time, data consumers should not miss any data, even when arriving late.

### Solution
The data preparation process consumes its input data from the *raw* S3 bucket, where the data is partitioned by the processing time of the source system.
By aligning the data pipeline end-to-end on the continuously increasing source system's processing time, all late arriving data would automatically be picked up at any stage of the pipeline.

However, MyStore decided to provide a more user-friendly view on the data in the *clean* S3 bucket, which is the output location of the data preparation process, by partitioning the data by event time.
Event time being the point in time when the event has been created at its original source.
Querying on event time is the more natural way for users to interact with the data than considering a time when a particular system has touched the event. 
As event time and processing time can diverge in certain situations, there is no direct correlation between the partition of the input and output data.
This design results in updates being made to existing partitions in the *clean* S3 bucket.

While switching partitioning from processing time to event time eases the situation for downstream consumers that run isolated queries on append-only data sets, it creates additional challenges for consumers that are interested in the incremental changes that are applied to a data set.
To handle this challenge, consumers that utilize AWS Glue can leverage a feature called [job bookmarks](https://docs.aws.amazon.com/glue/latest/dg/monitor-continuations.html).
Using this feature, AWS Glue tracks data that has already been processed during a previous run of an ETL job and prevents reprocessing of old data.
In case of consuming data from Amazon S3, the tracking happens on object level across all partition.
Another option for consumers to identify and consume the incremental changes to the data set is to leverage [Amazon S3 event notifications](https://docs.aws.amazon.com/AmazonS3/latest/dev/NotificationHowTo.html).
Using this feature, consumers will be notified when new objects are created in any of the partitions and can process them according to their needs.

Choosing an approach to handle late arriving events always has to consider the full data processing pipeline from the data source down to the final consumer of the event.
In a flow, which only includes processing steps that are interested in the incremental changes to the data set, sticking to a processing time based partitioning is usually the simplest approach.
If, like in the MyStore Inc scenario, a single view should be provided that allows end users to query based on event time, but also processes to pick up incremental changes, additional mechanisms have to be leveraged as described above.






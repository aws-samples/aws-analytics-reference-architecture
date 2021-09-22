# API Reference

**Classes**

Name|Description
----|-----------
[DataLakeExporter](#aws-analytics-reference-architecture-datalakeexporter)|DataLakeExporter Construct to export data from a stream to the data lake.
[Example](#aws-analytics-reference-architecture-example)|*No description*


**Structs**

Name|Description
----|-----------
[DataLakeExporterProps](#aws-analytics-reference-architecture-datalakeexporterprops)|The properties for DataLakeExporter Construct.
[ExampleProps](#aws-analytics-reference-architecture-exampleprops)|*No description*



## class DataLakeExporter 🔹 <a id="aws-analytics-reference-architecture-datalakeexporter"></a>

DataLakeExporter Construct to export data from a stream to the data lake.

Source can be an Amazon Kinesis Data Stream.
Target can be an Amazon S3 bucket.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new DataLakeExporter(scope: Construct, id: string, props: DataLakeExporterProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[DataLakeExporterProps](#aws-analytics-reference-architecture-datalakeexporterprops)</code>)  *No description*
  * **sinkLocation** (<code>[Location](#aws-cdk-aws-s3-location)</code>)  Sink must be an Amazon S3 Location composed of a bucket and a key. 
  * **sourceGlueDatabase** (<code>[Database](#aws-cdk-aws-glue-database)</code>)  Source AWS Glue Database containing the schema of the stream. 
  * **sourceGlueTable** (<code>[Table](#aws-cdk-aws-glue-table)</code>)  Source AWS Glue Table containing the schema of the stream. 
  * **sourceKinesisDataStream** (<code>[Stream](#aws-cdk-aws-kinesis-stream)</code>)  Source must be an Amazon Kinesis Data Stream. 
  * **deliveryInterval** (<code>number</code>)  Delivery interval in seconds. __*Default*__: Set to 900 seconds
  * **deliverySize** (<code>number</code>)  Maximum delivery size in MB. __*Default*__: Set to 128 MB



### Properties


Name | Type | Description 
-----|------|-------------
**cfnIngestionStream**🔹 | <code>[CfnDeliveryStream](#aws-cdk-aws-kinesisfirehose-cfndeliverystream)</code> | Constructs a new instance of the DataLakeExporter class.



## class Example 🔹 <a id="aws-analytics-reference-architecture-example"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer


Constructs a new instance of the Example class with CfnOutput.

CfnOutput can be customized.

```ts
new Example(scope: Construct, id: string, props: ExampleProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  the Scope of the AWS CDK Construct.
* **id** (<code>string</code>)  the ID of the AWS CDK Construct.
* **props** (<code>[ExampleProps](#aws-analytics-reference-architecture-exampleprops)</code>)  the ExampleProps [properties]{@link ExampleProps}.
  * **name** (<code>string</code>)  Name used to qualify the CfnOutput in the Stack. __*Default*__: Set to 'defaultMessage' if not provided
  * **value** (<code>string</code>)  Value used in the CfnOutput in the Stack. __*Default*__: Set to 'defaultValue!' if not provided




## struct DataLakeExporterProps 🔹 <a id="aws-analytics-reference-architecture-datalakeexporterprops"></a>


The properties for DataLakeExporter Construct.



Name | Type | Description 
-----|------|-------------
**sinkLocation**🔹 | <code>[Location](#aws-cdk-aws-s3-location)</code> | Sink must be an Amazon S3 Location composed of a bucket and a key.
**sourceGlueDatabase**🔹 | <code>[Database](#aws-cdk-aws-glue-database)</code> | Source AWS Glue Database containing the schema of the stream.
**sourceGlueTable**🔹 | <code>[Table](#aws-cdk-aws-glue-table)</code> | Source AWS Glue Table containing the schema of the stream.
**sourceKinesisDataStream**🔹 | <code>[Stream](#aws-cdk-aws-kinesis-stream)</code> | Source must be an Amazon Kinesis Data Stream.
**deliveryInterval**?🔹 | <code>number</code> | Delivery interval in seconds.<br/>__*Default*__: Set to 900 seconds
**deliverySize**?🔹 | <code>number</code> | Maximum delivery size in MB.<br/>__*Default*__: Set to 128 MB



## struct ExampleProps 🔹 <a id="aws-analytics-reference-architecture-exampleprops"></a>






Name | Type | Description 
-----|------|-------------
**name**?🔹 | <code>string</code> | Name used to qualify the CfnOutput in the Stack.<br/>__*Default*__: Set to 'defaultMessage' if not provided
**value**?🔹 | <code>string</code> | Value used in the CfnOutput in the Stack.<br/>__*Default*__: Set to 'defaultValue!' if not provided




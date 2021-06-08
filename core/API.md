# API Reference

**Classes**

Name|Description
----|-----------
[DataGenerator](#aws-analytics-reference-architecture-datagenerator)|*No description*
[Dataset](#aws-analytics-reference-architecture-dataset)|*No description*
[Example](#aws-analytics-reference-architecture-example)|*No description*


**Structs**

Name|Description
----|-----------
[DataGeneratorProps](#aws-analytics-reference-architecture-datageneratorprops)|*No description*
[ExampleProps](#aws-analytics-reference-architecture-exampleprops)|*No description*



## class DataGenerator 🔹 <a id="aws-analytics-reference-architecture-datagenerator"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer


Constructs a new instance of the DataGenerator class.

```ts
new DataGenerator(scope: Construct, id: string, props: DataGeneratorProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  the Scope of the CDK Construct.
* **id** (<code>string</code>)  the ID of the CDK Construct.
* **props** (<code>[DataGeneratorProps](#aws-analytics-reference-architecture-datageneratorprops)</code>)  the DataGenerator [properties]{@link DataGeneratorProps}.
  * **sinkArn** (<code>string</code>)  Sink Arn to receive the genarated data. 
  * **sourceDatetime** (<code>string</code>)  Dataset column containing the event datetime, updated by the DataGenerator with current datetime. 
  * **sourceS3Path** (<code>string</code>)  Dataset S3 path source used to generate the data. 



### Properties


Name | Type | Description 
-----|------|-------------
**sinkArn**🔹 | <code>[Arn](#aws-cdk-core-arn)</code> | <span></span>
**sourceDatetime**🔹 | <code>string</code> | <span></span>
**sourceS3Path**🔹 | <code>string</code> | <span></span>



## class Dataset 🔹 <a id="aws-analytics-reference-architecture-dataset"></a>




### Initializer


Constructs a new instance of the Dataset class.

```ts
new Dataset(location: string, datetime: string)
```

* **location** (<code>string</code>)  the S3 path where the dataset is located.
* **datetime** (<code>string</code>)  the column name in the dataset containing event datetime.



### Properties


Name | Type | Description 
-----|------|-------------
**datetime**🔹 | <code>string</code> | the column name in the dataset containing event datetime.
**location**🔹 | <code>string</code> | the S3 path where the dataset is located.
*static* **DATASETS_LOCATION**🔹 | <code>string</code> | <span></span>
*static* **RETAIL_ADDRESS**🔹 | <code>[Dataset](#aws-analytics-reference-architecture-dataset)</code> | <span></span>
*static* **RETAIL_CUSTOMER**🔹 | <code>[Dataset](#aws-analytics-reference-architecture-dataset)</code> | <span></span>
*static* **RETAIL_ITEM**🔹 | <code>[Dataset](#aws-analytics-reference-architecture-dataset)</code> | <span></span>
*static* **RETAIL_PROMO**🔹 | <code>[Dataset](#aws-analytics-reference-architecture-dataset)</code> | <span></span>
*static* **RETAIL_STORE**🔹 | <code>[Dataset](#aws-analytics-reference-architecture-dataset)</code> | <span></span>
*static* **RETAIL_STORESALE**🔹 | <code>[Dataset](#aws-analytics-reference-architecture-dataset)</code> | <span></span>
*static* **RETAIL_WAREHOUSE**🔹 | <code>[Dataset](#aws-analytics-reference-architecture-dataset)</code> | <span></span>
*static* **RETAIL_WEBSALE**🔹 | <code>[Dataset](#aws-analytics-reference-architecture-dataset)</code> | <span></span>



## class Example 🔹 <a id="aws-analytics-reference-architecture-example"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer


Constructs a new instance of the Example class with CfnOutput.

CfnOutput can be customized.

```ts
new Example(scope: Construct, id: string, props: ExampleProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  the Scope of the CDK Construct.
* **id** (<code>string</code>)  the ID of the CDK Construct.
* **props** (<code>[ExampleProps](#aws-analytics-reference-architecture-exampleprops)</code>)  the ExampleProps [properties]{@link ExampleProps}.
  * **name** (<code>string</code>)  Name used to qualify the CfnOutput in the Stack. __*Default*__: Set to 'defaultMessage' if not provided
  * **value** (<code>string</code>)  Value used in the CfnOutput in the Stack. __*Default*__: Set to 'defaultValue!' if not provided




## struct DataGeneratorProps 🔹 <a id="aws-analytics-reference-architecture-datageneratorprops"></a>






Name | Type | Description 
-----|------|-------------
**sinkArn**🔹 | <code>string</code> | Sink Arn to receive the genarated data.
**sourceDatetime**🔹 | <code>string</code> | Dataset column containing the event datetime, updated by the DataGenerator with current datetime.
**sourceS3Path**🔹 | <code>string</code> | Dataset S3 path source used to generate the data.



## struct ExampleProps 🔹 <a id="aws-analytics-reference-architecture-exampleprops"></a>






Name | Type | Description 
-----|------|-------------
**name**?🔹 | <code>string</code> | Name used to qualify the CfnOutput in the Stack.<br/>__*Default*__: Set to 'defaultMessage' if not provided
**value**?🔹 | <code>string</code> | Value used in the CfnOutput in the Stack.<br/>__*Default*__: Set to 'defaultValue!' if not provided




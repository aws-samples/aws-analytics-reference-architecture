# API Reference

**Classes**

Name|Description
----|-----------
[DataLakeStorage](#aws-analytics-reference-architecture-datalakestorage)|*No description*
[Example](#aws-analytics-reference-architecture-example)|*No description*


**Structs**

Name|Description
----|-----------
[DataLakeStorageProps](#aws-analytics-reference-architecture-datalakestorageprops)|*No description*
[ExampleProps](#aws-analytics-reference-architecture-exampleprops)|*No description*



## class DataLakeStorage 🔹 <a id="aws-analytics-reference-architecture-datalakestorage"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer


Construct a new instance of DataLakeStorage based on S3 buckets with best practices configuration.

```ts
new DataLakeStorage(scope: Construct, id: string)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  the Scope of the CDK Construct.
* **id** (<code>string</code>)  the ID of the CDK Construct.



### Properties


Name | Type | Description 
-----|------|-------------
**cleanBucket**🔹 | <code>[Bucket](#aws-cdk-aws-s3-bucket)</code> | <span></span>
**rawBucket**🔹 | <code>[Bucket](#aws-cdk-aws-s3-bucket)</code> | <span></span>
**transformBucket**🔹 | <code>[Bucket](#aws-cdk-aws-s3-bucket)</code> | <span></span>



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




## struct DataLakeStorageProps 🔹 <a id="aws-analytics-reference-architecture-datalakestorageprops"></a>





## struct ExampleProps 🔹 <a id="aws-analytics-reference-architecture-exampleprops"></a>






Name | Type | Description 
-----|------|-------------
**name**?🔹 | <code>string</code> | Name used to qualify the CfnOutput in the Stack.<br/>__*Default*__: Set to 'defaultMessage' if not provided
**value**?🔹 | <code>string</code> | Value used in the CfnOutput in the Stack.<br/>__*Default*__: Set to 'defaultValue!' if not provided




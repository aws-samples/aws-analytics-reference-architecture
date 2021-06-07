# API Reference

**Classes**

Name|Description
----|-----------
[Example](#aws-analytics-reference-architecture-example)|*No description*


**Structs**

Name|Description
----|-----------
[ExampleProps](#aws-analytics-reference-architecture-exampleprops)|*No description*



## class Example 🔹 <a id="aws-analytics-reference-architecture-example"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer


Constructs a new instance of the Example class with default CfnOutput.

CfnOutput can be customized.

```ts
new Example(scope: Construct, id: string, props: ExampleProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  the Scope of the CDK Stack.
* **id** (<code>string</code>)  the ID of the CDK Stack.
* **props** (<code>[ExampleProps](#aws-analytics-reference-architecture-exampleprops)</code>)  the ExampleProps [properties]{@link ExampleProps}.
  * **name** (<code>string</code>)  Name used to qualify the CfnOutput in the Stack. __*Default*__: Set to 'defaultMessage' if not provided
  * **value** (<code>string</code>)  Value used in the CfnOutput in the Stack. __*Default*__: Set to 'defaultValue!' if not provided




## struct ExampleProps 🔹 <a id="aws-analytics-reference-architecture-exampleprops"></a>






Name | Type | Description 
-----|------|-------------
**name**?🔹 | <code>string</code> | Name used to qualify the CfnOutput in the Stack.<br/>__*Default*__: Set to 'defaultMessage' if not provided
**value**?🔹 | <code>string</code> | Value used in the CfnOutput in the Stack.<br/>__*Default*__: Set to 'defaultValue!' if not provided




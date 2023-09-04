# AWS Analytics Reference Architecture

The AWS Analytics Reference Architecture is a set of analytics solutions put together as end-to-end examples.
It regroups AWS best practices for designing, implementing, and operating analytics platforms through different purpose-built patterns, handling common requirements, and solving customers' challenges.

This project is composed of:
 * Reusable core components exposed in an AWS CDK (Cloud Development Kit) library currently available in [Typescript](https://www.npmjs.com/package/aws-analytics-reference-architecture) and [Python](https://pypi.org/project/aws-analytics-reference-architecture/). This library contains [AWS CDK constructs](https://constructs.dev/packages/aws-analytics-reference-architecture/?lang=python) that can be used to quickly provision analytics solutions in demos, prototypes, proof of concepts and end-to-end reference architectures.
 * Reference architectures consumming the reusable components to demonstrate end-to-end examples in a business context. Currently, the [AWS native reference architecture](https://aws-samples.github.io/aws-analytics-reference-architecture/) is available.

This documentation explains how to get started with the core components of the AWS Analytics Reference Architecture.

## Getting started

- [AWS Analytics Reference Architecture](#aws-analytics-reference-architecture)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Initialization (in Python)](#initialization-in-python)
    - [Development](#development)
    - [Deployment](#deployment)
    - [Cleanup](#cleanup)
  - [API Reference](#api-reference)
  - [Contributing](#contributing)
- [License Summary](#license-summary)

### Prerequisites

1. [Create an AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
2. The core components can be deployed in any AWS region
3. Install the following components with the specified version on the machine from which the deployment will be executed:
    1. Python [3.8-3.9.2] or Typescript
    2. AWS CDK v2: Please refer to the [Getting started](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) guide.
1. Bootstrap AWS CDK in your region (here **eu-west-1**). It will provision resources required to deploy AWS CDK applications

```bash
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=eu-west-1
cdk bootstrap aws://$ACCOUNT_ID/$AWS_REGION
```

### Initialization (in Python)

1. Initialize a new AWS CDK application in Python and use a virtual environment to install dependencies

```bash
mkdir my_demo
cd my_demo
cdk init app --language python
python3 -m venv .env
source .env/bin/activate
```

2. Add the AWS Analytics Reference Architecture library in the dependencies of your project. Update **requirements.txt**

```bash
aws-cdk-lib==2.51.0
constructs>=10.0.0,<11.0.0
aws_analytics_reference_architecture>=2.0.0
```
3. Install The Packages via **pip**

```bash
python -m pip install -r requirements.txt
```

### Development

1. Import the AWS Analytics Reference Architecture in your code in **my_demo/my_demo_stack.py**

```bash
import aws_analytics_reference_architecture as ara
```

2. Now you can use all the constructs available from the core components library to quickly provision resources in your AWS CDK stack. For example:

* The DataLakeStorage to provision a full set of pre-configured Amazon S3 Bucket for a data lake

```bash
        # Create a new DataLakeStorage with Raw, Clean and Transform buckets configured with data lake best practices
        storage = ara.DataLakeStorage (self,"storage")
```

* The DataLakeCatalog to provision a full set of AWS Glue databases for registring tables in your data lake

```bash
        # Create a new DataLakeCatalog with Raw, Clean and Transform databases
        catalog = ara.DataLakeCatalog (self,"catalog")
```

* The DataGenerator to generate live data in the data lake from a pre-configured retail dataset

```bash
        # Generate the Sales Data
        sales_data = ara.BatchReplayer(
            scope=self,
            id="sale-data",
            dataset=ara.PreparedDataset.RETAIL_1_GB_STORE_SALE,
            sink_object_key="sale",
            sink_bucket=storage.raw_bucket,
         )

```

```bash
        # Generate the Customer Data
        customer_data = ara.BatchReplayer(
            scope=self,
            id="customer-data",
            dataset=ara.PreparedDataset.RETAIL_1_GB_CUSTOMER,
            sink_object_key="customer",
            sink_bucket=storage.raw_bucket,
         )

```

* Additionally, the library provides some helpers to quickly run demos:

```bash
        # Configure defaults for Athena console
        athena_defaults = ara.AthenaDemoSetup(scope=self, id="demo_setup")
```

```bash
        # Configure a default role for AWS Glue jobs
        ara.GlueDemoRole.get_or_create(self)
```

### Deployment

Deploy the AWS CDK application

```bash
cdk deploy
```

The time to deploy the application is depending on the constructs you are using

### Cleanup

Delete the AWS CDK application

```bash
cdk destroy
```

## API Reference

More contructs, helpers and datasets are available in the AWS Analytics Reference Architecture. See the full API specification [here](https://constructs.dev/packages/aws-analytics-reference-architecture)

## Contributing

Please refer to the [contributing guidelines](../CONTRIBUTING.md) and [contributing FAQ](../CONTRIB_FAQ.md) for details.

# License Summary

The documentation is made available under the Creative Commons Attribution-ShareAlike 4.0 International License. See the LICENSE file.

The sample code within this documentation is made available under the MIT-0 license. See the LICENSE-SAMPLECODE file.

# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AraBucket <a name="AraBucket" id="aws-analytics-reference-architecture.AraBucket"></a>

An Amazon S3 Bucket following best practices for the AWS Analytics Reference Architecture.

The bucket name is mandatory and is used as the CDK id.
The bucket name is postfixed with the AWS account ID and the AWS region.

The bucket has the following default properties:
 * the encryption mode is KMS managed by AWS
 * if the encryption mode is KMS customer managed, the encryption key is a default and unique KMS key for ARA
 * the KMS key is used as a bucket key
 * the SSL is enforced
 * the objects are automatically deleted when the bucket is deleted
 * the access are logged in a default and unique S3 bucket for ARA if serverAccessLogsPrefix is provided
 * the access are not logged if serverAccessLogsPrefix is  not provided
 * the public access is blocked and no bucket policy or object permission can grant public access

All standard S3 Bucket properties can be provided to not use the defaults.
Usage example:
```typescript
import * as cdk from 'aws-cdk-lib';
import { AraBucket } from 'aws-analytics-reference-architecture';

const exampleApp = new cdk.App();
const stack = new cdk.Stack(exampleApp, 'AraBucketStack');

new AraBucket(stack, {
 bucketName: 'test-bucket',
 serverAccessLogsPrefix: 'test-bucket',
});
```

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.addEventNotification">addEventNotification</a></code> | Adds a bucket notification event destination. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.addObjectCreatedNotification">addObjectCreatedNotification</a></code> | Subscribes a destination to receive notifications when an object is created in the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.addObjectRemovedNotification">addObjectRemovedNotification</a></code> | Subscribes a destination to receive notifications when an object is removed from the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.addToResourcePolicy">addToResourcePolicy</a></code> | Adds a statement to the resource policy for a principal (i.e. account/role/service) to perform actions on this bucket and/or its contents. Use `bucketArn` and `arnForObjects(keys)` to obtain ARNs for this bucket or objects. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.arnForObjects">arnForObjects</a></code> | Returns an ARN that represents all objects within the bucket that match the key pattern specified. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.enableEventBridgeNotification">enableEventBridgeNotification</a></code> | Enables event bridge notification, causing all events below to be sent to EventBridge:. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.grantDelete">grantDelete</a></code> | Grants s3:DeleteObject* permission to an IAM principal for objects in this bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.grantPublicAccess">grantPublicAccess</a></code> | Allows unrestricted access to objects from this bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.grantPut">grantPut</a></code> | Grants s3:PutObject* and s3:Abort* permissions for this bucket to an IAM principal. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.grantPutAcl">grantPutAcl</a></code> | Grant the given IAM identity permissions to modify the ACLs of objects in the given Bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.grantRead">grantRead</a></code> | Grant read permissions for this bucket and it's contents to an IAM principal (Role/Group/User). |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.grantReadWrite">grantReadWrite</a></code> | Grants read/write permissions for this bucket and it's contents to an IAM principal (Role/Group/User). |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.grantWrite">grantWrite</a></code> | Grant write permissions to this bucket to an IAM principal. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.onCloudTrailEvent">onCloudTrailEvent</a></code> | Define a CloudWatch event that triggers when something happens to this repository. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.onCloudTrailPutObject">onCloudTrailPutObject</a></code> | Defines an AWS CloudWatch event that triggers when an object is uploaded to the specified paths (keys) in this bucket using the PutObject API call. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.onCloudTrailWriteObject">onCloudTrailWriteObject</a></code> | Defines an AWS CloudWatch event that triggers when an object at the specified paths (keys) in this bucket are written to. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.s3UrlForObject">s3UrlForObject</a></code> | The S3 URL of an S3 object. For example:. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.transferAccelerationUrlForObject">transferAccelerationUrlForObject</a></code> | The https Transfer Acceleration URL of an S3 object. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.urlForObject">urlForObject</a></code> | The https URL of an S3 object. Specify `regional: false` at the options for non-regional URLs. For example:. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.virtualHostedUrlForObject">virtualHostedUrlForObject</a></code> | The virtual hosted-style URL of an S3 object. Specify `regional: false` at the options for non-regional URL. For example:. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.addCorsRule">addCorsRule</a></code> | Adds a cross-origin access configuration for objects in an Amazon S3 bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.addInventory">addInventory</a></code> | Add an inventory configuration. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.addLifecycleRule">addLifecycleRule</a></code> | Add a lifecycle rule to the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.addMetric">addMetric</a></code> | Adds a metrics configuration for the CloudWatch request metrics from the bucket. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.AraBucket.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-analytics-reference-architecture.AraBucket.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.AraBucket.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addEventNotification` <a name="addEventNotification" id="aws-analytics-reference-architecture.AraBucket.addEventNotification"></a>

```typescript
public addEventNotification(event: EventType, dest: IBucketNotificationDestination, filters: NotificationKeyFilter): void
```

Adds a bucket notification event destination.

> [https://docs.aws.amazon.com/AmazonS3/latest/dev/NotificationHowTo.html](https://docs.aws.amazon.com/AmazonS3/latest/dev/NotificationHowTo.html)

*Example*

```typescript
   declare const myLambda: lambda.Function;
   const bucket = new s3.Bucket(this, 'MyBucket');
   bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(myLambda), {prefix: 'home/myusername/*'});
```


###### `event`<sup>Required</sup> <a name="event" id="aws-analytics-reference-architecture.AraBucket.addEventNotification.parameter.event"></a>

- *Type:* aws-cdk-lib.aws_s3.EventType

The event to trigger the notification.

---

###### `dest`<sup>Required</sup> <a name="dest" id="aws-analytics-reference-architecture.AraBucket.addEventNotification.parameter.dest"></a>

- *Type:* aws-cdk-lib.aws_s3.IBucketNotificationDestination

The notification destination (Lambda, SNS Topic or SQS Queue).

---

###### `filters`<sup>Required</sup> <a name="filters" id="aws-analytics-reference-architecture.AraBucket.addEventNotification.parameter.filters"></a>

- *Type:* aws-cdk-lib.aws_s3.NotificationKeyFilter

S3 object key filter rules to determine which objects trigger this event.

Each filter must include a `prefix` and/or `suffix`
that will be matched against the s3 object key. Refer to the S3 Developer Guide
for details about allowed filter rules.

---

##### `addObjectCreatedNotification` <a name="addObjectCreatedNotification" id="aws-analytics-reference-architecture.AraBucket.addObjectCreatedNotification"></a>

```typescript
public addObjectCreatedNotification(dest: IBucketNotificationDestination, filters: NotificationKeyFilter): void
```

Subscribes a destination to receive notifications when an object is created in the bucket.

This is identical to calling
`onEvent(EventType.OBJECT_CREATED)`.

###### `dest`<sup>Required</sup> <a name="dest" id="aws-analytics-reference-architecture.AraBucket.addObjectCreatedNotification.parameter.dest"></a>

- *Type:* aws-cdk-lib.aws_s3.IBucketNotificationDestination

The notification destination (see onEvent).

---

###### `filters`<sup>Required</sup> <a name="filters" id="aws-analytics-reference-architecture.AraBucket.addObjectCreatedNotification.parameter.filters"></a>

- *Type:* aws-cdk-lib.aws_s3.NotificationKeyFilter

Filters (see onEvent).

---

##### `addObjectRemovedNotification` <a name="addObjectRemovedNotification" id="aws-analytics-reference-architecture.AraBucket.addObjectRemovedNotification"></a>

```typescript
public addObjectRemovedNotification(dest: IBucketNotificationDestination, filters: NotificationKeyFilter): void
```

Subscribes a destination to receive notifications when an object is removed from the bucket.

This is identical to calling
`onEvent(EventType.OBJECT_REMOVED)`.

###### `dest`<sup>Required</sup> <a name="dest" id="aws-analytics-reference-architecture.AraBucket.addObjectRemovedNotification.parameter.dest"></a>

- *Type:* aws-cdk-lib.aws_s3.IBucketNotificationDestination

The notification destination (see onEvent).

---

###### `filters`<sup>Required</sup> <a name="filters" id="aws-analytics-reference-architecture.AraBucket.addObjectRemovedNotification.parameter.filters"></a>

- *Type:* aws-cdk-lib.aws_s3.NotificationKeyFilter

Filters (see onEvent).

---

##### `addToResourcePolicy` <a name="addToResourcePolicy" id="aws-analytics-reference-architecture.AraBucket.addToResourcePolicy"></a>

```typescript
public addToResourcePolicy(permission: PolicyStatement): AddToResourcePolicyResult
```

Adds a statement to the resource policy for a principal (i.e. account/role/service) to perform actions on this bucket and/or its contents. Use `bucketArn` and `arnForObjects(keys)` to obtain ARNs for this bucket or objects.

Note that the policy statement may or may not be added to the policy.
For example, when an `IBucket` is created from an existing bucket,
it's not possible to tell whether the bucket already has a policy
attached, let alone to re-use that policy to add more statements to it.
So it's safest to do nothing in these cases.

###### `permission`<sup>Required</sup> <a name="permission" id="aws-analytics-reference-architecture.AraBucket.addToResourcePolicy.parameter.permission"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

the policy statement to be added to the bucket's policy.

---

##### `arnForObjects` <a name="arnForObjects" id="aws-analytics-reference-architecture.AraBucket.arnForObjects"></a>

```typescript
public arnForObjects(keyPattern: string): string
```

Returns an ARN that represents all objects within the bucket that match the key pattern specified.

To represent all keys, specify ``"*"``.

If you need to specify a keyPattern with multiple components, concatenate them into a single string, e.g.:

  arnForObjects(`home/${team}/${user}/*`)

###### `keyPattern`<sup>Required</sup> <a name="keyPattern" id="aws-analytics-reference-architecture.AraBucket.arnForObjects.parameter.keyPattern"></a>

- *Type:* string

---

##### `enableEventBridgeNotification` <a name="enableEventBridgeNotification" id="aws-analytics-reference-architecture.AraBucket.enableEventBridgeNotification"></a>

```typescript
public enableEventBridgeNotification(): void
```

Enables event bridge notification, causing all events below to be sent to EventBridge:.

Object Deleted (DeleteObject)
- Object Deleted (Lifecycle expiration)
- Object Restore Initiated
- Object Restore Completed
- Object Restore Expired
- Object Storage Class Changed
- Object Access Tier Changed
- Object ACL Updated
- Object Tags Added
- Object Tags Deleted

##### `grantDelete` <a name="grantDelete" id="aws-analytics-reference-architecture.AraBucket.grantDelete"></a>

```typescript
public grantDelete(identity: IGrantable, objectsKeyPattern?: any): Grant
```

Grants s3:DeleteObject* permission to an IAM principal for objects in this bucket.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.AraBucket.grantDelete.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal.

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.AraBucket.grantDelete.parameter.objectsKeyPattern"></a>

- *Type:* any

Restrict the permission to a certain key pattern (default '*').

---

##### `grantPublicAccess` <a name="grantPublicAccess" id="aws-analytics-reference-architecture.AraBucket.grantPublicAccess"></a>

```typescript
public grantPublicAccess(allowedActions: string, keyPrefix?: string): Grant
```

Allows unrestricted access to objects from this bucket.

IMPORTANT: This permission allows anyone to perform actions on S3 objects
in this bucket, which is useful for when you configure your bucket as a
website and want everyone to be able to read objects in the bucket without
needing to authenticate.

Without arguments, this method will grant read ("s3:GetObject") access to
all objects ("*") in the bucket.

The method returns the `iam.Grant` object, which can then be modified
as needed. For example, you can add a condition that will restrict access only
to an IPv4 range like this:

    const grant = bucket.grantPublicAccess();
    grant.resourceStatement!.addCondition(‘IpAddress’, { “aws:SourceIp”: “54.240.143.0/24” });

Note that if this `IBucket` refers to an existing bucket, possibly not
managed by CloudFormation, this method will have no effect, since it's
impossible to modify the policy of an existing bucket.

###### `allowedActions`<sup>Required</sup> <a name="allowedActions" id="aws-analytics-reference-architecture.AraBucket.grantPublicAccess.parameter.allowedActions"></a>

- *Type:* string

the set of S3 actions to allow.

Default is "s3:GetObject".

---

###### `keyPrefix`<sup>Optional</sup> <a name="keyPrefix" id="aws-analytics-reference-architecture.AraBucket.grantPublicAccess.parameter.keyPrefix"></a>

- *Type:* string

the prefix of S3 object keys (e.g. `home/*`). Default is "*".

---

##### `grantPut` <a name="grantPut" id="aws-analytics-reference-architecture.AraBucket.grantPut"></a>

```typescript
public grantPut(identity: IGrantable, objectsKeyPattern?: any): Grant
```

Grants s3:PutObject* and s3:Abort* permissions for this bucket to an IAM principal.

If encryption is used, permission to use the key to encrypt the contents
of written files will also be granted to the same principal.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.AraBucket.grantPut.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal.

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.AraBucket.grantPut.parameter.objectsKeyPattern"></a>

- *Type:* any

Restrict the permission to a certain key pattern (default '*').

---

##### `grantPutAcl` <a name="grantPutAcl" id="aws-analytics-reference-architecture.AraBucket.grantPutAcl"></a>

```typescript
public grantPutAcl(identity: IGrantable, objectsKeyPattern?: string): Grant
```

Grant the given IAM identity permissions to modify the ACLs of objects in the given Bucket.

If your application has the '@aws-cdk/aws-s3:grantWriteWithoutAcl' feature flag set,
calling `grantWrite` or `grantReadWrite` no longer grants permissions to modify the ACLs of the objects;
in this case, if you need to modify object ACLs, call this method explicitly.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.AraBucket.grantPutAcl.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.AraBucket.grantPutAcl.parameter.objectsKeyPattern"></a>

- *Type:* string

---

##### `grantRead` <a name="grantRead" id="aws-analytics-reference-architecture.AraBucket.grantRead"></a>

```typescript
public grantRead(identity: IGrantable, objectsKeyPattern?: any): Grant
```

Grant read permissions for this bucket and it's contents to an IAM principal (Role/Group/User).

If encryption is used, permission to use the key to decrypt the contents
of the bucket will also be granted to the same principal.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.AraBucket.grantRead.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal.

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.AraBucket.grantRead.parameter.objectsKeyPattern"></a>

- *Type:* any

Restrict the permission to a certain key pattern (default '*').

---

##### `grantReadWrite` <a name="grantReadWrite" id="aws-analytics-reference-architecture.AraBucket.grantReadWrite"></a>

```typescript
public grantReadWrite(identity: IGrantable, objectsKeyPattern?: any): Grant
```

Grants read/write permissions for this bucket and it's contents to an IAM principal (Role/Group/User).

If an encryption key is used, permission to use the key for
encrypt/decrypt will also be granted.

Before CDK version 1.85.0, this method granted the `s3:PutObject*` permission that included `s3:PutObjectAcl`,
which could be used to grant read/write object access to IAM principals in other accounts.
If you want to get rid of that behavior, update your CDK version to 1.85.0 or later,
and make sure the `@aws-cdk/aws-s3:grantWriteWithoutAcl` feature flag is set to `true`
in the `context` key of your cdk.json file.
If you've already updated, but still need the principal to have permissions to modify the ACLs,
use the `grantPutAcl` method.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.AraBucket.grantReadWrite.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.AraBucket.grantReadWrite.parameter.objectsKeyPattern"></a>

- *Type:* any

---

##### `grantWrite` <a name="grantWrite" id="aws-analytics-reference-architecture.AraBucket.grantWrite"></a>

```typescript
public grantWrite(identity: IGrantable, objectsKeyPattern?: any, allowedActionPatterns?: string[]): Grant
```

Grant write permissions to this bucket to an IAM principal.

If encryption is used, permission to use the key to encrypt the contents
of written files will also be granted to the same principal.

Before CDK version 1.85.0, this method granted the `s3:PutObject*` permission that included `s3:PutObjectAcl`,
which could be used to grant read/write object access to IAM principals in other accounts.
If you want to get rid of that behavior, update your CDK version to 1.85.0 or later,
and make sure the `@aws-cdk/aws-s3:grantWriteWithoutAcl` feature flag is set to `true`
in the `context` key of your cdk.json file.
If you've already updated, but still need the principal to have permissions to modify the ACLs,
use the `grantPutAcl` method.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.AraBucket.grantWrite.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.AraBucket.grantWrite.parameter.objectsKeyPattern"></a>

- *Type:* any

---

###### `allowedActionPatterns`<sup>Optional</sup> <a name="allowedActionPatterns" id="aws-analytics-reference-architecture.AraBucket.grantWrite.parameter.allowedActionPatterns"></a>

- *Type:* string[]

---

##### `onCloudTrailEvent` <a name="onCloudTrailEvent" id="aws-analytics-reference-architecture.AraBucket.onCloudTrailEvent"></a>

```typescript
public onCloudTrailEvent(id: string, options?: OnCloudTrailBucketEventOptions): Rule
```

Define a CloudWatch event that triggers when something happens to this repository.

Requires that there exists at least one CloudTrail Trail in your account
that captures the event. This method will not create the Trail.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.AraBucket.onCloudTrailEvent.parameter.id"></a>

- *Type:* string

The id of the rule.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.AraBucket.onCloudTrailEvent.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_s3.OnCloudTrailBucketEventOptions

Options for adding the rule.

---

##### `onCloudTrailPutObject` <a name="onCloudTrailPutObject" id="aws-analytics-reference-architecture.AraBucket.onCloudTrailPutObject"></a>

```typescript
public onCloudTrailPutObject(id: string, options?: OnCloudTrailBucketEventOptions): Rule
```

Defines an AWS CloudWatch event that triggers when an object is uploaded to the specified paths (keys) in this bucket using the PutObject API call.

Note that some tools like `aws s3 cp` will automatically use either
PutObject or the multipart upload API depending on the file size,
so using `onCloudTrailWriteObject` may be preferable.

Requires that there exists at least one CloudTrail Trail in your account
that captures the event. This method will not create the Trail.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.AraBucket.onCloudTrailPutObject.parameter.id"></a>

- *Type:* string

The id of the rule.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.AraBucket.onCloudTrailPutObject.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_s3.OnCloudTrailBucketEventOptions

Options for adding the rule.

---

##### `onCloudTrailWriteObject` <a name="onCloudTrailWriteObject" id="aws-analytics-reference-architecture.AraBucket.onCloudTrailWriteObject"></a>

```typescript
public onCloudTrailWriteObject(id: string, options?: OnCloudTrailBucketEventOptions): Rule
```

Defines an AWS CloudWatch event that triggers when an object at the specified paths (keys) in this bucket are written to.

This includes
the events PutObject, CopyObject, and CompleteMultipartUpload.

Note that some tools like `aws s3 cp` will automatically use either
PutObject or the multipart upload API depending on the file size,
so using this method may be preferable to `onCloudTrailPutObject`.

Requires that there exists at least one CloudTrail Trail in your account
that captures the event. This method will not create the Trail.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.AraBucket.onCloudTrailWriteObject.parameter.id"></a>

- *Type:* string

The id of the rule.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.AraBucket.onCloudTrailWriteObject.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_s3.OnCloudTrailBucketEventOptions

Options for adding the rule.

---

##### `s3UrlForObject` <a name="s3UrlForObject" id="aws-analytics-reference-architecture.AraBucket.s3UrlForObject"></a>

```typescript
public s3UrlForObject(key?: string): string
```

The S3 URL of an S3 object. For example:.

`s3://onlybucket`
- `s3://bucket/key`

###### `key`<sup>Optional</sup> <a name="key" id="aws-analytics-reference-architecture.AraBucket.s3UrlForObject.parameter.key"></a>

- *Type:* string

The S3 key of the object.

If not specified, the S3 URL of the
bucket is returned.

---

##### `transferAccelerationUrlForObject` <a name="transferAccelerationUrlForObject" id="aws-analytics-reference-architecture.AraBucket.transferAccelerationUrlForObject"></a>

```typescript
public transferAccelerationUrlForObject(key?: string, options?: TransferAccelerationUrlOptions): string
```

The https Transfer Acceleration URL of an S3 object.

Specify `dualStack: true` at the options
for dual-stack endpoint (connect to the bucket over IPv6). For example:

- `https://bucket.s3-accelerate.amazonaws.com`
- `https://bucket.s3-accelerate.amazonaws.com/key`

###### `key`<sup>Optional</sup> <a name="key" id="aws-analytics-reference-architecture.AraBucket.transferAccelerationUrlForObject.parameter.key"></a>

- *Type:* string

The S3 key of the object.

If not specified, the URL of the
bucket is returned.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.AraBucket.transferAccelerationUrlForObject.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_s3.TransferAccelerationUrlOptions

Options for generating URL.

---

##### `urlForObject` <a name="urlForObject" id="aws-analytics-reference-architecture.AraBucket.urlForObject"></a>

```typescript
public urlForObject(key?: string): string
```

The https URL of an S3 object. Specify `regional: false` at the options for non-regional URLs. For example:.

`https://s3.us-west-1.amazonaws.com/onlybucket`
- `https://s3.us-west-1.amazonaws.com/bucket/key`
- `https://s3.cn-north-1.amazonaws.com.cn/china-bucket/mykey`

###### `key`<sup>Optional</sup> <a name="key" id="aws-analytics-reference-architecture.AraBucket.urlForObject.parameter.key"></a>

- *Type:* string

The S3 key of the object.

If not specified, the URL of the
bucket is returned.

---

##### `virtualHostedUrlForObject` <a name="virtualHostedUrlForObject" id="aws-analytics-reference-architecture.AraBucket.virtualHostedUrlForObject"></a>

```typescript
public virtualHostedUrlForObject(key?: string, options?: VirtualHostedStyleUrlOptions): string
```

The virtual hosted-style URL of an S3 object. Specify `regional: false` at the options for non-regional URL. For example:.

`https://only-bucket.s3.us-west-1.amazonaws.com`
- `https://bucket.s3.us-west-1.amazonaws.com/key`
- `https://bucket.s3.amazonaws.com/key`
- `https://china-bucket.s3.cn-north-1.amazonaws.com.cn/mykey`

###### `key`<sup>Optional</sup> <a name="key" id="aws-analytics-reference-architecture.AraBucket.virtualHostedUrlForObject.parameter.key"></a>

- *Type:* string

The S3 key of the object.

If not specified, the URL of the
bucket is returned.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.AraBucket.virtualHostedUrlForObject.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_s3.VirtualHostedStyleUrlOptions

Options for generating URL.

---

##### `addCorsRule` <a name="addCorsRule" id="aws-analytics-reference-architecture.AraBucket.addCorsRule"></a>

```typescript
public addCorsRule(rule: CorsRule): void
```

Adds a cross-origin access configuration for objects in an Amazon S3 bucket.

###### `rule`<sup>Required</sup> <a name="rule" id="aws-analytics-reference-architecture.AraBucket.addCorsRule.parameter.rule"></a>

- *Type:* aws-cdk-lib.aws_s3.CorsRule

The CORS configuration rule to add.

---

##### `addInventory` <a name="addInventory" id="aws-analytics-reference-architecture.AraBucket.addInventory"></a>

```typescript
public addInventory(inventory: Inventory): void
```

Add an inventory configuration.

###### `inventory`<sup>Required</sup> <a name="inventory" id="aws-analytics-reference-architecture.AraBucket.addInventory.parameter.inventory"></a>

- *Type:* aws-cdk-lib.aws_s3.Inventory

configuration to add.

---

##### `addLifecycleRule` <a name="addLifecycleRule" id="aws-analytics-reference-architecture.AraBucket.addLifecycleRule"></a>

```typescript
public addLifecycleRule(rule: LifecycleRule): void
```

Add a lifecycle rule to the bucket.

###### `rule`<sup>Required</sup> <a name="rule" id="aws-analytics-reference-architecture.AraBucket.addLifecycleRule.parameter.rule"></a>

- *Type:* aws-cdk-lib.aws_s3.LifecycleRule

The rule to add.

---

##### `addMetric` <a name="addMetric" id="aws-analytics-reference-architecture.AraBucket.addMetric"></a>

```typescript
public addMetric(metric: BucketMetrics): void
```

Adds a metrics configuration for the CloudWatch request metrics from the bucket.

###### `metric`<sup>Required</sup> <a name="metric" id="aws-analytics-reference-architecture.AraBucket.addMetric.parameter.metric"></a>

- *Type:* aws-cdk-lib.aws_s3.BucketMetrics

The metric configuration to add.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.fromBucketArn">fromBucketArn</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.fromBucketAttributes">fromBucketAttributes</a></code> | Creates a Bucket construct that represents an external bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.fromBucketName">fromBucketName</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.fromCfnBucket">fromCfnBucket</a></code> | Create a mutable `IBucket` based on a low-level `CfnBucket`. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.validateBucketName">validateBucketName</a></code> | Thrown an exception if the given bucket name is not valid. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.getOrCreate">getOrCreate</a></code> | Get the Amazon S3 Bucket from the AWS CDK Stack based on the provided name. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.AraBucket.isConstruct"></a>

```typescript
import { AraBucket } from 'aws-analytics-reference-architecture'

AraBucket.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.AraBucket.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="aws-analytics-reference-architecture.AraBucket.isOwnedResource"></a>

```typescript
import { AraBucket } from 'aws-analytics-reference-architecture'

AraBucket.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.AraBucket.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="aws-analytics-reference-architecture.AraBucket.isResource"></a>

```typescript
import { AraBucket } from 'aws-analytics-reference-architecture'

AraBucket.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.AraBucket.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromBucketArn` <a name="fromBucketArn" id="aws-analytics-reference-architecture.AraBucket.fromBucketArn"></a>

```typescript
import { AraBucket } from 'aws-analytics-reference-architecture'

AraBucket.fromBucketArn(scope: Construct, id: string, bucketArn: string)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.AraBucket.fromBucketArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.AraBucket.fromBucketArn.parameter.id"></a>

- *Type:* string

---

###### `bucketArn`<sup>Required</sup> <a name="bucketArn" id="aws-analytics-reference-architecture.AraBucket.fromBucketArn.parameter.bucketArn"></a>

- *Type:* string

---

##### `fromBucketAttributes` <a name="fromBucketAttributes" id="aws-analytics-reference-architecture.AraBucket.fromBucketAttributes"></a>

```typescript
import { AraBucket } from 'aws-analytics-reference-architecture'

AraBucket.fromBucketAttributes(scope: Construct, id: string, attrs: BucketAttributes)
```

Creates a Bucket construct that represents an external bucket.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.AraBucket.fromBucketAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.AraBucket.fromBucketAttributes.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="aws-analytics-reference-architecture.AraBucket.fromBucketAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_s3.BucketAttributes

A `BucketAttributes` object.

Can be obtained from a call to
`bucket.export()` or manually created.

---

##### `fromBucketName` <a name="fromBucketName" id="aws-analytics-reference-architecture.AraBucket.fromBucketName"></a>

```typescript
import { AraBucket } from 'aws-analytics-reference-architecture'

AraBucket.fromBucketName(scope: Construct, id: string, bucketName: string)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.AraBucket.fromBucketName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.AraBucket.fromBucketName.parameter.id"></a>

- *Type:* string

---

###### `bucketName`<sup>Required</sup> <a name="bucketName" id="aws-analytics-reference-architecture.AraBucket.fromBucketName.parameter.bucketName"></a>

- *Type:* string

---

##### `fromCfnBucket` <a name="fromCfnBucket" id="aws-analytics-reference-architecture.AraBucket.fromCfnBucket"></a>

```typescript
import { AraBucket } from 'aws-analytics-reference-architecture'

AraBucket.fromCfnBucket(cfnBucket: CfnBucket)
```

Create a mutable `IBucket` based on a low-level `CfnBucket`.

###### `cfnBucket`<sup>Required</sup> <a name="cfnBucket" id="aws-analytics-reference-architecture.AraBucket.fromCfnBucket.parameter.cfnBucket"></a>

- *Type:* aws-cdk-lib.aws_s3.CfnBucket

---

##### `validateBucketName` <a name="validateBucketName" id="aws-analytics-reference-architecture.AraBucket.validateBucketName"></a>

```typescript
import { AraBucket } from 'aws-analytics-reference-architecture'

AraBucket.validateBucketName(physicalName: string)
```

Thrown an exception if the given bucket name is not valid.

###### `physicalName`<sup>Required</sup> <a name="physicalName" id="aws-analytics-reference-architecture.AraBucket.validateBucketName.parameter.physicalName"></a>

- *Type:* string

name of the bucket.

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.AraBucket.getOrCreate"></a>

```typescript
import { AraBucket } from 'aws-analytics-reference-architecture'

AraBucket.getOrCreate(scope: Construct, props: AraBucketProps)
```

Get the Amazon S3 Bucket from the AWS CDK Stack based on the provided name.

If no bucket exists, it creates a new one based on the provided properties.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.AraBucket.getOrCreate.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.AraBucket.getOrCreate.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.AraBucketProps">AraBucketProps</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.bucketArn">bucketArn</a></code> | <code>string</code> | The ARN of the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.bucketDomainName">bucketDomainName</a></code> | <code>string</code> | The IPv4 DNS name of the specified bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.bucketDualStackDomainName">bucketDualStackDomainName</a></code> | <code>string</code> | The IPv6 DNS name of the specified bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.bucketName">bucketName</a></code> | <code>string</code> | The name of the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.bucketRegionalDomainName">bucketRegionalDomainName</a></code> | <code>string</code> | The regional domain name of the specified bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.bucketWebsiteDomainName">bucketWebsiteDomainName</a></code> | <code>string</code> | The Domain name of the static website. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.bucketWebsiteUrl">bucketWebsiteUrl</a></code> | <code>string</code> | The URL of the static website. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS encryption key associated with this bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.isWebsite">isWebsite</a></code> | <code>boolean</code> | If this bucket has been configured for static website hosting. |
| <code><a href="#aws-analytics-reference-architecture.AraBucket.property.policy">policy</a></code> | <code>aws-cdk-lib.aws_s3.BucketPolicy</code> | The resource policy associated with this bucket. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.AraBucket.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-analytics-reference-architecture.AraBucket.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="aws-analytics-reference-architecture.AraBucket.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `bucketArn`<sup>Required</sup> <a name="bucketArn" id="aws-analytics-reference-architecture.AraBucket.property.bucketArn"></a>

```typescript
public readonly bucketArn: string;
```

- *Type:* string

The ARN of the bucket.

---

##### `bucketDomainName`<sup>Required</sup> <a name="bucketDomainName" id="aws-analytics-reference-architecture.AraBucket.property.bucketDomainName"></a>

```typescript
public readonly bucketDomainName: string;
```

- *Type:* string

The IPv4 DNS name of the specified bucket.

---

##### `bucketDualStackDomainName`<sup>Required</sup> <a name="bucketDualStackDomainName" id="aws-analytics-reference-architecture.AraBucket.property.bucketDualStackDomainName"></a>

```typescript
public readonly bucketDualStackDomainName: string;
```

- *Type:* string

The IPv6 DNS name of the specified bucket.

---

##### `bucketName`<sup>Required</sup> <a name="bucketName" id="aws-analytics-reference-architecture.AraBucket.property.bucketName"></a>

```typescript
public readonly bucketName: string;
```

- *Type:* string

The name of the bucket.

---

##### `bucketRegionalDomainName`<sup>Required</sup> <a name="bucketRegionalDomainName" id="aws-analytics-reference-architecture.AraBucket.property.bucketRegionalDomainName"></a>

```typescript
public readonly bucketRegionalDomainName: string;
```

- *Type:* string

The regional domain name of the specified bucket.

---

##### `bucketWebsiteDomainName`<sup>Required</sup> <a name="bucketWebsiteDomainName" id="aws-analytics-reference-architecture.AraBucket.property.bucketWebsiteDomainName"></a>

```typescript
public readonly bucketWebsiteDomainName: string;
```

- *Type:* string

The Domain name of the static website.

---

##### `bucketWebsiteUrl`<sup>Required</sup> <a name="bucketWebsiteUrl" id="aws-analytics-reference-architecture.AraBucket.property.bucketWebsiteUrl"></a>

```typescript
public readonly bucketWebsiteUrl: string;
```

- *Type:* string

The URL of the static website.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="aws-analytics-reference-architecture.AraBucket.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS encryption key associated with this bucket.

---

##### `isWebsite`<sup>Optional</sup> <a name="isWebsite" id="aws-analytics-reference-architecture.AraBucket.property.isWebsite"></a>

```typescript
public readonly isWebsite: boolean;
```

- *Type:* boolean

If this bucket has been configured for static website hosting.

---

##### `policy`<sup>Optional</sup> <a name="policy" id="aws-analytics-reference-architecture.AraBucket.property.policy"></a>

```typescript
public readonly policy: BucketPolicy;
```

- *Type:* aws-cdk-lib.aws_s3.BucketPolicy

The resource policy associated with this bucket.

If `autoCreatePolicy` is true, a `BucketPolicy` will be created upon the
first call to addToResourcePolicy(s).

---


### AthenaDemoSetup <a name="AthenaDemoSetup" id="aws-analytics-reference-architecture.AthenaDemoSetup"></a>

AthenaDemoSetup Construct to automatically setup a new Amazon Athena Workgroup with proper configuration for out-of-the-box demo.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.AthenaDemoSetup.Initializer"></a>

```typescript
import { AthenaDemoSetup } from 'aws-analytics-reference-architecture'

new AthenaDemoSetup(scope: Construct, id: string, props: AthenaDemoSetupProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetup.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetup.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetup.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetupProps">AthenaDemoSetupProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.AthenaDemoSetup.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.AthenaDemoSetup.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.AthenaDemoSetup.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.AthenaDemoSetupProps">AthenaDemoSetupProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetup.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.AthenaDemoSetup.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetup.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.AthenaDemoSetup.isConstruct"></a>

```typescript
import { AthenaDemoSetup } from 'aws-analytics-reference-architecture'

AthenaDemoSetup.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.AthenaDemoSetup.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetup.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetup.property.athenaWorkgroup">athenaWorkgroup</a></code> | <code>aws-cdk-lib.aws_athena.CfnWorkGroup</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetup.property.resultBucket">resultBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.AthenaDemoSetup.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `athenaWorkgroup`<sup>Required</sup> <a name="athenaWorkgroup" id="aws-analytics-reference-architecture.AthenaDemoSetup.property.athenaWorkgroup"></a>

```typescript
public readonly athenaWorkgroup: CfnWorkGroup;
```

- *Type:* aws-cdk-lib.aws_athena.CfnWorkGroup

---

##### `resultBucket`<sup>Required</sup> <a name="resultBucket" id="aws-analytics-reference-architecture.AthenaDemoSetup.property.resultBucket"></a>

```typescript
public readonly resultBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---


### BatchReplayer <a name="BatchReplayer" id="aws-analytics-reference-architecture.BatchReplayer"></a>

Replay the data in the given PartitionedDataset.

It will dump files into the target based on the given `frequency`.
The computation is in a Step Function with two Lambda steps.

1. resources/lambdas/find-file-paths
Read the manifest file and output a list of S3 file paths within that batch time range

2. resources/lambdas/write-in-batch
Take a file path, filter only records within given time range, adjust the time with offset to
make it looks like just being generated. Then write the output to the target

Usage example:
```typescript

const myBucket = new Bucket(stack, "MyBucket")

let myProps: S3Sink = {
 sinkBucket: myBucket,
 sinkObjectKey: 'some-prefix',
 outputFileMaxSizeInBytes: 10000000,
}

new BatchReplayer(stack, "WebSalesReplayer", {
  dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  s3Props: myProps,
  frequency: 120,
});
```

:warning: **If the Bucket is encrypted with KMS, the Key must be managed by this stack.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.BatchReplayer.Initializer"></a>

```typescript
import { BatchReplayer } from 'aws-analytics-reference-architecture'

new BatchReplayer(scope: Construct, id: string, props: BatchReplayerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps">BatchReplayerProps</a></code> | the BatchReplayer [properties]{@link BatchReplayerProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.BatchReplayerProps">BatchReplayerProps</a>

the BatchReplayer [properties]{@link BatchReplayerProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.BatchReplayer.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.BatchReplayer.isConstruct"></a>

```typescript
import { BatchReplayer } from 'aws-analytics-reference-architecture'

BatchReplayer.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.BatchReplayer.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.dataset">dataset</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | Dataset used for replay. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.frequency">frequency</a></code> | <code>number</code> | Frequency (in Seconds) of the replaying. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.auroraProps">auroraProps</a></code> | <code><a href="#aws-analytics-reference-architecture.DbSink">DbSink</a></code> | Parameters to write to Aurora target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.ddbProps">ddbProps</a></code> | <code><a href="#aws-analytics-reference-architecture.DynamoDbSink">DynamoDbSink</a></code> | Parameters to write to DynamoDB target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.rdsProps">rdsProps</a></code> | <code><a href="#aws-analytics-reference-architecture.DbSink">DbSink</a></code> | Parameters to write to RDS target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.redshiftProps">redshiftProps</a></code> | <code><a href="#aws-analytics-reference-architecture.DbSink">DbSink</a></code> | Parameters to write to Redshift target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.s3Props">s3Props</a></code> | <code><a href="#aws-analytics-reference-architecture.S3Sink">S3Sink</a></code> | Parameters to write to S3 target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.secGroup">secGroup</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup</code> | Security group for the WriteInBatch Lambda function. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC for the WriteInBatch Lambda function. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.BatchReplayer.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `dataset`<sup>Required</sup> <a name="dataset" id="aws-analytics-reference-architecture.BatchReplayer.property.dataset"></a>

```typescript
public readonly dataset: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

Dataset used for replay.

---

##### `frequency`<sup>Required</sup> <a name="frequency" id="aws-analytics-reference-architecture.BatchReplayer.property.frequency"></a>

```typescript
public readonly frequency: number;
```

- *Type:* number

Frequency (in Seconds) of the replaying.

The batch job will start
for every given frequency and replay the data in that period

---

##### `auroraProps`<sup>Optional</sup> <a name="auroraProps" id="aws-analytics-reference-architecture.BatchReplayer.property.auroraProps"></a>

```typescript
public readonly auroraProps: DbSink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DbSink">DbSink</a>

Parameters to write to Aurora target.

---

##### `ddbProps`<sup>Optional</sup> <a name="ddbProps" id="aws-analytics-reference-architecture.BatchReplayer.property.ddbProps"></a>

```typescript
public readonly ddbProps: DynamoDbSink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DynamoDbSink">DynamoDbSink</a>

Parameters to write to DynamoDB target.

---

##### `rdsProps`<sup>Optional</sup> <a name="rdsProps" id="aws-analytics-reference-architecture.BatchReplayer.property.rdsProps"></a>

```typescript
public readonly rdsProps: DbSink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DbSink">DbSink</a>

Parameters to write to RDS target.

---

##### `redshiftProps`<sup>Optional</sup> <a name="redshiftProps" id="aws-analytics-reference-architecture.BatchReplayer.property.redshiftProps"></a>

```typescript
public readonly redshiftProps: DbSink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DbSink">DbSink</a>

Parameters to write to Redshift target.

---

##### `s3Props`<sup>Optional</sup> <a name="s3Props" id="aws-analytics-reference-architecture.BatchReplayer.property.s3Props"></a>

```typescript
public readonly s3Props: S3Sink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.S3Sink">S3Sink</a>

Parameters to write to S3 target.

---

##### `secGroup`<sup>Optional</sup> <a name="secGroup" id="aws-analytics-reference-architecture.BatchReplayer.property.secGroup"></a>

```typescript
public readonly secGroup: ISecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup

Security group for the WriteInBatch Lambda function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="aws-analytics-reference-architecture.BatchReplayer.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

VPC for the WriteInBatch Lambda function.

---


### CdkDeployer <a name="CdkDeployer" id="aws-analytics-reference-architecture.CdkDeployer"></a>

A custom CDK Stack that can be synthetized as a CloudFormation Stack to deploy a CDK application hosted on GitHub or on S3 as a Zip file.

This stack is self contained and can be one-click deployed to any AWS account.
It can be used for AWS workshop or AWS blog examples deployment when CDK is not supported/desired.
The stack supports passing the CDK application stack name to deploy (in case there are multiple stacks in the CDK app) and CDK parameters.

It contains the necessary resources to synchronously deploy a CDK application from a GitHub repository:
 * A CodeBuild project to effectively deploy the CDK application
 * A StartBuild custom resource to synchronously triggers the build using a callback pattern based on Event Bridge
 * The necessary roles and permissions

The StartBuild CFN custom resource is using the callback pattern to wait for the build completion:
 1. a Lambda function starts the build but doesn't return any value to the CFN callback URL. Instead, the callback URL is passed to the build project.
 2. the completion of the build triggers an Event and a second Lambda function which checks the result of the build and send information to the CFN callback URL

 * Usage example:
```typescript
new CdkDeployer(AwsNativeRefArchApp, 'AwsNativeRefArchDeployer', {
 githubRepository: 'aws-samples/aws-analytics-reference-architecture',
 cdkAppLocation: 'refarch/aws-native',
 cdkParameters: {
   QuickSightUsername: {
     default: 'myuser',
     type: 'String',
   },
   QuickSightIdentityRegion: {
     default: 'us-east-1',
     type: 'String',
   },
 },
});
```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.CdkDeployer.Initializer"></a>

```typescript
import { CdkDeployer } from 'aws-analytics-reference-architecture'

new CdkDeployer(scope: Construct, props: CdkDeployerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps">CdkDeployerProps</a></code> | the CdkDeployer [properties]{@link CdkDeployerProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.CdkDeployer.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.CdkDeployer.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.CdkDeployerProps">CdkDeployerProps</a>

the CdkDeployer [properties]{@link CdkDeployerProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.addDependency">addDependency</a></code> | Add a dependency between this stack and another stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.addMetadata">addMetadata</a></code> | Adds an arbitary key-value pair, with information you want to record about the stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.addTransform">addTransform</a></code> | Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.exportStringListValue">exportStringListValue</a></code> | Create a CloudFormation Export for a string list value. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.exportValue">exportValue</a></code> | Create a CloudFormation Export for a string value. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.formatArn">formatArn</a></code> | Creates an ARN from components. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.getLogicalId">getLogicalId</a></code> | Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.regionalFact">regionalFact</a></code> | Look up a fact value for the given fact for the region of this stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.renameLogicalId">renameLogicalId</a></code> | Rename a generated logical identities. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.reportMissingContextKey">reportMissingContextKey</a></code> | Indicate that a context key was expected. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.resolve">resolve</a></code> | Resolve a tokenized value in the context of the current stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.splitArn">splitArn</a></code> | Splits the provided ARN into its components. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.toJsonString">toJsonString</a></code> | Convert an object, potentially containing tokens, to a JSON string. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.toYamlString">toYamlString</a></code> | Convert an object, potentially containing tokens, to a YAML string. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.CdkDeployer.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addDependency` <a name="addDependency" id="aws-analytics-reference-architecture.CdkDeployer.addDependency"></a>

```typescript
public addDependency(target: Stack, reason?: string): void
```

Add a dependency between this stack and another stack.

This can be used to define dependencies between any two stacks within an
app, and also supports nested stacks.

###### `target`<sup>Required</sup> <a name="target" id="aws-analytics-reference-architecture.CdkDeployer.addDependency.parameter.target"></a>

- *Type:* aws-cdk-lib.Stack

---

###### `reason`<sup>Optional</sup> <a name="reason" id="aws-analytics-reference-architecture.CdkDeployer.addDependency.parameter.reason"></a>

- *Type:* string

---

##### `addMetadata` <a name="addMetadata" id="aws-analytics-reference-architecture.CdkDeployer.addMetadata"></a>

```typescript
public addMetadata(key: string, value: any): void
```

Adds an arbitary key-value pair, with information you want to record about the stack.

These get translated to the Metadata section of the generated template.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html)

###### `key`<sup>Required</sup> <a name="key" id="aws-analytics-reference-architecture.CdkDeployer.addMetadata.parameter.key"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="aws-analytics-reference-architecture.CdkDeployer.addMetadata.parameter.value"></a>

- *Type:* any

---

##### `addTransform` <a name="addTransform" id="aws-analytics-reference-architecture.CdkDeployer.addTransform"></a>

```typescript
public addTransform(transform: string): void
```

Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template.

Duplicate values are removed when stack is synthesized.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html)

*Example*

```typescript
declare const stack: Stack;

stack.addTransform('AWS::Serverless-2016-10-31')
```


###### `transform`<sup>Required</sup> <a name="transform" id="aws-analytics-reference-architecture.CdkDeployer.addTransform.parameter.transform"></a>

- *Type:* string

The transform to add.

---

##### `exportStringListValue` <a name="exportStringListValue" id="aws-analytics-reference-architecture.CdkDeployer.exportStringListValue"></a>

```typescript
public exportStringListValue(exportedValue: any, options?: ExportValueOptions): string[]
```

Create a CloudFormation Export for a string list value.

Returns a string list representing the corresponding `Fn.importValue()`
expression for this Export. The export expression is automatically wrapped with an
`Fn::Join` and the import value with an `Fn::Split`, since CloudFormation can only
export strings. You can control the name for the export by passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

See `exportValue` for an example of this process.

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="aws-analytics-reference-architecture.CdkDeployer.exportStringListValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.CdkDeployer.exportStringListValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `exportValue` <a name="exportValue" id="aws-analytics-reference-architecture.CdkDeployer.exportValue"></a>

```typescript
public exportValue(exportedValue: any, options?: ExportValueOptions): string
```

Create a CloudFormation Export for a string value.

Returns a string representing the corresponding `Fn.importValue()`
expression for this Export. You can control the name for the export by
passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

## Example

Here is how the process works. Let's say there are two stacks,
`producerStack` and `consumerStack`, and `producerStack` has a bucket
called `bucket`, which is referenced by `consumerStack` (perhaps because
an AWS Lambda Function writes into it, or something like that).

It is not safe to remove `producerStack.bucket` because as the bucket is being
deleted, `consumerStack` might still be using it.

Instead, the process takes two deployments:

### Deployment 1: break the relationship

- Make sure `consumerStack` no longer references `bucket.bucketName` (maybe the consumer
  stack now uses its own bucket, or it writes to an AWS DynamoDB table, or maybe you just
  remove the Lambda Function altogether).
- In the `ProducerStack` class, call `this.exportValue(this.bucket.bucketName)`. This
  will make sure the CloudFormation Export continues to exist while the relationship
  between the two stacks is being broken.
- Deploy (this will effectively only change the `consumerStack`, but it's safe to deploy both).

### Deployment 2: remove the bucket resource

- You are now free to remove the `bucket` resource from `producerStack`.
- Don't forget to remove the `exportValue()` call as well.
- Deploy again (this time only the `producerStack` will be changed -- the bucket will be deleted).

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="aws-analytics-reference-architecture.CdkDeployer.exportValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.CdkDeployer.exportValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `formatArn` <a name="formatArn" id="aws-analytics-reference-architecture.CdkDeployer.formatArn"></a>

```typescript
public formatArn(components: ArnComponents): string
```

Creates an ARN from components.

If `partition`, `region` or `account` are not specified, the stack's
partition, region and account will be used.

If any component is the empty string, an empty string will be inserted
into the generated ARN at the location that component corresponds to.

The ARN will be formatted as follows:

  arn:{partition}:{service}:{region}:{account}:{resource}{sep}{resource-name}

The required ARN pieces that are omitted will be taken from the stack that
the 'scope' is attached to. If all ARN pieces are supplied, the supplied scope
can be 'undefined'.

###### `components`<sup>Required</sup> <a name="components" id="aws-analytics-reference-architecture.CdkDeployer.formatArn.parameter.components"></a>

- *Type:* aws-cdk-lib.ArnComponents

---

##### `getLogicalId` <a name="getLogicalId" id="aws-analytics-reference-architecture.CdkDeployer.getLogicalId"></a>

```typescript
public getLogicalId(element: CfnElement): string
```

Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource.

This method is called when a `CfnElement` is created and used to render the
initial logical identity of resources. Logical ID renames are applied at
this stage.

This method uses the protected method `allocateLogicalId` to render the
logical ID for an element. To modify the naming scheme, extend the `Stack`
class and override this method.

###### `element`<sup>Required</sup> <a name="element" id="aws-analytics-reference-architecture.CdkDeployer.getLogicalId.parameter.element"></a>

- *Type:* aws-cdk-lib.CfnElement

The CloudFormation element for which a logical identity is needed.

---

##### `regionalFact` <a name="regionalFact" id="aws-analytics-reference-architecture.CdkDeployer.regionalFact"></a>

```typescript
public regionalFact(factName: string, defaultValue?: string): string
```

Look up a fact value for the given fact for the region of this stack.

Will return a definite value only if the region of the current stack is resolved.
If not, a lookup map will be added to the stack and the lookup will be done at
CDK deployment time.

What regions will be included in the lookup map is controlled by the
`@aws-cdk/core:target-partitions` context value: it must be set to a list
of partitions, and only regions from the given partitions will be included.
If no such context key is set, all regions will be included.

This function is intended to be used by construct library authors. Application
builders can rely on the abstractions offered by construct libraries and do
not have to worry about regional facts.

If `defaultValue` is not given, it is an error if the fact is unknown for
the given region.

###### `factName`<sup>Required</sup> <a name="factName" id="aws-analytics-reference-architecture.CdkDeployer.regionalFact.parameter.factName"></a>

- *Type:* string

---

###### `defaultValue`<sup>Optional</sup> <a name="defaultValue" id="aws-analytics-reference-architecture.CdkDeployer.regionalFact.parameter.defaultValue"></a>

- *Type:* string

---

##### `renameLogicalId` <a name="renameLogicalId" id="aws-analytics-reference-architecture.CdkDeployer.renameLogicalId"></a>

```typescript
public renameLogicalId(oldId: string, newId: string): void
```

Rename a generated logical identities.

To modify the naming scheme strategy, extend the `Stack` class and
override the `allocateLogicalId` method.

###### `oldId`<sup>Required</sup> <a name="oldId" id="aws-analytics-reference-architecture.CdkDeployer.renameLogicalId.parameter.oldId"></a>

- *Type:* string

---

###### `newId`<sup>Required</sup> <a name="newId" id="aws-analytics-reference-architecture.CdkDeployer.renameLogicalId.parameter.newId"></a>

- *Type:* string

---

##### `reportMissingContextKey` <a name="reportMissingContextKey" id="aws-analytics-reference-architecture.CdkDeployer.reportMissingContextKey"></a>

```typescript
public reportMissingContextKey(report: MissingContext): void
```

Indicate that a context key was expected.

Contains instructions which will be emitted into the cloud assembly on how
the key should be supplied.

###### `report`<sup>Required</sup> <a name="report" id="aws-analytics-reference-architecture.CdkDeployer.reportMissingContextKey.parameter.report"></a>

- *Type:* aws-cdk-lib.cloud_assembly_schema.MissingContext

The set of parameters needed to obtain the context.

---

##### `resolve` <a name="resolve" id="aws-analytics-reference-architecture.CdkDeployer.resolve"></a>

```typescript
public resolve(obj: any): any
```

Resolve a tokenized value in the context of the current stack.

###### `obj`<sup>Required</sup> <a name="obj" id="aws-analytics-reference-architecture.CdkDeployer.resolve.parameter.obj"></a>

- *Type:* any

---

##### `splitArn` <a name="splitArn" id="aws-analytics-reference-architecture.CdkDeployer.splitArn"></a>

```typescript
public splitArn(arn: string, arnFormat: ArnFormat): ArnComponents
```

Splits the provided ARN into its components.

Works both if 'arn' is a string like 'arn:aws:s3:::bucket',
and a Token representing a dynamic CloudFormation expression
(in which case the returned components will also be dynamic CloudFormation expressions,
encoded as Tokens).

###### `arn`<sup>Required</sup> <a name="arn" id="aws-analytics-reference-architecture.CdkDeployer.splitArn.parameter.arn"></a>

- *Type:* string

the ARN to split into its components.

---

###### `arnFormat`<sup>Required</sup> <a name="arnFormat" id="aws-analytics-reference-architecture.CdkDeployer.splitArn.parameter.arnFormat"></a>

- *Type:* aws-cdk-lib.ArnFormat

the expected format of 'arn' - depends on what format the service 'arn' represents uses.

---

##### `toJsonString` <a name="toJsonString" id="aws-analytics-reference-architecture.CdkDeployer.toJsonString"></a>

```typescript
public toJsonString(obj: any, space?: number): string
```

Convert an object, potentially containing tokens, to a JSON string.

###### `obj`<sup>Required</sup> <a name="obj" id="aws-analytics-reference-architecture.CdkDeployer.toJsonString.parameter.obj"></a>

- *Type:* any

---

###### `space`<sup>Optional</sup> <a name="space" id="aws-analytics-reference-architecture.CdkDeployer.toJsonString.parameter.space"></a>

- *Type:* number

---

##### `toYamlString` <a name="toYamlString" id="aws-analytics-reference-architecture.CdkDeployer.toYamlString"></a>

```typescript
public toYamlString(obj: any): string
```

Convert an object, potentially containing tokens, to a YAML string.

###### `obj`<sup>Required</sup> <a name="obj" id="aws-analytics-reference-architecture.CdkDeployer.toYamlString.parameter.obj"></a>

- *Type:* any

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.isStack">isStack</a></code> | Return whether the given object is a Stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.of">of</a></code> | Looks up the first stack scope in which `construct` is defined. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.CdkDeployer.isConstruct"></a>

```typescript
import { CdkDeployer } from 'aws-analytics-reference-architecture'

CdkDeployer.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.CdkDeployer.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isStack` <a name="isStack" id="aws-analytics-reference-architecture.CdkDeployer.isStack"></a>

```typescript
import { CdkDeployer } from 'aws-analytics-reference-architecture'

CdkDeployer.isStack(x: any)
```

Return whether the given object is a Stack.

We do attribute detection since we can't reliably use 'instanceof'.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.CdkDeployer.isStack.parameter.x"></a>

- *Type:* any

---

##### `of` <a name="of" id="aws-analytics-reference-architecture.CdkDeployer.of"></a>

```typescript
import { CdkDeployer } from 'aws-analytics-reference-architecture'

CdkDeployer.of(construct: IConstruct)
```

Looks up the first stack scope in which `construct` is defined.

Fails if there is no stack up the tree.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.CdkDeployer.of.parameter.construct"></a>

- *Type:* constructs.IConstruct

The construct to start the search from.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.account">account</a></code> | <code>string</code> | The AWS account into which this stack will be deployed. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.artifactId">artifactId</a></code> | <code>string</code> | The ID of the cloud assembly artifact for this stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.availabilityZones">availabilityZones</a></code> | <code>string[]</code> | Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.bundlingRequired">bundlingRequired</a></code> | <code>boolean</code> | Indicates whether the stack requires bundling or not. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.dependencies">dependencies</a></code> | <code>aws-cdk-lib.Stack[]</code> | Return the stacks this stack depends on. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.environment">environment</a></code> | <code>string</code> | The environment coordinates in which this stack is deployed. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.nested">nested</a></code> | <code>boolean</code> | Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.notificationArns">notificationArns</a></code> | <code>string[]</code> | Returns the list of notification Amazon Resource Names (ARNs) for the current stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.partition">partition</a></code> | <code>string</code> | The partition in which this stack is defined. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.region">region</a></code> | <code>string</code> | The AWS region into which this stack will be deployed (e.g. `us-west-2`). |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.stackId">stackId</a></code> | <code>string</code> | The ID of the stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.stackName">stackName</a></code> | <code>string</code> | The concrete CloudFormation physical stack name. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method for this stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.tags">tags</a></code> | <code>aws-cdk-lib.TagManager</code> | Tags to be applied to the stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.templateFile">templateFile</a></code> | <code>string</code> | The name of the CloudFormation template file emitted to the output directory during synthesis. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.templateOptions">templateOptions</a></code> | <code>aws-cdk-lib.ITemplateOptions</code> | Options for CloudFormation template (like version, transform, description). |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.urlSuffix">urlSuffix</a></code> | <code>string</code> | The Amazon domain suffix for the region in which this stack is defined. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.nestedStackParent">nestedStackParent</a></code> | <code>aws-cdk-lib.Stack</code> | If this is a nested stack, returns it's parent stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.nestedStackResource">nestedStackResource</a></code> | <code>aws-cdk-lib.CfnResource</code> | If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether termination protection is enabled for this stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployer.property.deployResult">deployResult</a></code> | <code>string</code> | The result of the deloyment. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.CdkDeployer.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `account`<sup>Required</sup> <a name="account" id="aws-analytics-reference-architecture.CdkDeployer.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

The AWS account into which this stack will be deployed.

This value is resolved according to the following rules:

1. The value provided to `env.account` when the stack is defined. This can
   either be a concrete account (e.g. `585695031111`) or the
   `Aws.ACCOUNT_ID` token.
3. `Aws.ACCOUNT_ID`, which represents the CloudFormation intrinsic reference
   `{ "Ref": "AWS::AccountId" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concrete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.account)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **account-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `artifactId`<sup>Required</sup> <a name="artifactId" id="aws-analytics-reference-architecture.CdkDeployer.property.artifactId"></a>

```typescript
public readonly artifactId: string;
```

- *Type:* string

The ID of the cloud assembly artifact for this stack.

---

##### `availabilityZones`<sup>Required</sup> <a name="availabilityZones" id="aws-analytics-reference-architecture.CdkDeployer.property.availabilityZones"></a>

```typescript
public readonly availabilityZones: string[];
```

- *Type:* string[]

Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack.

If the stack is environment-agnostic (either account and/or region are
tokens), this property will return an array with 2 tokens that will resolve
at deploy-time to the first two availability zones returned from CloudFormation's
`Fn::GetAZs` intrinsic function.

If they are not available in the context, returns a set of dummy values and
reports them as missing, and let the CLI resolve them by calling EC2
`DescribeAvailabilityZones` on the target environment.

To specify a different strategy for selecting availability zones override this method.

---

##### `bundlingRequired`<sup>Required</sup> <a name="bundlingRequired" id="aws-analytics-reference-architecture.CdkDeployer.property.bundlingRequired"></a>

```typescript
public readonly bundlingRequired: boolean;
```

- *Type:* boolean

Indicates whether the stack requires bundling or not.

---

##### `dependencies`<sup>Required</sup> <a name="dependencies" id="aws-analytics-reference-architecture.CdkDeployer.property.dependencies"></a>

```typescript
public readonly dependencies: Stack[];
```

- *Type:* aws-cdk-lib.Stack[]

Return the stacks this stack depends on.

---

##### `environment`<sup>Required</sup> <a name="environment" id="aws-analytics-reference-architecture.CdkDeployer.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

The environment coordinates in which this stack is deployed.

In the form
`aws://account/region`. Use `stack.account` and `stack.region` to obtain
the specific values, no need to parse.

You can use this value to determine if two stacks are targeting the same
environment.

If either `stack.account` or `stack.region` are not concrete values (e.g.
`Aws.ACCOUNT_ID` or `Aws.REGION`) the special strings `unknown-account` and/or
`unknown-region` will be used respectively to indicate this stack is
region/account-agnostic.

---

##### `nested`<sup>Required</sup> <a name="nested" id="aws-analytics-reference-architecture.CdkDeployer.property.nested"></a>

```typescript
public readonly nested: boolean;
```

- *Type:* boolean

Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent.

---

##### `notificationArns`<sup>Required</sup> <a name="notificationArns" id="aws-analytics-reference-architecture.CdkDeployer.property.notificationArns"></a>

```typescript
public readonly notificationArns: string[];
```

- *Type:* string[]

Returns the list of notification Amazon Resource Names (ARNs) for the current stack.

---

##### `partition`<sup>Required</sup> <a name="partition" id="aws-analytics-reference-architecture.CdkDeployer.property.partition"></a>

```typescript
public readonly partition: string;
```

- *Type:* string

The partition in which this stack is defined.

---

##### `region`<sup>Required</sup> <a name="region" id="aws-analytics-reference-architecture.CdkDeployer.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

The AWS region into which this stack will be deployed (e.g. `us-west-2`).

This value is resolved according to the following rules:

1. The value provided to `env.region` when the stack is defined. This can
   either be a concrete region (e.g. `us-west-2`) or the `Aws.REGION`
   token.
3. `Aws.REGION`, which is represents the CloudFormation intrinsic reference
   `{ "Ref": "AWS::Region" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concrete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.region)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **region-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `stackId`<sup>Required</sup> <a name="stackId" id="aws-analytics-reference-architecture.CdkDeployer.property.stackId"></a>

```typescript
public readonly stackId: string;
```

- *Type:* string

The ID of the stack.

---

*Example*

```typescript
// After resolving, looks like
'arn:aws:cloudformation:us-west-2:123456789012:stack/teststack/51af3dc0-da77-11e4-872e-1234567db123'
```


##### `stackName`<sup>Required</sup> <a name="stackName" id="aws-analytics-reference-architecture.CdkDeployer.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string

The concrete CloudFormation physical stack name.

This is either the name defined explicitly in the `stackName` prop or
allocated based on the stack's location in the construct tree. Stacks that
are directly defined under the app use their construct `id` as their stack
name. Stacks that are defined deeper within the tree will use a hashed naming
scheme based on the construct path to ensure uniqueness.

If you wish to obtain the deploy-time AWS::StackName intrinsic,
you can use `Aws.STACK_NAME` directly.

---

##### `synthesizer`<sup>Required</sup> <a name="synthesizer" id="aws-analytics-reference-architecture.CdkDeployer.property.synthesizer"></a>

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer

Synthesis method for this stack.

---

##### `tags`<sup>Required</sup> <a name="tags" id="aws-analytics-reference-architecture.CdkDeployer.property.tags"></a>

```typescript
public readonly tags: TagManager;
```

- *Type:* aws-cdk-lib.TagManager

Tags to be applied to the stack.

---

##### `templateFile`<sup>Required</sup> <a name="templateFile" id="aws-analytics-reference-architecture.CdkDeployer.property.templateFile"></a>

```typescript
public readonly templateFile: string;
```

- *Type:* string

The name of the CloudFormation template file emitted to the output directory during synthesis.

Example value: `MyStack.template.json`

---

##### `templateOptions`<sup>Required</sup> <a name="templateOptions" id="aws-analytics-reference-architecture.CdkDeployer.property.templateOptions"></a>

```typescript
public readonly templateOptions: ITemplateOptions;
```

- *Type:* aws-cdk-lib.ITemplateOptions

Options for CloudFormation template (like version, transform, description).

---

##### `urlSuffix`<sup>Required</sup> <a name="urlSuffix" id="aws-analytics-reference-architecture.CdkDeployer.property.urlSuffix"></a>

```typescript
public readonly urlSuffix: string;
```

- *Type:* string

The Amazon domain suffix for the region in which this stack is defined.

---

##### `nestedStackParent`<sup>Optional</sup> <a name="nestedStackParent" id="aws-analytics-reference-architecture.CdkDeployer.property.nestedStackParent"></a>

```typescript
public readonly nestedStackParent: Stack;
```

- *Type:* aws-cdk-lib.Stack

If this is a nested stack, returns it's parent stack.

---

##### `nestedStackResource`<sup>Optional</sup> <a name="nestedStackResource" id="aws-analytics-reference-architecture.CdkDeployer.property.nestedStackResource"></a>

```typescript
public readonly nestedStackResource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource.

`undefined` for top-level (non-nested) stacks.

---

##### `terminationProtection`<sup>Optional</sup> <a name="terminationProtection" id="aws-analytics-reference-architecture.CdkDeployer.property.terminationProtection"></a>

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean

Whether termination protection is enabled for this stack.

---

##### `deployResult`<sup>Required</sup> <a name="deployResult" id="aws-analytics-reference-architecture.CdkDeployer.property.deployResult"></a>

```typescript
public readonly deployResult: string;
```

- *Type:* string

The result of the deloyment.

---


### CentralGovernance <a name="CentralGovernance" id="aws-analytics-reference-architecture.CentralGovernance"></a>

This CDK Construct creates a Data Product registration workflow and resources for the Central Governance account.

It uses AWS Step Functions state machine to orchestrate the workflow:
* creates tables in AWS Glue Data Catalog
* shares tables to Data Product owner account (Producer)

This construct also creates an Amazon EventBridge Event Bus to enable communication with Data Domain accounts (Producer/Consumer).

This construct requires to use the default [CDK qualifier](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) generated with the standard CDK bootstrap stack.
It ensures the right CDK execution role is used and granted Lake Formation administrator permissions so CDK can create Glue databases when registring a DataDomain.

To register a DataDomain, the following information are required:
* The account Id of the DataDomain
* The secret ARN for the domain configuration available as a CloudFormation output when creating a {@link DataDomain}

Usage example:
```typescript
import { App, Stack } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';
import { CentralGovernance, LfTag } from 'aws-analytics-reference-architecture';

const exampleApp = new App();
const stack = new Stack(exampleApp, 'CentralGovStack');

const tags: LfTag[] = [{key: 'tag1': values:['LfTagValue1', 'LfTagValue2']}]
const governance = new CentralGovernance(stack, 'myCentralGov', { tags });

governance.registerDataDomain('Domain1', 'domain1Name', <DOMAIN_CONFIG_SECRET_ARN>);
```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.CentralGovernance.Initializer"></a>

```typescript
import { CentralGovernance } from 'aws-analytics-reference-architecture'

new CentralGovernance(scope: Construct, id: string, props?: CentralGovernanceProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.CentralGovernanceProps">CentralGovernanceProps</a></code> | the CentralGovernance properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.CentralGovernance.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.CentralGovernance.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Optional</sup> <a name="props" id="aws-analytics-reference-architecture.CentralGovernance.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.CentralGovernanceProps">CentralGovernanceProps</a>

the CentralGovernance properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.registerDataDomain">registerDataDomain</a></code> | Registers a new Data Domain account in Central Governance account. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.CentralGovernance.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `registerDataDomain` <a name="registerDataDomain" id="aws-analytics-reference-architecture.CentralGovernance.registerDataDomain"></a>

```typescript
public registerDataDomain(id: string, domainId: string, domainName: string, domainSecretArn: string, lfAccessControlMode?: LfAccessControlMode): void
```

Registers a new Data Domain account in Central Governance account.

Each Data Domain account {@link DataDomain} has to be registered in Central Gov. account before it can participate in a mesh.

It creates:
* A cross-account policy for Amazon EventBridge Event Bus to enable Data Domain to send events to Central Gov. account
* A Lake Formation data access role scoped down to the data domain products bucket
* A Glue Catalog Database to hold Data Products for this Data Domain
* A Rule to forward events to target Data Domain account.

Object references are passed from the DataDomain account to the CentralGovernance account via a AWS Secret Manager secret and cross account access.
It includes the following JSON object:
```json
{
  BucketName: 'clean-<ACCOUNT_ID>-<REGION>',
  Prefix: 'data-products',
  KmsKeyId: '<KMS_ID>,
}
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.CentralGovernance.registerDataDomain.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

###### `domainId`<sup>Required</sup> <a name="domainId" id="aws-analytics-reference-architecture.CentralGovernance.registerDataDomain.parameter.domainId"></a>

- *Type:* string

the account ID of the DataDomain to register.

---

###### `domainName`<sup>Required</sup> <a name="domainName" id="aws-analytics-reference-architecture.CentralGovernance.registerDataDomain.parameter.domainName"></a>

- *Type:* string

the name of the DataDomain, i.e. Line of Business name.

---

###### `domainSecretArn`<sup>Required</sup> <a name="domainSecretArn" id="aws-analytics-reference-architecture.CentralGovernance.registerDataDomain.parameter.domainSecretArn"></a>

- *Type:* string

the full ARN of the secret used by producers to share references with the central governance.

---

###### `lfAccessControlMode`<sup>Optional</sup> <a name="lfAccessControlMode" id="aws-analytics-reference-architecture.CentralGovernance.registerDataDomain.parameter.lfAccessControlMode"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.LfAccessControlMode">LfAccessControlMode</a>

Lake Formation Access Control mode for the DataDomain.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.CentralGovernance.isConstruct"></a>

```typescript
import { CentralGovernance } from 'aws-analytics-reference-architecture'

CentralGovernance.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.CentralGovernance.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.property.eventBus">eventBus</a></code> | <code>aws-cdk-lib.aws_events.IEventBus</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.property.workflowRole">workflowRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.CentralGovernance.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `eventBus`<sup>Required</sup> <a name="eventBus" id="aws-analytics-reference-architecture.CentralGovernance.property.eventBus"></a>

```typescript
public readonly eventBus: IEventBus;
```

- *Type:* aws-cdk-lib.aws_events.IEventBus

---

##### `workflowRole`<sup>Required</sup> <a name="workflowRole" id="aws-analytics-reference-architecture.CentralGovernance.property.workflowRole"></a>

```typescript
public readonly workflowRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.property.CENTRAL_BUS_NAME">CENTRAL_BUS_NAME</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.property.DOMAIN_DATABASE_PREFIX">DOMAIN_DATABASE_PREFIX</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernance.property.DOMAIN_TAG_KEY">DOMAIN_TAG_KEY</a></code> | <code>string</code> | *No description.* |

---

##### `CENTRAL_BUS_NAME`<sup>Required</sup> <a name="CENTRAL_BUS_NAME" id="aws-analytics-reference-architecture.CentralGovernance.property.CENTRAL_BUS_NAME"></a>

```typescript
public readonly CENTRAL_BUS_NAME: string;
```

- *Type:* string

---

##### `DOMAIN_DATABASE_PREFIX`<sup>Required</sup> <a name="DOMAIN_DATABASE_PREFIX" id="aws-analytics-reference-architecture.CentralGovernance.property.DOMAIN_DATABASE_PREFIX"></a>

```typescript
public readonly DOMAIN_DATABASE_PREFIX: string;
```

- *Type:* string

---

##### `DOMAIN_TAG_KEY`<sup>Required</sup> <a name="DOMAIN_TAG_KEY" id="aws-analytics-reference-architecture.CentralGovernance.property.DOMAIN_TAG_KEY"></a>

```typescript
public readonly DOMAIN_TAG_KEY: string;
```

- *Type:* string

---

### CustomDataset <a name="CustomDataset" id="aws-analytics-reference-architecture.CustomDataset"></a>

A CustomDataset is a dataset that you need to prepare for the [BatchReplayer](@link BatchReplayer) to generate data.

The dataset is transformed into a [PreparedDataset](@link PreparedDataset) by a Glue Job that runs synchronously during the CDK deploy.
The Glue job is sized based on the approximate size of the input data or uses autoscaling (max 100) if no data size is provided.

The Glue job is applying the following transformations to the input dataset:
1. Read the input dataset based on its format. Currently, it supports data in CSV, JSON and Parquet
2. Group rows into tumbling windows based on the partition range parameter provided. 
The partition range should be adapted to the data volume and the total dataset time range
3. Convert dates from MM-dd-yyyy HH:mm:ss.SSS to MM-dd-yyyyTHH:mm:ss.SSSZ format and remove null values
4. Write data into the output bucket partitioned by the tumbling window time. 
For example, one partition for every 5 minutes. 
5. Generate a manifest file based on the previous output to be used by the BatchReplayer for generating data

The CloudWatch log group is stored as an object parameter to help check any error with the Glue job.

Usage example:
```typescript
import { CustomDataset, CustomDatasetInputFormat } from './data-generator/custom-dataset';

const app = new App();
const stack = new Stack(app, 'CustomDatasetStack');

const custom = new CustomDataset(stack, 'CustomDataset', {
  s3Location: {
    bucketName: 'aws-analytics-reference-architecture',
    objectKey: 'datasets/custom',
  },
  inputFormat: CustomDatasetInputFormat.CSV,
  datetimeColumn: 'tpep_pickup_datetime',
  datetimeColumnsToAdjust: ['tpep_pickup_datetime'],
  partitionRange: Duration.minutes(5),
  approximateDataSize: 1,
});

new CfnOutput(this, 'LogGroupName', {
  exportName: 'logGroupName,
  value: custom.glueJobLogGroup,
});
```

An example of a custom dataset that can be processed by this construct is available in s3://aws-analytics-reference-architecture/datasets/custom

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.CustomDataset.Initializer"></a>

```typescript
import { CustomDataset } from 'aws-analytics-reference-architecture'

new CustomDataset(scope: Construct, id: string, props: CustomDatasetProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CustomDataset.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.CustomDataset.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.CustomDataset.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.CustomDatasetProps">CustomDatasetProps</a></code> | the CustomDataset [properties]{@link CustomDatasetProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.CustomDataset.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.CustomDataset.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.CustomDataset.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.CustomDatasetProps">CustomDatasetProps</a>

the CustomDataset [properties]{@link CustomDatasetProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CustomDataset.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.CustomDataset.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CustomDataset.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.CustomDataset.isConstruct"></a>

```typescript
import { CustomDataset } from 'aws-analytics-reference-architecture'

CustomDataset.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.CustomDataset.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CustomDataset.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.CustomDataset.property.glueJobLogGroup">glueJobLogGroup</a></code> | <code>string</code> | The location of the logs to analyze potential errors in the Glue job. |
| <code><a href="#aws-analytics-reference-architecture.CustomDataset.property.preparedDataset">preparedDataset</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The prepared dataset generated from the custom dataset. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.CustomDataset.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `glueJobLogGroup`<sup>Required</sup> <a name="glueJobLogGroup" id="aws-analytics-reference-architecture.CustomDataset.property.glueJobLogGroup"></a>

```typescript
public readonly glueJobLogGroup: string;
```

- *Type:* string

The location of the logs to analyze potential errors in the Glue job.

---

##### `preparedDataset`<sup>Required</sup> <a name="preparedDataset" id="aws-analytics-reference-architecture.CustomDataset.property.preparedDataset"></a>

```typescript
public readonly preparedDataset: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The prepared dataset generated from the custom dataset.

---


### DataDomain <a name="DataDomain" id="aws-analytics-reference-architecture.DataDomain"></a>

This CDK Construct creates all required resources for data mesh in Data Domain account.

It creates the following:
* A data lake with multiple layers (Raw, Cleaned, Transformed) using {@link DataLakeStorage} construct
* An mazon EventBridge Event Bus and Rules to enable Central Governance account to send events to Data Domain account
* An AWS Secret Manager secret encrypted via AWS KMS and used to share references with the central governance account
* A Data Domain Workflow {@link DataDomainWorkflow } responsible for creating resources in the data domain via a Step Functions state machine
* An optional Crawler workflow {@link DataDomainCrawler} responsible for updating the data product schema after registration via a Step Functions state machine

Usage example:
```typescript
import { App, Stack } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';
import { DataDomain } from 'aws-analytics-reference-architecture';

const exampleApp = new App();
const stack = new Stack(exampleApp, 'DataProductStack');

new DataDomain(stack, 'myDataDomain', {
 centralAccountId: '1234567891011',
 crawlerWorkflow: true,
 domainName: 'domainName'
});
```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.DataDomain.Initializer"></a>

```typescript
import { DataDomain } from 'aws-analytics-reference-architecture'

new DataDomain(scope: Construct, id: string, props: DataDomainProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.DataDomainProps">DataDomainProps</a></code> | the DataDomainProps properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.DataDomain.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.DataDomain.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.DataDomain.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.DataDomainProps">DataDomainProps</a>

the DataDomainProps properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.addBusRule">addBusRule</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.DataDomain.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addBusRule` <a name="addBusRule" id="aws-analytics-reference-architecture.DataDomain.addBusRule"></a>

```typescript
public addBusRule(id: string, mode: LfAccessControlMode, workflow: StateMachine): void
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.DataDomain.addBusRule.parameter.id"></a>

- *Type:* string

---

###### `mode`<sup>Required</sup> <a name="mode" id="aws-analytics-reference-architecture.DataDomain.addBusRule.parameter.mode"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.LfAccessControlMode">LfAccessControlMode</a>

---

###### `workflow`<sup>Required</sup> <a name="workflow" id="aws-analytics-reference-architecture.DataDomain.addBusRule.parameter.workflow"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.DataDomain.isConstruct"></a>

```typescript
import { DataDomain } from 'aws-analytics-reference-architecture'

DataDomain.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.DataDomain.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.property.centralAccountId">centralAccountId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.property.dataLake">dataLake</a></code> | <code><a href="#aws-analytics-reference-architecture.DataLakeStorage">DataLakeStorage</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.property.eventBus">eventBus</a></code> | <code>aws-cdk-lib.aws_events.EventBus</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.DataDomain.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `centralAccountId`<sup>Required</sup> <a name="centralAccountId" id="aws-analytics-reference-architecture.DataDomain.property.centralAccountId"></a>

```typescript
public readonly centralAccountId: string;
```

- *Type:* string

---

##### `dataLake`<sup>Required</sup> <a name="dataLake" id="aws-analytics-reference-architecture.DataDomain.property.dataLake"></a>

```typescript
public readonly dataLake: DataLakeStorage;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DataLakeStorage">DataLakeStorage</a>

---

##### `eventBus`<sup>Required</sup> <a name="eventBus" id="aws-analytics-reference-architecture.DataDomain.property.eventBus"></a>

```typescript
public readonly eventBus: EventBus;
```

- *Type:* aws-cdk-lib.aws_events.EventBus

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.property.DATA_PRODUCTS_PREFIX">DATA_PRODUCTS_PREFIX</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.property.DOMAIN_BUS_NAME">DOMAIN_BUS_NAME</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataDomain.property.DOMAIN_CONFIG_SECRET">DOMAIN_CONFIG_SECRET</a></code> | <code>string</code> | *No description.* |

---

##### `DATA_PRODUCTS_PREFIX`<sup>Required</sup> <a name="DATA_PRODUCTS_PREFIX" id="aws-analytics-reference-architecture.DataDomain.property.DATA_PRODUCTS_PREFIX"></a>

```typescript
public readonly DATA_PRODUCTS_PREFIX: string;
```

- *Type:* string

---

##### `DOMAIN_BUS_NAME`<sup>Required</sup> <a name="DOMAIN_BUS_NAME" id="aws-analytics-reference-architecture.DataDomain.property.DOMAIN_BUS_NAME"></a>

```typescript
public readonly DOMAIN_BUS_NAME: string;
```

- *Type:* string

---

##### `DOMAIN_CONFIG_SECRET`<sup>Required</sup> <a name="DOMAIN_CONFIG_SECRET" id="aws-analytics-reference-architecture.DataDomain.property.DOMAIN_CONFIG_SECRET"></a>

```typescript
public readonly DOMAIN_CONFIG_SECRET: string;
```

- *Type:* string

---

### DataLakeCatalog <a name="DataLakeCatalog" id="aws-analytics-reference-architecture.DataLakeCatalog"></a>

A Data Lake Catalog composed of 3 AWS Glue Database configured with AWS best practices:  Databases for Raw/Cleaned/Transformed data,.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.DataLakeCatalog.Initializer"></a>

```typescript
import { DataLakeCatalog } from 'aws-analytics-reference-architecture'

new DataLakeCatalog(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.DataLakeCatalog.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.DataLakeCatalog.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.DataLakeCatalog.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.DataLakeCatalog.isConstruct"></a>

```typescript
import { DataLakeCatalog } from 'aws-analytics-reference-architecture'

DataLakeCatalog.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.DataLakeCatalog.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.cleanDatabase">cleanDatabase</a></code> | <code>@aws-cdk/aws-glue-alpha.Database</code> | AWS Glue Database for Clean data. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.rawDatabase">rawDatabase</a></code> | <code>@aws-cdk/aws-glue-alpha.Database</code> | AWS Glue Database for Raw data. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.transformDatabase">transformDatabase</a></code> | <code>@aws-cdk/aws-glue-alpha.Database</code> | AWS Glue Database for Transform data. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.DataLakeCatalog.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `cleanDatabase`<sup>Required</sup> <a name="cleanDatabase" id="aws-analytics-reference-architecture.DataLakeCatalog.property.cleanDatabase"></a>

```typescript
public readonly cleanDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue-alpha.Database

AWS Glue Database for Clean data.

---

##### `rawDatabase`<sup>Required</sup> <a name="rawDatabase" id="aws-analytics-reference-architecture.DataLakeCatalog.property.rawDatabase"></a>

```typescript
public readonly rawDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue-alpha.Database

AWS Glue Database for Raw data.

---

##### `transformDatabase`<sup>Required</sup> <a name="transformDatabase" id="aws-analytics-reference-architecture.DataLakeCatalog.property.transformDatabase"></a>

```typescript
public readonly transformDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue-alpha.Database

AWS Glue Database for Transform data.

---


### DataLakeExporter <a name="DataLakeExporter" id="aws-analytics-reference-architecture.DataLakeExporter"></a>

DataLakeExporter Construct to export data from a stream to the data lake.

Source can be an Amazon Kinesis Data Stream.
Target can be an Amazon S3 bucket.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.DataLakeExporter.Initializer"></a>

```typescript
import { DataLakeExporter } from 'aws-analytics-reference-architecture'

new DataLakeExporter(scope: Construct, id: string, props: DataLakeExporterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps">DataLakeExporterProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.DataLakeExporterProps">DataLakeExporterProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.DataLakeExporter.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.DataLakeExporter.isConstruct"></a>

```typescript
import { DataLakeExporter } from 'aws-analytics-reference-architecture'

DataLakeExporter.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.DataLakeExporter.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.property.cfnIngestionStream">cfnIngestionStream</a></code> | <code>aws-cdk-lib.aws_kinesisfirehose.CfnDeliveryStream</code> | Constructs a new instance of the DataLakeExporter class. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.DataLakeExporter.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `cfnIngestionStream`<sup>Required</sup> <a name="cfnIngestionStream" id="aws-analytics-reference-architecture.DataLakeExporter.property.cfnIngestionStream"></a>

```typescript
public readonly cfnIngestionStream: CfnDeliveryStream;
```

- *Type:* aws-cdk-lib.aws_kinesisfirehose.CfnDeliveryStream

Constructs a new instance of the DataLakeExporter class.

---


### DataLakeStorage <a name="DataLakeStorage" id="aws-analytics-reference-architecture.DataLakeStorage"></a>

A CDK Construct that creates the storage layers of a data lake composed of Amazon S3 Buckets.

This construct is based on 3 Amazon S3 buckets configured with AWS best practices:
 * S3 buckets for Raw/Cleaned/Transformed data,
 * data lifecycle optimization/transitioning to different Amazon S3 storage classes
 * server side buckets encryption managed by KMS customer key
 * Default single KMS key
 * SSL communication enforcement
 * access logged to an S3 bucket
 * All public access blocked

By default the transitioning rules to Amazon S3 storage classes are configured as following:
 * Raw data is moved to Infrequent Access after 30 days and archived to Glacier after 90 days
 * Clean and Transformed data is moved to Infrequent Access after 90 days and is not archived

Objects and buckets are automatically deleted when the CDK application is detroyed.

For custom requirements, consider using {@link AraBucket}.

Usage example:
```typescript
import * as cdk from 'aws-cdk-lib';
import { DataLakeStorage } from 'aws-analytics-reference-architecture';

const exampleApp = new cdk.App();
const stack = new cdk.Stack(exampleApp, 'DataLakeStorageStack');

new DataLakeStorage(stack, 'MyDataLakeStorage', {
 rawInfrequentAccessDelay: 90,
 rawArchiveDelay: 180,
 cleanInfrequentAccessDelay: 180,
 cleanArchiveDelay: 360,
 transformInfrequentAccessDelay: 180,
 transformArchiveDelay: 360,
});
```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.DataLakeStorage.Initializer"></a>

```typescript
import { DataLakeStorage } from 'aws-analytics-reference-architecture'

new DataLakeStorage(scope: Construct, id: string, props?: DataLakeStorageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.DataLakeStorageProps">DataLakeStorageProps</a></code> | the DataLakeStorageProps properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Optional</sup> <a name="props" id="aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.DataLakeStorageProps">DataLakeStorageProps</a>

the DataLakeStorageProps properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.DataLakeStorage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.DataLakeStorage.isConstruct"></a>

```typescript
import { DataLakeStorage } from 'aws-analytics-reference-architecture'

DataLakeStorage.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.DataLakeStorage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.cleanBucket">cleanBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.rawBucket">rawBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.transformBucket">transformBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.DataLakeStorage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `cleanBucket`<sup>Required</sup> <a name="cleanBucket" id="aws-analytics-reference-architecture.DataLakeStorage.property.cleanBucket"></a>

```typescript
public readonly cleanBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `rawBucket`<sup>Required</sup> <a name="rawBucket" id="aws-analytics-reference-architecture.DataLakeStorage.property.rawBucket"></a>

```typescript
public readonly rawBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `transformBucket`<sup>Required</sup> <a name="transformBucket" id="aws-analytics-reference-architecture.DataLakeStorage.property.transformBucket"></a>

```typescript
public readonly transformBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---


### Ec2SsmRole <a name="Ec2SsmRole" id="aws-analytics-reference-architecture.Ec2SsmRole"></a>

Construct extending IAM Role with AmazonSSMManagedInstanceCore managed policy.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.Ec2SsmRole.Initializer"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

new Ec2SsmRole(scope: Construct, id: string, props: RoleProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.props">props</a></code> | <code>aws-cdk-lib.aws_iam.RoleProps</code> | the RoleProps [properties]{@link RoleProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_iam.RoleProps

the RoleProps [properties]{@link RoleProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.addManagedPolicy">addManagedPolicy</a></code> | Attaches a managed policy to this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.addToPolicy">addToPolicy</a></code> | Add to the policy of this principal. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.addToPrincipalPolicy">addToPrincipalPolicy</a></code> | Adds a permission to the role's default policy document. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.attachInlinePolicy">attachInlinePolicy</a></code> | Attaches a policy to this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.grant">grant</a></code> | Grant the actions defined in actions to the identity Principal on this resource. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.grantAssumeRole">grantAssumeRole</a></code> | Grant permissions to the given principal to assume this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.grantPassRole">grantPassRole</a></code> | Grant permissions to the given principal to pass this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.withoutPolicyUpdates">withoutPolicyUpdates</a></code> | Return a copy of this Role object whose Policies will not be updated. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.Ec2SsmRole.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.Ec2SsmRole.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addManagedPolicy` <a name="addManagedPolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.addManagedPolicy"></a>

```typescript
public addManagedPolicy(policy: IManagedPolicy): void
```

Attaches a managed policy to this role.

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.Ec2SsmRole.addManagedPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.aws_iam.IManagedPolicy

The the managed policy to attach.

---

##### `addToPolicy` <a name="addToPolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.addToPolicy"></a>

```typescript
public addToPolicy(statement: PolicyStatement): boolean
```

Add to the policy of this principal.

###### `statement`<sup>Required</sup> <a name="statement" id="aws-analytics-reference-architecture.Ec2SsmRole.addToPolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `addToPrincipalPolicy` <a name="addToPrincipalPolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.addToPrincipalPolicy"></a>

```typescript
public addToPrincipalPolicy(statement: PolicyStatement): AddToPrincipalPolicyResult
```

Adds a permission to the role's default policy document.

If there is no default policy attached to this role, it will be created.

###### `statement`<sup>Required</sup> <a name="statement" id="aws-analytics-reference-architecture.Ec2SsmRole.addToPrincipalPolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

The permission statement to add to the policy document.

---

##### `attachInlinePolicy` <a name="attachInlinePolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.attachInlinePolicy"></a>

```typescript
public attachInlinePolicy(policy: Policy): void
```

Attaches a policy to this role.

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.Ec2SsmRole.attachInlinePolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.aws_iam.Policy

The policy to attach.

---

##### `grant` <a name="grant" id="aws-analytics-reference-architecture.Ec2SsmRole.grant"></a>

```typescript
public grant(grantee: IPrincipal, actions: string): Grant
```

Grant the actions defined in actions to the identity Principal on this resource.

###### `grantee`<sup>Required</sup> <a name="grantee" id="aws-analytics-reference-architecture.Ec2SsmRole.grant.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

---

###### `actions`<sup>Required</sup> <a name="actions" id="aws-analytics-reference-architecture.Ec2SsmRole.grant.parameter.actions"></a>

- *Type:* string

---

##### `grantAssumeRole` <a name="grantAssumeRole" id="aws-analytics-reference-architecture.Ec2SsmRole.grantAssumeRole"></a>

```typescript
public grantAssumeRole(identity: IPrincipal): Grant
```

Grant permissions to the given principal to assume this role.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.Ec2SsmRole.grantAssumeRole.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

---

##### `grantPassRole` <a name="grantPassRole" id="aws-analytics-reference-architecture.Ec2SsmRole.grantPassRole"></a>

```typescript
public grantPassRole(identity: IPrincipal): Grant
```

Grant permissions to the given principal to pass this role.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.Ec2SsmRole.grantPassRole.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

---

##### `withoutPolicyUpdates` <a name="withoutPolicyUpdates" id="aws-analytics-reference-architecture.Ec2SsmRole.withoutPolicyUpdates"></a>

```typescript
public withoutPolicyUpdates(options?: WithoutPolicyUpdatesOptions): IRole
```

Return a copy of this Role object whose Policies will not be updated.

Use the object returned by this method if you want this Role to be used by
a construct without it automatically updating the Role's Policies.

If you do, you are responsible for adding the correct statements to the
Role's policies yourself.

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.Ec2SsmRole.withoutPolicyUpdates.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_iam.WithoutPolicyUpdatesOptions

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.customizeRoles">customizeRoles</a></code> | Customize the creation of IAM roles within the given scope. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.fromRoleArn">fromRoleArn</a></code> | Import an external role by ARN. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName">fromRoleName</a></code> | Import an external role by name. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.isRole">isRole</a></code> | Return whether the given object is a Role. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.Ec2SsmRole.isConstruct"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.Ec2SsmRole.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="aws-analytics-reference-architecture.Ec2SsmRole.isOwnedResource"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.Ec2SsmRole.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="aws-analytics-reference-architecture.Ec2SsmRole.isResource"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.Ec2SsmRole.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `customizeRoles` <a name="customizeRoles" id="aws-analytics-reference-architecture.Ec2SsmRole.customizeRoles"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.customizeRoles(scope: Construct, options?: CustomizeRolesOptions)
```

Customize the creation of IAM roles within the given scope.

It is recommended that you **do not** use this method and instead allow
CDK to manage role creation. This should only be used
in environments where CDK applications are not allowed to created IAM roles.

This can be used to prevent the CDK application from creating roles
within the given scope and instead replace the references to the roles with
precreated role names. A report will be synthesized in the cloud assembly (i.e. cdk.out)
that will contain the list of IAM roles that would have been created along with the
IAM policy statements that the role should contain. This report can then be used
to create the IAM roles outside of CDK and then the created role names can be provided
in `usePrecreatedRoles`.

*Example*

```typescript
declare const app: App;
iam.Role.customizeRoles(app, {
  usePrecreatedRoles: {
    'ConstructPath/To/Role': 'my-precreated-role-name',
  },
});
```


###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.Ec2SsmRole.customizeRoles.parameter.scope"></a>

- *Type:* constructs.Construct

construct scope to customize role creation.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.Ec2SsmRole.customizeRoles.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_iam.CustomizeRolesOptions

options for configuring role creation.

---

##### `fromRoleArn` <a name="fromRoleArn" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleArn"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.fromRoleArn(scope: Construct, id: string, roleArn: string, options?: FromRoleArnOptions)
```

Import an external role by ARN.

If the imported Role ARN is a Token (such as a
`CfnParameter.valueAsString` or a `Fn.importValue()`) *and* the referenced
role has a `path` (like `arn:...:role/AdminRoles/Alice`), the
`roleName` property will not resolve to the correct value. Instead it
will resolve to the first path component. We unfortunately cannot express
the correct calculation of the full path name as a CloudFormation
expression. In this scenario the Role ARN should be supplied without the
`path` in order to resolve the correct role resource.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleArn.parameter.scope"></a>

- *Type:* constructs.Construct

construct scope.

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleArn.parameter.id"></a>

- *Type:* string

construct id.

---

###### `roleArn`<sup>Required</sup> <a name="roleArn" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleArn.parameter.roleArn"></a>

- *Type:* string

the ARN of the role to import.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleArn.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_iam.FromRoleArnOptions

allow customizing the behavior of the returned role.

---

##### `fromRoleName` <a name="fromRoleName" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.fromRoleName(scope: Construct, id: string, roleName: string, options?: FromRoleNameOptions)
```

Import an external role by name.

The imported role is assumed to exist in the same account as the account
the scope's containing Stack is being deployed to.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName.parameter.scope"></a>

- *Type:* constructs.Construct

construct scope.

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName.parameter.id"></a>

- *Type:* string

construct id.

---

###### `roleName`<sup>Required</sup> <a name="roleName" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName.parameter.roleName"></a>

- *Type:* string

the name of the role to import.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_iam.FromRoleNameOptions

allow customizing the behavior of the returned role.

---

##### `isRole` <a name="isRole" id="aws-analytics-reference-architecture.Ec2SsmRole.isRole"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.isRole(x: any)
```

Return whether the given object is a Role.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.Ec2SsmRole.isRole.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.assumeRoleAction">assumeRoleAction</a></code> | <code>string</code> | When this Principal is used in an AssumeRole policy, the action to use. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal to grant permissions to. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.policyFragment">policyFragment</a></code> | <code>aws-cdk-lib.aws_iam.PrincipalPolicyFragment</code> | Returns the role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.roleArn">roleArn</a></code> | <code>string</code> | Returns the ARN of this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.roleId">roleId</a></code> | <code>string</code> | Returns the stable and unique string identifying the role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.roleName">roleName</a></code> | <code>string</code> | Returns the name of the role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.assumeRolePolicy">assumeRolePolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyDocument</code> | The assume role policy document associated with this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.permissionsBoundary">permissionsBoundary</a></code> | <code>aws-cdk-lib.aws_iam.IManagedPolicy</code> | Returns the permissions boundary attached to this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.principalAccount">principalAccount</a></code> | <code>string</code> | The AWS account ID of this principal. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.Ec2SsmRole.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-analytics-reference-architecture.Ec2SsmRole.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="aws-analytics-reference-architecture.Ec2SsmRole.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `assumeRoleAction`<sup>Required</sup> <a name="assumeRoleAction" id="aws-analytics-reference-architecture.Ec2SsmRole.property.assumeRoleAction"></a>

```typescript
public readonly assumeRoleAction: string;
```

- *Type:* string

When this Principal is used in an AssumeRole policy, the action to use.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="aws-analytics-reference-architecture.Ec2SsmRole.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal to grant permissions to.

---

##### `policyFragment`<sup>Required</sup> <a name="policyFragment" id="aws-analytics-reference-architecture.Ec2SsmRole.property.policyFragment"></a>

```typescript
public readonly policyFragment: PrincipalPolicyFragment;
```

- *Type:* aws-cdk-lib.aws_iam.PrincipalPolicyFragment

Returns the role.

---

##### `roleArn`<sup>Required</sup> <a name="roleArn" id="aws-analytics-reference-architecture.Ec2SsmRole.property.roleArn"></a>

```typescript
public readonly roleArn: string;
```

- *Type:* string

Returns the ARN of this role.

---

##### `roleId`<sup>Required</sup> <a name="roleId" id="aws-analytics-reference-architecture.Ec2SsmRole.property.roleId"></a>

```typescript
public readonly roleId: string;
```

- *Type:* string

Returns the stable and unique string identifying the role.

For example,
AIDAJQABLZS4A3QDU576Q.

---

##### `roleName`<sup>Required</sup> <a name="roleName" id="aws-analytics-reference-architecture.Ec2SsmRole.property.roleName"></a>

```typescript
public readonly roleName: string;
```

- *Type:* string

Returns the name of the role.

---

##### `assumeRolePolicy`<sup>Optional</sup> <a name="assumeRolePolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.property.assumeRolePolicy"></a>

```typescript
public readonly assumeRolePolicy: PolicyDocument;
```

- *Type:* aws-cdk-lib.aws_iam.PolicyDocument

The assume role policy document associated with this role.

---

##### `permissionsBoundary`<sup>Optional</sup> <a name="permissionsBoundary" id="aws-analytics-reference-architecture.Ec2SsmRole.property.permissionsBoundary"></a>

```typescript
public readonly permissionsBoundary: IManagedPolicy;
```

- *Type:* aws-cdk-lib.aws_iam.IManagedPolicy

Returns the permissions boundary attached to this role.

---

##### `principalAccount`<sup>Optional</sup> <a name="principalAccount" id="aws-analytics-reference-architecture.Ec2SsmRole.property.principalAccount"></a>

```typescript
public readonly principalAccount: string;
```

- *Type:* string

The AWS account ID of this principal.

Can be undefined when the account is not known
(for example, for service principals).
Can be a Token - in that case,
it's assumed to be AWS::AccountId.

---


### EmrEksCluster <a name="EmrEksCluster" id="aws-analytics-reference-architecture.EmrEksCluster"></a>

EmrEksCluster Construct packaging all the resources and configuration required to run Amazon EMR on EKS.

It deploys:
* An EKS cluster (VPC configuration can be customized)
* A tooling nodegroup to run tools including the Kubedashboard and the Cluster Autoscaler
* Optionally multiple nodegroups (one per AZ) for critical/shared/notebook EMR workloads
* Additional nodegroups can be configured

The construct will upload on S3 the Pod templates required to run EMR jobs on the default nodegroups.
It will also parse and store the configuration of EMR on EKS jobs for each default nodegroup in object parameters

Methods are available to add EMR Virtual Clusters to the EKS cluster and to create execution roles for the virtual clusters.

Usage example:

```typescript
const emrEks: EmrEksCluster = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: <ROLE_ARN>,
  eksClusterName: <CLUSTER_NAME>,
});

const virtualCluster = emrEks.addEmrVirtualCluster(stack, {
  name: <Virtual_Cluster_Name>,
  createNamespace: <TRUE OR FALSE>,
  eksNamespace: <K8S_namespace>,
});

const role = emrEks.createExecutionRole(stack, 'ExecRole',{
  policy: <POLICY>,
})

// EMR on EKS virtual cluster ID
cdk.CfnOutput(self, 'VirtualClusterId',value = virtualCluster.attr_id)
// Job config for each nodegroup
cdk.CfnOutput(self, "CriticalConfig", value = emrEks.criticalDefaultConfig)
cdk.CfnOutput(self, "SharedConfig", value = emrEks.sharedDefaultConfig)
// Execution role arn
cdk.CfnOutput(self,'ExecRoleArn', value = role.roleArn)
```

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup">addEmrEksNodegroup</a></code> | Add new nodegroups to the cluster for Amazon EMR on EKS. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster">addEmrVirtualCluster</a></code> | Add a new Amazon EMR Virtual Cluster linked to Amazon EKS Cluster. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addJobTemplate">addJobTemplate</a></code> | Creates a new Amazon EMR on EKS job template based on the props passed. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addKarpenterProvisioner">addKarpenterProvisioner</a></code> | Apply the provided manifest and add the CDK dependency on EKS cluster. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint">addManagedEndpoint</a></code> | Creates a new Amazon EMR managed endpoint to be used with Amazon EMR Virtual Cluster . |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addNodegroupCapacity">addNodegroupCapacity</a></code> | Add a new Amazon EKS Nodegroup to the cluster. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole">createExecutionRole</a></code> | Create and configure a new Amazon IAM Role usable as an execution role. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.uploadPodTemplate">uploadPodTemplate</a></code> | Upload podTemplates to the Amazon S3 location used by the cluster. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.EmrEksCluster.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addEmrEksNodegroup` <a name="addEmrEksNodegroup" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup"></a>

```typescript
public addEmrEksNodegroup(id: string, props: EmrEksNodegroupOptions): void
```

Add new nodegroups to the cluster for Amazon EMR on EKS.

This method overrides Amazon EKS nodegroup options then create the nodegroup.
If no subnet is provided, it creates one nodegroup per private subnet in the Amazon EKS Cluster.
If NVME local storage is used, the user_data is modified.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup.parameter.id"></a>

- *Type:* string

the CDK ID of the resource.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

the EmrEksNodegroupOptions [properties]{@link EmrEksNodegroupOptions}.

---

##### `addEmrVirtualCluster` <a name="addEmrVirtualCluster" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster"></a>

```typescript
public addEmrVirtualCluster(scope: Construct, options: EmrVirtualClusterOptions): CfnVirtualCluster
```

Add a new Amazon EMR Virtual Cluster linked to Amazon EKS Cluster.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster.parameter.scope"></a>

- *Type:* constructs.Construct

of the stack where virtual cluster is deployed.

---

###### `options`<sup>Required</sup> <a name="options" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster.parameter.options"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrVirtualClusterOptions">EmrVirtualClusterOptions</a>

the EmrVirtualClusterProps [properties]{@link EmrVirtualClusterProps }.

---

##### `addJobTemplate` <a name="addJobTemplate" id="aws-analytics-reference-architecture.EmrEksCluster.addJobTemplate"></a>

```typescript
public addJobTemplate(scope: Construct, id: string, options: EmrEksJobTemplateDefinition): CustomResource
```

Creates a new Amazon EMR on EKS job template based on the props passed.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksCluster.addJobTemplate.parameter.scope"></a>

- *Type:* constructs.Construct

the scope of the stack where job template is created.

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.addJobTemplate.parameter.id"></a>

- *Type:* string

the CDK id for job template resource.

---

###### `options`<sup>Required</sup> <a name="options" id="aws-analytics-reference-architecture.EmrEksCluster.addJobTemplate.parameter.options"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksJobTemplateDefinition">EmrEksJobTemplateDefinition</a>

the EmrManagedEndpointOptions to configure the Amazon EMR managed endpoint.

---

##### `addKarpenterProvisioner` <a name="addKarpenterProvisioner" id="aws-analytics-reference-architecture.EmrEksCluster.addKarpenterProvisioner"></a>

```typescript
public addKarpenterProvisioner(id: string, manifest: any): any
```

Apply the provided manifest and add the CDK dependency on EKS cluster.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.addKarpenterProvisioner.parameter.id"></a>

- *Type:* string

the unique ID of the CDK resource.

---

###### `manifest`<sup>Required</sup> <a name="manifest" id="aws-analytics-reference-architecture.EmrEksCluster.addKarpenterProvisioner.parameter.manifest"></a>

- *Type:* any

The manifest to apply.

You can use the Utils class that offers method to read yaml file and load it as a manifest

---

##### `addManagedEndpoint` <a name="addManagedEndpoint" id="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint"></a>

```typescript
public addManagedEndpoint(scope: Construct, id: string, options: EmrManagedEndpointOptions): CustomResource
```

Creates a new Amazon EMR managed endpoint to be used with Amazon EMR Virtual Cluster .

CfnOutput can be customized.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint.parameter.scope"></a>

- *Type:* constructs.Construct

the scope of the stack where managed endpoint is deployed.

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint.parameter.id"></a>

- *Type:* string

the CDK id for endpoint.

---

###### `options`<sup>Required</sup> <a name="options" id="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint.parameter.options"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions">EmrManagedEndpointOptions</a>

the EmrManagedEndpointOptions to configure the Amazon EMR managed endpoint.

---

##### `addNodegroupCapacity` <a name="addNodegroupCapacity" id="aws-analytics-reference-architecture.EmrEksCluster.addNodegroupCapacity"></a>

```typescript
public addNodegroupCapacity(nodegroupId: string, options: EmrEksNodegroupOptions): Nodegroup
```

Add a new Amazon EKS Nodegroup to the cluster.

This method is used to add a nodegroup to the Amazon EKS cluster and automatically set tags based on labels and taints
 so it can be used for the cluster autoscaler.

###### `nodegroupId`<sup>Required</sup> <a name="nodegroupId" id="aws-analytics-reference-architecture.EmrEksCluster.addNodegroupCapacity.parameter.nodegroupId"></a>

- *Type:* string

the ID of the nodegroup.

---

###### `options`<sup>Required</sup> <a name="options" id="aws-analytics-reference-architecture.EmrEksCluster.addNodegroupCapacity.parameter.options"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

the EmrEksNodegroup [properties]{@link EmrEksNodegroupOptions}.

---

##### `createExecutionRole` <a name="createExecutionRole" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole"></a>

```typescript
public createExecutionRole(scope: Construct, id: string, policy: IManagedPolicy, namespace: string, name: string): Role
```

Create and configure a new Amazon IAM Role usable as an execution role.

This method makes the created role assumed by the Amazon EKS cluster Open ID Connect provider.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole.parameter.scope"></a>

- *Type:* constructs.Construct

of the IAM role.

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole.parameter.id"></a>

- *Type:* string

of the CDK resource to be created, it should be unique across the stack.

---

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole.parameter.policy"></a>

- *Type:* aws-cdk-lib.aws_iam.IManagedPolicy

the execution policy to attach to the role.

---

###### `namespace`<sup>Required</sup> <a name="namespace" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole.parameter.namespace"></a>

- *Type:* string

The namespace from which the role is going to be used.

MUST be the same as the namespace of the Virtual Cluster from which the job is submitted

---

###### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole.parameter.name"></a>

- *Type:* string

Name to use for the role, required and is used to scope the iam role.

---

##### `uploadPodTemplate` <a name="uploadPodTemplate" id="aws-analytics-reference-architecture.EmrEksCluster.uploadPodTemplate"></a>

```typescript
public uploadPodTemplate(id: string, filePath: string): void
```

Upload podTemplates to the Amazon S3 location used by the cluster.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.uploadPodTemplate.parameter.id"></a>

- *Type:* string

the unique ID of the CDK resource.

---

###### `filePath`<sup>Required</sup> <a name="filePath" id="aws-analytics-reference-architecture.EmrEksCluster.uploadPodTemplate.parameter.filePath"></a>

- *Type:* string

The local path of the yaml podTemplate files to upload.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.getOrCreate">getOrCreate</a></code> | Get an existing EmrEksCluster based on the cluster name property or create a new one only one EKS cluster can exist per stack. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.EmrEksCluster.isConstruct"></a>

```typescript
import { EmrEksCluster } from 'aws-analytics-reference-architecture'

EmrEksCluster.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.EmrEksCluster.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate"></a>

```typescript
import { EmrEksCluster } from 'aws-analytics-reference-architecture'

EmrEksCluster.getOrCreate(scope: Construct, props: EmrEksClusterProps)
```

Get an existing EmrEksCluster based on the cluster name property or create a new one only one EKS cluster can exist per stack.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate.parameter.scope"></a>

- *Type:* constructs.Construct

the CDK scope used to search or create the cluster.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksClusterProps">EmrEksClusterProps</a>

the EmrEksClusterProps [properties]{@link EmrEksClusterProps} if created.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.assetBucket">assetBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.clusterName">clusterName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.criticalDefaultConfig">criticalDefaultConfig</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.ec2InstanceNodeGroupRole">ec2InstanceNodeGroupRole</a></code> | <code>aws-cdk-lib.aws_iam.Role</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.eksCluster">eksCluster</a></code> | <code>aws-cdk-lib.aws_eks.Cluster</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.notebookDefaultConfig">notebookDefaultConfig</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.podTemplateLocation">podTemplateLocation</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.sharedDefaultConfig">sharedDefaultConfig</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.EmrEksCluster.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `assetBucket`<sup>Required</sup> <a name="assetBucket" id="aws-analytics-reference-architecture.EmrEksCluster.property.assetBucket"></a>

```typescript
public readonly assetBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `clusterName`<sup>Required</sup> <a name="clusterName" id="aws-analytics-reference-architecture.EmrEksCluster.property.clusterName"></a>

```typescript
public readonly clusterName: string;
```

- *Type:* string

---

##### `criticalDefaultConfig`<sup>Required</sup> <a name="criticalDefaultConfig" id="aws-analytics-reference-architecture.EmrEksCluster.property.criticalDefaultConfig"></a>

```typescript
public readonly criticalDefaultConfig: string;
```

- *Type:* string

---

##### `ec2InstanceNodeGroupRole`<sup>Required</sup> <a name="ec2InstanceNodeGroupRole" id="aws-analytics-reference-architecture.EmrEksCluster.property.ec2InstanceNodeGroupRole"></a>

```typescript
public readonly ec2InstanceNodeGroupRole: Role;
```

- *Type:* aws-cdk-lib.aws_iam.Role

---

##### `eksCluster`<sup>Required</sup> <a name="eksCluster" id="aws-analytics-reference-architecture.EmrEksCluster.property.eksCluster"></a>

```typescript
public readonly eksCluster: Cluster;
```

- *Type:* aws-cdk-lib.aws_eks.Cluster

---

##### `notebookDefaultConfig`<sup>Required</sup> <a name="notebookDefaultConfig" id="aws-analytics-reference-architecture.EmrEksCluster.property.notebookDefaultConfig"></a>

```typescript
public readonly notebookDefaultConfig: string;
```

- *Type:* string

---

##### `podTemplateLocation`<sup>Required</sup> <a name="podTemplateLocation" id="aws-analytics-reference-architecture.EmrEksCluster.property.podTemplateLocation"></a>

```typescript
public readonly podTemplateLocation: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

---

##### `sharedDefaultConfig`<sup>Required</sup> <a name="sharedDefaultConfig" id="aws-analytics-reference-architecture.EmrEksCluster.property.sharedDefaultConfig"></a>

```typescript
public readonly sharedDefaultConfig: string;
```

- *Type:* string

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_CLUSTER_NAME">DEFAULT_CLUSTER_NAME</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_EKS_VERSION">DEFAULT_EKS_VERSION</a></code> | <code>aws-cdk-lib.aws_eks.KubernetesVersion</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_EMR_VERSION">DEFAULT_EMR_VERSION</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrVersion">EmrVersion</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_KARPENTER_VERSION">DEFAULT_KARPENTER_VERSION</a></code> | <code>string</code> | *No description.* |

---

##### `DEFAULT_CLUSTER_NAME`<sup>Required</sup> <a name="DEFAULT_CLUSTER_NAME" id="aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_CLUSTER_NAME"></a>

```typescript
public readonly DEFAULT_CLUSTER_NAME: string;
```

- *Type:* string

---

##### `DEFAULT_EKS_VERSION`<sup>Required</sup> <a name="DEFAULT_EKS_VERSION" id="aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_EKS_VERSION"></a>

```typescript
public readonly DEFAULT_EKS_VERSION: KubernetesVersion;
```

- *Type:* aws-cdk-lib.aws_eks.KubernetesVersion

---

##### `DEFAULT_EMR_VERSION`<sup>Required</sup> <a name="DEFAULT_EMR_VERSION" id="aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_EMR_VERSION"></a>

```typescript
public readonly DEFAULT_EMR_VERSION: EmrVersion;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrVersion">EmrVersion</a>

---

##### `DEFAULT_KARPENTER_VERSION`<sup>Required</sup> <a name="DEFAULT_KARPENTER_VERSION" id="aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_KARPENTER_VERSION"></a>

```typescript
public readonly DEFAULT_KARPENTER_VERSION: string;
```

- *Type:* string

---

### EmrEksImageBuilder <a name="EmrEksImageBuilder" id="aws-analytics-reference-architecture.EmrEksImageBuilder"></a>

A CDK construct to create build and publish EMR on EKS custom image  The construct will create an ECR repository to publish the images  It provide a method {@link publishImage} to build a docker file and publish it to the ECR repository   Resources deployed:  * Multiple Session Policies that are used to map an EMR Studio user or group to a set of resources they are allowed to access.

These resources are:
  * ECR Repository
  * Codebuild project
  * A custom resource to build and publish a custom EMR on EKS image 


Usage example:

```typescript

const app = new App();
  
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

const stack = new Stack(app, 'EmrEksImageBuilderStack', {
env: { account: account, region: region },
});

const publish = new EmrEksImageBuilder(stack, 'EmrEksImageBuilder', {
 repositoryName: 'my-repo',
 ecrRemovalPolicy: RemovalPolicy.RETAIN
});

publish.publishImage('PATH-TO-DOCKER-FILE-FOLDER', 'v4');

```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.EmrEksImageBuilder.Initializer"></a>

```typescript
import { EmrEksImageBuilder } from 'aws-analytics-reference-architecture'

new EmrEksImageBuilder(scope: Construct, id: string, props: EmrEksImageBuilderProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilder.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilder.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilder.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilderProps">EmrEksImageBuilderProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksImageBuilder.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksImageBuilder.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.EmrEksImageBuilder.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksImageBuilderProps">EmrEksImageBuilderProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilder.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilder.publishImage">publishImage</a></code> | A method to build and publish the custom image from a Dockerfile  The method invoke the custom resource deployed by the construct  and publish the **URI** of the published custom image as Cloudformation output. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.EmrEksImageBuilder.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `publishImage` <a name="publishImage" id="aws-analytics-reference-architecture.EmrEksImageBuilder.publishImage"></a>

```typescript
public publishImage(dockerfilePath: string, tag: string): void
```

A method to build and publish the custom image from a Dockerfile  The method invoke the custom resource deployed by the construct  and publish the **URI** of the published custom image as Cloudformation output.

###### `dockerfilePath`<sup>Required</sup> <a name="dockerfilePath" id="aws-analytics-reference-architecture.EmrEksImageBuilder.publishImage.parameter.dockerfilePath"></a>

- *Type:* string

Path to the folder for Dockerfile.

---

###### `tag`<sup>Required</sup> <a name="tag" id="aws-analytics-reference-architecture.EmrEksImageBuilder.publishImage.parameter.tag"></a>

- *Type:* string

The tag used to publish to the ECR repository.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilder.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.EmrEksImageBuilder.isConstruct"></a>

```typescript
import { EmrEksImageBuilder } from 'aws-analytics-reference-architecture'

EmrEksImageBuilder.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.EmrEksImageBuilder.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilder.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.EmrEksImageBuilder.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### EmrEksJobTemplateProvider <a name="EmrEksJobTemplateProvider" id="aws-analytics-reference-architecture.EmrEksJobTemplateProvider"></a>

A custom resource provider for CRUD operations on Amazon EMR on EKS Managed Endpoints.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.EmrEksJobTemplateProvider.Initializer"></a>

```typescript
import { EmrEksJobTemplateProvider } from 'aws-analytics-reference-architecture'

new EmrEksJobTemplateProvider(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksJobTemplateProvider.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksJobTemplateProvider.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksJobTemplateProvider.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksJobTemplateProvider.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksJobTemplateProvider.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.EmrEksJobTemplateProvider.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksJobTemplateProvider.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.EmrEksJobTemplateProvider.isConstruct"></a>

```typescript
import { EmrEksJobTemplateProvider } from 'aws-analytics-reference-architecture'

EmrEksJobTemplateProvider.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.EmrEksJobTemplateProvider.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksJobTemplateProvider.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksJobTemplateProvider.property.provider">provider</a></code> | <code>aws-cdk-lib.custom_resources.Provider</code> | The custom resource Provider for creating Amazon EMR Managed Endpoints custom resources. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.EmrEksJobTemplateProvider.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `provider`<sup>Required</sup> <a name="provider" id="aws-analytics-reference-architecture.EmrEksJobTemplateProvider.property.provider"></a>

```typescript
public readonly provider: Provider;
```

- *Type:* aws-cdk-lib.custom_resources.Provider

The custom resource Provider for creating Amazon EMR Managed Endpoints custom resources.

---


### FlywayRunner <a name="FlywayRunner" id="aws-analytics-reference-architecture.FlywayRunner"></a>

A CDK construct that runs flyway migration scripts against a redshift cluster.

This construct is based on two main resource, an AWS Lambda hosting a flyway runner
and one custom resource invoking it when content of migrationScriptsFolderAbsolutePath changes.

Usage example:

*This example assume that migration SQL files are located in `resources/sql` of the cdk project.*
```typescript
import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as redshift from '@aws-cdk/aws-redshift-alpha';
import * as cdk from 'aws-cdk-lib';

import { FlywayRunner } from 'aws-analytics-reference-architecture';

const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'fywayRunnerTest');

const vpc = new ec2.Vpc(stack, 'Vpc');

const dbName = 'testdb';
const cluster = new redshift.Cluster(stack, 'Redshift', {
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  masterUser: {
    masterUsername: 'admin',
  },
  vpc,
  defaultDatabaseName: dbName,
});

new FlywayRunner(stack, 'testMigration', {
  migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),
  cluster: cluster,
  vpc: vpc,
  databaseName: dbName,
});
```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.FlywayRunner.Initializer"></a>

```typescript
import { FlywayRunner } from 'aws-analytics-reference-architecture'

new FlywayRunner(scope: Construct, id: string, props: FlywayRunnerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps">FlywayRunnerProps</a></code> | the FlywayRunner [properties]{@link FlywayRunnerProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.FlywayRunnerProps">FlywayRunnerProps</a>

the FlywayRunner [properties]{@link FlywayRunnerProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.FlywayRunner.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.FlywayRunner.isConstruct"></a>

```typescript
import { FlywayRunner } from 'aws-analytics-reference-architecture'

FlywayRunner.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.FlywayRunner.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.property.runner">runner</a></code> | <code>aws-cdk-lib.CustomResource</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.FlywayRunner.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `runner`<sup>Required</sup> <a name="runner" id="aws-analytics-reference-architecture.FlywayRunner.property.runner"></a>

```typescript
public readonly runner: CustomResource;
```

- *Type:* aws-cdk-lib.CustomResource

---


### GlueDemoRole <a name="GlueDemoRole" id="aws-analytics-reference-architecture.GlueDemoRole"></a>

GlueDemoRole Construct to automatically setup a new Amazon IAM role to use with AWS Glue jobs.

The role is created with AWSGlueServiceRole policy and authorize all actions on S3.
If you would like to scope down the permission you should create a new role with a scoped down policy
The Construct provides a getOrCreate method for SingletonInstantiation

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.GlueDemoRole.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.GlueDemoRole.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.GlueDemoRole.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.GlueDemoRole.getOrCreate">getOrCreate</a></code> | *No description.* |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.GlueDemoRole.isConstruct"></a>

```typescript
import { GlueDemoRole } from 'aws-analytics-reference-architecture'

GlueDemoRole.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.GlueDemoRole.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.GlueDemoRole.getOrCreate"></a>

```typescript
import { GlueDemoRole } from 'aws-analytics-reference-architecture'

GlueDemoRole.getOrCreate(scope: Construct)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.GlueDemoRole.getOrCreate.parameter.scope"></a>

- *Type:* constructs.Construct

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.GlueDemoRole.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.GlueDemoRole.property.iamRole">iamRole</a></code> | <code>aws-cdk-lib.aws_iam.Role</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.GlueDemoRole.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `iamRole`<sup>Required</sup> <a name="iamRole" id="aws-analytics-reference-architecture.GlueDemoRole.property.iamRole"></a>

```typescript
public readonly iamRole: Role;
```

- *Type:* aws-cdk-lib.aws_iam.Role

---


### LakeFormationAdmin <a name="LakeFormationAdmin" id="aws-analytics-reference-architecture.LakeFormationAdmin"></a>

An AWS Lake Formation administrator with privileges to do all the administration tasks in AWS Lake Formation.

The principal is an Amazon IAM user or role and is added/removed to the list of AWS Lake Formation administrator
via the Data Lake Settings API.
Creation/deleting first retrieves the current list of administrators and then add/remove the principal to this list.
These steps are done outside of any transaction. Concurrent modifications between retrieving and updating can lead to inconsistent results.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.LakeFormationAdmin.Initializer"></a>

```typescript
import { LakeFormationAdmin } from 'aws-analytics-reference-architecture'

new LakeFormationAdmin(scope: Construct, id: string, props: LakeFormationAdminProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdmin.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdmin.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdmin.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.LakeFormationAdminProps">LakeFormationAdminProps</a></code> | the LakeFormationAdminProps properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.LakeFormationAdmin.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.LakeFormationAdmin.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.LakeFormationAdmin.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.LakeFormationAdminProps">LakeFormationAdminProps</a>

the LakeFormationAdminProps properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdmin.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.LakeFormationAdmin.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdmin.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdmin.addCdkExecRole">addCdkExecRole</a></code> | Adds the CDK execution role to LF admins It requires default cdk bootstrap. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.LakeFormationAdmin.isConstruct"></a>

```typescript
import { LakeFormationAdmin } from 'aws-analytics-reference-architecture'

LakeFormationAdmin.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.LakeFormationAdmin.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `addCdkExecRole` <a name="addCdkExecRole" id="aws-analytics-reference-architecture.LakeFormationAdmin.addCdkExecRole"></a>

```typescript
import { LakeFormationAdmin } from 'aws-analytics-reference-architecture'

LakeFormationAdmin.addCdkExecRole(scope: Construct, name: string)
```

Adds the CDK execution role to LF admins It requires default cdk bootstrap.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.LakeFormationAdmin.addCdkExecRole.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.LakeFormationAdmin.addCdkExecRole.parameter.name"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdmin.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdmin.property.catalogId">catalogId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdmin.property.principal">principal</a></code> | <code>aws-cdk-lib.aws_iam.IRole \| aws-cdk-lib.aws_iam.IUser</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.LakeFormationAdmin.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `catalogId`<sup>Required</sup> <a name="catalogId" id="aws-analytics-reference-architecture.LakeFormationAdmin.property.catalogId"></a>

```typescript
public readonly catalogId: string;
```

- *Type:* string

---

##### `principal`<sup>Required</sup> <a name="principal" id="aws-analytics-reference-architecture.LakeFormationAdmin.property.principal"></a>

```typescript
public readonly principal: IRole | IUser;
```

- *Type:* aws-cdk-lib.aws_iam.IRole | aws-cdk-lib.aws_iam.IUser

---


### LakeFormationS3Location <a name="LakeFormationS3Location" id="aws-analytics-reference-architecture.LakeFormationS3Location"></a>

This CDK construct aims to register an S3 Location for Lakeformation with Read and Write access.

If the location is in a different account, cross account access should be granted via the [S3CrossAccount]{@link S3CrossAccount } construct.
If the S3 location is encrypted with KMS, the key must be explicitly passed to the construct because CDK cannot retrieve bucket encryption key from imported buckets. 
Imported buckets are generally used in cross account setup like data mesh.

This construct instantiate 2 objects:
* An IAM role with read/write permissions to the S3 location and encrypt/decrypt access to the KMS key used to encypt the bucket
* A CfnResource is based on an IAM role with 2 policy statement folowing the least privilege AWS best practices:
  * Statement 1 for S3 permissions
  * Statement 2 for KMS permissions if the bucket is encrypted

The CDK construct instantiate the CfnResource in order to register the S3 location with Lakeformation using the IAM role defined above.

Usage example:
```typescript
import * as cdk from 'aws-cdk-lib';
import { LakeformationS3Location } from 'aws-analytics-reference-architecture';

const exampleApp = new cdk.App();
const stack = new cdk.Stack(exampleApp, 'LakeformationS3LocationStack');

const myKey = new Key(stack, 'MyKey')
const myBucket = new Bucket(stack, 'MyBucket', {
  encryptionKey: myKey,
})

new LakeFormationS3Location(stack, 'MyLakeformationS3Location', {
  s3Location: {
    bucketName: myBucket.bucketName,
    objectKey: 'my-prefix',
  },
  kmsKeyId: myBucket.encryptionKey.keyId,
});
```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.LakeFormationS3Location.Initializer"></a>

```typescript
import { LakeFormationS3Location } from 'aws-analytics-reference-architecture'

new LakeFormationS3Location(scope: Construct, id: string, props: LakeFormationS3LocationProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3Location.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3Location.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3Location.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.LakeFormationS3LocationProps">LakeFormationS3LocationProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.LakeFormationS3Location.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.LakeFormationS3Location.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.LakeFormationS3Location.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.LakeFormationS3LocationProps">LakeFormationS3LocationProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3Location.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.LakeFormationS3Location.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3Location.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.LakeFormationS3Location.isConstruct"></a>

```typescript
import { LakeFormationS3Location } from 'aws-analytics-reference-architecture'

LakeFormationS3Location.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.LakeFormationS3Location.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3Location.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3Location.property.dataAccessRole">dataAccessRole</a></code> | <code>aws-cdk-lib.aws_iam.Role</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.LakeFormationS3Location.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `dataAccessRole`<sup>Required</sup> <a name="dataAccessRole" id="aws-analytics-reference-architecture.LakeFormationS3Location.property.dataAccessRole"></a>

```typescript
public readonly dataAccessRole: Role;
```

- *Type:* aws-cdk-lib.aws_iam.Role

---


### NotebookPlatform <a name="NotebookPlatform" id="aws-analytics-reference-architecture.NotebookPlatform"></a>

A CDK construct to create a notebook infrastructure based on Amazon EMR Studio and assign users to it.

This construct is initialized through a constructor that takes as argument an interface defined in {@link NotebookPlatformProps}
The construct has a method to add users {@link addUser} the method take as argument {@link NotebookUserOptions}

Resources deployed:

* An S3 Bucket used by EMR Studio to store the Jupyter notebooks
* A KMS encryption Key used to encrypt an S3 bucket used by EMR Studio to store jupyter notebooks
* An EMR Studio service Role as defined here, and allowed to access the S3 bucket and KMS key created above
* An EMR Studio User Role as defined here - The policy template which is leveraged is the Basic one from the Amazon EMR Studio documentation
* Multiple EMR on EKS Managed Endpoints, each for a user or a group of users
* An execution role to be passed to the Managed endpoint from a policy provided by the user
* Multiple Session Policies that are used to map an EMR Studio user or group to a set of resources they are allowed to access. These resources are:
  * EMR Virtual Cluster - created above
  * ManagedEndpoint


Usage example:

```typescript
const emrEks = EmrEksCluster.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::012345678912:role/Admin-Admin',
  eksClusterName: 'cluster',
});

const notebookPlatform = new NotebookPlatform(stack, 'platform-notebook', {
  emrEks: emrEks,
  eksNamespace: 'platformns',
  studioName: 'platform',
  studioAuthMode: StudioAuthMode.SSO,
});

// If the S3 bucket is encrypted, add policy to the key for the role
const policy1 = new ManagedPolicy(stack, 'MyPolicy1', {
  statements: [
    new PolicyStatement({
      resources: <BUCKET ARN(s)>,
      actions: ['s3:*'],
    }),
    new PolicyStatement({
      resources: [
        stack.formatArn({
          account: Aws.ACCOUNT_ID,
          region: Aws.REGION,
          service: 'logs',
          resource: '*',
          arnFormat: ArnFormat.NO_RESOURCE_NAME,
        }),
      ],
      actions: [
        'logs:*',
      ],
    }),
  ],
});

notebookPlatform.addUser([{
  identityName: 'user1',
  identityType: SSOIdentityType.USER,
  notebookManagedEndpoints: [{
    emrOnEksVersion: EmrVersion.V6_9,
    executionPolicy: policy1,
  }],
}]);

```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.NotebookPlatform.Initializer"></a>

```typescript
import { NotebookPlatform } from 'aws-analytics-reference-architecture'

new NotebookPlatform(scope: Construct, id: string, props: NotebookPlatformProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the AWS CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the AWS CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps">NotebookPlatformProps</a></code> | the DataPlatformNotebooks [properties]{@link NotebookPlatformProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the AWS CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.id"></a>

- *Type:* string

the ID of the AWS CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.NotebookPlatformProps">NotebookPlatformProps</a>

the DataPlatformNotebooks [properties]{@link NotebookPlatformProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.addUser">addUser</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.NotebookPlatform.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addUser` <a name="addUser" id="aws-analytics-reference-architecture.NotebookPlatform.addUser"></a>

```typescript
public addUser(userList: NotebookUserOptions[]): Role[]
```

###### `userList`<sup>Required</sup> <a name="userList" id="aws-analytics-reference-architecture.NotebookPlatform.addUser.parameter.userList"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.NotebookUserOptions">NotebookUserOptions</a>[]

list of users.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.NotebookPlatform.isConstruct"></a>

```typescript
import { NotebookPlatform } from 'aws-analytics-reference-architecture'

NotebookPlatform.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.NotebookPlatform.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.NotebookPlatform.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### OpensearchCluster <a name="OpensearchCluster" id="aws-analytics-reference-architecture.OpensearchCluster"></a>

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.OpensearchCluster.Initializer"></a>

```typescript
import { OpensearchCluster } from 'aws-analytics-reference-architecture'

new OpensearchCluster(scope: Construct, id: string, props: OpensearchClusterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the AWS CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the AWS CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.OpensearchClusterProps">OpensearchClusterProps</a></code> | the OpensearchCluster [properties]{@link OpensearchClusterProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.OpensearchCluster.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the AWS CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.OpensearchCluster.Initializer.parameter.id"></a>

- *Type:* string

the ID of the AWS CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.OpensearchCluster.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.OpensearchClusterProps">OpensearchClusterProps</a>

the OpensearchCluster [properties]{@link OpensearchClusterProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.addAccessRole">addAccessRole</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.addAdminUser">addAdminUser</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.addDasboardUser">addDasboardUser</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.addIndex">addIndex</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.addRole">addRole</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.addRoleMapping">addRoleMapping</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.addRollupStrategy">addRollupStrategy</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.addUser">addUser</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.OpensearchCluster.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAccessRole` <a name="addAccessRole" id="aws-analytics-reference-architecture.OpensearchCluster.addAccessRole"></a>

```typescript
public addAccessRole(id: string, role: Role): void
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.OpensearchCluster.addAccessRole.parameter.id"></a>

- *Type:* string

a unique id.

---

###### `role`<sup>Required</sup> <a name="role" id="aws-analytics-reference-architecture.OpensearchCluster.addAccessRole.parameter.role"></a>

- *Type:* aws-cdk-lib.aws_iam.Role

the iam role.

---

##### `addAdminUser` <a name="addAdminUser" id="aws-analytics-reference-architecture.OpensearchCluster.addAdminUser"></a>

```typescript
public addAdminUser(id: string, username: string): void
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.OpensearchCluster.addAdminUser.parameter.id"></a>

- *Type:* string

a unique id.

---

###### `username`<sup>Required</sup> <a name="username" id="aws-analytics-reference-architecture.OpensearchCluster.addAdminUser.parameter.username"></a>

- *Type:* string

the username.

---

##### `addDasboardUser` <a name="addDasboardUser" id="aws-analytics-reference-architecture.OpensearchCluster.addDasboardUser"></a>

```typescript
public addDasboardUser(id: string, username: string): void
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.OpensearchCluster.addDasboardUser.parameter.id"></a>

- *Type:* string

a unique id.

---

###### `username`<sup>Required</sup> <a name="username" id="aws-analytics-reference-architecture.OpensearchCluster.addDasboardUser.parameter.username"></a>

- *Type:* string

the username.

---

##### `addIndex` <a name="addIndex" id="aws-analytics-reference-architecture.OpensearchCluster.addIndex"></a>

```typescript
public addIndex(id: string, name: string, template: any): void
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.OpensearchCluster.addIndex.parameter.id"></a>

- *Type:* string

a unique id.

---

###### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.OpensearchCluster.addIndex.parameter.name"></a>

- *Type:* string

the role name.

---

###### `template`<sup>Required</sup> <a name="template" id="aws-analytics-reference-architecture.OpensearchCluster.addIndex.parameter.template"></a>

- *Type:* any

the permissions template.

---

##### `addRole` <a name="addRole" id="aws-analytics-reference-architecture.OpensearchCluster.addRole"></a>

```typescript
public addRole(id: string, name: string, template: object): void
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.OpensearchCluster.addRole.parameter.id"></a>

- *Type:* string

a unique id.

---

###### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.OpensearchCluster.addRole.parameter.name"></a>

- *Type:* string

the role name.

---

###### `template`<sup>Required</sup> <a name="template" id="aws-analytics-reference-architecture.OpensearchCluster.addRole.parameter.template"></a>

- *Type:* object

the permissions template.

---

##### `addRoleMapping` <a name="addRoleMapping" id="aws-analytics-reference-architecture.OpensearchCluster.addRoleMapping"></a>

```typescript
public addRoleMapping(id: string, name: string, role: Role): void
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.OpensearchCluster.addRoleMapping.parameter.id"></a>

- *Type:* string

a unique id.

---

###### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.OpensearchCluster.addRoleMapping.parameter.name"></a>

- *Type:* string

the role name.

---

###### `role`<sup>Required</sup> <a name="role" id="aws-analytics-reference-architecture.OpensearchCluster.addRoleMapping.parameter.role"></a>

- *Type:* aws-cdk-lib.aws_iam.Role

the iam role.

---

##### `addRollupStrategy` <a name="addRollupStrategy" id="aws-analytics-reference-architecture.OpensearchCluster.addRollupStrategy"></a>

```typescript
public addRollupStrategy(id: string, name: string, template: any): void
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.OpensearchCluster.addRollupStrategy.parameter.id"></a>

- *Type:* string

a unique id.

---

###### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.OpensearchCluster.addRollupStrategy.parameter.name"></a>

- *Type:* string

the role name.

---

###### `template`<sup>Required</sup> <a name="template" id="aws-analytics-reference-architecture.OpensearchCluster.addRollupStrategy.parameter.template"></a>

- *Type:* any

the permissions template.

---

##### `addUser` <a name="addUser" id="aws-analytics-reference-architecture.OpensearchCluster.addUser"></a>

```typescript
public addUser(id: string, username: string, template: string[]): void
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.OpensearchCluster.addUser.parameter.id"></a>

- *Type:* string

a unique id.

---

###### `username`<sup>Required</sup> <a name="username" id="aws-analytics-reference-architecture.OpensearchCluster.addUser.parameter.username"></a>

- *Type:* string

the username.

---

###### `template`<sup>Required</sup> <a name="template" id="aws-analytics-reference-architecture.OpensearchCluster.addUser.parameter.template"></a>

- *Type:* string[]

the permissions template.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.getOrCreate">getOrCreate</a></code> | *No description.* |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.OpensearchCluster.isConstruct"></a>

```typescript
import { OpensearchCluster } from 'aws-analytics-reference-architecture'

OpensearchCluster.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.OpensearchCluster.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.OpensearchCluster.getOrCreate"></a>

```typescript
import { OpensearchCluster } from 'aws-analytics-reference-architecture'

OpensearchCluster.getOrCreate(scope: Construct, props: OpensearchClusterProps)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.OpensearchCluster.getOrCreate.parameter.scope"></a>

- *Type:* constructs.Construct

the CDK scope used to search or create the cluster.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.OpensearchCluster.getOrCreate.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.OpensearchClusterProps">OpensearchClusterProps</a>

the OpensearchClusterProps [properties]{@link OpensearchClusterProps} if created.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.OpensearchCluster.property.domain">domain</a></code> | <code>aws-cdk-lib.aws_opensearchservice.Domain</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.OpensearchCluster.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `domain`<sup>Required</sup> <a name="domain" id="aws-analytics-reference-architecture.OpensearchCluster.property.domain"></a>

```typescript
public readonly domain: Domain;
```

- *Type:* aws-cdk-lib.aws_opensearchservice.Domain

---


### S3CrossAccount <a name="S3CrossAccount" id="aws-analytics-reference-architecture.S3CrossAccount"></a>

This CDK construct grants cross account permissions on an Amazon S3 location.

It uses a bucket policy and an Amazon KMS Key policy if the bucket is encrypted with KMS.
The cross account permission is granted to the entire account and not to a specific principal in this account.
It's the responsibility of the target account to grant permissions to the relevant principals.

Note that it uses a Bucket object and not an IBucket because CDK can only add policies to objects managed in the CDK stack.

Usage example:
```typescript
import * as cdk from 'aws-cdk-lib';
import { S3CrossAccount } from 'aws-analytics-reference-architecture';

const exampleApp = new cdk.App();
const stack = new cdk.Stack(exampleApp, 'S3CrossAccountStack');

const myBucket = new Bucket(stack, 'MyBucket')

new S3CrossAccount(stack, 'S3CrossAccountGrant', {
  bucket: myBucket,
  s3ObjectKey: 'my-data',
  accountId: '1234567891011',
});
```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.S3CrossAccount.Initializer"></a>

```typescript
import { S3CrossAccount } from 'aws-analytics-reference-architecture'

new S3CrossAccount(scope: Construct, id: string, props: S3CrossAccountProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.S3CrossAccountProps">S3CrossAccountProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.S3CrossAccountProps">S3CrossAccountProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.S3CrossAccount.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.S3CrossAccount.isConstruct"></a>

```typescript
import { S3CrossAccount } from 'aws-analytics-reference-architecture'

S3CrossAccount.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.S3CrossAccount.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.S3CrossAccount.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### SingletonCfnLaunchTemplate <a name="SingletonCfnLaunchTemplate" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate"></a>

An Amazon S3 Bucket implementing the singleton pattern.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.Initializer"></a>

```typescript
import { SingletonCfnLaunchTemplate } from 'aws-analytics-reference-architecture'

new SingletonCfnLaunchTemplate(scope: Construct, id: string, props: CfnLaunchTemplateProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | - scope in which this resource is defined. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.Initializer.parameter.id">id</a></code> | <code>string</code> | - scoped id of the resource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.Initializer.parameter.props">props</a></code> | <code>aws-cdk-lib.aws_ec2.CfnLaunchTemplateProps</code> | - resource properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

scope in which this resource is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.Initializer.parameter.id"></a>

- *Type:* string

scoped id of the resource.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.Initializer.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_ec2.CfnLaunchTemplateProps

resource properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.overrideLogicalId">overrideLogicalId</a></code> | Overrides the auto-generated logical ID with a specific ID. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addDeletionOverride">addDeletionOverride</a></code> | Syntactic sugar for `addOverride(path, undefined)`. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addDependency">addDependency</a></code> | Indicates that this resource depends on another resource and cannot be provisioned unless the other resource has been successfully provisioned. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addDependsOn">addDependsOn</a></code> | Indicates that this resource depends on another resource and cannot be provisioned unless the other resource has been successfully provisioned. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addMetadata">addMetadata</a></code> | Add a value to the CloudFormation Resource Metadata. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addOverride">addOverride</a></code> | Adds an override to the synthesized CloudFormation resource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addPropertyDeletionOverride">addPropertyDeletionOverride</a></code> | Adds an override that deletes the value of a property from the resource definition. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addPropertyOverride">addPropertyOverride</a></code> | Adds an override to a resource property. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.applyRemovalPolicy">applyRemovalPolicy</a></code> | Sets the deletion policy of the resource based on the removal policy specified. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getAtt">getAtt</a></code> | Returns a token for an runtime attribute of this resource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getMetadata">getMetadata</a></code> | Retrieve a value value from the CloudFormation Resource Metadata. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.obtainDependencies">obtainDependencies</a></code> | Retrieves an array of resources this resource depends on. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.obtainResourceDependencies">obtainResourceDependencies</a></code> | Get a shallow copy of dependencies between this resource and other resources in the same stack. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.removeDependency">removeDependency</a></code> | Indicates that this resource no longer depends on another resource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.replaceDependency">replaceDependency</a></code> | Replaces one dependency with another. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.inspect">inspect</a></code> | Examines the CloudFormation resource and discloses attributes. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `overrideLogicalId` <a name="overrideLogicalId" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.overrideLogicalId"></a>

```typescript
public overrideLogicalId(newLogicalId: string): void
```

Overrides the auto-generated logical ID with a specific ID.

###### `newLogicalId`<sup>Required</sup> <a name="newLogicalId" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.overrideLogicalId.parameter.newLogicalId"></a>

- *Type:* string

The new logical ID to use for this stack element.

---

##### `addDeletionOverride` <a name="addDeletionOverride" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addDeletionOverride"></a>

```typescript
public addDeletionOverride(path: string): void
```

Syntactic sugar for `addOverride(path, undefined)`.

###### `path`<sup>Required</sup> <a name="path" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addDeletionOverride.parameter.path"></a>

- *Type:* string

The path of the value to delete.

---

##### `addDependency` <a name="addDependency" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addDependency"></a>

```typescript
public addDependency(target: CfnResource): void
```

Indicates that this resource depends on another resource and cannot be provisioned unless the other resource has been successfully provisioned.

This can be used for resources across stacks (or nested stack) boundaries
and the dependency will automatically be transferred to the relevant scope.

###### `target`<sup>Required</sup> <a name="target" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addDependency.parameter.target"></a>

- *Type:* aws-cdk-lib.CfnResource

---

##### ~~`addDependsOn`~~ <a name="addDependsOn" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addDependsOn"></a>

```typescript
public addDependsOn(target: CfnResource): void
```

Indicates that this resource depends on another resource and cannot be provisioned unless the other resource has been successfully provisioned.

###### `target`<sup>Required</sup> <a name="target" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addDependsOn.parameter.target"></a>

- *Type:* aws-cdk-lib.CfnResource

---

##### `addMetadata` <a name="addMetadata" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addMetadata"></a>

```typescript
public addMetadata(key: string, value: any): void
```

Add a value to the CloudFormation Resource Metadata.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html

Note that this is a different set of metadata from CDK node metadata; this
metadata ends up in the stack template under the resource, whereas CDK
node metadata ends up in the Cloud Assembly.](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html

Note that this is a different set of metadata from CDK node metadata; this
metadata ends up in the stack template under the resource, whereas CDK
node metadata ends up in the Cloud Assembly.)

###### `key`<sup>Required</sup> <a name="key" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addMetadata.parameter.key"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addMetadata.parameter.value"></a>

- *Type:* any

---

##### `addOverride` <a name="addOverride" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addOverride"></a>

```typescript
public addOverride(path: string, value: any): void
```

Adds an override to the synthesized CloudFormation resource.

To add a
property override, either use `addPropertyOverride` or prefix `path` with
"Properties." (i.e. `Properties.TopicName`).

If the override is nested, separate each nested level using a dot (.) in the path parameter.
If there is an array as part of the nesting, specify the index in the path.

To include a literal `.` in the property name, prefix with a `\`. In most
programming languages you will need to write this as `"\\."` because the
`\` itself will need to be escaped.

For example,
```typescript
cfnResource.addOverride('Properties.GlobalSecondaryIndexes.0.Projection.NonKeyAttributes', ['myattribute']);
cfnResource.addOverride('Properties.GlobalSecondaryIndexes.1.ProjectionType', 'INCLUDE');
```
would add the overrides
```json
"Properties": {
  "GlobalSecondaryIndexes": [
    {
      "Projection": {
        "NonKeyAttributes": [ "myattribute" ]
        ...
      }
      ...
    },
    {
      "ProjectionType": "INCLUDE"
      ...
    },
  ]
  ...
}
```

The `value` argument to `addOverride` will not be processed or translated
in any way. Pass raw JSON values in here with the correct capitalization
for CloudFormation. If you pass CDK classes or structs, they will be
rendered with lowercased key names, and CloudFormation will reject the
template.

###### `path`<sup>Required</sup> <a name="path" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addOverride.parameter.path"></a>

- *Type:* string

The path of the property, you can use dot notation to override values in complex types.

Any intermediate keys
will be created as needed.

---

###### `value`<sup>Required</sup> <a name="value" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addOverride.parameter.value"></a>

- *Type:* any

The value.

Could be primitive or complex.

---

##### `addPropertyDeletionOverride` <a name="addPropertyDeletionOverride" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addPropertyDeletionOverride"></a>

```typescript
public addPropertyDeletionOverride(propertyPath: string): void
```

Adds an override that deletes the value of a property from the resource definition.

###### `propertyPath`<sup>Required</sup> <a name="propertyPath" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addPropertyDeletionOverride.parameter.propertyPath"></a>

- *Type:* string

The path to the property.

---

##### `addPropertyOverride` <a name="addPropertyOverride" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addPropertyOverride"></a>

```typescript
public addPropertyOverride(propertyPath: string, value: any): void
```

Adds an override to a resource property.

Syntactic sugar for `addOverride("Properties.<...>", value)`.

###### `propertyPath`<sup>Required</sup> <a name="propertyPath" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addPropertyOverride.parameter.propertyPath"></a>

- *Type:* string

The path of the property.

---

###### `value`<sup>Required</sup> <a name="value" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.addPropertyOverride.parameter.value"></a>

- *Type:* any

The value.

---

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy?: RemovalPolicy, options?: RemovalPolicyOptions): void
```

Sets the deletion policy of the resource based on the removal policy specified.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`). In some
cases, a snapshot can be taken of the resource prior to deletion
(`RemovalPolicy.SNAPSHOT`). A list of resources that support this policy
can be found in the following link:

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html#aws-attribute-deletionpolicy-options](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html#aws-attribute-deletionpolicy-options)

###### `policy`<sup>Optional</sup> <a name="policy" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.applyRemovalPolicy.parameter.options"></a>

- *Type:* aws-cdk-lib.RemovalPolicyOptions

---

##### `getAtt` <a name="getAtt" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getAtt"></a>

```typescript
public getAtt(attributeName: string, typeHint?: ResolutionTypeHint): Reference
```

Returns a token for an runtime attribute of this resource.

Ideally, use generated attribute accessors (e.g. `resource.arn`), but this can be used for future compatibility
in case there is no generated attribute.

###### `attributeName`<sup>Required</sup> <a name="attributeName" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getAtt.parameter.attributeName"></a>

- *Type:* string

The name of the attribute.

---

###### `typeHint`<sup>Optional</sup> <a name="typeHint" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getAtt.parameter.typeHint"></a>

- *Type:* aws-cdk-lib.ResolutionTypeHint

---

##### `getMetadata` <a name="getMetadata" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getMetadata"></a>

```typescript
public getMetadata(key: string): any
```

Retrieve a value value from the CloudFormation Resource Metadata.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html

Note that this is a different set of metadata from CDK node metadata; this
metadata ends up in the stack template under the resource, whereas CDK
node metadata ends up in the Cloud Assembly.](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html

Note that this is a different set of metadata from CDK node metadata; this
metadata ends up in the stack template under the resource, whereas CDK
node metadata ends up in the Cloud Assembly.)

###### `key`<sup>Required</sup> <a name="key" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getMetadata.parameter.key"></a>

- *Type:* string

---

##### `obtainDependencies` <a name="obtainDependencies" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.obtainDependencies"></a>

```typescript
public obtainDependencies(): Stack | CfnResource[]
```

Retrieves an array of resources this resource depends on.

This assembles dependencies on resources across stacks (including nested stacks)
automatically.

##### `obtainResourceDependencies` <a name="obtainResourceDependencies" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.obtainResourceDependencies"></a>

```typescript
public obtainResourceDependencies(): CfnResource[]
```

Get a shallow copy of dependencies between this resource and other resources in the same stack.

##### `removeDependency` <a name="removeDependency" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.removeDependency"></a>

```typescript
public removeDependency(target: CfnResource): void
```

Indicates that this resource no longer depends on another resource.

This can be used for resources across stacks (including nested stacks)
and the dependency will automatically be removed from the relevant scope.

###### `target`<sup>Required</sup> <a name="target" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.removeDependency.parameter.target"></a>

- *Type:* aws-cdk-lib.CfnResource

---

##### `replaceDependency` <a name="replaceDependency" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.replaceDependency"></a>

```typescript
public replaceDependency(target: CfnResource, newTarget: CfnResource): void
```

Replaces one dependency with another.

###### `target`<sup>Required</sup> <a name="target" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.replaceDependency.parameter.target"></a>

- *Type:* aws-cdk-lib.CfnResource

The dependency to replace.

---

###### `newTarget`<sup>Required</sup> <a name="newTarget" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.replaceDependency.parameter.newTarget"></a>

- *Type:* aws-cdk-lib.CfnResource

The new dependency to add.

---

##### `inspect` <a name="inspect" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.inspect"></a>

```typescript
public inspect(inspector: TreeInspector): void
```

Examines the CloudFormation resource and discloses attributes.

###### `inspector`<sup>Required</sup> <a name="inspector" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.inspect.parameter.inspector"></a>

- *Type:* aws-cdk-lib.TreeInspector

tree inspector to collect and process attributes.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.isCfnElement">isCfnElement</a></code> | Returns `true` if a construct is a stack element (i.e. part of the synthesized cloudformation template). |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.isCfnResource">isCfnResource</a></code> | Check whether the given construct is a CfnResource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getOrCreate">getOrCreate</a></code> | *No description.* |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.isConstruct"></a>

```typescript
import { SingletonCfnLaunchTemplate } from 'aws-analytics-reference-architecture'

SingletonCfnLaunchTemplate.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isCfnElement` <a name="isCfnElement" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.isCfnElement"></a>

```typescript
import { SingletonCfnLaunchTemplate } from 'aws-analytics-reference-architecture'

SingletonCfnLaunchTemplate.isCfnElement(x: any)
```

Returns `true` if a construct is a stack element (i.e. part of the synthesized cloudformation template).

Uses duck-typing instead of `instanceof` to allow stack elements from different
versions of this library to be included in the same stack.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.isCfnElement.parameter.x"></a>

- *Type:* any

---

##### `isCfnResource` <a name="isCfnResource" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.isCfnResource"></a>

```typescript
import { SingletonCfnLaunchTemplate } from 'aws-analytics-reference-architecture'

SingletonCfnLaunchTemplate.isCfnResource(construct: IConstruct)
```

Check whether the given construct is a CfnResource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.isCfnResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getOrCreate"></a>

```typescript
import { SingletonCfnLaunchTemplate } from 'aws-analytics-reference-architecture'

SingletonCfnLaunchTemplate.getOrCreate(scope: Construct, name: string, data: string)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getOrCreate.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getOrCreate.parameter.name"></a>

- *Type:* string

---

###### `data`<sup>Required</sup> <a name="data" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.getOrCreate.parameter.data"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.creationStack">creationStack</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.logicalId">logicalId</a></code> | <code>string</code> | The logical ID for this CloudFormation stack element. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this element is defined. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.ref">ref</a></code> | <code>string</code> | Return a string that will be resolved to a CloudFormation `{ Ref }` for this element. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.cfnOptions">cfnOptions</a></code> | <code>aws-cdk-lib.ICfnResourceOptions</code> | Options for this resource, such as condition, update policy etc. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.cfnResourceType">cfnResourceType</a></code> | <code>string</code> | AWS resource type. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.attrDefaultVersionNumber">attrDefaultVersionNumber</a></code> | <code>string</code> | The default version of the launch template, such as 2. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.attrLatestVersionNumber">attrLatestVersionNumber</a></code> | <code>string</code> | The latest version of the launch template, such as `5` . |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.launchTemplateData">launchTemplateData</a></code> | <code>aws-cdk-lib.IResolvable \| aws-cdk-lib.aws_ec2.CfnLaunchTemplate.LaunchTemplateDataProperty</code> | The information for the launch template. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.launchTemplateName">launchTemplateName</a></code> | <code>string</code> | A name for the launch template. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.tagSpecifications">tagSpecifications</a></code> | <code>aws-cdk-lib.IResolvable \| aws-cdk-lib.IResolvable \| aws-cdk-lib.aws_ec2.CfnLaunchTemplate.LaunchTemplateTagSpecificationProperty[]</code> | The tags to apply to the launch template on creation. |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.versionDescription">versionDescription</a></code> | <code>string</code> | A description for the first version of the launch template. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `creationStack`<sup>Required</sup> <a name="creationStack" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.creationStack"></a>

```typescript
public readonly creationStack: string[];
```

- *Type:* string[]

---

##### `logicalId`<sup>Required</sup> <a name="logicalId" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.logicalId"></a>

```typescript
public readonly logicalId: string;
```

- *Type:* string

The logical ID for this CloudFormation stack element.

The logical ID of the element
is calculated from the path of the resource node in the construct tree.

To override this value, use `overrideLogicalId(newLogicalId)`.

---

##### `stack`<sup>Required</sup> <a name="stack" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this element is defined.

CfnElements must be defined within a stack scope (directly or indirectly).

---

##### `ref`<sup>Required</sup> <a name="ref" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.ref"></a>

```typescript
public readonly ref: string;
```

- *Type:* string

Return a string that will be resolved to a CloudFormation `{ Ref }` for this element.

If, by any chance, the intrinsic reference of a resource is not a string, you could
coerce it to an IResolvable through `Lazy.any({ produce: resource.ref })`.

---

##### `cfnOptions`<sup>Required</sup> <a name="cfnOptions" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.cfnOptions"></a>

```typescript
public readonly cfnOptions: ICfnResourceOptions;
```

- *Type:* aws-cdk-lib.ICfnResourceOptions

Options for this resource, such as condition, update policy etc.

---

##### `cfnResourceType`<sup>Required</sup> <a name="cfnResourceType" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.cfnResourceType"></a>

```typescript
public readonly cfnResourceType: string;
```

- *Type:* string

AWS resource type.

---

##### `attrDefaultVersionNumber`<sup>Required</sup> <a name="attrDefaultVersionNumber" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.attrDefaultVersionNumber"></a>

```typescript
public readonly attrDefaultVersionNumber: string;
```

- *Type:* string

The default version of the launch template, such as 2.

The default version of a launch template cannot be specified in AWS CloudFormation . The default version can be set in the Amazon EC2 console or by using the `modify-launch-template` AWS CLI command.

---

##### `attrLatestVersionNumber`<sup>Required</sup> <a name="attrLatestVersionNumber" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.attrLatestVersionNumber"></a>

```typescript
public readonly attrLatestVersionNumber: string;
```

- *Type:* string

The latest version of the launch template, such as `5` .

---

##### `launchTemplateData`<sup>Required</sup> <a name="launchTemplateData" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.launchTemplateData"></a>

```typescript
public readonly launchTemplateData: IResolvable | LaunchTemplateDataProperty;
```

- *Type:* aws-cdk-lib.IResolvable | aws-cdk-lib.aws_ec2.CfnLaunchTemplate.LaunchTemplateDataProperty

The information for the launch template.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-launchtemplate.html#cfn-ec2-launchtemplate-launchtemplatedata](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-launchtemplate.html#cfn-ec2-launchtemplate-launchtemplatedata)

---

##### `launchTemplateName`<sup>Optional</sup> <a name="launchTemplateName" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.launchTemplateName"></a>

```typescript
public readonly launchTemplateName: string;
```

- *Type:* string

A name for the launch template.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-launchtemplate.html#cfn-ec2-launchtemplate-launchtemplatename](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-launchtemplate.html#cfn-ec2-launchtemplate-launchtemplatename)

---

##### `tagSpecifications`<sup>Optional</sup> <a name="tagSpecifications" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.tagSpecifications"></a>

```typescript
public readonly tagSpecifications: IResolvable | IResolvable | LaunchTemplateTagSpecificationProperty[];
```

- *Type:* aws-cdk-lib.IResolvable | aws-cdk-lib.IResolvable | aws-cdk-lib.aws_ec2.CfnLaunchTemplate.LaunchTemplateTagSpecificationProperty[]

The tags to apply to the launch template on creation.

To tag the launch template, the resource type must be `launch-template` .

> To specify the tags for the resources that are created when an instance is launched, you must use the `TagSpecifications` parameter in the [launch template data](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_RequestLaunchTemplateData.html) structure.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-launchtemplate.html#cfn-ec2-launchtemplate-tagspecifications](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-launchtemplate.html#cfn-ec2-launchtemplate-tagspecifications)

---

##### `versionDescription`<sup>Optional</sup> <a name="versionDescription" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.versionDescription"></a>

```typescript
public readonly versionDescription: string;
```

- *Type:* string

A description for the first version of the launch template.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-launchtemplate.html#cfn-ec2-launchtemplate-versiondescription](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-launchtemplate.html#cfn-ec2-launchtemplate-versiondescription)

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.CFN_RESOURCE_TYPE_NAME">CFN_RESOURCE_TYPE_NAME</a></code> | <code>string</code> | The CloudFormation resource type name for this resource class. |

---

##### `CFN_RESOURCE_TYPE_NAME`<sup>Required</sup> <a name="CFN_RESOURCE_TYPE_NAME" id="aws-analytics-reference-architecture.SingletonCfnLaunchTemplate.property.CFN_RESOURCE_TYPE_NAME"></a>

```typescript
public readonly CFN_RESOURCE_TYPE_NAME: string;
```

- *Type:* string

The CloudFormation resource type name for this resource class.

---

### SingletonGlueDatabase <a name="SingletonGlueDatabase" id="aws-analytics-reference-architecture.SingletonGlueDatabase"></a>

AWS Glue Database implementing the singleton pattern.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.SingletonGlueDatabase.Initializer"></a>

```typescript
import { SingletonGlueDatabase } from 'aws-analytics-reference-architecture'

new SingletonGlueDatabase(scope: Construct, id: string, props?: DatabaseProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.Initializer.parameter.props">props</a></code> | <code>@aws-cdk/aws-glue-alpha.DatabaseProps</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonGlueDatabase.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonGlueDatabase.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="aws-analytics-reference-architecture.SingletonGlueDatabase.Initializer.parameter.props"></a>

- *Type:* @aws-cdk/aws-glue-alpha.DatabaseProps

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.SingletonGlueDatabase.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-analytics-reference-architecture.SingletonGlueDatabase.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.SingletonGlueDatabase.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.fromDatabaseArn">fromDatabaseArn</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.getOrCreate">getOrCreate</a></code> | *No description.* |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SingletonGlueDatabase.isConstruct"></a>

```typescript
import { SingletonGlueDatabase } from 'aws-analytics-reference-architecture'

SingletonGlueDatabase.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SingletonGlueDatabase.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="aws-analytics-reference-architecture.SingletonGlueDatabase.isOwnedResource"></a>

```typescript
import { SingletonGlueDatabase } from 'aws-analytics-reference-architecture'

SingletonGlueDatabase.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.SingletonGlueDatabase.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="aws-analytics-reference-architecture.SingletonGlueDatabase.isResource"></a>

```typescript
import { SingletonGlueDatabase } from 'aws-analytics-reference-architecture'

SingletonGlueDatabase.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.SingletonGlueDatabase.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromDatabaseArn` <a name="fromDatabaseArn" id="aws-analytics-reference-architecture.SingletonGlueDatabase.fromDatabaseArn"></a>

```typescript
import { SingletonGlueDatabase } from 'aws-analytics-reference-architecture'

SingletonGlueDatabase.fromDatabaseArn(scope: Construct, id: string, databaseArn: string)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonGlueDatabase.fromDatabaseArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonGlueDatabase.fromDatabaseArn.parameter.id"></a>

- *Type:* string

---

###### `databaseArn`<sup>Required</sup> <a name="databaseArn" id="aws-analytics-reference-architecture.SingletonGlueDatabase.fromDatabaseArn.parameter.databaseArn"></a>

- *Type:* string

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.SingletonGlueDatabase.getOrCreate"></a>

```typescript
import { SingletonGlueDatabase } from 'aws-analytics-reference-architecture'

SingletonGlueDatabase.getOrCreate(scope: Construct, name: string)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonGlueDatabase.getOrCreate.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.SingletonGlueDatabase.getOrCreate.parameter.name"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.property.catalogArn">catalogArn</a></code> | <code>string</code> | ARN of the Glue catalog in which this database is stored. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.property.catalogId">catalogId</a></code> | <code>string</code> | The catalog id of the database (usually, the AWS account id). |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.property.databaseArn">databaseArn</a></code> | <code>string</code> | ARN of this database. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.property.databaseName">databaseName</a></code> | <code>string</code> | Name of this database. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDatabase.property.locationUri">locationUri</a></code> | <code>string</code> | Location URI of this database. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SingletonGlueDatabase.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-analytics-reference-architecture.SingletonGlueDatabase.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="aws-analytics-reference-architecture.SingletonGlueDatabase.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `catalogArn`<sup>Required</sup> <a name="catalogArn" id="aws-analytics-reference-architecture.SingletonGlueDatabase.property.catalogArn"></a>

```typescript
public readonly catalogArn: string;
```

- *Type:* string

ARN of the Glue catalog in which this database is stored.

---

##### `catalogId`<sup>Required</sup> <a name="catalogId" id="aws-analytics-reference-architecture.SingletonGlueDatabase.property.catalogId"></a>

```typescript
public readonly catalogId: string;
```

- *Type:* string

The catalog id of the database (usually, the AWS account id).

---

##### `databaseArn`<sup>Required</sup> <a name="databaseArn" id="aws-analytics-reference-architecture.SingletonGlueDatabase.property.databaseArn"></a>

```typescript
public readonly databaseArn: string;
```

- *Type:* string

ARN of this database.

---

##### `databaseName`<sup>Required</sup> <a name="databaseName" id="aws-analytics-reference-architecture.SingletonGlueDatabase.property.databaseName"></a>

```typescript
public readonly databaseName: string;
```

- *Type:* string

Name of this database.

---

##### `locationUri`<sup>Optional</sup> <a name="locationUri" id="aws-analytics-reference-architecture.SingletonGlueDatabase.property.locationUri"></a>

```typescript
public readonly locationUri: string;
```

- *Type:* string

Location URI of this database.

---


### SingletonKey <a name="SingletonKey" id="aws-analytics-reference-architecture.SingletonKey"></a>

An Amazon S3 Bucket implementing the singleton pattern.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.SingletonKey.Initializer"></a>

```typescript
import { SingletonKey } from 'aws-analytics-reference-architecture'

new SingletonKey(scope: Construct, id: string, props?: KeyProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.Initializer.parameter.props">props</a></code> | <code>aws-cdk-lib.aws_kms.KeyProps</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonKey.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonKey.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="aws-analytics-reference-architecture.SingletonKey.Initializer.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_kms.KeyProps

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.addAlias">addAlias</a></code> | Defines a new alias for the key. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.addToResourcePolicy">addToResourcePolicy</a></code> | Adds a statement to the KMS key resource policy. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.grant">grant</a></code> | Grant the indicated permissions on this key to the given principal. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.grantAdmin">grantAdmin</a></code> | Grant admins permissions using this key to the given principal. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.grantDecrypt">grantDecrypt</a></code> | Grant decryption permissions using this key to the given principal. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.grantEncrypt">grantEncrypt</a></code> | Grant encryption permissions using this key to the given principal. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.grantEncryptDecrypt">grantEncryptDecrypt</a></code> | Grant encryption and decryption permissions using this key to the given principal. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.grantGenerateMac">grantGenerateMac</a></code> | Grant permissions to generating MACs to the given principal. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.grantVerifyMac">grantVerifyMac</a></code> | Grant permissions to verifying MACs to the given principal. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.SingletonKey.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-analytics-reference-architecture.SingletonKey.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.SingletonKey.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addAlias` <a name="addAlias" id="aws-analytics-reference-architecture.SingletonKey.addAlias"></a>

```typescript
public addAlias(aliasName: string): Alias
```

Defines a new alias for the key.

###### `aliasName`<sup>Required</sup> <a name="aliasName" id="aws-analytics-reference-architecture.SingletonKey.addAlias.parameter.aliasName"></a>

- *Type:* string

---

##### `addToResourcePolicy` <a name="addToResourcePolicy" id="aws-analytics-reference-architecture.SingletonKey.addToResourcePolicy"></a>

```typescript
public addToResourcePolicy(statement: PolicyStatement, allowNoOp?: boolean): AddToResourcePolicyResult
```

Adds a statement to the KMS key resource policy.

###### `statement`<sup>Required</sup> <a name="statement" id="aws-analytics-reference-architecture.SingletonKey.addToResourcePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

The policy statement to add.

---

###### `allowNoOp`<sup>Optional</sup> <a name="allowNoOp" id="aws-analytics-reference-architecture.SingletonKey.addToResourcePolicy.parameter.allowNoOp"></a>

- *Type:* boolean

If this is set to `false` and there is no policy defined (i.e. external key), the operation will fail. Otherwise, it will no-op.

---

##### `grant` <a name="grant" id="aws-analytics-reference-architecture.SingletonKey.grant"></a>

```typescript
public grant(grantee: IGrantable, actions: string): Grant
```

Grant the indicated permissions on this key to the given principal.

This modifies both the principal's policy as well as the resource policy,
since the default CloudFormation setup for KMS keys is that the policy
must not be empty and so default grants won't work.

###### `grantee`<sup>Required</sup> <a name="grantee" id="aws-analytics-reference-architecture.SingletonKey.grant.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

###### `actions`<sup>Required</sup> <a name="actions" id="aws-analytics-reference-architecture.SingletonKey.grant.parameter.actions"></a>

- *Type:* string

---

##### `grantAdmin` <a name="grantAdmin" id="aws-analytics-reference-architecture.SingletonKey.grantAdmin"></a>

```typescript
public grantAdmin(grantee: IGrantable): Grant
```

Grant admins permissions using this key to the given principal.

Key administrators have permissions to manage the key (e.g., change permissions, revoke), but do not have permissions
to use the key in cryptographic operations (e.g., encrypt, decrypt).

###### `grantee`<sup>Required</sup> <a name="grantee" id="aws-analytics-reference-architecture.SingletonKey.grantAdmin.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantDecrypt` <a name="grantDecrypt" id="aws-analytics-reference-architecture.SingletonKey.grantDecrypt"></a>

```typescript
public grantDecrypt(grantee: IGrantable): Grant
```

Grant decryption permissions using this key to the given principal.

###### `grantee`<sup>Required</sup> <a name="grantee" id="aws-analytics-reference-architecture.SingletonKey.grantDecrypt.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantEncrypt` <a name="grantEncrypt" id="aws-analytics-reference-architecture.SingletonKey.grantEncrypt"></a>

```typescript
public grantEncrypt(grantee: IGrantable): Grant
```

Grant encryption permissions using this key to the given principal.

###### `grantee`<sup>Required</sup> <a name="grantee" id="aws-analytics-reference-architecture.SingletonKey.grantEncrypt.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantEncryptDecrypt` <a name="grantEncryptDecrypt" id="aws-analytics-reference-architecture.SingletonKey.grantEncryptDecrypt"></a>

```typescript
public grantEncryptDecrypt(grantee: IGrantable): Grant
```

Grant encryption and decryption permissions using this key to the given principal.

###### `grantee`<sup>Required</sup> <a name="grantee" id="aws-analytics-reference-architecture.SingletonKey.grantEncryptDecrypt.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantGenerateMac` <a name="grantGenerateMac" id="aws-analytics-reference-architecture.SingletonKey.grantGenerateMac"></a>

```typescript
public grantGenerateMac(grantee: IGrantable): Grant
```

Grant permissions to generating MACs to the given principal.

###### `grantee`<sup>Required</sup> <a name="grantee" id="aws-analytics-reference-architecture.SingletonKey.grantGenerateMac.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantVerifyMac` <a name="grantVerifyMac" id="aws-analytics-reference-architecture.SingletonKey.grantVerifyMac"></a>

```typescript
public grantVerifyMac(grantee: IGrantable): Grant
```

Grant permissions to verifying MACs to the given principal.

###### `grantee`<sup>Required</sup> <a name="grantee" id="aws-analytics-reference-architecture.SingletonKey.grantVerifyMac.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.fromCfnKey">fromCfnKey</a></code> | Create a mutable `IKey` based on a low-level `CfnKey`. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.fromKeyArn">fromKeyArn</a></code> | Import an externally defined KMS Key using its ARN. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.fromLookup">fromLookup</a></code> | Import an existing Key by querying the AWS environment this stack is deployed to. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.getOrCreate">getOrCreate</a></code> | Get the Amazon KMS Key the AWS CDK Stack based on the provided name. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SingletonKey.isConstruct"></a>

```typescript
import { SingletonKey } from 'aws-analytics-reference-architecture'

SingletonKey.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SingletonKey.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="aws-analytics-reference-architecture.SingletonKey.isOwnedResource"></a>

```typescript
import { SingletonKey } from 'aws-analytics-reference-architecture'

SingletonKey.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.SingletonKey.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="aws-analytics-reference-architecture.SingletonKey.isResource"></a>

```typescript
import { SingletonKey } from 'aws-analytics-reference-architecture'

SingletonKey.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.SingletonKey.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromCfnKey` <a name="fromCfnKey" id="aws-analytics-reference-architecture.SingletonKey.fromCfnKey"></a>

```typescript
import { SingletonKey } from 'aws-analytics-reference-architecture'

SingletonKey.fromCfnKey(cfnKey: CfnKey)
```

Create a mutable `IKey` based on a low-level `CfnKey`.

This is most useful when combined with the cloudformation-include module.
This method is different than `fromKeyArn()` because the `IKey`
returned from this method is mutable;
meaning, calling any mutating methods on it,
like `IKey.addToResourcePolicy()`,
will actually be reflected in the resulting template,
as opposed to the object returned from `fromKeyArn()`,
on which calling those methods would have no effect.

###### `cfnKey`<sup>Required</sup> <a name="cfnKey" id="aws-analytics-reference-architecture.SingletonKey.fromCfnKey.parameter.cfnKey"></a>

- *Type:* aws-cdk-lib.aws_kms.CfnKey

---

##### `fromKeyArn` <a name="fromKeyArn" id="aws-analytics-reference-architecture.SingletonKey.fromKeyArn"></a>

```typescript
import { SingletonKey } from 'aws-analytics-reference-architecture'

SingletonKey.fromKeyArn(scope: Construct, id: string, keyArn: string)
```

Import an externally defined KMS Key using its ARN.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonKey.fromKeyArn.parameter.scope"></a>

- *Type:* constructs.Construct

the construct that will "own" the imported key.

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonKey.fromKeyArn.parameter.id"></a>

- *Type:* string

the id of the imported key in the construct tree.

---

###### `keyArn`<sup>Required</sup> <a name="keyArn" id="aws-analytics-reference-architecture.SingletonKey.fromKeyArn.parameter.keyArn"></a>

- *Type:* string

the ARN of an existing KMS key.

---

##### `fromLookup` <a name="fromLookup" id="aws-analytics-reference-architecture.SingletonKey.fromLookup"></a>

```typescript
import { SingletonKey } from 'aws-analytics-reference-architecture'

SingletonKey.fromLookup(scope: Construct, id: string, options: KeyLookupOptions)
```

Import an existing Key by querying the AWS environment this stack is deployed to.

This function only needs to be used to use Keys not defined in your CDK
application. If you are looking to share a Key between stacks, you can
pass the `Key` object between stacks and use it as normal. In addition,
it's not necessary to use this method if an interface accepts an `IKey`.
In this case, `Alias.fromAliasName()` can be used which returns an alias
that extends `IKey`.

Calling this method will lead to a lookup when the CDK CLI is executed.
You can therefore not use any values that will only be available at
CloudFormation execution time (i.e., Tokens).

The Key information will be cached in `cdk.context.json` and the same Key
will be used on future runs. To refresh the lookup, you will have to
evict the value from the cache using the `cdk context` command. See
https://docs.aws.amazon.com/cdk/latest/guide/context.html for more information.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonKey.fromLookup.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonKey.fromLookup.parameter.id"></a>

- *Type:* string

---

###### `options`<sup>Required</sup> <a name="options" id="aws-analytics-reference-architecture.SingletonKey.fromLookup.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_kms.KeyLookupOptions

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.SingletonKey.getOrCreate"></a>

```typescript
import { SingletonKey } from 'aws-analytics-reference-architecture'

SingletonKey.getOrCreate(scope: Construct, keyName: string)
```

Get the Amazon KMS Key the AWS CDK Stack based on the provided name.

If no key exists, it creates a new one.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonKey.getOrCreate.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `keyName`<sup>Required</sup> <a name="keyName" id="aws-analytics-reference-architecture.SingletonKey.getOrCreate.parameter.keyName"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.property.keyArn">keyArn</a></code> | <code>string</code> | The ARN of the key. |
| <code><a href="#aws-analytics-reference-architecture.SingletonKey.property.keyId">keyId</a></code> | <code>string</code> | The ID of the key (the part that looks something like: 1234abcd-12ab-34cd-56ef-1234567890ab). |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SingletonKey.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-analytics-reference-architecture.SingletonKey.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="aws-analytics-reference-architecture.SingletonKey.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `keyArn`<sup>Required</sup> <a name="keyArn" id="aws-analytics-reference-architecture.SingletonKey.property.keyArn"></a>

```typescript
public readonly keyArn: string;
```

- *Type:* string

The ARN of the key.

---

##### `keyId`<sup>Required</sup> <a name="keyId" id="aws-analytics-reference-architecture.SingletonKey.property.keyId"></a>

```typescript
public readonly keyId: string;
```

- *Type:* string

The ID of the key (the part that looks something like: 1234abcd-12ab-34cd-56ef-1234567890ab).

---


### SynchronousAthenaQuery <a name="SynchronousAthenaQuery" id="aws-analytics-reference-architecture.SynchronousAthenaQuery"></a>

Execute an Amazon Athena query synchronously during CDK deployment.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer"></a>

```typescript
import { SynchronousAthenaQuery } from 'aws-analytics-reference-architecture'

new SynchronousAthenaQuery(scope: Construct, id: string, props: SynchronousAthenaQueryProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps">SynchronousAthenaQueryProps</a></code> | the CrawlerStartWait [properties]{@link SynchronousAthenaQueryProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps">SynchronousAthenaQueryProps</a>

the CrawlerStartWait [properties]{@link SynchronousAthenaQueryProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.isConstruct"></a>

```typescript
import { SynchronousAthenaQuery } from 'aws-analytics-reference-architecture'

SynchronousAthenaQuery.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### SynchronousCrawler <a name="SynchronousCrawler" id="aws-analytics-reference-architecture.SynchronousCrawler"></a>

CrawlerStartWait Construct to start an AWS Glue Crawler execution and asynchronously wait for completion.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.SynchronousCrawler.Initializer"></a>

```typescript
import { SynchronousCrawler } from 'aws-analytics-reference-architecture'

new SynchronousCrawler(scope: Construct, id: string, props: SynchronousCrawlerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.SynchronousCrawlerProps">SynchronousCrawlerProps</a></code> | the CrawlerStartWait [properties]{@link SynchronousCrawlerProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.SynchronousCrawlerProps">SynchronousCrawlerProps</a>

the CrawlerStartWait [properties]{@link SynchronousCrawlerProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.SynchronousCrawler.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SynchronousCrawler.isConstruct"></a>

```typescript
import { SynchronousCrawler } from 'aws-analytics-reference-architecture'

SynchronousCrawler.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SynchronousCrawler.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SynchronousCrawler.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### SynchronousGlueJob <a name="SynchronousGlueJob" id="aws-analytics-reference-architecture.SynchronousGlueJob"></a>

SynchronousGlueJob Construct to start an AWS Glue Job execution and wait for completion during CDK deploy.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.SynchronousGlueJob.Initializer"></a>

```typescript
import { SynchronousGlueJob } from 'aws-analytics-reference-architecture'

new SynchronousGlueJob(scope: Construct, id: string, props: JobProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousGlueJob.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousGlueJob.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousGlueJob.Initializer.parameter.props">props</a></code> | <code>@aws-cdk/aws-glue-alpha.JobProps</code> | the SynchronousGlueJob properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SynchronousGlueJob.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SynchronousGlueJob.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.SynchronousGlueJob.Initializer.parameter.props"></a>

- *Type:* @aws-cdk/aws-glue-alpha.JobProps

the SynchronousGlueJob properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousGlueJob.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.SynchronousGlueJob.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousGlueJob.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SynchronousGlueJob.isConstruct"></a>

```typescript
import { SynchronousGlueJob } from 'aws-analytics-reference-architecture'

SynchronousGlueJob.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SynchronousGlueJob.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousGlueJob.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousGlueJob.property.glueJobLogStream">glueJobLogStream</a></code> | <code>string</code> | The Glue job logstream to check potential errors. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SynchronousGlueJob.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `glueJobLogStream`<sup>Required</sup> <a name="glueJobLogStream" id="aws-analytics-reference-architecture.SynchronousGlueJob.property.glueJobLogStream"></a>

```typescript
public readonly glueJobLogStream: string;
```

- *Type:* string

The Glue job logstream to check potential errors.

---


### TrackedConstruct <a name="TrackedConstruct" id="aws-analytics-reference-architecture.TrackedConstruct"></a>

A type of CDK Construct that is tracked via a unique code in Stack labels.

It is  used to measure the number of deployments and so the impact of the Analytics Reference Architecture.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.TrackedConstruct.Initializer"></a>

```typescript
import { TrackedConstruct } from 'aws-analytics-reference-architecture'

new TrackedConstruct(scope: Construct, id: string, props: TrackedConstructProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.TrackedConstruct.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.TrackedConstruct.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.TrackedConstruct.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.TrackedConstructProps">TrackedConstructProps</a></code> | the TrackedConstruct [properties]{@link TrackedConstructProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.TrackedConstruct.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.TrackedConstruct.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.TrackedConstruct.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.TrackedConstructProps">TrackedConstructProps</a>

the TrackedConstruct [properties]{@link TrackedConstructProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.TrackedConstruct.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.TrackedConstruct.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.TrackedConstruct.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.TrackedConstruct.isConstruct"></a>

```typescript
import { TrackedConstruct } from 'aws-analytics-reference-architecture'

TrackedConstruct.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.TrackedConstruct.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.TrackedConstruct.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.TrackedConstruct.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### AraBucketProps <a name="AraBucketProps" id="aws-analytics-reference-architecture.AraBucketProps"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.AraBucketProps.Initializer"></a>

```typescript
import { AraBucketProps } from 'aws-analytics-reference-architecture'

const araBucketProps: AraBucketProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.bucketName">bucketName</a></code> | <code>string</code> | The Amazon S3 bucket name. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.accessControl">accessControl</a></code> | <code>aws-cdk-lib.aws_s3.BucketAccessControl</code> | Specifies a canned ACL that grants predefined permissions to the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.autoDeleteObjects">autoDeleteObjects</a></code> | <code>boolean</code> | Whether all objects should be automatically deleted when the bucket is removed from the stack or when the stack is deleted. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.blockPublicAccess">blockPublicAccess</a></code> | <code>aws-cdk-lib.aws_s3.BlockPublicAccess</code> | The block public access configuration of this bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.bucketKeyEnabled">bucketKeyEnabled</a></code> | <code>boolean</code> | Specifies whether Amazon S3 should use an S3 Bucket Key with server-side encryption using KMS (SSE-KMS) for new objects in the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.cors">cors</a></code> | <code>aws-cdk-lib.aws_s3.CorsRule[]</code> | The CORS configuration of this bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.encryption">encryption</a></code> | <code>aws-cdk-lib.aws_s3.BucketEncryption</code> | The encryption mode for the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The KMS key for the bucket encryption. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.enforceSSL">enforceSSL</a></code> | <code>boolean</code> | Enforces SSL for requests. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.intelligentTieringConfigurations">intelligentTieringConfigurations</a></code> | <code>aws-cdk-lib.aws_s3.IntelligentTieringConfiguration[]</code> | Inteligent Tiering Configurations. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.inventories">inventories</a></code> | <code>aws-cdk-lib.aws_s3.Inventory[]</code> | The inventory configuration of the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.lifecycleRules">lifecycleRules</a></code> | <code>aws-cdk-lib.aws_s3.LifecycleRule[]</code> | Rules that define how Amazon S3 manages objects during their lifetime. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.metrics">metrics</a></code> | <code>aws-cdk-lib.aws_s3.BucketMetrics[]</code> | The metrics configuration of this bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.notificationsHandlerRole">notificationsHandlerRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The role to be used by the notifications handler. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.objectOwnership">objectOwnership</a></code> | <code>aws-cdk-lib.aws_s3.ObjectOwnership</code> | The objectOwnership of the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.publicReadAccess">publicReadAccess</a></code> | <code>boolean</code> | Grants public read access to all objects in the bucket. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.removalPolicy">removalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | Policy to apply when the bucket is removed from this stack. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.serverAccessLogsBucket">serverAccessLogsBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Destination bucket for the server access logs. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.serverAccessLogsPrefix">serverAccessLogsPrefix</a></code> | <code>string</code> | The log file prefix to use for the bucket's access logs. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.transferAcceleration">transferAcceleration</a></code> | <code>boolean</code> | Whether this bucket should have transfer acceleration turned on or not. |
| <code><a href="#aws-analytics-reference-architecture.AraBucketProps.property.versioned">versioned</a></code> | <code>boolean</code> | Whether this bucket should have versioning turned on or not. |

---

##### `bucketName`<sup>Required</sup> <a name="bucketName" id="aws-analytics-reference-architecture.AraBucketProps.property.bucketName"></a>

```typescript
public readonly bucketName: string;
```

- *Type:* string

The Amazon S3 bucket name.

The bucket name is postfixed with the AWS account ID and the AWS region

---

##### `accessControl`<sup>Optional</sup> <a name="accessControl" id="aws-analytics-reference-architecture.AraBucketProps.property.accessControl"></a>

```typescript
public readonly accessControl: BucketAccessControl;
```

- *Type:* aws-cdk-lib.aws_s3.BucketAccessControl
- *Default:* BucketAccessControl.PRIVATE

Specifies a canned ACL that grants predefined permissions to the bucket.

---

##### `autoDeleteObjects`<sup>Optional</sup> <a name="autoDeleteObjects" id="aws-analytics-reference-architecture.AraBucketProps.property.autoDeleteObjects"></a>

```typescript
public readonly autoDeleteObjects: boolean;
```

- *Type:* boolean
- *Default:* true

Whether all objects should be automatically deleted when the bucket is removed from the stack or when the stack is deleted.

Requires the `removalPolicy` to be set to `RemovalPolicy.DESTROY`.

---

##### `blockPublicAccess`<sup>Optional</sup> <a name="blockPublicAccess" id="aws-analytics-reference-architecture.AraBucketProps.property.blockPublicAccess"></a>

```typescript
public readonly blockPublicAccess: BlockPublicAccess;
```

- *Type:* aws-cdk-lib.aws_s3.BlockPublicAccess
- *Default:* Block all public access and no ACL or bucket policy can grant public access.

The block public access configuration of this bucket.

---

##### `bucketKeyEnabled`<sup>Optional</sup> <a name="bucketKeyEnabled" id="aws-analytics-reference-architecture.AraBucketProps.property.bucketKeyEnabled"></a>

```typescript
public readonly bucketKeyEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Specifies whether Amazon S3 should use an S3 Bucket Key with server-side encryption using KMS (SSE-KMS) for new objects in the bucket.

---

##### `cors`<sup>Optional</sup> <a name="cors" id="aws-analytics-reference-architecture.AraBucketProps.property.cors"></a>

```typescript
public readonly cors: CorsRule[];
```

- *Type:* aws-cdk-lib.aws_s3.CorsRule[]
- *Default:* No CORS configuration.

The CORS configuration of this bucket.

---

##### `encryption`<sup>Optional</sup> <a name="encryption" id="aws-analytics-reference-architecture.AraBucketProps.property.encryption"></a>

```typescript
public readonly encryption: BucketEncryption;
```

- *Type:* aws-cdk-lib.aws_s3.BucketEncryption
- *Default:* Server side encryption with AWS managed key (SSE-KMS)

The encryption mode for the bucket.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="aws-analytics-reference-architecture.AraBucketProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* if encryption is KMS, use a unique KMS key across the stack called `AraDefaultKmsKey`

The KMS key for the bucket encryption.

---

##### `enforceSSL`<sup>Optional</sup> <a name="enforceSSL" id="aws-analytics-reference-architecture.AraBucketProps.property.enforceSSL"></a>

```typescript
public readonly enforceSSL: boolean;
```

- *Type:* boolean
- *Default:* true

Enforces SSL for requests.

---

##### `intelligentTieringConfigurations`<sup>Optional</sup> <a name="intelligentTieringConfigurations" id="aws-analytics-reference-architecture.AraBucketProps.property.intelligentTieringConfigurations"></a>

```typescript
public readonly intelligentTieringConfigurations: IntelligentTieringConfiguration[];
```

- *Type:* aws-cdk-lib.aws_s3.IntelligentTieringConfiguration[]
- *Default:* No Intelligent Tiiering Configurations.

Inteligent Tiering Configurations.

---

##### `inventories`<sup>Optional</sup> <a name="inventories" id="aws-analytics-reference-architecture.AraBucketProps.property.inventories"></a>

```typescript
public readonly inventories: Inventory[];
```

- *Type:* aws-cdk-lib.aws_s3.Inventory[]
- *Default:* No inventory configuration

The inventory configuration of the bucket.

---

##### `lifecycleRules`<sup>Optional</sup> <a name="lifecycleRules" id="aws-analytics-reference-architecture.AraBucketProps.property.lifecycleRules"></a>

```typescript
public readonly lifecycleRules: LifecycleRule[];
```

- *Type:* aws-cdk-lib.aws_s3.LifecycleRule[]
- *Default:* No lifecycle rules.

Rules that define how Amazon S3 manages objects during their lifetime.

---

##### `metrics`<sup>Optional</sup> <a name="metrics" id="aws-analytics-reference-architecture.AraBucketProps.property.metrics"></a>

```typescript
public readonly metrics: BucketMetrics[];
```

- *Type:* aws-cdk-lib.aws_s3.BucketMetrics[]
- *Default:* No metrics configuration.

The metrics configuration of this bucket.

---

##### `notificationsHandlerRole`<sup>Optional</sup> <a name="notificationsHandlerRole" id="aws-analytics-reference-architecture.AraBucketProps.property.notificationsHandlerRole"></a>

```typescript
public readonly notificationsHandlerRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* a new role will be created.

The role to be used by the notifications handler.

---

##### `objectOwnership`<sup>Optional</sup> <a name="objectOwnership" id="aws-analytics-reference-architecture.AraBucketProps.property.objectOwnership"></a>

```typescript
public readonly objectOwnership: ObjectOwnership;
```

- *Type:* aws-cdk-lib.aws_s3.ObjectOwnership
- *Default:* Writer account will own the object.

The objectOwnership of the bucket.

---

##### `publicReadAccess`<sup>Optional</sup> <a name="publicReadAccess" id="aws-analytics-reference-architecture.AraBucketProps.property.publicReadAccess"></a>

```typescript
public readonly publicReadAccess: boolean;
```

- *Type:* boolean
- *Default:* false

Grants public read access to all objects in the bucket.

Similar to calling `bucket.grantPublicAccess()`

---

##### `removalPolicy`<sup>Optional</sup> <a name="removalPolicy" id="aws-analytics-reference-architecture.AraBucketProps.property.removalPolicy"></a>

```typescript
public readonly removalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* destroy the bucket

Policy to apply when the bucket is removed from this stack.

---

##### `serverAccessLogsBucket`<sup>Optional</sup> <a name="serverAccessLogsBucket" id="aws-analytics-reference-architecture.AraBucketProps.property.serverAccessLogsBucket"></a>

```typescript
public readonly serverAccessLogsBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket
- *Default:* if serverAccessLogsPrefix is defined, use a unique bucket across the stack called `s3-access-logs`

Destination bucket for the server access logs.

---

##### `serverAccessLogsPrefix`<sup>Optional</sup> <a name="serverAccessLogsPrefix" id="aws-analytics-reference-architecture.AraBucketProps.property.serverAccessLogsPrefix"></a>

```typescript
public readonly serverAccessLogsPrefix: string;
```

- *Type:* string
- *Default:* access are not logged

The log file prefix to use for the bucket's access logs.

---

##### `transferAcceleration`<sup>Optional</sup> <a name="transferAcceleration" id="aws-analytics-reference-architecture.AraBucketProps.property.transferAcceleration"></a>

```typescript
public readonly transferAcceleration: boolean;
```

- *Type:* boolean
- *Default:* false

Whether this bucket should have transfer acceleration turned on or not.

---

##### `versioned`<sup>Optional</sup> <a name="versioned" id="aws-analytics-reference-architecture.AraBucketProps.property.versioned"></a>

```typescript
public readonly versioned: boolean;
```

- *Type:* boolean
- *Default:* false

Whether this bucket should have versioning turned on or not.

---

### AthenaDemoSetupProps <a name="AthenaDemoSetupProps" id="aws-analytics-reference-architecture.AthenaDemoSetupProps"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.AthenaDemoSetupProps.Initializer"></a>

```typescript
import { AthenaDemoSetupProps } from 'aws-analytics-reference-architecture'

const athenaDemoSetupProps: AthenaDemoSetupProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDemoSetupProps.property.workgroupName">workgroupName</a></code> | <code>string</code> | The Amazon Athena workgroup name. |

---

##### `workgroupName`<sup>Optional</sup> <a name="workgroupName" id="aws-analytics-reference-architecture.AthenaDemoSetupProps.property.workgroupName"></a>

```typescript
public readonly workgroupName: string;
```

- *Type:* string
- *Default:* `demo` is used

The Amazon Athena workgroup name.

The name is also used

---

### BatchReplayerProps <a name="BatchReplayerProps" id="aws-analytics-reference-architecture.BatchReplayerProps"></a>

The properties for the BatchReplayer construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.BatchReplayerProps.Initializer"></a>

```typescript
import { BatchReplayerProps } from 'aws-analytics-reference-architecture'

const batchReplayerProps: BatchReplayerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.dataset">dataset</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The [PreparedDataset]{@link PreparedDataset} used to replay data. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.additionalStepFunctionTasks">additionalStepFunctionTasks</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IChainable[]</code> | Additional StupFunction Tasks to run sequentially after the BatchReplayer finishes. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.auroraProps">auroraProps</a></code> | <code><a href="#aws-analytics-reference-architecture.DbSink">DbSink</a></code> | Parameters to write to Aurora target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.ddbProps">ddbProps</a></code> | <code><a href="#aws-analytics-reference-architecture.DynamoDbSink">DynamoDbSink</a></code> | Parameters to write to DynamoDB target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.frequency">frequency</a></code> | <code>aws-cdk-lib.Duration</code> | The frequency of the replay. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.rdsProps">rdsProps</a></code> | <code><a href="#aws-analytics-reference-architecture.DbSink">DbSink</a></code> | Parameters to write to RDS target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.redshiftProps">redshiftProps</a></code> | <code><a href="#aws-analytics-reference-architecture.DbSink">DbSink</a></code> | Parameters to write to Redshift target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.s3Props">s3Props</a></code> | <code><a href="#aws-analytics-reference-architecture.S3Sink">S3Sink</a></code> | Parameters to write to S3 target. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.secGroup">secGroup</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup</code> | Security group for the WriteInBatch Lambda function. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC for the WriteInBatch Lambda function. |

---

##### `dataset`<sup>Required</sup> <a name="dataset" id="aws-analytics-reference-architecture.BatchReplayerProps.property.dataset"></a>

```typescript
public readonly dataset: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The [PreparedDataset]{@link PreparedDataset} used to replay data.

---

##### `additionalStepFunctionTasks`<sup>Optional</sup> <a name="additionalStepFunctionTasks" id="aws-analytics-reference-architecture.BatchReplayerProps.property.additionalStepFunctionTasks"></a>

```typescript
public readonly additionalStepFunctionTasks: IChainable[];
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IChainable[]
- *Default:* The BatchReplayer do not have additional Tasks  The expected input for the first Task in this sequence is:  input = [ { "processedRecords": Int, "outputPaths": String [], "startTimeinIso": String, "endTimeinIso": String } ]  Each element in input represents the output of each lambda iterator that replays the data.  param: processedRecods -> Number of records processed param: ouputPaths -> List of files created in S3  **  eg. "s3://<sinkBucket name>/<s3ObjectKeySink prefix, if any>/<dataset name>/ingestion_start=<timestamp>/ingestion_end=<timestamp>/<s3 filename>.csv",  param: startTimeinIso -> Start Timestamp on original dataset param: endTimeinIso -> End Timestamp on original dataset  *outputPaths* can be used to extract and aggregate new partitions on data and  trigger additional Tasks.

Additional StupFunction Tasks to run sequentially after the BatchReplayer finishes.

---

##### `auroraProps`<sup>Optional</sup> <a name="auroraProps" id="aws-analytics-reference-architecture.BatchReplayerProps.property.auroraProps"></a>

```typescript
public readonly auroraProps: DbSink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DbSink">DbSink</a>

Parameters to write to Aurora target.

---

##### `ddbProps`<sup>Optional</sup> <a name="ddbProps" id="aws-analytics-reference-architecture.BatchReplayerProps.property.ddbProps"></a>

```typescript
public readonly ddbProps: DynamoDbSink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DynamoDbSink">DynamoDbSink</a>

Parameters to write to DynamoDB target.

---

##### `frequency`<sup>Optional</sup> <a name="frequency" id="aws-analytics-reference-architecture.BatchReplayerProps.property.frequency"></a>

```typescript
public readonly frequency: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* The BatchReplayer is triggered every 60 seconds

The frequency of the replay.

---

##### `rdsProps`<sup>Optional</sup> <a name="rdsProps" id="aws-analytics-reference-architecture.BatchReplayerProps.property.rdsProps"></a>

```typescript
public readonly rdsProps: DbSink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DbSink">DbSink</a>

Parameters to write to RDS target.

---

##### `redshiftProps`<sup>Optional</sup> <a name="redshiftProps" id="aws-analytics-reference-architecture.BatchReplayerProps.property.redshiftProps"></a>

```typescript
public readonly redshiftProps: DbSink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DbSink">DbSink</a>

Parameters to write to Redshift target.

---

##### `s3Props`<sup>Optional</sup> <a name="s3Props" id="aws-analytics-reference-architecture.BatchReplayerProps.property.s3Props"></a>

```typescript
public readonly s3Props: S3Sink;
```

- *Type:* <a href="#aws-analytics-reference-architecture.S3Sink">S3Sink</a>

Parameters to write to S3 target.

---

##### `secGroup`<sup>Optional</sup> <a name="secGroup" id="aws-analytics-reference-architecture.BatchReplayerProps.property.secGroup"></a>

```typescript
public readonly secGroup: ISecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup

Security group for the WriteInBatch Lambda function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="aws-analytics-reference-architecture.BatchReplayerProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

VPC for the WriteInBatch Lambda function.

---

### CdkDeployerProps <a name="CdkDeployerProps" id="aws-analytics-reference-architecture.CdkDeployerProps"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.CdkDeployerProps.Initializer"></a>

```typescript
import { CdkDeployerProps } from 'aws-analytics-reference-architecture'

const cdkDeployerProps: CdkDeployerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.analyticsReporting">analyticsReporting</a></code> | <code>boolean</code> | Include runtime versioning information in this Stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.crossRegionReferences">crossRegionReferences</a></code> | <code>boolean</code> | Enable this flag to allow native cross region stack references. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.description">description</a></code> | <code>string</code> | A description of the stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.env">env</a></code> | <code>aws-cdk-lib.Environment</code> | The AWS environment (account/region) where this stack will be deployed. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.permissionsBoundary">permissionsBoundary</a></code> | <code>aws-cdk-lib.PermissionsBoundary</code> | Options for applying a permissions boundary to all IAM Roles and Users created within this Stage. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.stackName">stackName</a></code> | <code>string</code> | Name to deploy the stack with. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method to use while deploying this stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | Stack tags that will be applied to all the taggable resources and the stack itself. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether to enable termination protection for this stack. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.deploymentType">deploymentType</a></code> | <code><a href="#aws-analytics-reference-architecture.DeploymentType">DeploymentType</a></code> | The deployment type WORKSHOP_STUDIO: the CDK application is deployed through a workshop studio deployment process CLICK_TO_DEPLOY: the CDK application is deployed through a one-click deploy button. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.cdkAppLocation">cdkAppLocation</a></code> | <code>string</code> | The location of the CDK application in the repository. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.cdkParameters">cdkParameters</a></code> | <code>{[ key: string ]: aws-cdk-lib.CfnParameterProps}</code> | The CFN parameters to pass to the CDK application. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.cdkStack">cdkStack</a></code> | <code>string</code> | The CDK stack name to deploy. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.deployBuildSpec">deployBuildSpec</a></code> | <code>aws-cdk-lib.aws_codebuild.BuildSpec</code> | Deploy CodeBuild buildspec file name at the root of the cdk app folder. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.destroyBuildSpec">destroyBuildSpec</a></code> | <code>aws-cdk-lib.aws_codebuild.BuildSpec</code> | Destroy Codebuild buildspec file name at the root of the cdk app folder. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.gitBranch">gitBranch</a></code> | <code>string</code> | The branch to use on the Github repository. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.githubRepository">githubRepository</a></code> | <code>string</code> | The github repository containing the CDK application. |
| <code><a href="#aws-analytics-reference-architecture.CdkDeployerProps.property.s3Repository">s3Repository</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | The Amazon S3 repository location containing the CDK application. |

---

##### ~~`analyticsReporting`~~<sup>Optional</sup> <a name="analyticsReporting" id="aws-analytics-reference-architecture.CdkDeployerProps.property.analyticsReporting"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly analyticsReporting: boolean;
```

- *Type:* boolean
- *Default:* `analyticsReporting` setting of containing `App`, or value of 'aws:cdk:version-reporting' context key

Include runtime versioning information in this Stack.

---

##### ~~`crossRegionReferences`~~<sup>Optional</sup> <a name="crossRegionReferences" id="aws-analytics-reference-architecture.CdkDeployerProps.property.crossRegionReferences"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly crossRegionReferences: boolean;
```

- *Type:* boolean
- *Default:* false

Enable this flag to allow native cross region stack references.

Enabling this will create a CloudFormation custom resource
in both the producing stack and consuming stack in order to perform the export/import

This feature is currently experimental

---

##### ~~`description`~~<sup>Optional</sup> <a name="description" id="aws-analytics-reference-architecture.CdkDeployerProps.property.description"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the stack.

---

##### ~~`env`~~<sup>Optional</sup> <a name="env" id="aws-analytics-reference-architecture.CdkDeployerProps.property.env"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly env: Environment;
```

- *Type:* aws-cdk-lib.Environment
- *Default:* The environment of the containing `Stage` if available, otherwise create the stack will be environment-agnostic.

The AWS environment (account/region) where this stack will be deployed.

Set the `region`/`account` fields of `env` to either a concrete value to
select the indicated environment (recommended for production stacks), or to
the values of environment variables
`CDK_DEFAULT_REGION`/`CDK_DEFAULT_ACCOUNT` to let the target environment
depend on the AWS credentials/configuration that the CDK CLI is executed
under (recommended for development stacks).

If the `Stack` is instantiated inside a `Stage`, any undefined
`region`/`account` fields from `env` will default to the same field on the
encompassing `Stage`, if configured there.

If either `region` or `account` are not set nor inherited from `Stage`, the
Stack will be considered "*environment-agnostic*"". Environment-agnostic
stacks can be deployed to any environment but may not be able to take
advantage of all features of the CDK. For example, they will not be able to
use environmental context lookups such as `ec2.Vpc.fromLookup` and will not
automatically translate Service Principals to the right format based on the
environment's AWS partition, and other such enhancements.

---

*Example*

```typescript
// Use a concrete account and region to deploy this stack to:
// `.account` and `.region` will simply return these values.
new Stack(app, 'Stack1', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  },
});

// Use the CLI's current credentials to determine the target environment:
// `.account` and `.region` will reflect the account+region the CLI
// is configured to use (based on the user CLI credentials)
new Stack(app, 'Stack2', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});

// Define multiple stacks stage associated with an environment
const myStage = new Stage(app, 'MyStage', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  }
});

// both of these stacks will use the stage's account/region:
// `.account` and `.region` will resolve to the concrete values as above
new MyStack(myStage, 'Stack1');
new YourStack(myStage, 'Stack2');

// Define an environment-agnostic stack:
// `.account` and `.region` will resolve to `{ "Ref": "AWS::AccountId" }` and `{ "Ref": "AWS::Region" }` respectively.
// which will only resolve to actual values by CloudFormation during deployment.
new MyStack(app, 'Stack1');
```


##### ~~`permissionsBoundary`~~<sup>Optional</sup> <a name="permissionsBoundary" id="aws-analytics-reference-architecture.CdkDeployerProps.property.permissionsBoundary"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly permissionsBoundary: PermissionsBoundary;
```

- *Type:* aws-cdk-lib.PermissionsBoundary
- *Default:* no permissions boundary is applied

Options for applying a permissions boundary to all IAM Roles and Users created within this Stage.

---

##### ~~`stackName`~~<sup>Optional</sup> <a name="stackName" id="aws-analytics-reference-architecture.CdkDeployerProps.property.stackName"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly stackName: string;
```

- *Type:* string
- *Default:* Derived from construct path.

Name to deploy the stack with.

---

##### ~~`synthesizer`~~<sup>Optional</sup> <a name="synthesizer" id="aws-analytics-reference-architecture.CdkDeployerProps.property.synthesizer"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer
- *Default:* The synthesizer specified on `App`, or `DefaultStackSynthesizer` otherwise.

Synthesis method to use while deploying this stack.

The Stack Synthesizer controls aspects of synthesis and deployment,
like how assets are referenced and what IAM roles to use. For more
information, see the README of the main CDK package.

If not specified, the `defaultStackSynthesizer` from `App` will be used.
If that is not specified, `DefaultStackSynthesizer` is used if
`@aws-cdk/core:newStyleStackSynthesis` is set to `true` or the CDK major
version is v2. In CDK v1 `LegacyStackSynthesizer` is the default if no
other synthesizer is specified.

---

##### ~~`tags`~~<sup>Optional</sup> <a name="tags" id="aws-analytics-reference-architecture.CdkDeployerProps.property.tags"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* {}

Stack tags that will be applied to all the taggable resources and the stack itself.

---

##### ~~`terminationProtection`~~<sup>Optional</sup> <a name="terminationProtection" id="aws-analytics-reference-architecture.CdkDeployerProps.property.terminationProtection"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to enable termination protection for this stack.

---

##### ~~`deploymentType`~~<sup>Required</sup> <a name="deploymentType" id="aws-analytics-reference-architecture.CdkDeployerProps.property.deploymentType"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly deploymentType: DeploymentType;
```

- *Type:* <a href="#aws-analytics-reference-architecture.DeploymentType">DeploymentType</a>

The deployment type WORKSHOP_STUDIO: the CDK application is deployed through a workshop studio deployment process CLICK_TO_DEPLOY: the CDK application is deployed through a one-click deploy button.

---

##### ~~`cdkAppLocation`~~<sup>Optional</sup> <a name="cdkAppLocation" id="aws-analytics-reference-architecture.CdkDeployerProps.property.cdkAppLocation"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly cdkAppLocation: string;
```

- *Type:* string
- *Default:* The root of the repository

The location of the CDK application in the repository.

It is used to `cd` into the folder before deploying the CDK application

---

##### ~~`cdkParameters`~~<sup>Optional</sup> <a name="cdkParameters" id="aws-analytics-reference-architecture.CdkDeployerProps.property.cdkParameters"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly cdkParameters: {[ key: string ]: CfnParameterProps};
```

- *Type:* {[ key: string ]: aws-cdk-lib.CfnParameterProps}
- *Default:* No parameter is used

The CFN parameters to pass to the CDK application.

---

##### ~~`cdkStack`~~<sup>Optional</sup> <a name="cdkStack" id="aws-analytics-reference-architecture.CdkDeployerProps.property.cdkStack"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly cdkStack: string;
```

- *Type:* string
- *Default:* The default stack is deployed

The CDK stack name to deploy.

---

##### ~~`deployBuildSpec`~~<sup>Optional</sup> <a name="deployBuildSpec" id="aws-analytics-reference-architecture.CdkDeployerProps.property.deployBuildSpec"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly deployBuildSpec: BuildSpec;
```

- *Type:* aws-cdk-lib.aws_codebuild.BuildSpec

Deploy CodeBuild buildspec file name at the root of the cdk app folder.

---

##### ~~`destroyBuildSpec`~~<sup>Optional</sup> <a name="destroyBuildSpec" id="aws-analytics-reference-architecture.CdkDeployerProps.property.destroyBuildSpec"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly destroyBuildSpec: BuildSpec;
```

- *Type:* aws-cdk-lib.aws_codebuild.BuildSpec

Destroy Codebuild buildspec file name at the root of the cdk app folder.

---

##### ~~`gitBranch`~~<sup>Optional</sup> <a name="gitBranch" id="aws-analytics-reference-architecture.CdkDeployerProps.property.gitBranch"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly gitBranch: string;
```

- *Type:* string
- *Default:* The main branch of the repository

The branch to use on the Github repository.

---

##### ~~`githubRepository`~~<sup>Optional</sup> <a name="githubRepository" id="aws-analytics-reference-architecture.CdkDeployerProps.property.githubRepository"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly githubRepository: string;
```

- *Type:* string
- *Default:* Github is not used as the source of the CDK code.

The github repository containing the CDK application.

Either `githubRepository` or `s3Repository` needs to be set if `deploymentType` is `CLICK_TO_DEPLOY`.

---

##### ~~`s3Repository`~~<sup>Optional</sup> <a name="s3Repository" id="aws-analytics-reference-architecture.CdkDeployerProps.property.s3Repository"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer
The properties for the CdkDeployer construct.

```typescript
public readonly s3Repository: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location
- *Default:* S3 is not used as the source of the CDK code

The Amazon S3 repository location containing the CDK application.

The object key is a Zip file.
Either `githubRepository` or `s3Repository` needs to be set if `deploymentType` is `CLICK_TO_DEPLOY`.

---

### CentralGovernanceProps <a name="CentralGovernanceProps" id="aws-analytics-reference-architecture.CentralGovernanceProps"></a>

Properties for the CentralGovernance Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.CentralGovernanceProps.Initializer"></a>

```typescript
import { CentralGovernanceProps } from 'aws-analytics-reference-architecture'

const centralGovernanceProps: CentralGovernanceProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CentralGovernanceProps.property.lfTags">lfTags</a></code> | <code><a href="#aws-analytics-reference-architecture.LfTag">LfTag</a>[]</code> | LF tags. |

---

##### `lfTags`<sup>Optional</sup> <a name="lfTags" id="aws-analytics-reference-architecture.CentralGovernanceProps.property.lfTags"></a>

```typescript
public readonly lfTags: LfTag[];
```

- *Type:* <a href="#aws-analytics-reference-architecture.LfTag">LfTag</a>[]

LF tags.

---

### CustomDatasetProps <a name="CustomDatasetProps" id="aws-analytics-reference-architecture.CustomDatasetProps"></a>

The properties for the Bring Your Own Data generator.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.CustomDatasetProps.Initializer"></a>

```typescript
import { CustomDatasetProps } from 'aws-analytics-reference-architecture'

const customDatasetProps: CustomDatasetProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CustomDatasetProps.property.datetimeColumn">datetimeColumn</a></code> | <code>string</code> | The datetime column to use for data generation as the time reference. |
| <code><a href="#aws-analytics-reference-architecture.CustomDatasetProps.property.datetimeColumnsToAdjust">datetimeColumnsToAdjust</a></code> | <code>string[]</code> | The datetime columns to use for data generation. |
| <code><a href="#aws-analytics-reference-architecture.CustomDatasetProps.property.inputFormat">inputFormat</a></code> | <code><a href="#aws-analytics-reference-architecture.CustomDatasetInputFormat">CustomDatasetInputFormat</a></code> | The format of the input data. |
| <code><a href="#aws-analytics-reference-architecture.CustomDatasetProps.property.partitionRange">partitionRange</a></code> | <code>aws-cdk-lib.Duration</code> | The interval to partition data and optimize the data generation in Minutes. |
| <code><a href="#aws-analytics-reference-architecture.CustomDatasetProps.property.s3Location">s3Location</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | The S3 location of the input data. |
| <code><a href="#aws-analytics-reference-architecture.CustomDatasetProps.property.approximateDataSize">approximateDataSize</a></code> | <code>number</code> | Approximate data size (in GB) of the custom dataset. |

---

##### `datetimeColumn`<sup>Required</sup> <a name="datetimeColumn" id="aws-analytics-reference-architecture.CustomDatasetProps.property.datetimeColumn"></a>

```typescript
public readonly datetimeColumn: string;
```

- *Type:* string

The datetime column to use for data generation as the time reference.

---

##### `datetimeColumnsToAdjust`<sup>Required</sup> <a name="datetimeColumnsToAdjust" id="aws-analytics-reference-architecture.CustomDatasetProps.property.datetimeColumnsToAdjust"></a>

```typescript
public readonly datetimeColumnsToAdjust: string[];
```

- *Type:* string[]

The datetime columns to use for data generation.

---

##### `inputFormat`<sup>Required</sup> <a name="inputFormat" id="aws-analytics-reference-architecture.CustomDatasetProps.property.inputFormat"></a>

```typescript
public readonly inputFormat: CustomDatasetInputFormat;
```

- *Type:* <a href="#aws-analytics-reference-architecture.CustomDatasetInputFormat">CustomDatasetInputFormat</a>

The format of the input data.

---

##### `partitionRange`<sup>Required</sup> <a name="partitionRange" id="aws-analytics-reference-architecture.CustomDatasetProps.property.partitionRange"></a>

```typescript
public readonly partitionRange: Duration;
```

- *Type:* aws-cdk-lib.Duration

The interval to partition data and optimize the data generation in Minutes.

---

##### `s3Location`<sup>Required</sup> <a name="s3Location" id="aws-analytics-reference-architecture.CustomDatasetProps.property.s3Location"></a>

```typescript
public readonly s3Location: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

The S3 location of the input data.

---

##### `approximateDataSize`<sup>Optional</sup> <a name="approximateDataSize" id="aws-analytics-reference-architecture.CustomDatasetProps.property.approximateDataSize"></a>

```typescript
public readonly approximateDataSize: number;
```

- *Type:* number
- *Default:* The Glue job responsible for preparing the data uses autoscaling with a maximum of 100 workers

Approximate data size (in GB) of the custom dataset.

---

### DataDomainProps <a name="DataDomainProps" id="aws-analytics-reference-architecture.DataDomainProps"></a>

Properties for the DataDomain Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.DataDomainProps.Initializer"></a>

```typescript
import { DataDomainProps } from 'aws-analytics-reference-architecture'

const dataDomainProps: DataDomainProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataDomainProps.property.centralAccountId">centralAccountId</a></code> | <code>string</code> | Central Governance account Id. |
| <code><a href="#aws-analytics-reference-architecture.DataDomainProps.property.domainName">domainName</a></code> | <code>string</code> | Data domain name. |
| <code><a href="#aws-analytics-reference-architecture.DataDomainProps.property.crawlerWorkflow">crawlerWorkflow</a></code> | <code>boolean</code> | Flag to create a Crawler workflow in Data Domain account. |

---

##### `centralAccountId`<sup>Required</sup> <a name="centralAccountId" id="aws-analytics-reference-architecture.DataDomainProps.property.centralAccountId"></a>

```typescript
public readonly centralAccountId: string;
```

- *Type:* string

Central Governance account Id.

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="aws-analytics-reference-architecture.DataDomainProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

Data domain name.

---

##### `crawlerWorkflow`<sup>Optional</sup> <a name="crawlerWorkflow" id="aws-analytics-reference-architecture.DataDomainProps.property.crawlerWorkflow"></a>

```typescript
public readonly crawlerWorkflow: boolean;
```

- *Type:* boolean

Flag to create a Crawler workflow in Data Domain account.

---

### DataLakeExporterProps <a name="DataLakeExporterProps" id="aws-analytics-reference-architecture.DataLakeExporterProps"></a>

The properties for DataLakeExporter Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.DataLakeExporterProps.Initializer"></a>

```typescript
import { DataLakeExporterProps } from 'aws-analytics-reference-architecture'

const dataLakeExporterProps: DataLakeExporterProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.sinkBucket">sinkBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | Amazon S3 sink Bucket where the data lake exporter write data. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueDatabase">sourceGlueDatabase</a></code> | <code>@aws-cdk/aws-glue-alpha.Database</code> | Source AWS Glue Database containing the schema of the stream. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueTable">sourceGlueTable</a></code> | <code>@aws-cdk/aws-glue-alpha.Table</code> | Source AWS Glue Table containing the schema of the stream. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceKinesisDataStream">sourceKinesisDataStream</a></code> | <code>aws-cdk-lib.aws_kinesis.Stream</code> | Source must be an Amazon Kinesis Data Stream. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.deliveryInterval">deliveryInterval</a></code> | <code>number</code> | Delivery interval in seconds. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.deliverySize">deliverySize</a></code> | <code>number</code> | Maximum delivery size in MB. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.sinkObjectKey">sinkObjectKey</a></code> | <code>string</code> | Amazon S3 sink object key where the data lake exporter write data. |

---

##### `sinkBucket`<sup>Required</sup> <a name="sinkBucket" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.sinkBucket"></a>

```typescript
public readonly sinkBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

Amazon S3 sink Bucket where the data lake exporter write data.

---

##### `sourceGlueDatabase`<sup>Required</sup> <a name="sourceGlueDatabase" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueDatabase"></a>

```typescript
public readonly sourceGlueDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue-alpha.Database

Source AWS Glue Database containing the schema of the stream.

---

##### `sourceGlueTable`<sup>Required</sup> <a name="sourceGlueTable" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueTable"></a>

```typescript
public readonly sourceGlueTable: Table;
```

- *Type:* @aws-cdk/aws-glue-alpha.Table

Source AWS Glue Table containing the schema of the stream.

---

##### `sourceKinesisDataStream`<sup>Required</sup> <a name="sourceKinesisDataStream" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceKinesisDataStream"></a>

```typescript
public readonly sourceKinesisDataStream: Stream;
```

- *Type:* aws-cdk-lib.aws_kinesis.Stream

Source must be an Amazon Kinesis Data Stream.

---

##### `deliveryInterval`<sup>Optional</sup> <a name="deliveryInterval" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.deliveryInterval"></a>

```typescript
public readonly deliveryInterval: number;
```

- *Type:* number
- *Default:* Set to 900 seconds

Delivery interval in seconds.

The frequency of the data delivery is defined by this interval.

---

##### `deliverySize`<sup>Optional</sup> <a name="deliverySize" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.deliverySize"></a>

```typescript
public readonly deliverySize: number;
```

- *Type:* number
- *Default:* Set to 128 MB

Maximum delivery size in MB.

The frequency of the data delivery is defined by this maximum delivery size.

---

##### `sinkObjectKey`<sup>Optional</sup> <a name="sinkObjectKey" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.sinkObjectKey"></a>

```typescript
public readonly sinkObjectKey: string;
```

- *Type:* string
- *Default:* The data is written at the bucket root

Amazon S3 sink object key where the data lake exporter write data.

---

### DataLakeStorageProps <a name="DataLakeStorageProps" id="aws-analytics-reference-architecture.DataLakeStorageProps"></a>

Properties for the DataLakeStorage Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.DataLakeStorageProps.Initializer"></a>

```typescript
import { DataLakeStorageProps } from 'aws-analytics-reference-architecture'

const dataLakeStorageProps: DataLakeStorageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorageProps.property.cleanArchiveDelay">cleanArchiveDelay</a></code> | <code>number</code> | Delay (in days) before archiving CLEAN data to frozen storage (Glacier storage class). |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorageProps.property.cleanInfrequentAccessDelay">cleanInfrequentAccessDelay</a></code> | <code>number</code> | Delay (in days) before moving CLEAN data to cold storage (Infrequent Access storage class). |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorageProps.property.rawArchiveDelay">rawArchiveDelay</a></code> | <code>number</code> | Delay (in days) before archiving RAW data to frozen storage (Glacier storage class). |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorageProps.property.rawInfrequentAccessDelay">rawInfrequentAccessDelay</a></code> | <code>number</code> | Delay (in days) before moving RAW data to cold storage (Infrequent Access storage class). |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorageProps.property.transformArchiveDelay">transformArchiveDelay</a></code> | <code>number</code> | Delay (in days) before archiving TRANSFORM data to frozen storage (Glacier storage class). |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorageProps.property.transformInfrequentAccessDelay">transformInfrequentAccessDelay</a></code> | <code>number</code> | Delay (in days) before moving TRANSFORM data to cold storage (Infrequent Access storage class). |

---

##### `cleanArchiveDelay`<sup>Optional</sup> <a name="cleanArchiveDelay" id="aws-analytics-reference-architecture.DataLakeStorageProps.property.cleanArchiveDelay"></a>

```typescript
public readonly cleanArchiveDelay: number;
```

- *Type:* number
- *Default:* Objects are not archived to Glacier

Delay (in days) before archiving CLEAN data to frozen storage (Glacier storage class).

---

##### `cleanInfrequentAccessDelay`<sup>Optional</sup> <a name="cleanInfrequentAccessDelay" id="aws-analytics-reference-architecture.DataLakeStorageProps.property.cleanInfrequentAccessDelay"></a>

```typescript
public readonly cleanInfrequentAccessDelay: number;
```

- *Type:* number
- *Default:* Move objects to Infrequent Access after 90 days

Delay (in days) before moving CLEAN data to cold storage (Infrequent Access storage class).

---

##### `rawArchiveDelay`<sup>Optional</sup> <a name="rawArchiveDelay" id="aws-analytics-reference-architecture.DataLakeStorageProps.property.rawArchiveDelay"></a>

```typescript
public readonly rawArchiveDelay: number;
```

- *Type:* number
- *Default:* Move objects to Glacier after 90 days

Delay (in days) before archiving RAW data to frozen storage (Glacier storage class).

---

##### `rawInfrequentAccessDelay`<sup>Optional</sup> <a name="rawInfrequentAccessDelay" id="aws-analytics-reference-architecture.DataLakeStorageProps.property.rawInfrequentAccessDelay"></a>

```typescript
public readonly rawInfrequentAccessDelay: number;
```

- *Type:* number
- *Default:* Move objects to Infrequent Access after 30 days

Delay (in days) before moving RAW data to cold storage (Infrequent Access storage class).

---

##### `transformArchiveDelay`<sup>Optional</sup> <a name="transformArchiveDelay" id="aws-analytics-reference-architecture.DataLakeStorageProps.property.transformArchiveDelay"></a>

```typescript
public readonly transformArchiveDelay: number;
```

- *Type:* number
- *Default:* Objects are not archived to Glacier

Delay (in days) before archiving TRANSFORM data to frozen storage (Glacier storage class).

---

##### `transformInfrequentAccessDelay`<sup>Optional</sup> <a name="transformInfrequentAccessDelay" id="aws-analytics-reference-architecture.DataLakeStorageProps.property.transformInfrequentAccessDelay"></a>

```typescript
public readonly transformInfrequentAccessDelay: number;
```

- *Type:* number
- *Default:* Move objects to Infrequent Access after 90 days

Delay (in days) before moving TRANSFORM data to cold storage (Infrequent Access storage class).

---

### DbSink <a name="DbSink" id="aws-analytics-reference-architecture.DbSink"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.DbSink.Initializer"></a>

```typescript
import { DbSink } from 'aws-analytics-reference-architecture'

const dbSink: DbSink = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DbSink.property.connection">connection</a></code> | <code>string</code> | Secret ARN of the database connection. |
| <code><a href="#aws-analytics-reference-architecture.DbSink.property.table">table</a></code> | <code>string</code> | The name of the table to write to. |
| <code><a href="#aws-analytics-reference-architecture.DbSink.property.schema">schema</a></code> | <code>string</code> | The name of the database schema if required. |
| <code><a href="#aws-analytics-reference-architecture.DbSink.property.type">type</a></code> | <code>string</code> | Database engine if applicable. |

---

##### `connection`<sup>Required</sup> <a name="connection" id="aws-analytics-reference-architecture.DbSink.property.connection"></a>

```typescript
public readonly connection: string;
```

- *Type:* string

Secret ARN of the database connection.

---

##### `table`<sup>Required</sup> <a name="table" id="aws-analytics-reference-architecture.DbSink.property.table"></a>

```typescript
public readonly table: string;
```

- *Type:* string

The name of the table to write to.

---

##### `schema`<sup>Optional</sup> <a name="schema" id="aws-analytics-reference-architecture.DbSink.property.schema"></a>

```typescript
public readonly schema: string;
```

- *Type:* string

The name of the database schema if required.

---

##### `type`<sup>Optional</sup> <a name="type" id="aws-analytics-reference-architecture.DbSink.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

Database engine if applicable.

---

### DynamoDbSink <a name="DynamoDbSink" id="aws-analytics-reference-architecture.DynamoDbSink"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.DynamoDbSink.Initializer"></a>

```typescript
import { DynamoDbSink } from 'aws-analytics-reference-architecture'

const dynamoDbSink: DynamoDbSink = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DynamoDbSink.property.table">table</a></code> | <code>aws-cdk-lib.aws_dynamodb.ITable</code> | DynamoDB table. |

---

##### `table`<sup>Required</sup> <a name="table" id="aws-analytics-reference-architecture.DynamoDbSink.property.table"></a>

```typescript
public readonly table: ITable;
```

- *Type:* aws-cdk-lib.aws_dynamodb.ITable

DynamoDB table.

---

### EmrEksClusterProps <a name="EmrEksClusterProps" id="aws-analytics-reference-architecture.EmrEksClusterProps"></a>

The properties for the EmrEksCluster Construct class.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.EmrEksClusterProps.Initializer"></a>

```typescript
import { EmrEksClusterProps } from 'aws-analytics-reference-architecture'

const emrEksClusterProps: EmrEksClusterProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.autoscaling">autoscaling</a></code> | <code><a href="#aws-analytics-reference-architecture.Autoscaler">Autoscaler</a></code> | The autoscaling mechanism to use. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.defaultNodes">defaultNodes</a></code> | <code>boolean</code> | If set to true, the Construct will create default EKS nodegroups or node provisioners (based on the autoscaler mechanism used). |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.eksAdminRoleArn">eksAdminRoleArn</a></code> | <code>string</code> | Amazon IAM Role to be added to Amazon EKS master roles that will give access to kubernetes cluster from AWS console UI. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.eksCluster">eksCluster</a></code> | <code>aws-cdk-lib.aws_eks.Cluster</code> | The EKS cluster to setup EMR on. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.eksClusterName">eksClusterName</a></code> | <code>string</code> | Name of the Amazon EKS cluster to be created. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.eksVpc">eksVpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | The VPC object where to deploy the EKS cluster VPC should have at least two private and public subnets in different Availability Zones All private subnets should have the following tags: 'for-use-with-amazon-emr-managed-policies'='true' 'kubernetes.io/role/internal-elb'='1' All public subnets should have the following tag: 'kubernetes.io/role/elb'='1' Cannot be combined with vpcCidr, if combined vpcCidr takes precendency. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.emrEksNodegroups">emrEksNodegroups</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup">EmrEksNodegroup</a>[]</code> | List of EmrEksNodegroup to create in the cluster in addition to the default [nodegroups]{@link EmrEksNodegroup}. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.karpenterVersion">karpenterVersion</a></code> | <code>string</code> | The version of karpenter to pass to Helm. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.kubectlLambdaLayer">kubectlLambdaLayer</a></code> | <code>aws-cdk-lib.aws_lambda.ILayerVersion</code> | Starting k8s 1.22, CDK no longer bundle the kubectl layer with the code due to breaking npm package size.  A layer needs to be passed to the Construct. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.kubernetesVersion">kubernetesVersion</a></code> | <code>aws-cdk-lib.aws_eks.KubernetesVersion</code> | Kubernetes version for Amazon EKS cluster that will be created. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.vpcCidr">vpcCidr</a></code> | <code>string</code> | The CIDR of the VPC to use with EKS, if provided a VPC with three public subnets and three private subnet is create The size of the private subnets is four time the one of the public subnet. |

---

##### `autoscaling`<sup>Required</sup> <a name="autoscaling" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.autoscaling"></a>

```typescript
public readonly autoscaling: Autoscaler;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Autoscaler">Autoscaler</a>

The autoscaling mechanism to use.

---

##### `defaultNodes`<sup>Optional</sup> <a name="defaultNodes" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.defaultNodes"></a>

```typescript
public readonly defaultNodes: boolean;
```

- *Type:* boolean
- *Default:* true

If set to true, the Construct will create default EKS nodegroups or node provisioners (based on the autoscaler mechanism used).

There are three types of nodes:
 * Nodes for critical jobs which use on-demand instances, high speed disks and workload isolation
 * Nodes for shared worklaods which uses spot instances and no isolation to optimize costs
 * Nodes for notebooks which leverage a cost optimized configuration for running EMR managed endpoints and spark drivers/executors.

---

##### `eksAdminRoleArn`<sup>Optional</sup> <a name="eksAdminRoleArn" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksAdminRoleArn"></a>

```typescript
public readonly eksAdminRoleArn: string;
```

- *Type:* string
- *Default:* No admin role is used and EKS cluster creation fails

Amazon IAM Role to be added to Amazon EKS master roles that will give access to kubernetes cluster from AWS console UI.

An admin role must be passed if `eksCluster` property is not set.

---

##### `eksCluster`<sup>Optional</sup> <a name="eksCluster" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksCluster"></a>

```typescript
public readonly eksCluster: Cluster;
```

- *Type:* aws-cdk-lib.aws_eks.Cluster
- *Default:* An EKS Cluster is created

The EKS cluster to setup EMR on.

The cluster needs to be created in the same CDK Stack.
If the EKS cluster is provided, the cluster AddOns and all the controllers (Ingress controller, Cluster Autoscaler or Karpenter...) need to be configured. 
When providing an EKS cluster, the methods for adding nodegroups can still be used. They implement the best practices for running Spark on EKS.

---

##### `eksClusterName`<sup>Optional</sup> <a name="eksClusterName" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksClusterName"></a>

```typescript
public readonly eksClusterName: string;
```

- *Type:* string
- *Default:* The [default cluster name]{@link DEFAULT_CLUSTER_NAME }

Name of the Amazon EKS cluster to be created.

---

##### `eksVpc`<sup>Optional</sup> <a name="eksVpc" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksVpc"></a>

```typescript
public readonly eksVpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

The VPC object where to deploy the EKS cluster VPC should have at least two private and public subnets in different Availability Zones All private subnets should have the following tags: 'for-use-with-amazon-emr-managed-policies'='true' 'kubernetes.io/role/internal-elb'='1' All public subnets should have the following tag: 'kubernetes.io/role/elb'='1' Cannot be combined with vpcCidr, if combined vpcCidr takes precendency.

---

##### `emrEksNodegroups`<sup>Optional</sup> <a name="emrEksNodegroups" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.emrEksNodegroups"></a>

```typescript
public readonly emrEksNodegroups: EmrEksNodegroup[];
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroup">EmrEksNodegroup</a>[]
- *Default:* Don't create additional nodegroups

List of EmrEksNodegroup to create in the cluster in addition to the default [nodegroups]{@link EmrEksNodegroup}.

---

##### `karpenterVersion`<sup>Optional</sup> <a name="karpenterVersion" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.karpenterVersion"></a>

```typescript
public readonly karpenterVersion: string;
```

- *Type:* string
- *Default:* The [default Karpenter version]{@link DEFAULT_KARPENTER_VERSION }

The version of karpenter to pass to Helm.

---

##### `kubectlLambdaLayer`<sup>Optional</sup> <a name="kubectlLambdaLayer" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.kubectlLambdaLayer"></a>

```typescript
public readonly kubectlLambdaLayer: ILayerVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.ILayerVersion
- *Default:* No layer is used

Starting k8s 1.22, CDK no longer bundle the kubectl layer with the code due to breaking npm package size.  A layer needs to be passed to the Construct.

The cdk [documentation] (https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_eks.KubernetesVersion.html#static-v1_22)
contains the libraries that you should add for the right Kubernetes version

---

##### `kubernetesVersion`<sup>Optional</sup> <a name="kubernetesVersion" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.kubernetesVersion"></a>

```typescript
public readonly kubernetesVersion: KubernetesVersion;
```

- *Type:* aws-cdk-lib.aws_eks.KubernetesVersion
- *Default:* Kubernetes v1.21 version is used

Kubernetes version for Amazon EKS cluster that will be created.

---

##### `vpcCidr`<sup>Optional</sup> <a name="vpcCidr" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.vpcCidr"></a>

```typescript
public readonly vpcCidr: string;
```

- *Type:* string
- *Default:* A vpc with the following CIDR 10.0.0.0/16 will be used

The CIDR of the VPC to use with EKS, if provided a VPC with three public subnets and three private subnet is create The size of the private subnets is four time the one of the public subnet.

---

### EmrEksImageBuilderProps <a name="EmrEksImageBuilderProps" id="aws-analytics-reference-architecture.EmrEksImageBuilderProps"></a>

The properties for initializing the construct to build custom EMR on EKS image.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.EmrEksImageBuilderProps.Initializer"></a>

```typescript
import { EmrEksImageBuilderProps } from 'aws-analytics-reference-architecture'

const emrEksImageBuilderProps: EmrEksImageBuilderProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilderProps.property.repositoryName">repositoryName</a></code> | <code>string</code> | Required The name of the ECR repository to create. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksImageBuilderProps.property.ecrRemovalPolicy">ecrRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | *No description.* |

---

##### `repositoryName`<sup>Required</sup> <a name="repositoryName" id="aws-analytics-reference-architecture.EmrEksImageBuilderProps.property.repositoryName"></a>

```typescript
public readonly repositoryName: string;
```

- *Type:* string

Required The name of the ECR repository to create.

---

##### `ecrRemovalPolicy`<sup>Optional</sup> <a name="ecrRemovalPolicy" id="aws-analytics-reference-architecture.EmrEksImageBuilderProps.property.ecrRemovalPolicy"></a>

```typescript
public readonly ecrRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.RETAIN This option allow to delete or not the ECR repository If it is set to RemovalPolicy.DESTROY, you need to delete the images before we delete the Repository

---

### EmrEksJobTemplateDefinition <a name="EmrEksJobTemplateDefinition" id="aws-analytics-reference-architecture.EmrEksJobTemplateDefinition"></a>

The properties for the EMR Managed Endpoint to create.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.EmrEksJobTemplateDefinition.Initializer"></a>

```typescript
import { EmrEksJobTemplateDefinition } from 'aws-analytics-reference-architecture'

const emrEksJobTemplateDefinition: EmrEksJobTemplateDefinition = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksJobTemplateDefinition.property.jobTemplateData">jobTemplateData</a></code> | <code>string</code> | The JSON definition of the job template. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksJobTemplateDefinition.property.name">name</a></code> | <code>string</code> | The name of the job template. |

---

##### `jobTemplateData`<sup>Required</sup> <a name="jobTemplateData" id="aws-analytics-reference-architecture.EmrEksJobTemplateDefinition.property.jobTemplateData"></a>

```typescript
public readonly jobTemplateData: string;
```

- *Type:* string

The JSON definition of the job template.

---

##### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.EmrEksJobTemplateDefinition.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The name of the job template.

---

### EmrEksNodegroupOptions <a name="EmrEksNodegroupOptions" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions"></a>

The Options for adding EmrEksNodegroup to an EmrEksCluster.

Some of the Amazon EKS Nodegroup parameters are overriden:
-  NodegroupName by the id and an index per AZ
-  LaunchTemplate spec
-  SubnetList by either the subnet parameter or one subnet per Amazon EKS Cluster AZ.
-  Labels and Taints are automatically used to tag the nodegroup for the cluster autoscaler

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.Initializer"></a>

```typescript
import { EmrEksNodegroupOptions } from 'aws-analytics-reference-architecture'

const emrEksNodegroupOptions: EmrEksNodegroupOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.amiType">amiType</a></code> | <code>aws-cdk-lib.aws_eks.NodegroupAmiType</code> | The AMI type for your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.capacityType">capacityType</a></code> | <code>aws-cdk-lib.aws_eks.CapacityType</code> | The capacity type of the nodegroup. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.desiredSize">desiredSize</a></code> | <code>number</code> | The current number of worker nodes that the managed node group should maintain. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.diskSize">diskSize</a></code> | <code>number</code> | The root device disk size (in GiB) for your node group instances. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.forceUpdate">forceUpdate</a></code> | <code>boolean</code> | Force the update if the existing node group's pods are unable to be drained due to a pod disruption budget issue. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceTypes">instanceTypes</a></code> | <code>aws-cdk-lib.aws_ec2.InstanceType[]</code> | The instance types to use for your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.labels">labels</a></code> | <code>{[ key: string ]: string}</code> | The Kubernetes labels to be applied to the nodes in the node group when they are created. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.launchTemplateSpec">launchTemplateSpec</a></code> | <code>aws-cdk-lib.aws_eks.LaunchTemplateSpec</code> | Launch template specification used for the nodegroup. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.maxSize">maxSize</a></code> | <code>number</code> | The maximum number of worker nodes that the managed node group can scale out to. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.minSize">minSize</a></code> | <code>number</code> | The minimum number of worker nodes that the managed node group can scale in to. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodegroupName">nodegroupName</a></code> | <code>string</code> | Name of the Nodegroup. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodeRole">nodeRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role to associate with your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.releaseVersion">releaseVersion</a></code> | <code>string</code> | The AMI version of the Amazon EKS-optimized AMI to use with your node group (for example, `1.14.7-YYYYMMDD`). |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.remoteAccess">remoteAccess</a></code> | <code>aws-cdk-lib.aws_eks.NodegroupRemoteAccess</code> | The remote access (SSH) configuration to use with your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnets">subnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | The subnets to use for the Auto Scaling group that is created for your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | The metadata to apply to the node group to assist with categorization and organization. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.taints">taints</a></code> | <code>aws-cdk-lib.aws_eks.TaintSpec[]</code> | The Kubernetes taints to be applied to the nodes in the node group when they are created. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.mountNvme">mountNvme</a></code> | <code>boolean</code> | Set to true if using instance types with local NVMe drives to mount them automatically at boot time. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnet">subnet</a></code> | <code>aws-cdk-lib.aws_ec2.ISubnet</code> | Configure the Amazon EKS NodeGroup in this subnet. |

---

##### `amiType`<sup>Optional</sup> <a name="amiType" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.amiType"></a>

```typescript
public readonly amiType: NodegroupAmiType;
```

- *Type:* aws-cdk-lib.aws_eks.NodegroupAmiType
- *Default:* auto-determined from the instanceTypes property when launchTemplateSpec property is not specified

The AMI type for your node group.

If you explicitly specify the launchTemplate with custom AMI, do not specify this property, or
the node group deployment will fail. In other cases, you will need to specify correct amiType for the nodegroup.

---

##### `capacityType`<sup>Optional</sup> <a name="capacityType" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.capacityType"></a>

```typescript
public readonly capacityType: CapacityType;
```

- *Type:* aws-cdk-lib.aws_eks.CapacityType
- *Default:* ON_DEMAND

The capacity type of the nodegroup.

---

##### `desiredSize`<sup>Optional</sup> <a name="desiredSize" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.desiredSize"></a>

```typescript
public readonly desiredSize: number;
```

- *Type:* number
- *Default:* 2

The current number of worker nodes that the managed node group should maintain.

If not specified,
the nodewgroup will initially create `minSize` instances.

---

##### `diskSize`<sup>Optional</sup> <a name="diskSize" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.diskSize"></a>

```typescript
public readonly diskSize: number;
```

- *Type:* number
- *Default:* 20

The root device disk size (in GiB) for your node group instances.

---

##### `forceUpdate`<sup>Optional</sup> <a name="forceUpdate" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.forceUpdate"></a>

```typescript
public readonly forceUpdate: boolean;
```

- *Type:* boolean
- *Default:* true

Force the update if the existing node group's pods are unable to be drained due to a pod disruption budget issue.

If an update fails because pods could not be drained, you can force the update after it fails to terminate the old
node whether or not any pods are
running on the node.

---

##### `instanceTypes`<sup>Optional</sup> <a name="instanceTypes" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceTypes"></a>

```typescript
public readonly instanceTypes: InstanceType[];
```

- *Type:* aws-cdk-lib.aws_ec2.InstanceType[]
- *Default:* t3.medium will be used according to the cloudformation document.

The instance types to use for your node group.

> [ - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-eks-nodegroup.html#cfn-eks-nodegroup-instancetypes]( - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-eks-nodegroup.html#cfn-eks-nodegroup-instancetypes)

---

##### `labels`<sup>Optional</sup> <a name="labels" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.labels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* None

The Kubernetes labels to be applied to the nodes in the node group when they are created.

---

##### `launchTemplateSpec`<sup>Optional</sup> <a name="launchTemplateSpec" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.launchTemplateSpec"></a>

```typescript
public readonly launchTemplateSpec: LaunchTemplateSpec;
```

- *Type:* aws-cdk-lib.aws_eks.LaunchTemplateSpec
- *Default:* no launch template

Launch template specification used for the nodegroup.

> [ - https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html]( - https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html)

---

##### `maxSize`<sup>Optional</sup> <a name="maxSize" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.maxSize"></a>

```typescript
public readonly maxSize: number;
```

- *Type:* number
- *Default:* desiredSize

The maximum number of worker nodes that the managed node group can scale out to.

Managed node groups can support up to 100 nodes by default.

---

##### `minSize`<sup>Optional</sup> <a name="minSize" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.minSize"></a>

```typescript
public readonly minSize: number;
```

- *Type:* number
- *Default:* 1

The minimum number of worker nodes that the managed node group can scale in to.

This number must be greater than or equal to zero.

---

##### `nodegroupName`<sup>Optional</sup> <a name="nodegroupName" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodegroupName"></a>

```typescript
public readonly nodegroupName: string;
```

- *Type:* string
- *Default:* resource ID

Name of the Nodegroup.

---

##### `nodeRole`<sup>Optional</sup> <a name="nodeRole" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodeRole"></a>

```typescript
public readonly nodeRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* None. Auto-generated if not specified.

The IAM role to associate with your node group.

The Amazon EKS worker node kubelet daemon
makes calls to AWS APIs on your behalf. Worker nodes receive permissions for these API calls through
an IAM instance profile and associated policies. Before you can launch worker nodes and register them
into a cluster, you must create an IAM role for those worker nodes to use when they are launched.

---

##### `releaseVersion`<sup>Optional</sup> <a name="releaseVersion" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.releaseVersion"></a>

```typescript
public readonly releaseVersion: string;
```

- *Type:* string
- *Default:* The latest available AMI version for the node group's current Kubernetes version is used.

The AMI version of the Amazon EKS-optimized AMI to use with your node group (for example, `1.14.7-YYYYMMDD`).

---

##### `remoteAccess`<sup>Optional</sup> <a name="remoteAccess" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.remoteAccess"></a>

```typescript
public readonly remoteAccess: NodegroupRemoteAccess;
```

- *Type:* aws-cdk-lib.aws_eks.NodegroupRemoteAccess
- *Default:* disabled

The remote access (SSH) configuration to use with your node group.

Disabled by default, however, if you
specify an Amazon EC2 SSH key but do not specify a source security group when you create a managed node group,
then port 22 on the worker nodes is opened to the internet (0.0.0.0/0)

---

##### `subnets`<sup>Optional</sup> <a name="subnets" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnets"></a>

```typescript
public readonly subnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* private subnets

The subnets to use for the Auto Scaling group that is created for your node group.

By specifying the
SubnetSelection, the selected subnets will automatically apply required tags i.e.
`kubernetes.io/cluster/CLUSTER_NAME` with a value of `shared`, where `CLUSTER_NAME` is replaced with
the name of your cluster.

---

##### `tags`<sup>Optional</sup> <a name="tags" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* None

The metadata to apply to the node group to assist with categorization and organization.

Each tag consists of
a key and an optional value, both of which you define. Node group tags do not propagate to any other resources
associated with the node group, such as the Amazon EC2 instances or subnets.

---

##### `taints`<sup>Optional</sup> <a name="taints" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.taints"></a>

```typescript
public readonly taints: TaintSpec[];
```

- *Type:* aws-cdk-lib.aws_eks.TaintSpec[]
- *Default:* None

The Kubernetes taints to be applied to the nodes in the node group when they are created.

---

##### `mountNvme`<sup>Optional</sup> <a name="mountNvme" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.mountNvme"></a>

```typescript
public readonly mountNvme: boolean;
```

- *Type:* boolean
- *Default:* false

Set to true if using instance types with local NVMe drives to mount them automatically at boot time.

---

##### `subnet`<sup>Optional</sup> <a name="subnet" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnet"></a>

```typescript
public readonly subnet: ISubnet;
```

- *Type:* aws-cdk-lib.aws_ec2.ISubnet
- *Default:* One NodeGroup is deployed per cluster AZ

Configure the Amazon EKS NodeGroup in this subnet.

Use this setting for resource dependencies like an Amazon RDS database.
The subnet must include the availability zone information because the nodegroup is tagged with the AZ for the K8S Cluster Autoscaler.

---

### EmrManagedEndpointOptions <a name="EmrManagedEndpointOptions" id="aws-analytics-reference-architecture.EmrManagedEndpointOptions"></a>

The properties for the EMR Managed Endpoint to create.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.EmrManagedEndpointOptions.Initializer"></a>

```typescript
import { EmrManagedEndpointOptions } from 'aws-analytics-reference-architecture'

const emrManagedEndpointOptions: EmrManagedEndpointOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.executionRole">executionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The Amazon IAM role used as the execution role, this role must provide access to all the AWS resource a user will interact with These can be S3, DynamoDB, Glue Catalog. |
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.managedEndpointName">managedEndpointName</a></code> | <code>string</code> | The name of the EMR managed endpoint. |
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.virtualClusterId">virtualClusterId</a></code> | <code>string</code> | The Id of the Amazon EMR virtual cluster containing the managed endpoint. |
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.configurationOverrides">configurationOverrides</a></code> | <code>string</code> | The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint. |
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.emrOnEksVersion">emrOnEksVersion</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrVersion">EmrVersion</a></code> | The Amazon EMR version to use. |

---

##### `executionRole`<sup>Required</sup> <a name="executionRole" id="aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.executionRole"></a>

```typescript
public readonly executionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

The Amazon IAM role used as the execution role, this role must provide access to all the AWS resource a user will interact with These can be S3, DynamoDB, Glue Catalog.

---

##### `managedEndpointName`<sup>Required</sup> <a name="managedEndpointName" id="aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.managedEndpointName"></a>

```typescript
public readonly managedEndpointName: string;
```

- *Type:* string

The name of the EMR managed endpoint.

---

##### `virtualClusterId`<sup>Required</sup> <a name="virtualClusterId" id="aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.virtualClusterId"></a>

```typescript
public readonly virtualClusterId: string;
```

- *Type:* string

The Id of the Amazon EMR virtual cluster containing the managed endpoint.

---

##### `configurationOverrides`<sup>Optional</sup> <a name="configurationOverrides" id="aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.configurationOverrides"></a>

```typescript
public readonly configurationOverrides: string;
```

- *Type:* string
- *Default:* Configuration related to the [default nodegroup for notebook]{@link EmrEksNodegroup.NOTEBOOK_EXECUTOR }

The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint.

---

##### `emrOnEksVersion`<sup>Optional</sup> <a name="emrOnEksVersion" id="aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.emrOnEksVersion"></a>

```typescript
public readonly emrOnEksVersion: EmrVersion;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrVersion">EmrVersion</a>
- *Default:* The [default Amazon EMR version]{@link EmrEksCluster.DEFAULT_EMR_VERSION }

The Amazon EMR version to use.

---

### EmrVirtualClusterOptions <a name="EmrVirtualClusterOptions" id="aws-analytics-reference-architecture.EmrVirtualClusterOptions"></a>

The properties for the EmrVirtualCluster Construct class.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.EmrVirtualClusterOptions.Initializer"></a>

```typescript
import { EmrVirtualClusterOptions } from 'aws-analytics-reference-architecture'

const emrVirtualClusterOptions: EmrVirtualClusterOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrVirtualClusterOptions.property.name">name</a></code> | <code>string</code> | name of the Amazon Emr virtual cluster to be created. |
| <code><a href="#aws-analytics-reference-architecture.EmrVirtualClusterOptions.property.createNamespace">createNamespace</a></code> | <code>boolean</code> | creates Amazon EKS namespace. |
| <code><a href="#aws-analytics-reference-architecture.EmrVirtualClusterOptions.property.eksNamespace">eksNamespace</a></code> | <code>string</code> | name of the Amazon EKS namespace to be linked to the Amazon EMR virtual cluster. |

---

##### `name`<sup>Required</sup> <a name="name" id="aws-analytics-reference-architecture.EmrVirtualClusterOptions.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

name of the Amazon Emr virtual cluster to be created.

---

##### `createNamespace`<sup>Optional</sup> <a name="createNamespace" id="aws-analytics-reference-architecture.EmrVirtualClusterOptions.property.createNamespace"></a>

```typescript
public readonly createNamespace: boolean;
```

- *Type:* boolean
- *Default:* Do not create the namespace

creates Amazon EKS namespace.

---

##### `eksNamespace`<sup>Optional</sup> <a name="eksNamespace" id="aws-analytics-reference-architecture.EmrVirtualClusterOptions.property.eksNamespace"></a>

```typescript
public readonly eksNamespace: string;
```

- *Type:* string
- *Default:* Use the default namespace

name of the Amazon EKS namespace to be linked to the Amazon EMR virtual cluster.

---

### FlywayRunnerProps <a name="FlywayRunnerProps" id="aws-analytics-reference-architecture.FlywayRunnerProps"></a>

The properties of the FlywayRunner construct, needed to run flyway migration scripts.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.FlywayRunnerProps.Initializer"></a>

```typescript
import { FlywayRunnerProps } from 'aws-analytics-reference-architecture'

const flywayRunnerProps: FlywayRunnerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.cluster">cluster</a></code> | <code>@aws-cdk/aws-redshift-alpha.Cluster</code> | The cluster to run migration scripts against. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.databaseName">databaseName</a></code> | <code>string</code> | The database name to run migration scripts against. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.migrationScriptsFolderAbsolutePath">migrationScriptsFolderAbsolutePath</a></code> | <code>string</code> | The absolute path to the flyway migration scripts. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.Vpc</code> | The vpc hosting the cluster. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | Period to keep the logs around. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.replaceDictionary">replaceDictionary</a></code> | <code>{[ key: string ]: string}</code> | A key-value map of string (encapsulated between `${` and `}`) to replace in the SQL files given. |

---

##### `cluster`<sup>Required</sup> <a name="cluster" id="aws-analytics-reference-architecture.FlywayRunnerProps.property.cluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* @aws-cdk/aws-redshift-alpha.Cluster

The cluster to run migration scripts against.

---

##### `databaseName`<sup>Required</sup> <a name="databaseName" id="aws-analytics-reference-architecture.FlywayRunnerProps.property.databaseName"></a>

```typescript
public readonly databaseName: string;
```

- *Type:* string

The database name to run migration scripts against.

---

##### `migrationScriptsFolderAbsolutePath`<sup>Required</sup> <a name="migrationScriptsFolderAbsolutePath" id="aws-analytics-reference-architecture.FlywayRunnerProps.property.migrationScriptsFolderAbsolutePath"></a>

```typescript
public readonly migrationScriptsFolderAbsolutePath: string;
```

- *Type:* string

The absolute path to the flyway migration scripts.

Those scripts needs to follow expected flyway naming convention.

> [https://flywaydb.org/documentation/concepts/migrations.html#sql-based-migrations for more details.](https://flywaydb.org/documentation/concepts/migrations.html#sql-based-migrations for more details.)

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="aws-analytics-reference-architecture.FlywayRunnerProps.property.vpc"></a>

```typescript
public readonly vpc: Vpc;
```

- *Type:* aws-cdk-lib.aws_ec2.Vpc

The vpc hosting the cluster.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="aws-analytics-reference-architecture.FlywayRunnerProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.ONE_WEEK

Period to keep the logs around.

---

##### `replaceDictionary`<sup>Optional</sup> <a name="replaceDictionary" id="aws-analytics-reference-architecture.FlywayRunnerProps.property.replaceDictionary"></a>

```typescript
public readonly replaceDictionary: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No replacement is done

A key-value map of string (encapsulated between `${` and `}`) to replace in the SQL files given.

Example:

* The SQL file:

  ```sql
  SELECT * FROM ${TABLE_NAME};
  ```
* The replacement map:

  ```typescript
  replaceDictionary = {
    TABLE_NAME: 'my_table'
  }
  ```

---

### LakeFormationAdminProps <a name="LakeFormationAdminProps" id="aws-analytics-reference-architecture.LakeFormationAdminProps"></a>

Properties for the lakeFormationAdmin Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.LakeFormationAdminProps.Initializer"></a>

```typescript
import { LakeFormationAdminProps } from 'aws-analytics-reference-architecture'

const lakeFormationAdminProps: LakeFormationAdminProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdminProps.property.principal">principal</a></code> | <code>aws-cdk-lib.aws_iam.IRole \| aws-cdk-lib.aws_iam.IUser</code> | The principal to declare as an AWS Lake Formation administrator. |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationAdminProps.property.catalogId">catalogId</a></code> | <code>string</code> | The catalog ID to create the administrator in. |

---

##### `principal`<sup>Required</sup> <a name="principal" id="aws-analytics-reference-architecture.LakeFormationAdminProps.property.principal"></a>

```typescript
public readonly principal: IRole | IUser;
```

- *Type:* aws-cdk-lib.aws_iam.IRole | aws-cdk-lib.aws_iam.IUser

The principal to declare as an AWS Lake Formation administrator.

---

##### `catalogId`<sup>Optional</sup> <a name="catalogId" id="aws-analytics-reference-architecture.LakeFormationAdminProps.property.catalogId"></a>

```typescript
public readonly catalogId: string;
```

- *Type:* string
- *Default:* The account ID

The catalog ID to create the administrator in.

---

### LakeFormationS3LocationProps <a name="LakeFormationS3LocationProps" id="aws-analytics-reference-architecture.LakeFormationS3LocationProps"></a>

The props for LF-S3-Location Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.LakeFormationS3LocationProps.Initializer"></a>

```typescript
import { LakeFormationS3LocationProps } from 'aws-analytics-reference-architecture'

const lakeFormationS3LocationProps: LakeFormationS3LocationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3LocationProps.property.kmsKeyId">kmsKeyId</a></code> | <code>string</code> | KMS key used to encrypt the S3 Location. |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3LocationProps.property.s3Location">s3Location</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | S3 location to be registered with Lakeformation. |
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3LocationProps.property.accountId">accountId</a></code> | <code>string</code> | Account ID owning the S3 location. |

---

##### `kmsKeyId`<sup>Required</sup> <a name="kmsKeyId" id="aws-analytics-reference-architecture.LakeFormationS3LocationProps.property.kmsKeyId"></a>

```typescript
public readonly kmsKeyId: string;
```

- *Type:* string
- *Default:* No encryption is used

KMS key used to encrypt the S3 Location.

---

##### `s3Location`<sup>Required</sup> <a name="s3Location" id="aws-analytics-reference-architecture.LakeFormationS3LocationProps.property.s3Location"></a>

```typescript
public readonly s3Location: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

S3 location to be registered with Lakeformation.

---

##### `accountId`<sup>Optional</sup> <a name="accountId" id="aws-analytics-reference-architecture.LakeFormationS3LocationProps.property.accountId"></a>

```typescript
public readonly accountId: string;
```

- *Type:* string
- *Default:* Current account is used

Account ID owning the S3 location.

---

### LfTag <a name="LfTag" id="aws-analytics-reference-architecture.LfTag"></a>

LF Tag interface.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.LfTag.Initializer"></a>

```typescript
import { LfTag } from 'aws-analytics-reference-architecture'

const lfTag: LfTag = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LfTag.property.key">key</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.LfTag.property.values">values</a></code> | <code>string[]</code> | *No description.* |

---

##### `key`<sup>Required</sup> <a name="key" id="aws-analytics-reference-architecture.LfTag.property.key"></a>

```typescript
public readonly key: string;
```

- *Type:* string

---

##### `values`<sup>Required</sup> <a name="values" id="aws-analytics-reference-architecture.LfTag.property.values"></a>

```typescript
public readonly values: string[];
```

- *Type:* string[]

---

### NotebookManagedEndpointOptions <a name="NotebookManagedEndpointOptions" id="aws-analytics-reference-architecture.NotebookManagedEndpointOptions"></a>

The properties for defining a Managed Endpoint The interface is used to create a managed Endpoint which can be leveraged by multiple users.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.NotebookManagedEndpointOptions.Initializer"></a>

```typescript
import { NotebookManagedEndpointOptions } from 'aws-analytics-reference-architecture'

const notebookManagedEndpointOptions: NotebookManagedEndpointOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.executionPolicy">executionPolicy</a></code> | <code>aws-cdk-lib.aws_iam.ManagedPolicy</code> | The name of the policy to be used for the execution Role to pass to ManagedEndpoint, this role should allow access to any resource needed for the job including: Amazon S3 buckets, Amazon DynamoDB, AWS Glue Data Catalog. |
| <code><a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.managedEndpointName">managedEndpointName</a></code> | <code>string</code> | The name of the managed endpoint if no name is provided then the name of the policy associated with managed endpoint will be used as a name. |
| <code><a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.configurationOverrides">configurationOverrides</a></code> | <code>any</code> | The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint an example can be found [here] (https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/core/src/emr-eks-data-platform/resources/k8s/emr-eks-config/critical.json). |
| <code><a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.emrOnEksVersion">emrOnEksVersion</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrVersion">EmrVersion</a></code> | The version of Amazon EMR to deploy. |

---

##### `executionPolicy`<sup>Required</sup> <a name="executionPolicy" id="aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.executionPolicy"></a>

```typescript
public readonly executionPolicy: ManagedPolicy;
```

- *Type:* aws-cdk-lib.aws_iam.ManagedPolicy

The name of the policy to be used for the execution Role to pass to ManagedEndpoint, this role should allow access to any resource needed for the job including: Amazon S3 buckets, Amazon DynamoDB, AWS Glue Data Catalog.

---

##### `managedEndpointName`<sup>Required</sup> <a name="managedEndpointName" id="aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.managedEndpointName"></a>

```typescript
public readonly managedEndpointName: string;
```

- *Type:* string

The name of the managed endpoint if no name is provided then the name of the policy associated with managed endpoint will be used as a name.

---

##### `configurationOverrides`<sup>Optional</sup> <a name="configurationOverrides" id="aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.configurationOverrides"></a>

```typescript
public readonly configurationOverrides: any;
```

- *Type:* any

The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint an example can be found [here] (https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/core/src/emr-eks-data-platform/resources/k8s/emr-eks-config/critical.json).

---

##### `emrOnEksVersion`<sup>Optional</sup> <a name="emrOnEksVersion" id="aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.emrOnEksVersion"></a>

```typescript
public readonly emrOnEksVersion: EmrVersion;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrVersion">EmrVersion</a>

The version of Amazon EMR to deploy.

---

### NotebookPlatformProps <a name="NotebookPlatformProps" id="aws-analytics-reference-architecture.NotebookPlatformProps"></a>

The properties for NotebookPlatform Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.NotebookPlatformProps.Initializer"></a>

```typescript
import { NotebookPlatformProps } from 'aws-analytics-reference-architecture'

const notebookPlatformProps: NotebookPlatformProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps.property.emrEks">emrEks</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksCluster">EmrEksCluster</a></code> | Required the EmrEks infrastructure used for the deployment. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps.property.studioAuthMode">studioAuthMode</a></code> | <code><a href="#aws-analytics-reference-architecture.StudioAuthMode">StudioAuthMode</a></code> | Required the authentication mode of Amazon EMR Studio Either 'SSO' or 'IAM' defined in the Enum {@link studioAuthMode}. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps.property.studioName">studioName</a></code> | <code>string</code> | Required the name to be given to the Amazon EMR Studio Must be unique across the AWS account. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps.property.eksNamespace">eksNamespace</a></code> | <code>string</code> | the namespace where to deploy the EMR Virtual Cluster. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps.property.idpArn">idpArn</a></code> | <code>string</code> | Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio Value taken from the IAM console in the Identity providers console. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps.property.idpAuthUrl">idpAuthUrl</a></code> | <code>string</code> | Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio This is the URL used to sign in the AWS console. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps.property.idpRelayStateParameterName">idpRelayStateParameterName</a></code> | <code>string</code> | Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio Value can be set with {@link IdpRelayState } Enum or through a value provided by the user. |

---

##### `emrEks`<sup>Required</sup> <a name="emrEks" id="aws-analytics-reference-architecture.NotebookPlatformProps.property.emrEks"></a>

```typescript
public readonly emrEks: EmrEksCluster;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksCluster">EmrEksCluster</a>

Required the EmrEks infrastructure used for the deployment.

---

##### `studioAuthMode`<sup>Required</sup> <a name="studioAuthMode" id="aws-analytics-reference-architecture.NotebookPlatformProps.property.studioAuthMode"></a>

```typescript
public readonly studioAuthMode: StudioAuthMode;
```

- *Type:* <a href="#aws-analytics-reference-architecture.StudioAuthMode">StudioAuthMode</a>

Required the authentication mode of Amazon EMR Studio Either 'SSO' or 'IAM' defined in the Enum {@link studioAuthMode}.

---

##### `studioName`<sup>Required</sup> <a name="studioName" id="aws-analytics-reference-architecture.NotebookPlatformProps.property.studioName"></a>

```typescript
public readonly studioName: string;
```

- *Type:* string

Required the name to be given to the Amazon EMR Studio Must be unique across the AWS account.

---

##### `eksNamespace`<sup>Optional</sup> <a name="eksNamespace" id="aws-analytics-reference-architecture.NotebookPlatformProps.property.eksNamespace"></a>

```typescript
public readonly eksNamespace: string;
```

- *Type:* string
- *Default:* Use the {@link EmrVirtualClusterOptions } default namespace

the namespace where to deploy the EMR Virtual Cluster.

---

##### `idpArn`<sup>Optional</sup> <a name="idpArn" id="aws-analytics-reference-architecture.NotebookPlatformProps.property.idpArn"></a>

```typescript
public readonly idpArn: string;
```

- *Type:* string

Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio Value taken from the IAM console in the Identity providers console.

---

##### `idpAuthUrl`<sup>Optional</sup> <a name="idpAuthUrl" id="aws-analytics-reference-architecture.NotebookPlatformProps.property.idpAuthUrl"></a>

```typescript
public readonly idpAuthUrl: string;
```

- *Type:* string

Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio This is the URL used to sign in the AWS console.

---

##### `idpRelayStateParameterName`<sup>Optional</sup> <a name="idpRelayStateParameterName" id="aws-analytics-reference-architecture.NotebookPlatformProps.property.idpRelayStateParameterName"></a>

```typescript
public readonly idpRelayStateParameterName: string;
```

- *Type:* string

Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio Value can be set with {@link IdpRelayState } Enum or through a value provided by the user.

---

### NotebookUserOptions <a name="NotebookUserOptions" id="aws-analytics-reference-architecture.NotebookUserOptions"></a>

The properties for defining a user.

The interface is used to create and assign a user or a group to an Amazon EMR Studio

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.NotebookUserOptions.Initializer"></a>

```typescript
import { NotebookUserOptions } from 'aws-analytics-reference-architecture'

const notebookUserOptions: NotebookUserOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.NotebookUserOptions.property.notebookManagedEndpoints">notebookManagedEndpoints</a></code> | <code><a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions">NotebookManagedEndpointOptions</a>[]</code> | Required Array of {@link NotebookManagedEndpointOptions} this defines the managed endpoint the notebook/workspace user will have access to. |
| <code><a href="#aws-analytics-reference-architecture.NotebookUserOptions.property.iamUser">iamUser</a></code> | <code>aws-cdk-lib.aws_iam.IUser</code> | IAM User for EMR Studio, if both iamUser and identityName are provided, the iamUser will have precedence and will be used for EMR Studio. |
| <code><a href="#aws-analytics-reference-architecture.NotebookUserOptions.property.identityName">identityName</a></code> | <code>string</code> | Name of the identity as it appears in AWS IAM Identity Center console, or the IAM user to be used when IAM authentication is chosen. |
| <code><a href="#aws-analytics-reference-architecture.NotebookUserOptions.property.identityType">identityType</a></code> | <code>string</code> | Required Type of the identity either GROUP or USER, to be used when SSO is used as an authentication mode {@see SSOIdentityType}. |

---

##### `notebookManagedEndpoints`<sup>Required</sup> <a name="notebookManagedEndpoints" id="aws-analytics-reference-architecture.NotebookUserOptions.property.notebookManagedEndpoints"></a>

```typescript
public readonly notebookManagedEndpoints: NotebookManagedEndpointOptions[];
```

- *Type:* <a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions">NotebookManagedEndpointOptions</a>[]

Required Array of {@link NotebookManagedEndpointOptions} this defines the managed endpoint the notebook/workspace user will have access to.

---

##### `iamUser`<sup>Optional</sup> <a name="iamUser" id="aws-analytics-reference-architecture.NotebookUserOptions.property.iamUser"></a>

```typescript
public readonly iamUser: IUser;
```

- *Type:* aws-cdk-lib.aws_iam.IUser

IAM User for EMR Studio, if both iamUser and identityName are provided, the iamUser will have precedence and will be used for EMR Studio.

if your IAM user is created in the same CDK stack you can pass the USER object

---

##### `identityName`<sup>Optional</sup> <a name="identityName" id="aws-analytics-reference-architecture.NotebookUserOptions.property.identityName"></a>

```typescript
public readonly identityName: string;
```

- *Type:* string

Name of the identity as it appears in AWS IAM Identity Center console, or the IAM user to be used when IAM authentication is chosen.

---

##### `identityType`<sup>Optional</sup> <a name="identityType" id="aws-analytics-reference-architecture.NotebookUserOptions.property.identityType"></a>

```typescript
public readonly identityType: string;
```

- *Type:* string

Required Type of the identity either GROUP or USER, to be used when SSO is used as an authentication mode {@see SSOIdentityType}.

---

### OpensearchClusterProps <a name="OpensearchClusterProps" id="aws-analytics-reference-architecture.OpensearchClusterProps"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.OpensearchClusterProps.Initializer"></a>

```typescript
import { OpensearchClusterProps } from 'aws-analytics-reference-architecture'

const opensearchClusterProps: OpensearchClusterProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.OpensearchClusterProps.property.accessRoles">accessRoles</a></code> | <code>aws-cdk-lib.aws_iam.Role[]</code> | initial access roles to be mapped. |
| <code><a href="#aws-analytics-reference-architecture.OpensearchClusterProps.property.adminUsername">adminUsername</a></code> | <code>string</code> | initial admin users to be created. |
| <code><a href="#aws-analytics-reference-architecture.OpensearchClusterProps.property.usernames">usernames</a></code> | <code>string[]</code> | initial dasboards users to be created. |
| <code><a href="#aws-analytics-reference-architecture.OpensearchClusterProps.property.domainProps">domainProps</a></code> | <code>aws-cdk-lib.aws_opensearchservice.DomainProps</code> | Override Opensearch domain props {@link aws_opensearchservice.DomainProps}. |

---

##### `accessRoles`<sup>Required</sup> <a name="accessRoles" id="aws-analytics-reference-architecture.OpensearchClusterProps.property.accessRoles"></a>

```typescript
public readonly accessRoles: Role[];
```

- *Type:* aws-cdk-lib.aws_iam.Role[]

initial access roles to be mapped.

---

##### `adminUsername`<sup>Required</sup> <a name="adminUsername" id="aws-analytics-reference-architecture.OpensearchClusterProps.property.adminUsername"></a>

```typescript
public readonly adminUsername: string;
```

- *Type:* string

initial admin users to be created.

---

##### `usernames`<sup>Required</sup> <a name="usernames" id="aws-analytics-reference-architecture.OpensearchClusterProps.property.usernames"></a>

```typescript
public readonly usernames: string[];
```

- *Type:* string[]

initial dasboards users to be created.

---

##### `domainProps`<sup>Optional</sup> <a name="domainProps" id="aws-analytics-reference-architecture.OpensearchClusterProps.property.domainProps"></a>

```typescript
public readonly domainProps: DomainProps;
```

- *Type:* aws-cdk-lib.aws_opensearchservice.DomainProps

Override Opensearch domain props {@link aws_opensearchservice.DomainProps}.

---

### PreparedDatasetProps <a name="PreparedDatasetProps" id="aws-analytics-reference-architecture.PreparedDatasetProps"></a>

The properties for the PreparedDataset class used by the BatchReplayer construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.PreparedDatasetProps.Initializer"></a>

```typescript
import { PreparedDatasetProps } from 'aws-analytics-reference-architecture'

const preparedDatasetProps: PreparedDatasetProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.dateTimeColumnToFilter">dateTimeColumnToFilter</a></code> | <code>string</code> | Datetime column for filtering data. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.location">location</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | The Amazon S3 Location of the source dataset. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.manifestLocation">manifestLocation</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | Manifest file in csv format with two columns: start, path. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.dateTimeColumnsToAdjust">dateTimeColumnsToAdjust</a></code> | <code>string[]</code> | Array of column names with datetime to adjust. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.offset">offset</a></code> | <code>string</code> | The offset in seconds for replaying data. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.startDatetime">startDatetime</a></code> | <code>string</code> | The minimum datetime value in the dataset used to calculate time offset. |

---

##### `dateTimeColumnToFilter`<sup>Required</sup> <a name="dateTimeColumnToFilter" id="aws-analytics-reference-architecture.PreparedDatasetProps.property.dateTimeColumnToFilter"></a>

```typescript
public readonly dateTimeColumnToFilter: string;
```

- *Type:* string

Datetime column for filtering data.

---

##### `location`<sup>Required</sup> <a name="location" id="aws-analytics-reference-architecture.PreparedDatasetProps.property.location"></a>

```typescript
public readonly location: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

The Amazon S3 Location of the source dataset.

It's composed of an Amazon S3 bucketName and an Amazon S3 objectKey

---

##### `manifestLocation`<sup>Required</sup> <a name="manifestLocation" id="aws-analytics-reference-architecture.PreparedDatasetProps.property.manifestLocation"></a>

```typescript
public readonly manifestLocation: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

Manifest file in csv format with two columns: start, path.

---

##### `dateTimeColumnsToAdjust`<sup>Optional</sup> <a name="dateTimeColumnsToAdjust" id="aws-analytics-reference-architecture.PreparedDatasetProps.property.dateTimeColumnsToAdjust"></a>

```typescript
public readonly dateTimeColumnsToAdjust: string[];
```

- *Type:* string[]

Array of column names with datetime to adjust.

The source data will have date in the past 2021-01-01T00:00:00 while
the data replayer will have have the current time. The difference (aka. offset)
must be added to all datetime columns

---

##### `offset`<sup>Optional</sup> <a name="offset" id="aws-analytics-reference-architecture.PreparedDatasetProps.property.offset"></a>

```typescript
public readonly offset: string;
```

- *Type:* string
- *Default:* Calculate the offset from startDatetime parameter during CDK deployment

The offset in seconds for replaying data.

It is the difference between the `startDatetime` and now.

---

##### `startDatetime`<sup>Optional</sup> <a name="startDatetime" id="aws-analytics-reference-architecture.PreparedDatasetProps.property.startDatetime"></a>

```typescript
public readonly startDatetime: string;
```

- *Type:* string
- *Default:* The offset parameter is used.

The minimum datetime value in the dataset used to calculate time offset.

---

### S3CrossAccountProps <a name="S3CrossAccountProps" id="aws-analytics-reference-architecture.S3CrossAccountProps"></a>

The props for S3CrossAccount construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.S3CrossAccountProps.Initializer"></a>

```typescript
import { S3CrossAccountProps } from 'aws-analytics-reference-architecture'

const s3CrossAccountProps: S3CrossAccountProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccountProps.property.accountId">accountId</a></code> | <code>string</code> | The account ID to grant on the S3 location. |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccountProps.property.s3Bucket">s3Bucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | The S3 Bucket object to grant cross account access. |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccountProps.property.s3ObjectKey">s3ObjectKey</a></code> | <code>string</code> | The S3 object key to grant cross account access (S3 prefix without the bucket name). |

---

##### `accountId`<sup>Required</sup> <a name="accountId" id="aws-analytics-reference-architecture.S3CrossAccountProps.property.accountId"></a>

```typescript
public readonly accountId: string;
```

- *Type:* string

The account ID to grant on the S3 location.

---

##### `s3Bucket`<sup>Required</sup> <a name="s3Bucket" id="aws-analytics-reference-architecture.S3CrossAccountProps.property.s3Bucket"></a>

```typescript
public readonly s3Bucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

The S3 Bucket object to grant cross account access.

This needs to be a Bucket object and not an IBucket because the construct modifies the Bucket policy

---

##### `s3ObjectKey`<sup>Optional</sup> <a name="s3ObjectKey" id="aws-analytics-reference-architecture.S3CrossAccountProps.property.s3ObjectKey"></a>

```typescript
public readonly s3ObjectKey: string;
```

- *Type:* string
- *Default:* Grant cross account for the entire bucket

The S3 object key to grant cross account access (S3 prefix without the bucket name).

---

### S3Sink <a name="S3Sink" id="aws-analytics-reference-architecture.S3Sink"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.S3Sink.Initializer"></a>

```typescript
import { S3Sink } from 'aws-analytics-reference-architecture'

const s3Sink: S3Sink = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.S3Sink.property.sinkBucket">sinkBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | The S3 Bucket sink where the BatchReplayer writes data. |
| <code><a href="#aws-analytics-reference-architecture.S3Sink.property.outputFileMaxSizeInBytes">outputFileMaxSizeInBytes</a></code> | <code>number</code> | The maximum file size in Bytes written by the BatchReplayer. |
| <code><a href="#aws-analytics-reference-architecture.S3Sink.property.sinkObjectKey">sinkObjectKey</a></code> | <code>string</code> | The S3 object key sink where the BatchReplayer writes data. |

---

##### `sinkBucket`<sup>Required</sup> <a name="sinkBucket" id="aws-analytics-reference-architecture.S3Sink.property.sinkBucket"></a>

```typescript
public readonly sinkBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

The S3 Bucket sink where the BatchReplayer writes data.

:warning: **If the Bucket is encrypted with KMS, the Key must be managed by this stack.

---

##### `outputFileMaxSizeInBytes`<sup>Optional</sup> <a name="outputFileMaxSizeInBytes" id="aws-analytics-reference-architecture.S3Sink.property.outputFileMaxSizeInBytes"></a>

```typescript
public readonly outputFileMaxSizeInBytes: number;
```

- *Type:* number
- *Default:* The BatchReplayer writes 100MB files maximum

The maximum file size in Bytes written by the BatchReplayer.

---

##### `sinkObjectKey`<sup>Optional</sup> <a name="sinkObjectKey" id="aws-analytics-reference-architecture.S3Sink.property.sinkObjectKey"></a>

```typescript
public readonly sinkObjectKey: string;
```

- *Type:* string
- *Default:* No object key is used and the BatchReplayer writes the dataset in s3://<BUCKET_NAME>/<TABLE_NAME>

The S3 object key sink where the BatchReplayer writes data.

---

### SynchronousAthenaQueryProps <a name="SynchronousAthenaQueryProps" id="aws-analytics-reference-architecture.SynchronousAthenaQueryProps"></a>

The properties for the SynchronousAthenaQuery construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.Initializer"></a>

```typescript
import { SynchronousAthenaQueryProps } from 'aws-analytics-reference-architecture'

const synchronousAthenaQueryProps: SynchronousAthenaQueryProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.resultPath">resultPath</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | The Amazon S3 Location for the query results (without trailing slash). |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.statement">statement</a></code> | <code>string</code> | The name of the Athena query to execute. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.executionRoleStatements">executionRoleStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | The Amazon IAM Policy Statements used to run the query. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.timeout">timeout</a></code> | <code>number</code> | The timeout in seconds to wait for query success. |

---

##### `resultPath`<sup>Required</sup> <a name="resultPath" id="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.resultPath"></a>

```typescript
public readonly resultPath: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

The Amazon S3 Location for the query results (without trailing slash).

---

##### `statement`<sup>Required</sup> <a name="statement" id="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.statement"></a>

```typescript
public readonly statement: string;
```

- *Type:* string

The name of the Athena query to execute.

---

##### `executionRoleStatements`<sup>Optional</sup> <a name="executionRoleStatements" id="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.executionRoleStatements"></a>

```typescript
public readonly executionRoleStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No Policy Statements are added to the execution role

The Amazon IAM Policy Statements used to run the query.

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.timeout"></a>

```typescript
public readonly timeout: number;
```

- *Type:* number
- *Default:* 60 seconds

The timeout in seconds to wait for query success.

---

### SynchronousCrawlerProps <a name="SynchronousCrawlerProps" id="aws-analytics-reference-architecture.SynchronousCrawlerProps"></a>

The properties for SynchronousCrawler Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.SynchronousCrawlerProps.Initializer"></a>

```typescript
import { SynchronousCrawlerProps } from 'aws-analytics-reference-architecture'

const synchronousCrawlerProps: SynchronousCrawlerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawlerProps.property.crawlerName">crawlerName</a></code> | <code>string</code> | The name of the Crawler to use. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawlerProps.property.timeout">timeout</a></code> | <code>number</code> | The timeout in seconds to wait for the Crawler success. |

---

##### `crawlerName`<sup>Required</sup> <a name="crawlerName" id="aws-analytics-reference-architecture.SynchronousCrawlerProps.property.crawlerName"></a>

```typescript
public readonly crawlerName: string;
```

- *Type:* string

The name of the Crawler to use.

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="aws-analytics-reference-architecture.SynchronousCrawlerProps.property.timeout"></a>

```typescript
public readonly timeout: number;
```

- *Type:* number
- *Default:* 300 seconds

The timeout in seconds to wait for the Crawler success.

---

### TrackedConstructProps <a name="TrackedConstructProps" id="aws-analytics-reference-architecture.TrackedConstructProps"></a>

The properties for the TrackedConstructProps construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.TrackedConstructProps.Initializer"></a>

```typescript
import { TrackedConstructProps } from 'aws-analytics-reference-architecture'

const trackedConstructProps: TrackedConstructProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.TrackedConstructProps.property.trackingCode">trackingCode</a></code> | <code>string</code> | Unique code used to measure the number of the CloudFormation deployments. |

---

##### `trackingCode`<sup>Required</sup> <a name="trackingCode" id="aws-analytics-reference-architecture.TrackedConstructProps.property.trackingCode"></a>

```typescript
public readonly trackingCode: string;
```

- *Type:* string

Unique code used to measure the number of the CloudFormation deployments.

---

## Classes <a name="Classes" id="Classes"></a>

### EmrEksNodegroup <a name="EmrEksNodegroup" id="aws-analytics-reference-architecture.EmrEksNodegroup"></a>

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.EmrEksNodegroup.Initializer"></a>

```typescript
import { EmrEksNodegroup } from 'aws-analytics-reference-architecture'

new EmrEksNodegroup()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---




#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.CRITICAL_ALL">CRITICAL_ALL</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | Default nodegroup configuration for EMR on EKS critical workloads (both drivers and executors). |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_DRIVER">NOTEBOOK_DRIVER</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS (drivers only). |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_EXECUTOR">NOTEBOOK_EXECUTOR</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS (executors only). |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_WITHOUT_PODTEMPLATE">NOTEBOOK_WITHOUT_PODTEMPLATE</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS This nodegroup is replacing [NOTEBOOK_DRIVER]{@link EmrEksNodegroup.NOTEBOOK_DRIVER} and [NOTEBOOK_EXECUTOR]{@link EmrEksNodegroup.NOTEBOOK_EXECUTOR} because EMR on EKS Managed Endpoint currently doesn't support Pod Template customization. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_DRIVER">SHARED_DRIVER</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | Default nodegroup configuration for EMR on EKS shared (non-crtical) workloads (drivers only). |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_EXECUTOR">SHARED_EXECUTOR</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | Default nodegroup configuration for EMR on EKS shared (non-crtical) workloads (executors only). |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.TOOLING_ALL">TOOLING_ALL</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | *No description.* |

---

##### `CRITICAL_ALL`<sup>Required</sup> <a name="CRITICAL_ALL" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.CRITICAL_ALL"></a>

```typescript
public readonly CRITICAL_ALL: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

Default nodegroup configuration for EMR on EKS critical workloads (both drivers and executors).

---

##### `NOTEBOOK_DRIVER`<sup>Required</sup> <a name="NOTEBOOK_DRIVER" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_DRIVER"></a>

```typescript
public readonly NOTEBOOK_DRIVER: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS (drivers only).

---

##### `NOTEBOOK_EXECUTOR`<sup>Required</sup> <a name="NOTEBOOK_EXECUTOR" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_EXECUTOR"></a>

```typescript
public readonly NOTEBOOK_EXECUTOR: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS (executors only).

---

##### `NOTEBOOK_WITHOUT_PODTEMPLATE`<sup>Required</sup> <a name="NOTEBOOK_WITHOUT_PODTEMPLATE" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_WITHOUT_PODTEMPLATE"></a>

```typescript
public readonly NOTEBOOK_WITHOUT_PODTEMPLATE: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS This nodegroup is replacing [NOTEBOOK_DRIVER]{@link EmrEksNodegroup.NOTEBOOK_DRIVER} and [NOTEBOOK_EXECUTOR]{@link EmrEksNodegroup.NOTEBOOK_EXECUTOR} because EMR on EKS Managed Endpoint currently doesn't support Pod Template customization.

---

##### `SHARED_DRIVER`<sup>Required</sup> <a name="SHARED_DRIVER" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_DRIVER"></a>

```typescript
public readonly SHARED_DRIVER: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

Default nodegroup configuration for EMR on EKS shared (non-crtical) workloads (drivers only).

---

##### `SHARED_EXECUTOR`<sup>Required</sup> <a name="SHARED_EXECUTOR" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_EXECUTOR"></a>

```typescript
public readonly SHARED_EXECUTOR: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

Default nodegroup configuration for EMR on EKS shared (non-crtical) workloads (executors only).

---

##### `TOOLING_ALL`<sup>Required</sup> <a name="TOOLING_ALL" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.TOOLING_ALL"></a>

```typescript
public readonly TOOLING_ALL: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

---

### PreparedDataset <a name="PreparedDataset" id="aws-analytics-reference-architecture.PreparedDataset"></a>

PreparedDataset is used by the [BatchReplayer]{@link BatchReplayer } to generate data in different targets.

One of the startDatetime or offset parameter needs to be passed to the constructor: 
 * StartDatetime is used for prepared datasets provided by the Analytics Reference Architecture because they are known during synthetize time.
 * Offset is used when a PreparedDataset is created from a CustomDataset because the startDatetime is not known during synthetize time.

A PreparedDataset has following properties:

1. Data is partitioned by timestamp (a range in seconds). Each folder stores data within a given range.
There is no constraint on how long the timestamp range can be. But each file must not be larger than 100MB.
Creating new PreparedDataset requires to find the right balance between number of partitions and the amount of data read by each BatchReplayer (micro-)batch
The available PreparedDatasets have a timestamp range that fit the total dataset time range (see each dataset documentation below) to avoid having too many partitions. 

Here is an example:

|- time_range_start=16000000000

   |- file1.csv 100MB

   |- file2.csv 50MB

|- time_range_start=16000000300 // 5 minute range (300 sec)

   |- file1.csv 1MB

|- time_range_start=16000000600

   |- file1.csv 100MB

   |- file2.csv 100MB

   |- whichever-file-name-is-fine-as-we-have-manifest-files.csv 50MB

2. It has a manifest CSV file with two columns: start and path. Start is the timestamp

start        , path

16000000000  , s3://<path>/<to>/<folder>/time_range_start=16000000000/file1.csv

16000000000  , s3://<path>/<to>/<folder>/time_range_start=16000000000/file2.csv

16000000300  , s3://<path>/<to>/<folder>/time_range_start=16000000300/file1.csv

16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/file1.csv

16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/file2.csv

16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/whichever-file....csv

If the stack is deployed in another region than eu-west-1, data transfer costs will apply.
The pre-defined PreparedDataset access is recharged to the consumer via Amazon S3 Requester Pay feature.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.PreparedDataset.Initializer"></a>

```typescript
import { PreparedDataset } from 'aws-analytics-reference-architecture'

new PreparedDataset(props: PreparedDatasetProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps">PreparedDatasetProps</a></code> | the DatasetProps. |

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.PreparedDataset.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDatasetProps">PreparedDatasetProps</a>

the DatasetProps.

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.dateTimeColumnToFilter">dateTimeColumnToFilter</a></code> | <code>string</code> | Datetime column for filtering data. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.location">location</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | The Amazon S3 Location of the source dataset. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.manifestLocation">manifestLocation</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | Manifest file in csv format with two columns: start, path. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.tableName">tableName</a></code> | <code>string</code> | The name of the SQL table extracted from path. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.dateTimeColumnsToAdjust">dateTimeColumnsToAdjust</a></code> | <code>string[]</code> | Array of column names with datetime to adjust. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.offset">offset</a></code> | <code>string</code> | The offset of the Dataset (difference between min datetime and now) in Seconds. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.startDateTime">startDateTime</a></code> | <code>string</code> | Start datetime replaying this dataset. |

---

##### `dateTimeColumnToFilter`<sup>Required</sup> <a name="dateTimeColumnToFilter" id="aws-analytics-reference-architecture.PreparedDataset.property.dateTimeColumnToFilter"></a>

```typescript
public readonly dateTimeColumnToFilter: string;
```

- *Type:* string

Datetime column for filtering data.

---

##### `location`<sup>Required</sup> <a name="location" id="aws-analytics-reference-architecture.PreparedDataset.property.location"></a>

```typescript
public readonly location: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

The Amazon S3 Location of the source dataset.

---

##### `manifestLocation`<sup>Required</sup> <a name="manifestLocation" id="aws-analytics-reference-architecture.PreparedDataset.property.manifestLocation"></a>

```typescript
public readonly manifestLocation: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

Manifest file in csv format with two columns: start, path.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="aws-analytics-reference-architecture.PreparedDataset.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

The name of the SQL table extracted from path.

---

##### `dateTimeColumnsToAdjust`<sup>Optional</sup> <a name="dateTimeColumnsToAdjust" id="aws-analytics-reference-architecture.PreparedDataset.property.dateTimeColumnsToAdjust"></a>

```typescript
public readonly dateTimeColumnsToAdjust: string[];
```

- *Type:* string[]

Array of column names with datetime to adjust.

---

##### `offset`<sup>Optional</sup> <a name="offset" id="aws-analytics-reference-architecture.PreparedDataset.property.offset"></a>

```typescript
public readonly offset: string;
```

- *Type:* string

The offset of the Dataset (difference between min datetime and now) in Seconds.

---

##### `startDateTime`<sup>Optional</sup> <a name="startDateTime" id="aws-analytics-reference-architecture.PreparedDataset.property.startDateTime"></a>

```typescript
public readonly startDateTime: string;
```

- *Type:* string

Start datetime replaying this dataset.

Your data set may start from 1 Jan 2020
But you can specify this to 1 Feb 2020 to omit the first month data.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.DATASETS_BUCKET">DATASETS_BUCKET</a></code> | <code>string</code> | The bucket name of the AWS Analytics Reference Architecture datasets. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_CUSTOMER">RETAIL_1_GB_CUSTOMER</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The customer dataset part of 1GB retail datasets. The time range is one week from min(customer_datetime) to max(customer_datetime). |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_CUSTOMER_ADDRESS">RETAIL_1_GB_CUSTOMER_ADDRESS</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The customer address dataset part of 1GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_ITEM">RETAIL_1_GB_ITEM</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The item dataset part of 1GB retail datasets The time range is one week from min(item_datetime) to max(item_datetime). |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_PROMO">RETAIL_1_GB_PROMO</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The promo dataset part of 1GB retail datasets The time range is one week from min(promo_datetime) to max(promo_datetime). |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_STORE">RETAIL_1_GB_STORE</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The store dataset part of 1GB retail datasets The time range is one week from min(store_datetime) to max(store_datetime). |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_STORE_SALE">RETAIL_1_GB_STORE_SALE</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The store sale dataset part of 1GB retail datasets. The time range is one week from min(sale_datetime) to max(sale_datetime). |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_WAREHOUSE">RETAIL_1_GB_WAREHOUSE</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The store dataset part of 1GB retail datasets The time range is one week from min(warehouse_datetime) to max(warehouse_datetime). |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_WEB_SALE">RETAIL_1_GB_WEB_SALE</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | The web sale dataset part of 1GB retail datasets. The time range is one week from min(sale_datetime) to max(sale_datetime). |

---

##### `DATASETS_BUCKET`<sup>Required</sup> <a name="DATASETS_BUCKET" id="aws-analytics-reference-architecture.PreparedDataset.property.DATASETS_BUCKET"></a>

```typescript
public readonly DATASETS_BUCKET: string;
```

- *Type:* string

The bucket name of the AWS Analytics Reference Architecture datasets.

Data transfer costs will aply if the stack is deployed in another region than eu-west-1.
The pre-defined PreparedDataset access is recharged to the consumer via Amazon S3 Requester Pay feature.

---

##### `RETAIL_1_GB_CUSTOMER`<sup>Required</sup> <a name="RETAIL_1_GB_CUSTOMER" id="aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_CUSTOMER"></a>

```typescript
public readonly RETAIL_1_GB_CUSTOMER: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The customer dataset part of 1GB retail datasets. The time range is one week from min(customer_datetime) to max(customer_datetime).

| Column name       	| Column type 	| Example                    	|
|-------------------	|-------------	|----------------------------	|
| customer_id       	| string      	| AAAAAAAAHCLFOHAA           	|
| salutation        	| string      	| Miss                       	|
| first_name        	| string      	| Tina                       	|
| last_name         	| string      	| Frias                      	|
| birth_country     	| string      	| GEORGIA                    	|
| email_address     	| string      	| Tina.Frias@jdK4TZ1qJXB.org 	|
| birth_date        	| string      	| 1924-06-14                 	|
| gender            	| string      	| F                          	|
| marital_status    	| string      	| D                          	|
| education_status  	| string      	| 2 yr Degree                	|
| purchase_estimate 	| bigint      	| 2500                       	|
| credit_rating     	| string      	| Low Risk                   	|
| buy_potential     	| string      	| 1001-5000                  	|
| vehicle_count     	| bigint      	| 1                          	|
| lower_bound       	| bigint      	| 170001                     	|
| upper_bound       	| bigint      	| 180000                     	|
| address_id        	| string      	| AAAAAAAALAFINEAA           	|
| customer_datetime 	| string      	| 2021-01-19T08:07:47.140Z   	|

The BatchReplayer adds two columns ingestion_start and ingestion_end

---

##### `RETAIL_1_GB_CUSTOMER_ADDRESS`<sup>Required</sup> <a name="RETAIL_1_GB_CUSTOMER_ADDRESS" id="aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_CUSTOMER_ADDRESS"></a>

```typescript
public readonly RETAIL_1_GB_CUSTOMER_ADDRESS: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The customer address dataset part of 1GB retail datasets.

It can be joined with customer dataset on address_id column.
The time range is one week from min(address_datetime) to max(address_datetime)

| Column name      | Column type | Example                  |
|------------------|-------------|--------------------------|
| address_id       | string      | AAAAAAAAINDKAAAA         |
| city             | string      | Farmington               |
| county           | string      | Greeley County           |
| state            | string      | KS                       |
| zip              | bigint      | 69145                    |
| country          | string      | United States            |
| gmt_offset       | double      | -6.0                     |
| location_type    | string      | apartment                |
| street           | string      | 390 Pine South Boulevard |
| address_datetime | string      | 2021-01-03T02:25:52.826Z |

The BatchReplayer adds two columns ingestion_start and ingestion_end

---

##### `RETAIL_1_GB_ITEM`<sup>Required</sup> <a name="RETAIL_1_GB_ITEM" id="aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_ITEM"></a>

```typescript
public readonly RETAIL_1_GB_ITEM: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The item dataset part of 1GB retail datasets The time range is one week from min(item_datetime) to max(item_datetime).

| Column name   | Column type | Example                                        |
|---------------|-------------|------------------------------------------------|
|       item_id |      bigint |                                          15018 |
|     item_desc |      string | Even ready materials tell with a ministers; un |
|         brand |      string |                                 scholarmaxi #9 |
|         class |      string |                                        fishing |
|      category |      string |                                         Sports |
|      manufact |      string |                                    eseoughtpri |
|          size |      string |                                            N/A |
|         color |      string |                                        thistle |
|         units |      string |                                         Bundle |
|     container |      string |                                        Unknown |
|  product_name |      string |                          eingoughtbarantiought |
| item_datetime |      string |                       2021-01-01T18:17:56.718Z |

The BatchReplayer adds two columns ingestion_start and ingestion_end

---

##### `RETAIL_1_GB_PROMO`<sup>Required</sup> <a name="RETAIL_1_GB_PROMO" id="aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_PROMO"></a>

```typescript
public readonly RETAIL_1_GB_PROMO: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The promo dataset part of 1GB retail datasets The time range is one week from min(promo_datetime) to max(promo_datetime).

| Column name     | Column type | Example                  |
|-----------------|-------------|--------------------------|
|        promo_id |      string |         AAAAAAAAHIAAAAAA |
|            cost |      double |                   1000.0 |
| response_target |      bigint |                        1 |
|      promo_name |      string |                     anti |
|         purpose |      string |                  Unknown |
|  start_datetime |      string | 2021-01-01 00:00:35.890Z |
|    end_datetime |      string | 2021-01-02 13:16:09.785Z |
|  promo_datetime |      string | 2021-01-01 00:00:16.104Z |

The BatchReplayer adds two columns ingestion_start and ingestion_end

---

##### `RETAIL_1_GB_STORE`<sup>Required</sup> <a name="RETAIL_1_GB_STORE" id="aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_STORE"></a>

```typescript
public readonly RETAIL_1_GB_STORE: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The store dataset part of 1GB retail datasets The time range is one week from min(store_datetime) to max(store_datetime).

| Column name      | Column type | Example                  |
|------------------|-------------|--------------------------|
|         store_id |      string |         AAAAAAAAKAAAAAAA |
|       store_name |      string |                      bar |
| number_employees |      bigint |                      219 |
|      floor_space |      bigint |                  6505323 |
|            hours |      string |                 8AM-12AM |
|          manager |      string |             David Trahan |
|        market_id |      bigint |                       10 |
|   market_manager |      string |      Christopher Maxwell |
|             city |      string |                   Midway |
|           county |      string |        Williamson County |
|            state |      string |                       TN |
|              zip |      bigint |                    31904 |
|          country |      string |            United States |
|       gmt_offset |      double |                     -5.0 |
|   tax_percentage |      double |                      0.0 |
|           street |      string |            71 Cedar Blvd |
|   store_datetime |      string | 2021-01-01T00:00:00.017Z |

The BatchReplayer adds two columns ingestion_start and ingestion_end

---

##### `RETAIL_1_GB_STORE_SALE`<sup>Required</sup> <a name="RETAIL_1_GB_STORE_SALE" id="aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_STORE_SALE"></a>

```typescript
public readonly RETAIL_1_GB_STORE_SALE: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The store sale dataset part of 1GB retail datasets. The time range is one week from min(sale_datetime) to max(sale_datetime).

| Column name        | Column type | Example                  |
|--------------------|-------------|--------------------------|
| item_id            | bigint      | 3935                     |
| ticket_id          | bigint      | 81837                    |
| quantity           | bigint      | 96                       |
| wholesale_cost     | double      | 21.15                    |
| list_price         | double      | 21.78                    |
| sales_price        | double      | 21.18                    |
| ext_discount_amt   | double      | 0.0                      |
| ext_sales_price    | double      | 2033.28                  |
| ext_wholesale_cost | double      | 2030.4                   |
| ext_list_price     | double      | 2090.88                  |
| ext_tax            | double      | 81.1                     |
| coupon_amt         | double      | 0.0                      |
| net_paid           | double      | 2033.28                  |
| net_paid_inc_tax   | double      | 2114.38                  |
| net_profit         | double      | 2.88                     |
| customer_id        | string      | AAAAAAAAEOIDAAAA         |
| store_id           | string      | AAAAAAAABAAAAAAA         |
| promo_id           | string      | AAAAAAAAEEAAAAAA         |
| sale_datetime      | string      | 2021-01-04T22:20:04.144Z |

The BatchReplayer adds two columns ingestion_start and ingestion_end

---

##### `RETAIL_1_GB_WAREHOUSE`<sup>Required</sup> <a name="RETAIL_1_GB_WAREHOUSE" id="aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_WAREHOUSE"></a>

```typescript
public readonly RETAIL_1_GB_WAREHOUSE: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The store dataset part of 1GB retail datasets The time range is one week from min(warehouse_datetime) to max(warehouse_datetime).

| Column name        | Column type | Example                  |
|--------------------|-------------|--------------------------|
|       warehouse_id |      string |         AAAAAAAAEAAAAAAA |
|     warehouse_name |      string |               Operations |
|             street |      string |    461 Second Johnson Wy |
|               city |      string |                 Fairview |
|                zip |      bigint |                    35709 |
|             county |      string |        Williamson County |
|              state |      string |                       TN |
|            country |      string |            United States |
|         gmt_offset |      double |                     -5.0 |
| warehouse_datetime |      string | 2021-01-01T00:00:00.123Z |

---

##### `RETAIL_1_GB_WEB_SALE`<sup>Required</sup> <a name="RETAIL_1_GB_WEB_SALE" id="aws-analytics-reference-architecture.PreparedDataset.property.RETAIL_1_GB_WEB_SALE"></a>

```typescript
public readonly RETAIL_1_GB_WEB_SALE: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

The web sale dataset part of 1GB retail datasets. The time range is one week from min(sale_datetime) to max(sale_datetime).

| Column name           | Column type | Example                  |
|-----------------------|-------------|--------------------------|
| item_id               | bigint      | 3935                     |
| order_id              | bigint      | 81837                    |
| quantity              | bigint      | 65                       |
| wholesale_cost        | double      | 32.98                    |
| list_price            | double      | 47.82                    |
| sales_price           | double      | 36.34                    |
| ext_discount_amt      | double      | 2828.8                   |
| ext_sales_price       | double      | 2362.1                   |
| ext_wholesale_cost    | double      | 2143.7                   |
| ext_list_price        | double      | 3108.3                   |
| ext_tax               | double      | 0.0                      |
| coupon_amt            | double      | 209.62                   |
| ext_ship_cost         | double      | 372.45                   |
| net_paid              | double      | 2152.48                  |
| net_paid_inc_tax      | double      | 2152.48                  |
| net_paid_inc_ship     | double      | 442.33                   |
| net_paid_inc_ship_tax | double      | 442.33                   |
| net_profit            | double      | 8.78                     |
| bill_customer_id      | string      | AAAAAAAALNLFAAAA         |
| ship_customer_id      | string      | AAAAAAAALPPJAAAA         |
| warehouse_id          | string      | AAAAAAAABAAAAAAA         |
| promo_id              | string      | AAAAAAAAPCAAAAAA         |
| ship_delay            | string      | OVERNIGHT                |
| ship_mode             | string      | SEA                      |
| ship_carrier          | string      | GREAT EASTERN            |
| sale_datetime         | string      | 2021-01-06T15:00:19.373Z |

The BatchReplayer adds two columns ingestion_start and ingestion_end

---


## Enums <a name="Enums" id="Enums"></a>

### Autoscaler <a name="Autoscaler" id="aws-analytics-reference-architecture.Autoscaler"></a>

The different autoscaler available with EmrEksCluster.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Autoscaler.KARPENTER">KARPENTER</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.Autoscaler.CLUSTER_AUTOSCALER">CLUSTER_AUTOSCALER</a></code> | *No description.* |

---

##### `KARPENTER` <a name="KARPENTER" id="aws-analytics-reference-architecture.Autoscaler.KARPENTER"></a>

---


##### `CLUSTER_AUTOSCALER` <a name="CLUSTER_AUTOSCALER" id="aws-analytics-reference-architecture.Autoscaler.CLUSTER_AUTOSCALER"></a>

---


### CustomDatasetInputFormat <a name="CustomDatasetInputFormat" id="aws-analytics-reference-architecture.CustomDatasetInputFormat"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.CustomDatasetInputFormat.CSV">CSV</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.CustomDatasetInputFormat.PARQUET">PARQUET</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.CustomDatasetInputFormat.JSON">JSON</a></code> | *No description.* |

---

##### `CSV` <a name="CSV" id="aws-analytics-reference-architecture.CustomDatasetInputFormat.CSV"></a>

---


##### `PARQUET` <a name="PARQUET" id="aws-analytics-reference-architecture.CustomDatasetInputFormat.PARQUET"></a>

---


##### `JSON` <a name="JSON" id="aws-analytics-reference-architecture.CustomDatasetInputFormat.JSON"></a>

---


### DeploymentType <a name="DeploymentType" id="aws-analytics-reference-architecture.DeploymentType"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DeploymentType.WORKSHOP_STUDIO">WORKSHOP_STUDIO</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DeploymentType.CLICK_TO_DEPLOY">CLICK_TO_DEPLOY</a></code> | *No description.* |

---

##### ~~`WORKSHOP_STUDIO`~~ <a name="WORKSHOP_STUDIO" id="aws-analytics-reference-architecture.DeploymentType.WORKSHOP_STUDIO"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer

---


##### ~~`CLICK_TO_DEPLOY`~~ <a name="CLICK_TO_DEPLOY" id="aws-analytics-reference-architecture.DeploymentType.CLICK_TO_DEPLOY"></a>

- *Deprecated:* The enum should not be used. Use https://github.com/flochaz/cdk-standalone-deployer

---


### EmrVersion <a name="EmrVersion" id="aws-analytics-reference-architecture.EmrVersion"></a>

The different EMR versions available on EKS.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V6_10">V6_10</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V6_9">V6_9</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V6_8">V6_8</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V6_7">V6_7</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V6_6">V6_6</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V6_5">V6_5</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V6_4">V6_4</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V6_3">V6_3</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V6_2">V6_2</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V5_33">V5_33</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrVersion.V5_32">V5_32</a></code> | *No description.* |

---

##### `V6_10` <a name="V6_10" id="aws-analytics-reference-architecture.EmrVersion.V6_10"></a>

---


##### `V6_9` <a name="V6_9" id="aws-analytics-reference-architecture.EmrVersion.V6_9"></a>

---


##### `V6_8` <a name="V6_8" id="aws-analytics-reference-architecture.EmrVersion.V6_8"></a>

---


##### `V6_7` <a name="V6_7" id="aws-analytics-reference-architecture.EmrVersion.V6_7"></a>

---


##### `V6_6` <a name="V6_6" id="aws-analytics-reference-architecture.EmrVersion.V6_6"></a>

---


##### `V6_5` <a name="V6_5" id="aws-analytics-reference-architecture.EmrVersion.V6_5"></a>

---


##### `V6_4` <a name="V6_4" id="aws-analytics-reference-architecture.EmrVersion.V6_4"></a>

---


##### `V6_3` <a name="V6_3" id="aws-analytics-reference-architecture.EmrVersion.V6_3"></a>

---


##### `V6_2` <a name="V6_2" id="aws-analytics-reference-architecture.EmrVersion.V6_2"></a>

---


##### `V5_33` <a name="V5_33" id="aws-analytics-reference-architecture.EmrVersion.V5_33"></a>

---


##### `V5_32` <a name="V5_32" id="aws-analytics-reference-architecture.EmrVersion.V5_32"></a>

---


### LfAccessControlMode <a name="LfAccessControlMode" id="aws-analytics-reference-architecture.LfAccessControlMode"></a>

Enum to define access control mode in Lake Formation.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LfAccessControlMode.NRAC">NRAC</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.LfAccessControlMode.TBAC">TBAC</a></code> | *No description.* |

---

##### `NRAC` <a name="NRAC" id="aws-analytics-reference-architecture.LfAccessControlMode.NRAC"></a>

---


##### `TBAC` <a name="TBAC" id="aws-analytics-reference-architecture.LfAccessControlMode.TBAC"></a>

---


### SSOIdentityType <a name="SSOIdentityType" id="aws-analytics-reference-architecture.SSOIdentityType"></a>

Enum to define the type of identity Type in EMR studio.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SSOIdentityType.USER">USER</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SSOIdentityType.GROUP">GROUP</a></code> | *No description.* |

---

##### `USER` <a name="USER" id="aws-analytics-reference-architecture.SSOIdentityType.USER"></a>

---


##### `GROUP` <a name="GROUP" id="aws-analytics-reference-architecture.SSOIdentityType.GROUP"></a>

---


### StudioAuthMode <a name="StudioAuthMode" id="aws-analytics-reference-architecture.StudioAuthMode"></a>

Enum to define authentication mode for Amazon EMR Studio.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.StudioAuthMode.IAM">IAM</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.StudioAuthMode.SSO">SSO</a></code> | *No description.* |

---

##### `IAM` <a name="IAM" id="aws-analytics-reference-architecture.StudioAuthMode.IAM"></a>

---


##### `SSO` <a name="SSO" id="aws-analytics-reference-architecture.StudioAuthMode.SSO"></a>

---


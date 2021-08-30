# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### DataGenerator <a name="aws-analytics-reference-architecture.DataGenerator"></a>

DataGenerator Construct to replay data from an existing dataset into a target replacing datetime to current datetime Target can be an Amazon S3 bucket or an Amazon Kinesis Data Stream.

DataGenerator can use pre-defined or custom datasets available in the [Dataset]{@link Dataset} Class

#### Initializer <a name="aws-analytics-reference-architecture.DataGenerator.Initializer"></a>

```typescript
import { DataGenerator } from 'aws-analytics-reference-architecture'

new DataGenerator(scope: Construct, id: string, props: DataGeneratorProps)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.parameter.id"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.DataGeneratorProps`](#aws-analytics-reference-architecture.DataGeneratorProps)

the DataGenerator [properties]{@link DataGeneratorProps}.

---



#### Properties <a name="Properties"></a>

##### `dataset`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.property.dataset"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

Dataset used to generate data.

---

##### `frequency`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.property.frequency"></a>

- *Type:* `number`

Frequency (in Seconds) of the data generation.

---

##### `sinkArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.property.sinkArn"></a>

- *Type:* `string`

Sink Arn to receive the generated data.

---

#### Constants <a name="Constants"></a>

##### `DATA_GENERATOR_DATABASE` <a name="aws-analytics-reference-architecture.DataGenerator.property.DATA_GENERATOR_DATABASE"></a>

- *Type:* `string`

AWS Glue Database name used by the DataGenerator.

---

### DataLakeStorage <a name="aws-analytics-reference-architecture.DataLakeStorage"></a>

A Data Lake Storage composed of 3 Amazon S3 Buckets configured with AWS best practices:   S3 buckets for Raw/Cleaned/Transformed data,   data lifecycle optimization/transitioning to different Amazon S3 storage classes   server side buckets encryption managed by KMS.

#### Initializer <a name="aws-analytics-reference-architecture.DataLakeStorage.Initializer"></a>

```typescript
import { DataLakeStorage } from 'aws-analytics-reference-architecture'

new DataLakeStorage(scope: Construct, id: string, props: DataLakeStorageProps)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.parameter.id"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.DataLakeStorageProps`](#aws-analytics-reference-architecture.DataLakeStorageProps)

the DataLakeStorageProps properties.

---



#### Properties <a name="Properties"></a>

##### `cleanBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.property.cleanBucket"></a>

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---

##### `rawBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.property.rawBucket"></a>

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---

##### `transformBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.property.transformBucket"></a>

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---


### Example <a name="aws-analytics-reference-architecture.Example"></a>

Example Construct to help onboarding contributors.

This example includes best practices for code comment/documentation generation,
and for default parameters pattern in CDK using Props with Optional properties

#### Initializer <a name="aws-analytics-reference-architecture.Example.Initializer"></a>

```typescript
import { Example } from 'aws-analytics-reference-architecture'

new Example(scope: Construct, id: string, props: ExampleProps)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Example.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Example.parameter.id"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Example.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.ExampleProps`](#aws-analytics-reference-architecture.ExampleProps)

the ExampleProps properties.

---





### SingletonBucket <a name="aws-analytics-reference-architecture.SingletonBucket"></a>

An Amazon S3 Bucket implementing the singleton pattern.

#### Initializer <a name="aws-analytics-reference-architecture.SingletonBucket.Initializer"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

new SingletonBucket(scope: Construct, id: string, props?: BucketProps)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.scope"></a>

- *Type:* [`constructs.Construct`](#constructs.Construct)

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.props"></a>

- *Type:* [`@aws-cdk/aws-s3.BucketProps`](#@aws-cdk/aws-s3.BucketProps)

---


#### Static Functions <a name="Static Functions"></a>

##### `getOrCreate` <a name="aws-analytics-reference-architecture.SingletonBucket.getOrCreate"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.getOrCreate(scope: Construct, bucketName: string)
```

###### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

###### `bucketName`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.bucketName"></a>

- *Type:* `string`

---



### SynchronousAthenaQuery <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery"></a>

SynchronousAthenaQuery Construct to execute an Amazon Athena query synchronously.

#### Initializer <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer"></a>

```typescript
import { SynchronousAthenaQuery } from 'aws-analytics-reference-architecture'

new SynchronousAthenaQuery(scope: Construct, id: string, props: SynchronousAthenaQueryProps)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery.parameter.id"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.SynchronousAthenaQueryProps`](#aws-analytics-reference-architecture.SynchronousAthenaQueryProps)

the CrawlerStartWait [properties]{@link SynchronousAthenaQueryProps}.

---





### SynchronousCrawler <a name="aws-analytics-reference-architecture.SynchronousCrawler"></a>

CrawlerStartWait Construct to start an AWS Glue Crawler execution and asynchronously wait for completion.

#### Initializer <a name="aws-analytics-reference-architecture.SynchronousCrawler.Initializer"></a>

```typescript
import { SynchronousCrawler } from 'aws-analytics-reference-architecture'

new SynchronousCrawler(scope: Construct, id: string, props: SynchronousCrawlerProps)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawler.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawler.parameter.id"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawler.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.SynchronousCrawlerProps`](#aws-analytics-reference-architecture.SynchronousCrawlerProps)

the CrawlerStartWait [properties]{@link SynchronousCrawlerProps}.

---





## Structs <a name="Structs"></a>

### DataGeneratorProps <a name="aws-analytics-reference-architecture.DataGeneratorProps"></a>

The properties for DataGenerator Construct.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DataGeneratorProps } from 'aws-analytics-reference-architecture'

const dataGeneratorProps: DataGeneratorProps = { ... }
```

##### `dataset`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGeneratorProps.property.dataset"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

Source dataset used to generate the data by replying it.

Use a pre-defined [Dataset]{@link Dataset} or create a [custom one]{@link Dataset.constructor}.

---

##### `sinkArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGeneratorProps.property.sinkArn"></a>

- *Type:* `string`

Sink Arn to receive the generated data.

Sink must be an Amazon S3 bucket.

---

##### `frequency`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataGeneratorProps.property.frequency"></a>

- *Type:* `number`
- *Default:* 30 min (1800s)

Frequency (in Seconds) of the data generation.

Should be > 60s.

---

### DataLakeStorageProps <a name="aws-analytics-reference-architecture.DataLakeStorageProps"></a>

Properties for the DataLakeStorage Construct.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DataLakeStorageProps } from 'aws-analytics-reference-architecture'

const dataLakeStorageProps: DataLakeStorageProps = { ... }
```

##### `cleanArchiveDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.cleanArchiveDelay"></a>

- *Type:* `number`
- *Default:* Objects are not archived to Glacier

Delay (in days) before archiving CLEAN data to frozen storage (Glacier storage class).

---

##### `cleanInfrequentAccessDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.cleanInfrequentAccessDelay"></a>

- *Type:* `number`
- *Default:* Move objects to Infrequent Access after 90 days

Delay (in days) before moving CLEAN data to cold storage (Infrequent Access storage class).

---

##### `rawArchiveDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.rawArchiveDelay"></a>

- *Type:* `number`
- *Default:* Move objects to Glacier after 90 days

Delay (in days) before archiving RAW data to frozen storage (Glacier storage class).

---

##### `rawInfrequentAccessDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.rawInfrequentAccessDelay"></a>

- *Type:* `number`
- *Default:* Move objects to Infrequent Access after 30 days

Delay (in days) before moving RAW data to cold storage (Infrequent Access storage class).

---

##### `transformArchiveDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.transformArchiveDelay"></a>

- *Type:* `number`
- *Default:* Objects are not archived to Glacier

Delay (in days) before archiving TRANSFORM data to frozen storage (Glacier storage class).

---

##### `transformInfrequentAccessDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.transformInfrequentAccessDelay"></a>

- *Type:* `number`
- *Default:* Move objects to Infrequent Access after 90 days

Delay (in days) before moving TRANSFORM data to cold storage (Infrequent Access storage class).

---

### DatasetProps <a name="aws-analytics-reference-architecture.DatasetProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DatasetProps } from 'aws-analytics-reference-architecture'

const datasetProps: DatasetProps = { ... }
```

##### `createTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.createTable"></a>

- *Type:* `string`

The CREATE TABLE DDL command to create the AWS Glue Table.

---

##### `generateData`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.generateData"></a>

- *Type:* `string`

The SELECT query used to generate new data.

---

##### `location`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.location"></a>

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

The Amazon S3 Location of the source dataset.

It's composed of an Amazon S3 bucketName and an Amazon S3 objectKey

---

##### `startDatetime`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.startDatetime"></a>

- *Type:* `string`

The minimum datetime value in the dataset used to calculate time offset.

---

### ExampleProps <a name="aws-analytics-reference-architecture.ExampleProps"></a>

The properties for the Example Construct class.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { ExampleProps } from 'aws-analytics-reference-architecture'

const exampleProps: ExampleProps = { ... }
```

##### `name`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.ExampleProps.property.name"></a>

- *Type:* `string`
- *Default:* Set to 'defaultMessage' if not provided

Name used to qualify the CfnOutput in the Stack.

---

##### `value`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.ExampleProps.property.value"></a>

- *Type:* `string`
- *Default:* Set to 'defaultValue!' if not provided

Value used in the CfnOutput in the Stack.

---

### SynchronousAthenaQueryProps <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps"></a>

The properties for SynchronousAthenaQuery Construct.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { SynchronousAthenaQueryProps } from 'aws-analytics-reference-architecture'

const synchronousAthenaQueryProps: SynchronousAthenaQueryProps = { ... }
```

##### `resultPath`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.resultPath"></a>

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

The Amazon S3 Location for the query results (without trailing slash).

---

##### `statement`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.statement"></a>

- *Type:* `string`

The name of the Athena query to execute.

---

##### `executionRoleStatements`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.executionRoleStatements"></a>

- *Type:* [`@aws-cdk/aws-iam.PolicyStatement`](#@aws-cdk/aws-iam.PolicyStatement)[]
- *Default:* No Policy Statements are added to the execution role

The Amazon IAM Policy Statements used to run the query.

---

##### `timeout`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.timeout"></a>

- *Type:* `number`
- *Default:* 60 seconds

The timeout in seconds to wait for query success.

---

### SynchronousCrawlerProps <a name="aws-analytics-reference-architecture.SynchronousCrawlerProps"></a>

The properties for SynchronousCrawler Construct.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { SynchronousCrawlerProps } from 'aws-analytics-reference-architecture'

const synchronousCrawlerProps: SynchronousCrawlerProps = { ... }
```

##### `crawlerName`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawlerProps.property.crawlerName"></a>

- *Type:* `string`

The name of the Crawler to use.

---

##### `timeout`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawlerProps.property.timeout"></a>

- *Type:* `number`
- *Default:* 300 seconds

The timeout in seconds to wait for the Crawler success.

---

## Classes <a name="Classes"></a>

### Dataset <a name="aws-analytics-reference-architecture.Dataset"></a>

Dataset enum-like class providing pre-defined datasets metadata and custom dataset creation.

#### Initializer <a name="aws-analytics-reference-architecture.Dataset.Initializer"></a>

```typescript
import { Dataset } from 'aws-analytics-reference-architecture'

new Dataset(props: DatasetProps)
```

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.DatasetProps`](#aws-analytics-reference-architecture.DatasetProps)

the DatasetProps.

---

#### Methods <a name="Methods"></a>

##### `parseCreateQuery` <a name="aws-analytics-reference-architecture.Dataset.parseCreateQuery"></a>

```typescript
public parseCreateQuery(database: string, table: string, bucket: string, key: string)
```

###### `database`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.database"></a>

- *Type:* `string`

the database name to parse.

---

###### `table`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.table"></a>

- *Type:* `string`

the table name to parse.

---

###### `bucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.bucket"></a>

- *Type:* `string`

the bucket name to parse.

---

###### `key`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.key"></a>

- *Type:* `string`

the key to parse.

---

##### `parseGenerateQuery` <a name="aws-analytics-reference-architecture.Dataset.parseGenerateQuery"></a>

```typescript
public parseGenerateQuery(database: string, sourceTable: string, targetTable: string)
```

###### `database`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.database"></a>

- *Type:* `string`

the database name to parse.

---

###### `sourceTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.sourceTable"></a>

- *Type:* `string`

the source table name to parse.

---

###### `targetTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.targetTable"></a>

- *Type:* `string`

the target table name to parse.

---


#### Properties <a name="Properties"></a>

##### `createTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.createTable"></a>

- *Type:* `string`

The CREATE TABLE DDL command to create the AWS Glue Table.

---

##### `generateData`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.generateData"></a>

- *Type:* `string`

The SELECT query used to generate new data.

---

##### `location`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.location"></a>

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

The Amazon S3 Location of the source dataset.

---

##### `offset`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.offset"></a>

- *Type:* `number`

The offset of the Dataset (difference between min datetime and now) in Seconds.

---

##### `tableName`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.tableName"></a>

- *Type:* `string`

The name of the SQL table extracted from path.

---

#### Constants <a name="Constants"></a>

##### `DATASETS_BUCKET` <a name="aws-analytics-reference-architecture.Dataset.property.DATASETS_BUCKET"></a>

- *Type:* `string`

The bucket name of the AWS Analytics Reference Architecture datasets.

---

##### `RETAIL_ADDRESS` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_ADDRESS"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer address dataset part of retail datasets.

---

##### `RETAIL_CUSTOMER` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_CUSTOMER"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer dataset part of retail datasets.

---

##### `RETAIL_ITEM` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_ITEM"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The item dataset part of retail datasets.

---

##### `RETAIL_PROMO` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_PROMO"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The promotion dataset part of retail datasets.

---

##### `RETAIL_STORE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_STORE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store dataset part of retail datasets.

---

##### `RETAIL_STORE_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_STORE_SALE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store sale dataset part of retail datasets.

---

##### `RETAIL_WAREHOUSE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_WAREHOUSE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The warehouse dataset part of retail datasets.

---

##### `RETAIL_WEB_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_WEB_SALE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The web sale dataset part of retail datasets.

---



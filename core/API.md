# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AthenaDefaultSetup <a name="AthenaDefaultSetup" id="aws-analytics-reference-architecture.AthenaDefaultSetup"></a>

AthenaDefaultSetup Construct to automatically setup a new Amazon Athena Workgroup with proper configuration for out-of-the-box usage.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.AthenaDefaultSetup.Initializer"></a>

```typescript
import { AthenaDefaultSetup } from 'aws-analytics-reference-architecture'

new AthenaDefaultSetup(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDefaultSetup.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.AthenaDefaultSetup.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.AthenaDefaultSetup.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.AthenaDefaultSetup.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDefaultSetup.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.AthenaDefaultSetup.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDefaultSetup.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.AthenaDefaultSetup.isConstruct"></a>

```typescript
import { AthenaDefaultSetup } from 'aws-analytics-reference-architecture'

AthenaDefaultSetup.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.AthenaDefaultSetup.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDefaultSetup.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.AthenaDefaultSetup.property.resultBucket">resultBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.AthenaDefaultSetup.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `resultBucket`<sup>Required</sup> <a name="resultBucket" id="aws-analytics-reference-architecture.AthenaDefaultSetup.property.resultBucket"></a>

```typescript
public readonly resultBucket: Bucket;
```

- *Type:* @aws-cdk/aws-s3.Bucket

---


### BatchReplayer <a name="BatchReplayer" id="aws-analytics-reference-architecture.BatchReplayer"></a>

Replay the data in the given PartitionedDataset.

It will dump files into the `sinkBucket` based on the given `frequency`.
The computation is in a Step Function with two Lambda steps.

1. resources/lambdas/find-file-paths
Read the manifest file and output a list of S3 file paths within that batch time range

2. resources/lambdas/write-in-batch
Take a file path, filter only records within given time range, adjust the the time with offset to
make it looks like just being generated. Then write the output to the `sinkBucket`

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.BatchReplayer.Initializer"></a>

```typescript
import { BatchReplayer } from 'aws-analytics-reference-architecture'

new BatchReplayer(scope: Construct, id: string, props: BatchReplayerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps">BatchReplayerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.BatchReplayer.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.BatchReplayerProps">BatchReplayerProps</a>

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
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.BatchReplayer.isConstruct"></a>

```typescript
import { BatchReplayer } from 'aws-analytics-reference-architecture'

BatchReplayer.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.BatchReplayer.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.dataset">dataset</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | Dataset used for replay. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.frequency">frequency</a></code> | <code>number</code> | Frequency (in Seconds) of the replaying. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.sinkBucket">sinkBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | Sink bucket where the batch replayer will put data in. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.outputFileMaxSizeInBytes">outputFileMaxSizeInBytes</a></code> | <code>number</code> | Maximum file size for each output file. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.BatchReplayer.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

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

##### `sinkBucket`<sup>Required</sup> <a name="sinkBucket" id="aws-analytics-reference-architecture.BatchReplayer.property.sinkBucket"></a>

```typescript
public readonly sinkBucket: Bucket;
```

- *Type:* @aws-cdk/aws-s3.Bucket

Sink bucket where the batch replayer will put data in.

---

##### `outputFileMaxSizeInBytes`<sup>Optional</sup> <a name="outputFileMaxSizeInBytes" id="aws-analytics-reference-architecture.BatchReplayer.property.outputFileMaxSizeInBytes"></a>

```typescript
public readonly outputFileMaxSizeInBytes: number;
```

- *Type:* number

Maximum file size for each output file.

If the output batch file is,
larger than that, it will be splitted into multiple files that fit this size.

Default to 100MB (max value)

---


### DataGenerator <a name="DataGenerator" id="aws-analytics-reference-architecture.DataGenerator"></a>

DataGenerator Construct to replay data from an existing dataset into a target replacing datetime to current datetime Target can be an Amazon S3 bucket or an Amazon Kinesis Data Stream.

DataGenerator can use pre-defined or custom datasets available in the [Dataset]{@link Dataset} Class

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.DataGenerator.Initializer"></a>

```typescript
import { DataGenerator } from 'aws-analytics-reference-architecture'

new DataGenerator(scope: Construct, id: string, props: DataGeneratorProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.DataGeneratorProps">DataGeneratorProps</a></code> | the DataGenerator [properties]{@link DataGeneratorProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.DataGenerator.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.DataGenerator.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.DataGenerator.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.DataGeneratorProps">DataGeneratorProps</a>

the DataGenerator [properties]{@link DataGeneratorProps}.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.DataGenerator.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.DataGenerator.isConstruct"></a>

```typescript
import { DataGenerator } from 'aws-analytics-reference-architecture'

DataGenerator.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.DataGenerator.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.property.dataset">dataset</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | Dataset used to generate data. |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.property.frequency">frequency</a></code> | <code>number</code> | Frequency (in Seconds) of the data generation. |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.property.sinkArn">sinkArn</a></code> | <code>string</code> | Sink Arn to receive the generated data. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.DataGenerator.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `dataset`<sup>Required</sup> <a name="dataset" id="aws-analytics-reference-architecture.DataGenerator.property.dataset"></a>

```typescript
public readonly dataset: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

Dataset used to generate data.

---

##### `frequency`<sup>Required</sup> <a name="frequency" id="aws-analytics-reference-architecture.DataGenerator.property.frequency"></a>

```typescript
public readonly frequency: number;
```

- *Type:* number

Frequency (in Seconds) of the data generation.

---

##### `sinkArn`<sup>Required</sup> <a name="sinkArn" id="aws-analytics-reference-architecture.DataGenerator.property.sinkArn"></a>

```typescript
public readonly sinkArn: string;
```

- *Type:* string

Sink Arn to receive the generated data.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.property.DATA_GENERATOR_DATABASE">DATA_GENERATOR_DATABASE</a></code> | <code>string</code> | AWS Glue Database name used by the DataGenerator. |

---

##### `DATA_GENERATOR_DATABASE`<sup>Required</sup> <a name="DATA_GENERATOR_DATABASE" id="aws-analytics-reference-architecture.DataGenerator.property.DATA_GENERATOR_DATABASE"></a>

```typescript
public readonly DATA_GENERATOR_DATABASE: string;
```

- *Type:* string

AWS Glue Database name used by the DataGenerator.

---

### DataLakeCatalog <a name="DataLakeCatalog" id="aws-analytics-reference-architecture.DataLakeCatalog"></a>

A Data Lake Catalog composed of 3 AWS Glue Database configured with AWS best practices:   Databases for Raw/Cleaned/Transformed data,.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.DataLakeCatalog.Initializer"></a>

```typescript
import { DataLakeCatalog } from 'aws-analytics-reference-architecture'

new DataLakeCatalog(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.DataLakeCatalog.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

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
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.DataLakeCatalog.isConstruct"></a>

```typescript
import { DataLakeCatalog } from 'aws-analytics-reference-architecture'

DataLakeCatalog.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.DataLakeCatalog.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.cleanDatabase">cleanDatabase</a></code> | <code>@aws-cdk/aws-glue.Database</code> | AWS Glue Database for Clean data. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.rawDatabase">rawDatabase</a></code> | <code>@aws-cdk/aws-glue.Database</code> | AWS Glue Database for Raw data. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.transformDatabase">transformDatabase</a></code> | <code>@aws-cdk/aws-glue.Database</code> | AWS Glue Database for Transform data. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.DataLakeCatalog.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `cleanDatabase`<sup>Required</sup> <a name="cleanDatabase" id="aws-analytics-reference-architecture.DataLakeCatalog.property.cleanDatabase"></a>

```typescript
public readonly cleanDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue.Database

AWS Glue Database for Clean data.

---

##### `rawDatabase`<sup>Required</sup> <a name="rawDatabase" id="aws-analytics-reference-architecture.DataLakeCatalog.property.rawDatabase"></a>

```typescript
public readonly rawDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue.Database

AWS Glue Database for Raw data.

---

##### `transformDatabase`<sup>Required</sup> <a name="transformDatabase" id="aws-analytics-reference-architecture.DataLakeCatalog.property.transformDatabase"></a>

```typescript
public readonly transformDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue.Database

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
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps">DataLakeExporterProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.DataLakeExporter.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

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
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.DataLakeExporter.isConstruct"></a>

```typescript
import { DataLakeExporter } from 'aws-analytics-reference-architecture'

DataLakeExporter.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.DataLakeExporter.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.property.cfnIngestionStream">cfnIngestionStream</a></code> | <code>@aws-cdk/aws-kinesisfirehose.CfnDeliveryStream</code> | Constructs a new instance of the DataLakeExporter class. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.DataLakeExporter.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `cfnIngestionStream`<sup>Required</sup> <a name="cfnIngestionStream" id="aws-analytics-reference-architecture.DataLakeExporter.property.cfnIngestionStream"></a>

```typescript
public readonly cfnIngestionStream: CfnDeliveryStream;
```

- *Type:* @aws-cdk/aws-kinesisfirehose.CfnDeliveryStream

Constructs a new instance of the DataLakeExporter class.

---


### DataLakeStorage <a name="DataLakeStorage" id="aws-analytics-reference-architecture.DataLakeStorage"></a>

A CDK Construct that creates the storage layers of a data lake composed of Amazon S3 Buckets.

This construct is based on 3 Amazon S3 buckets configured with AWS best practices:
  * S3 buckets for Raw/Cleaned/Transformed data,
  * data lifecycle optimization/transitioning to different Amazon S3 storage classes
  * server side buckets encryption managed by KMS

By default the transitioning rules to Amazon S3 storage classes are configured as following:
  * Raw data is moved to Infrequent Access after 30 days and archived to Glacier after 90 days
  * Clean and Transformed data is moved to Infrequent Access after 90 days and is not archived

Usage example:
```typescript
import * as cdk from '@aws-cdk/core';
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
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.DataLakeStorageProps">DataLakeStorageProps</a></code> | the DataLakeStorageProps properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.DataLakeStorage.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

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
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.DataLakeStorage.isConstruct"></a>

```typescript
import { DataLakeStorage } from 'aws-analytics-reference-architecture'

DataLakeStorage.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.DataLakeStorage.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.cleanBucket">cleanBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.rawBucket">rawBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.transformBucket">transformBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.DataLakeStorage.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `cleanBucket`<sup>Required</sup> <a name="cleanBucket" id="aws-analytics-reference-architecture.DataLakeStorage.property.cleanBucket"></a>

```typescript
public readonly cleanBucket: Bucket;
```

- *Type:* @aws-cdk/aws-s3.Bucket

---

##### `rawBucket`<sup>Required</sup> <a name="rawBucket" id="aws-analytics-reference-architecture.DataLakeStorage.property.rawBucket"></a>

```typescript
public readonly rawBucket: Bucket;
```

- *Type:* @aws-cdk/aws-s3.Bucket

---

##### `transformBucket`<sup>Required</sup> <a name="transformBucket" id="aws-analytics-reference-architecture.DataLakeStorage.property.transformBucket"></a>

```typescript
public readonly transformBucket: Bucket;
```

- *Type:* @aws-cdk/aws-s3.Bucket

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
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.props">props</a></code> | <code>@aws-cdk/aws-iam.RoleProps</code> | the RoleProps [properties]{@link RoleProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.Ec2SsmRole.Initializer.parameter.props"></a>

- *Type:* @aws-cdk/aws-iam.RoleProps

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

- *Type:* @aws-cdk/core.RemovalPolicy

---

##### `addManagedPolicy` <a name="addManagedPolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.addManagedPolicy"></a>

```typescript
public addManagedPolicy(policy: IManagedPolicy): void
```

Attaches a managed policy to this role.

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.Ec2SsmRole.addManagedPolicy.parameter.policy"></a>

- *Type:* @aws-cdk/aws-iam.IManagedPolicy

The the managed policy to attach.

---

##### `addToPolicy` <a name="addToPolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.addToPolicy"></a>

```typescript
public addToPolicy(statement: PolicyStatement): boolean
```

Add to the policy of this principal.

###### `statement`<sup>Required</sup> <a name="statement" id="aws-analytics-reference-architecture.Ec2SsmRole.addToPolicy.parameter.statement"></a>

- *Type:* @aws-cdk/aws-iam.PolicyStatement

---

##### `addToPrincipalPolicy` <a name="addToPrincipalPolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.addToPrincipalPolicy"></a>

```typescript
public addToPrincipalPolicy(statement: PolicyStatement): AddToPrincipalPolicyResult
```

Adds a permission to the role's default policy document.

If there is no default policy attached to this role, it will be created.

###### `statement`<sup>Required</sup> <a name="statement" id="aws-analytics-reference-architecture.Ec2SsmRole.addToPrincipalPolicy.parameter.statement"></a>

- *Type:* @aws-cdk/aws-iam.PolicyStatement

The permission statement to add to the policy document.

---

##### `attachInlinePolicy` <a name="attachInlinePolicy" id="aws-analytics-reference-architecture.Ec2SsmRole.attachInlinePolicy"></a>

```typescript
public attachInlinePolicy(policy: Policy): void
```

Attaches a policy to this role.

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.Ec2SsmRole.attachInlinePolicy.parameter.policy"></a>

- *Type:* @aws-cdk/aws-iam.Policy

The policy to attach.

---

##### `grant` <a name="grant" id="aws-analytics-reference-architecture.Ec2SsmRole.grant"></a>

```typescript
public grant(grantee: IPrincipal, actions: string): Grant
```

Grant the actions defined in actions to the identity Principal on this resource.

###### `grantee`<sup>Required</sup> <a name="grantee" id="aws-analytics-reference-architecture.Ec2SsmRole.grant.parameter.grantee"></a>

- *Type:* @aws-cdk/aws-iam.IPrincipal

---

###### `actions`<sup>Required</sup> <a name="actions" id="aws-analytics-reference-architecture.Ec2SsmRole.grant.parameter.actions"></a>

- *Type:* string

---

##### `grantPassRole` <a name="grantPassRole" id="aws-analytics-reference-architecture.Ec2SsmRole.grantPassRole"></a>

```typescript
public grantPassRole(identity: IPrincipal): Grant
```

Grant permissions to the given principal to pass this role.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.Ec2SsmRole.grantPassRole.parameter.identity"></a>

- *Type:* @aws-cdk/aws-iam.IPrincipal

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

- *Type:* @aws-cdk/aws-iam.WithoutPolicyUpdatesOptions

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.fromRoleArn">fromRoleArn</a></code> | Import an external role by ARN. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName">fromRoleName</a></code> | Import an external role by name. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.Ec2SsmRole.isConstruct"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.Ec2SsmRole.isConstruct.parameter.x"></a>

- *Type:* any

---

##### `isResource` <a name="isResource" id="aws-analytics-reference-architecture.Ec2SsmRole.isResource"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.Ec2SsmRole.isResource.parameter.construct"></a>

- *Type:* @aws-cdk/core.IConstruct

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

- *Type:* @aws-cdk/aws-iam.FromRoleArnOptions

allow customizing the behavior of the returned role.

---

##### `fromRoleName` <a name="fromRoleName" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

Ec2SsmRole.fromRoleName(scope: Construct, id: string, roleName: string)
```

Import an external role by name.

The imported role is assumed to exist in the same account as the account
the scope's containing Stack is being deployed to.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName.parameter.id"></a>

- *Type:* string

---

###### `roleName`<sup>Required</sup> <a name="roleName" id="aws-analytics-reference-architecture.Ec2SsmRole.fromRoleName.parameter.roleName"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.env">env</a></code> | <code>@aws-cdk/core.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.stack">stack</a></code> | <code>@aws-cdk/core.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.assumeRoleAction">assumeRoleAction</a></code> | <code>string</code> | When this Principal is used in an AssumeRole policy, the action to use. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.grantPrincipal">grantPrincipal</a></code> | <code>@aws-cdk/aws-iam.IPrincipal</code> | The principal to grant permissions to. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.policyFragment">policyFragment</a></code> | <code>@aws-cdk/aws-iam.PrincipalPolicyFragment</code> | Returns the role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.roleArn">roleArn</a></code> | <code>string</code> | Returns the ARN of this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.roleId">roleId</a></code> | <code>string</code> | Returns the stable and unique string identifying the role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.roleName">roleName</a></code> | <code>string</code> | Returns the name of the role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.assumeRolePolicy">assumeRolePolicy</a></code> | <code>@aws-cdk/aws-iam.PolicyDocument</code> | The assume role policy document associated with this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.permissionsBoundary">permissionsBoundary</a></code> | <code>@aws-cdk/aws-iam.IManagedPolicy</code> | Returns the permissions boundary attached to this role. |
| <code><a href="#aws-analytics-reference-architecture.Ec2SsmRole.property.principalAccount">principalAccount</a></code> | <code>string</code> | The AWS account ID of this principal. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.Ec2SsmRole.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-analytics-reference-architecture.Ec2SsmRole.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* @aws-cdk/core.ResourceEnvironment

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

- *Type:* @aws-cdk/core.Stack

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

- *Type:* @aws-cdk/aws-iam.IPrincipal

The principal to grant permissions to.

---

##### `policyFragment`<sup>Required</sup> <a name="policyFragment" id="aws-analytics-reference-architecture.Ec2SsmRole.property.policyFragment"></a>

```typescript
public readonly policyFragment: PrincipalPolicyFragment;
```

- *Type:* @aws-cdk/aws-iam.PrincipalPolicyFragment

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

- *Type:* @aws-cdk/aws-iam.PolicyDocument

The assume role policy document associated with this role.

---

##### `permissionsBoundary`<sup>Optional</sup> <a name="permissionsBoundary" id="aws-analytics-reference-architecture.Ec2SsmRole.property.permissionsBoundary"></a>

```typescript
public readonly permissionsBoundary: IManagedPolicy;
```

- *Type:* @aws-cdk/aws-iam.IManagedPolicy

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

EmrEksCluster Construct packaging all the ressources required to run Amazon EMR on Amazon EKS.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup">addEmrEksNodegroup</a></code> | Add new Amazon EMR on EKS nodegroups to the cluster. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster">addEmrVirtualCluster</a></code> | Add a new Amazon EMR Virtual Cluster linked to Amazon EKS Cluster. |
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

Add new Amazon EMR on EKS nodegroups to the cluster.

This method overrides Amazon EKS nodegroup options then create the nodegroup.
If no subnet is provided, it creates one nodegroup per private subnet in the Amazon EKS Cluster.
If NVME local storage is used, the user_data is modified.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup.parameter.id"></a>

- *Type:* string

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

- *Type:* @aws-cdk/core.Construct

of the stack where virtual cluster is deployed.

---

###### `options`<sup>Required</sup> <a name="options" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster.parameter.options"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrVirtualClusterOptions">EmrVirtualClusterOptions</a>

the EmrVirtualClusterProps [properties]{@link EmrVirtualClusterProps}.

---

##### `addManagedEndpoint` <a name="addManagedEndpoint" id="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint"></a>

```typescript
public addManagedEndpoint(scope: Construct, id: string, options: EmrManagedEndpointOptions): CustomResource
```

Creates a new Amazon EMR managed endpoint to be used with Amazon EMR Virtual Cluster .

CfnOutput can be customized.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

of the stack where managed endpoint is deployed.

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint.parameter.id"></a>

- *Type:* string

unique id for endpoint.

---

###### `options`<sup>Required</sup> <a name="options" id="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint.parameter.options"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions">EmrManagedEndpointOptions</a>

The EmrManagedEndpointOptions to configure the Amazon EMR managed endpoint.

---

##### `addNodegroupCapacity` <a name="addNodegroupCapacity" id="aws-analytics-reference-architecture.EmrEksCluster.addNodegroupCapacity"></a>

```typescript
public addNodegroupCapacity(nodegroupId: string, options: EmrEksNodegroupOptions): Nodegroup
```

Add a new Amazon EKS Nodegroup to the cluster.

This method is be used to add a nodegroup to the Amazon EKS cluster and automatically set tags based on labels and taints
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
public createExecutionRole(scope: Construct, id: string, policy: IManagedPolicy, name?: string): Role
```

Create and configure a new Amazon IAM Role usable as an execution role.

This method links the makes the created role assumed by the Amazon EKS cluster Open ID Connect provider.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

of the IAM role.

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole.parameter.id"></a>

- *Type:* string

of the CDK resource to be created, it should be unique across the stack.

---

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole.parameter.policy"></a>

- *Type:* @aws-cdk/aws-iam.IManagedPolicy

the execution policy to attach to the role.

---

###### `name`<sup>Optional</sup> <a name="name" id="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole.parameter.name"></a>

- *Type:* string

for the Managed Endpoint.

---

##### `uploadPodTemplate` <a name="uploadPodTemplate" id="aws-analytics-reference-architecture.EmrEksCluster.uploadPodTemplate"></a>

```typescript
public uploadPodTemplate(id: string, filePath: string): void
```

Upload podTemplates to the Amazon S3 location used by the cluster.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.uploadPodTemplate.parameter.id"></a>

- *Type:* string

---

###### `filePath`<sup>Required</sup> <a name="filePath" id="aws-analytics-reference-architecture.EmrEksCluster.uploadPodTemplate.parameter.filePath"></a>

- *Type:* string

The local path of the yaml podTemplate files to upload.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.getOrCreate">getOrCreate</a></code> | Get an existing EmrEksCluster based on the cluster name property or create a new one. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.EmrEksCluster.isConstruct"></a>

```typescript
import { EmrEksCluster } from 'aws-analytics-reference-architecture'

EmrEksCluster.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.EmrEksCluster.isConstruct.parameter.x"></a>

- *Type:* any

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate"></a>

```typescript
import { EmrEksCluster } from 'aws-analytics-reference-architecture'

EmrEksCluster.getOrCreate(scope: Construct, props: EmrEksClusterProps)
```

Get an existing EmrEksCluster based on the cluster name property or create a new one.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

###### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksClusterProps">EmrEksClusterProps</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.criticalDefaultConfig">criticalDefaultConfig</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.eksCluster">eksCluster</a></code> | <code>@aws-cdk/aws-eks.Cluster</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.notebookDefaultConfig">notebookDefaultConfig</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.podTemplateLocation">podTemplateLocation</a></code> | <code>@aws-cdk/aws-s3.Location</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.sharedDefaultConfig">sharedDefaultConfig</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.EmrEksCluster.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `criticalDefaultConfig`<sup>Required</sup> <a name="criticalDefaultConfig" id="aws-analytics-reference-architecture.EmrEksCluster.property.criticalDefaultConfig"></a>

```typescript
public readonly criticalDefaultConfig: string;
```

- *Type:* string

---

##### `eksCluster`<sup>Required</sup> <a name="eksCluster" id="aws-analytics-reference-architecture.EmrEksCluster.property.eksCluster"></a>

```typescript
public readonly eksCluster: Cluster;
```

- *Type:* @aws-cdk/aws-eks.Cluster

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

- *Type:* @aws-cdk/aws-s3.Location

---

##### `sharedDefaultConfig`<sup>Required</sup> <a name="sharedDefaultConfig" id="aws-analytics-reference-architecture.EmrEksCluster.property.sharedDefaultConfig"></a>

```typescript
public readonly sharedDefaultConfig: string;
```

- *Type:* string

---


### Example <a name="Example" id="aws-analytics-reference-architecture.Example"></a>

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.Example.Initializer"></a>

```typescript
import { Example } from 'aws-analytics-reference-architecture'

new Example(scope: Construct, id: string, props: ExampleProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Example.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.Example.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.Example.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.ExampleProps">ExampleProps</a></code> | the ExampleProps properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.Example.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.Example.Initializer.parameter.id"></a>

- *Type:* string

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.Example.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.ExampleProps">ExampleProps</a>

the ExampleProps properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Example.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.Example.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Example.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.Example.isConstruct"></a>

```typescript
import { Example } from 'aws-analytics-reference-architecture'

Example.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.Example.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Example.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.Example.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---


### FlywayRunner <a name="FlywayRunner" id="aws-analytics-reference-architecture.FlywayRunner"></a>

A CDK construct that runs flyway migration scripts against a redshift cluster.

This construct is based on two main resource, an AWS Lambda hosting a flyway runner
and one custom resource invoking it when content of migrationScriptsFolderAbsolutePath changes.

Usage example:

*This example assume that migration SQL files are located in `resources/sql` of the cdk project.*
```typescript
import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as redshift from '@aws-cdk/aws-redshift';
import * as cdk from '@aws-cdk/core';

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
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps">FlywayRunnerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.FlywayRunner.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.FlywayRunnerProps">FlywayRunnerProps</a>

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
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.FlywayRunner.isConstruct"></a>

```typescript
import { FlywayRunner } from 'aws-analytics-reference-architecture'

FlywayRunner.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.FlywayRunner.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.property.runner">runner</a></code> | <code>@aws-cdk/core.CustomResource</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.FlywayRunner.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `runner`<sup>Required</sup> <a name="runner" id="aws-analytics-reference-architecture.FlywayRunner.property.runner"></a>

```typescript
public readonly runner: CustomResource;
```

- *Type:* @aws-cdk/core.CustomResource

---


### LakeformationS3Location <a name="LakeformationS3Location" id="aws-analytics-reference-architecture.LakeformationS3Location"></a>

This CDK construct aims to register an S3 Location for Lakeformation with Read and Write access.

This construct instantiate 2 objects:
* An IAM role with read/write permissions to the S3 location and read access to the KMS key used to encypt the bucket 
* A CfnResource is based on an IAM role with 2 policies folowing the least privilege AWS best practices:
* Policy 1 is for GetObject, PutObject, DeleteObject from S3 bucket
* Policy 2 is to list S3 Buckets

Policy 1 takes as an input S3 object arn
Policy 2 takes as an input S3 bucket arn


The CDK construct instantiate the cfnresource in order to register the S3 location with Lakeformation using the IAM role defined above.

Usage example:
```typescript
import * as cdk from '@aws-cdk/core';
import { LakeformationS3Location } from 'aws-analytics-reference-architecture';

const exampleApp = new cdk.App();
const stack = new cdk.Stack(exampleApp, 'LakeformationS3LocationStack');

new LakeformationS3Location(stack, 'MyLakeformationS3Location', {
   s3Location:{
     bucketName: 'my-bucket',
     objectKey: 'my-prefix',
   }
});
```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.LakeformationS3Location.Initializer"></a>

```typescript
import { LakeformationS3Location } from 'aws-analytics-reference-architecture'

new LakeformationS3Location(scope: Construct, id: string, props: LakeFormationS3LocationProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeformationS3Location.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.LakeformationS3Location.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.LakeformationS3Location.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.LakeFormationS3LocationProps">LakeFormationS3LocationProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.LakeformationS3Location.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.LakeformationS3Location.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.LakeformationS3Location.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.LakeFormationS3LocationProps">LakeFormationS3LocationProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeformationS3Location.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.LakeformationS3Location.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeformationS3Location.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.LakeformationS3Location.isConstruct"></a>

```typescript
import { LakeformationS3Location } from 'aws-analytics-reference-architecture'

LakeformationS3Location.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.LakeformationS3Location.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.LakeformationS3Location.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.LakeformationS3Location.property.dataAccessRole">dataAccessRole</a></code> | <code>@aws-cdk/aws-iam.Role</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.LakeformationS3Location.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `dataAccessRole`<sup>Required</sup> <a name="dataAccessRole" id="aws-analytics-reference-architecture.LakeformationS3Location.property.dataAccessRole"></a>

```typescript
public readonly dataAccessRole: Role;
```

- *Type:* @aws-cdk/aws-iam.Role

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
* Multiple Session Policies that are used to map an EMR Studio user or group to a set of resources they are allowed to access. These resources are: <br />
   - EMR Virtual Cluster - created above <br />
   - ManagedEndpoint <br />


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


const policy1 = new ManagedPolicy(stack, 'MyPolicy1', {
   statements: [
     new PolicyStatement({
       resources: ['*'],
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
     emrOnEksVersion: 'emr-6.3.0-latest',
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
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | the Scope of the AWS CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the AWS CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps">NotebookPlatformProps</a></code> | the DataPlatformNotebooks [properties]{@link NotebookPlatformProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.NotebookPlatform.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

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
public addUser(userList: NotebookUserOptions[]): string[]
```

###### `userList`<sup>Required</sup> <a name="userList" id="aws-analytics-reference-architecture.NotebookPlatform.addUser.parameter.userList"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.NotebookUserOptions">NotebookUserOptions</a>[]

list of users.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.NotebookPlatform.isConstruct"></a>

```typescript
import { NotebookPlatform } from 'aws-analytics-reference-architecture'

NotebookPlatform.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.NotebookPlatform.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.NotebookPlatform.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---


### S3CrossAccount <a name="S3CrossAccount" id="aws-analytics-reference-architecture.S3CrossAccount"></a>

This CDK construct grants cross account permissions on an Amazon S3 location.

It uses a bucket policy and an Amazon KMS Key policy if the bucket is encrypted with KMS.
The cross account permission is granted to the entire account and not to a specific principal in this account.
It's the responsibility of the target account to grant permissions to the relevant principals.
  
Usage example:
```typescript
import * as cdk from '@aws-cdk/core';
import { S3CrossAccount } from 'aws-analytics-reference-architecture';

const exampleApp = new cdk.App();
const stack = new cdk.Stack(exampleApp, 'S3CrossAccountStack');

new S3CrossAccount(stack, 'S3CrossAccountGrant', {
   s3Location:{
     bucketName: 'my-bucket',
     objectKey: 'my-prefix',
   }
});
```

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.S3CrossAccount.Initializer"></a>

```typescript
import { S3CrossAccount } from 'aws-analytics-reference-architecture'

new S3CrossAccount(scope: Construct, id: string, props: S3CrossAccountProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.S3CrossAccountProps">S3CrossAccountProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.S3CrossAccount.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

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
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.S3CrossAccount.isConstruct"></a>

```typescript
import { S3CrossAccount } from 'aws-analytics-reference-architecture'

S3CrossAccount.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.S3CrossAccount.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccount.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.S3CrossAccount.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---


### SingletonBucket <a name="SingletonBucket" id="aws-analytics-reference-architecture.SingletonBucket"></a>

An Amazon S3 Bucket implementing the singleton pattern.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.SingletonBucket.Initializer"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

new SingletonBucket(scope: Construct, id: string, props?: BucketProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.Initializer.parameter.props">props</a></code> | <code>@aws-cdk/aws-s3.BucketProps</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonBucket.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonBucket.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="aws-analytics-reference-architecture.SingletonBucket.Initializer.parameter.props"></a>

- *Type:* @aws-cdk/aws-s3.BucketProps

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.addEventNotification">addEventNotification</a></code> | Adds a bucket notification event destination. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.addObjectCreatedNotification">addObjectCreatedNotification</a></code> | Subscribes a destination to receive notifications when an object is created in the bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.addObjectRemovedNotification">addObjectRemovedNotification</a></code> | Subscribes a destination to receive notifications when an object is removed from the bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.addToResourcePolicy">addToResourcePolicy</a></code> | Adds a statement to the resource policy for a principal (i.e. account/role/service) to perform actions on this bucket and/or its contents. Use `bucketArn` and `arnForObjects(keys)` to obtain ARNs for this bucket or objects. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.arnForObjects">arnForObjects</a></code> | Returns an ARN that represents all objects within the bucket that match the key pattern specified. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.grantDelete">grantDelete</a></code> | Grants s3:DeleteObject* permission to an IAM principal for objects in this bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.grantPublicAccess">grantPublicAccess</a></code> | Allows unrestricted access to objects from this bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.grantPut">grantPut</a></code> | Grants s3:PutObject* and s3:Abort* permissions for this bucket to an IAM principal. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.grantPutAcl">grantPutAcl</a></code> | Grant the given IAM identity permissions to modify the ACLs of objects in the given Bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.grantRead">grantRead</a></code> | Grant read permissions for this bucket and it's contents to an IAM principal (Role/Group/User). |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.grantReadWrite">grantReadWrite</a></code> | Grants read/write permissions for this bucket and it's contents to an IAM principal (Role/Group/User). |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.grantWrite">grantWrite</a></code> | Grant write permissions to this bucket to an IAM principal. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.onCloudTrailEvent">onCloudTrailEvent</a></code> | Define a CloudWatch event that triggers when something happens to this repository. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.onCloudTrailPutObject">onCloudTrailPutObject</a></code> | Defines an AWS CloudWatch event that triggers when an object is uploaded to the specified paths (keys) in this bucket using the PutObject API call. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.onCloudTrailWriteObject">onCloudTrailWriteObject</a></code> | Defines an AWS CloudWatch event that triggers when an object at the specified paths (keys) in this bucket are written to. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.s3UrlForObject">s3UrlForObject</a></code> | The S3 URL of an S3 object. For example:. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.transferAccelerationUrlForObject">transferAccelerationUrlForObject</a></code> | The https Transfer Acceleration URL of an S3 object. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.urlForObject">urlForObject</a></code> | The https URL of an S3 object. Specify `regional: false` at the options for non-regional URLs. For example:. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.virtualHostedUrlForObject">virtualHostedUrlForObject</a></code> | The virtual hosted-style URL of an S3 object. Specify `regional: false` at the options for non-regional URL. For example:. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.addCorsRule">addCorsRule</a></code> | Adds a cross-origin access configuration for objects in an Amazon S3 bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.addInventory">addInventory</a></code> | Add an inventory configuration. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.addLifecycleRule">addLifecycleRule</a></code> | Add a lifecycle rule to the bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.addMetric">addMetric</a></code> | Adds a metrics configuration for the CloudWatch request metrics from the bucket. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.SingletonBucket.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-analytics-reference-architecture.SingletonBucket.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="aws-analytics-reference-architecture.SingletonBucket.applyRemovalPolicy.parameter.policy"></a>

- *Type:* @aws-cdk/core.RemovalPolicy

---

##### `addEventNotification` <a name="addEventNotification" id="aws-analytics-reference-architecture.SingletonBucket.addEventNotification"></a>

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


###### `event`<sup>Required</sup> <a name="event" id="aws-analytics-reference-architecture.SingletonBucket.addEventNotification.parameter.event"></a>

- *Type:* @aws-cdk/aws-s3.EventType

The event to trigger the notification.

---

###### `dest`<sup>Required</sup> <a name="dest" id="aws-analytics-reference-architecture.SingletonBucket.addEventNotification.parameter.dest"></a>

- *Type:* @aws-cdk/aws-s3.IBucketNotificationDestination

The notification destination (Lambda, SNS Topic or SQS Queue).

---

###### `filters`<sup>Required</sup> <a name="filters" id="aws-analytics-reference-architecture.SingletonBucket.addEventNotification.parameter.filters"></a>

- *Type:* @aws-cdk/aws-s3.NotificationKeyFilter

S3 object key filter rules to determine which objects trigger this event.

Each filter must include a `prefix` and/or `suffix`
that will be matched against the s3 object key. Refer to the S3 Developer Guide
for details about allowed filter rules.

---

##### `addObjectCreatedNotification` <a name="addObjectCreatedNotification" id="aws-analytics-reference-architecture.SingletonBucket.addObjectCreatedNotification"></a>

```typescript
public addObjectCreatedNotification(dest: IBucketNotificationDestination, filters: NotificationKeyFilter): void
```

Subscribes a destination to receive notifications when an object is created in the bucket.

This is identical to calling
`onEvent(EventType.OBJECT_CREATED)`.

###### `dest`<sup>Required</sup> <a name="dest" id="aws-analytics-reference-architecture.SingletonBucket.addObjectCreatedNotification.parameter.dest"></a>

- *Type:* @aws-cdk/aws-s3.IBucketNotificationDestination

The notification destination (see onEvent).

---

###### `filters`<sup>Required</sup> <a name="filters" id="aws-analytics-reference-architecture.SingletonBucket.addObjectCreatedNotification.parameter.filters"></a>

- *Type:* @aws-cdk/aws-s3.NotificationKeyFilter

Filters (see onEvent).

---

##### `addObjectRemovedNotification` <a name="addObjectRemovedNotification" id="aws-analytics-reference-architecture.SingletonBucket.addObjectRemovedNotification"></a>

```typescript
public addObjectRemovedNotification(dest: IBucketNotificationDestination, filters: NotificationKeyFilter): void
```

Subscribes a destination to receive notifications when an object is removed from the bucket.

This is identical to calling
`onEvent(EventType.OBJECT_REMOVED)`.

###### `dest`<sup>Required</sup> <a name="dest" id="aws-analytics-reference-architecture.SingletonBucket.addObjectRemovedNotification.parameter.dest"></a>

- *Type:* @aws-cdk/aws-s3.IBucketNotificationDestination

The notification destination (see onEvent).

---

###### `filters`<sup>Required</sup> <a name="filters" id="aws-analytics-reference-architecture.SingletonBucket.addObjectRemovedNotification.parameter.filters"></a>

- *Type:* @aws-cdk/aws-s3.NotificationKeyFilter

Filters (see onEvent).

---

##### `addToResourcePolicy` <a name="addToResourcePolicy" id="aws-analytics-reference-architecture.SingletonBucket.addToResourcePolicy"></a>

```typescript
public addToResourcePolicy(permission: PolicyStatement): AddToResourcePolicyResult
```

Adds a statement to the resource policy for a principal (i.e. account/role/service) to perform actions on this bucket and/or its contents. Use `bucketArn` and `arnForObjects(keys)` to obtain ARNs for this bucket or objects.

Note that the policy statement may or may not be added to the policy.
For example, when an `IBucket` is created from an existing bucket,
it's not possible to tell whether the bucket already has a policy
attached, let alone to re-use that policy to add more statements to it.
So it's safest to do nothing in these cases.

###### `permission`<sup>Required</sup> <a name="permission" id="aws-analytics-reference-architecture.SingletonBucket.addToResourcePolicy.parameter.permission"></a>

- *Type:* @aws-cdk/aws-iam.PolicyStatement

the policy statement to be added to the bucket's policy.

---

##### `arnForObjects` <a name="arnForObjects" id="aws-analytics-reference-architecture.SingletonBucket.arnForObjects"></a>

```typescript
public arnForObjects(keyPattern: string): string
```

Returns an ARN that represents all objects within the bucket that match the key pattern specified.

To represent all keys, specify ``"*"``.

If you need to specify a keyPattern with multiple components, concatenate them into a single string, e.g.:

   arnForObjects(`home/${team}/${user}/*`)

###### `keyPattern`<sup>Required</sup> <a name="keyPattern" id="aws-analytics-reference-architecture.SingletonBucket.arnForObjects.parameter.keyPattern"></a>

- *Type:* string

---

##### `grantDelete` <a name="grantDelete" id="aws-analytics-reference-architecture.SingletonBucket.grantDelete"></a>

```typescript
public grantDelete(identity: IGrantable, objectsKeyPattern?: any): Grant
```

Grants s3:DeleteObject* permission to an IAM principal for objects in this bucket.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.SingletonBucket.grantDelete.parameter.identity"></a>

- *Type:* @aws-cdk/aws-iam.IGrantable

The principal.

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.SingletonBucket.grantDelete.parameter.objectsKeyPattern"></a>

- *Type:* any

Restrict the permission to a certain key pattern (default '*').

---

##### `grantPublicAccess` <a name="grantPublicAccess" id="aws-analytics-reference-architecture.SingletonBucket.grantPublicAccess"></a>

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

###### `allowedActions`<sup>Required</sup> <a name="allowedActions" id="aws-analytics-reference-architecture.SingletonBucket.grantPublicAccess.parameter.allowedActions"></a>

- *Type:* string

the set of S3 actions to allow.

Default is "s3:GetObject".

---

###### `keyPrefix`<sup>Optional</sup> <a name="keyPrefix" id="aws-analytics-reference-architecture.SingletonBucket.grantPublicAccess.parameter.keyPrefix"></a>

- *Type:* string

the prefix of S3 object keys (e.g. `home/*`). Default is "*".

---

##### `grantPut` <a name="grantPut" id="aws-analytics-reference-architecture.SingletonBucket.grantPut"></a>

```typescript
public grantPut(identity: IGrantable, objectsKeyPattern?: any): Grant
```

Grants s3:PutObject* and s3:Abort* permissions for this bucket to an IAM principal.

If encryption is used, permission to use the key to encrypt the contents
of written files will also be granted to the same principal.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.SingletonBucket.grantPut.parameter.identity"></a>

- *Type:* @aws-cdk/aws-iam.IGrantable

The principal.

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.SingletonBucket.grantPut.parameter.objectsKeyPattern"></a>

- *Type:* any

Restrict the permission to a certain key pattern (default '*').

---

##### `grantPutAcl` <a name="grantPutAcl" id="aws-analytics-reference-architecture.SingletonBucket.grantPutAcl"></a>

```typescript
public grantPutAcl(identity: IGrantable, objectsKeyPattern?: string): Grant
```

Grant the given IAM identity permissions to modify the ACLs of objects in the given Bucket.

If your application has the '@aws-cdk/aws-s3:grantWriteWithoutAcl' feature flag set,
calling {@link grantWrite} or {@link grantReadWrite} no longer grants permissions to modify the ACLs of the objects;
in this case, if you need to modify object ACLs, call this method explicitly.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.SingletonBucket.grantPutAcl.parameter.identity"></a>

- *Type:* @aws-cdk/aws-iam.IGrantable

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.SingletonBucket.grantPutAcl.parameter.objectsKeyPattern"></a>

- *Type:* string

---

##### `grantRead` <a name="grantRead" id="aws-analytics-reference-architecture.SingletonBucket.grantRead"></a>

```typescript
public grantRead(identity: IGrantable, objectsKeyPattern?: any): Grant
```

Grant read permissions for this bucket and it's contents to an IAM principal (Role/Group/User).

If encryption is used, permission to use the key to decrypt the contents
of the bucket will also be granted to the same principal.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.SingletonBucket.grantRead.parameter.identity"></a>

- *Type:* @aws-cdk/aws-iam.IGrantable

The principal.

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.SingletonBucket.grantRead.parameter.objectsKeyPattern"></a>

- *Type:* any

Restrict the permission to a certain key pattern (default '*').

---

##### `grantReadWrite` <a name="grantReadWrite" id="aws-analytics-reference-architecture.SingletonBucket.grantReadWrite"></a>

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
use the {@link grantPutAcl} method.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.SingletonBucket.grantReadWrite.parameter.identity"></a>

- *Type:* @aws-cdk/aws-iam.IGrantable

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.SingletonBucket.grantReadWrite.parameter.objectsKeyPattern"></a>

- *Type:* any

---

##### `grantWrite` <a name="grantWrite" id="aws-analytics-reference-architecture.SingletonBucket.grantWrite"></a>

```typescript
public grantWrite(identity: IGrantable, objectsKeyPattern?: any): Grant
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
use the {@link grantPutAcl} method.

###### `identity`<sup>Required</sup> <a name="identity" id="aws-analytics-reference-architecture.SingletonBucket.grantWrite.parameter.identity"></a>

- *Type:* @aws-cdk/aws-iam.IGrantable

---

###### `objectsKeyPattern`<sup>Optional</sup> <a name="objectsKeyPattern" id="aws-analytics-reference-architecture.SingletonBucket.grantWrite.parameter.objectsKeyPattern"></a>

- *Type:* any

---

##### `onCloudTrailEvent` <a name="onCloudTrailEvent" id="aws-analytics-reference-architecture.SingletonBucket.onCloudTrailEvent"></a>

```typescript
public onCloudTrailEvent(id: string, options?: OnCloudTrailBucketEventOptions): Rule
```

Define a CloudWatch event that triggers when something happens to this repository.

Requires that there exists at least one CloudTrail Trail in your account
that captures the event. This method will not create the Trail.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonBucket.onCloudTrailEvent.parameter.id"></a>

- *Type:* string

The id of the rule.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.SingletonBucket.onCloudTrailEvent.parameter.options"></a>

- *Type:* @aws-cdk/aws-s3.OnCloudTrailBucketEventOptions

Options for adding the rule.

---

##### `onCloudTrailPutObject` <a name="onCloudTrailPutObject" id="aws-analytics-reference-architecture.SingletonBucket.onCloudTrailPutObject"></a>

```typescript
public onCloudTrailPutObject(id: string, options?: OnCloudTrailBucketEventOptions): Rule
```

Defines an AWS CloudWatch event that triggers when an object is uploaded to the specified paths (keys) in this bucket using the PutObject API call.

Note that some tools like `aws s3 cp` will automatically use either
PutObject or the multipart upload API depending on the file size,
so using `onCloudTrailWriteObject` may be preferable.

Requires that there exists at least one CloudTrail Trail in your account
that captures the event. This method will not create the Trail.

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonBucket.onCloudTrailPutObject.parameter.id"></a>

- *Type:* string

The id of the rule.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.SingletonBucket.onCloudTrailPutObject.parameter.options"></a>

- *Type:* @aws-cdk/aws-s3.OnCloudTrailBucketEventOptions

Options for adding the rule.

---

##### `onCloudTrailWriteObject` <a name="onCloudTrailWriteObject" id="aws-analytics-reference-architecture.SingletonBucket.onCloudTrailWriteObject"></a>

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

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonBucket.onCloudTrailWriteObject.parameter.id"></a>

- *Type:* string

The id of the rule.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.SingletonBucket.onCloudTrailWriteObject.parameter.options"></a>

- *Type:* @aws-cdk/aws-s3.OnCloudTrailBucketEventOptions

Options for adding the rule.

---

##### `s3UrlForObject` <a name="s3UrlForObject" id="aws-analytics-reference-architecture.SingletonBucket.s3UrlForObject"></a>

```typescript
public s3UrlForObject(key?: string): string
```

The S3 URL of an S3 object. For example:.

`s3://onlybucket`
- `s3://bucket/key`

###### `key`<sup>Optional</sup> <a name="key" id="aws-analytics-reference-architecture.SingletonBucket.s3UrlForObject.parameter.key"></a>

- *Type:* string

The S3 key of the object.

If not specified, the S3 URL of the
bucket is returned.

---

##### `transferAccelerationUrlForObject` <a name="transferAccelerationUrlForObject" id="aws-analytics-reference-architecture.SingletonBucket.transferAccelerationUrlForObject"></a>

```typescript
public transferAccelerationUrlForObject(key?: string, options?: TransferAccelerationUrlOptions): string
```

The https Transfer Acceleration URL of an S3 object.

Specify `dualStack: true` at the options
for dual-stack endpoint (connect to the bucket over IPv6). For example:

- `https://bucket.s3-accelerate.amazonaws.com`
- `https://bucket.s3-accelerate.amazonaws.com/key`

###### `key`<sup>Optional</sup> <a name="key" id="aws-analytics-reference-architecture.SingletonBucket.transferAccelerationUrlForObject.parameter.key"></a>

- *Type:* string

The S3 key of the object.

If not specified, the URL of the
bucket is returned.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.SingletonBucket.transferAccelerationUrlForObject.parameter.options"></a>

- *Type:* @aws-cdk/aws-s3.TransferAccelerationUrlOptions

Options for generating URL.

---

##### `urlForObject` <a name="urlForObject" id="aws-analytics-reference-architecture.SingletonBucket.urlForObject"></a>

```typescript
public urlForObject(key?: string): string
```

The https URL of an S3 object. Specify `regional: false` at the options for non-regional URLs. For example:.

`https://s3.us-west-1.amazonaws.com/onlybucket`
- `https://s3.us-west-1.amazonaws.com/bucket/key`
- `https://s3.cn-north-1.amazonaws.com.cn/china-bucket/mykey`

###### `key`<sup>Optional</sup> <a name="key" id="aws-analytics-reference-architecture.SingletonBucket.urlForObject.parameter.key"></a>

- *Type:* string

The S3 key of the object.

If not specified, the URL of the
bucket is returned.

---

##### `virtualHostedUrlForObject` <a name="virtualHostedUrlForObject" id="aws-analytics-reference-architecture.SingletonBucket.virtualHostedUrlForObject"></a>

```typescript
public virtualHostedUrlForObject(key?: string, options?: VirtualHostedStyleUrlOptions): string
```

The virtual hosted-style URL of an S3 object. Specify `regional: false` at the options for non-regional URL. For example:.

`https://only-bucket.s3.us-west-1.amazonaws.com`
- `https://bucket.s3.us-west-1.amazonaws.com/key`
- `https://bucket.s3.amazonaws.com/key`
- `https://china-bucket.s3.cn-north-1.amazonaws.com.cn/mykey`

###### `key`<sup>Optional</sup> <a name="key" id="aws-analytics-reference-architecture.SingletonBucket.virtualHostedUrlForObject.parameter.key"></a>

- *Type:* string

The S3 key of the object.

If not specified, the URL of the
bucket is returned.

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-analytics-reference-architecture.SingletonBucket.virtualHostedUrlForObject.parameter.options"></a>

- *Type:* @aws-cdk/aws-s3.VirtualHostedStyleUrlOptions

Options for generating URL.

---

##### `addCorsRule` <a name="addCorsRule" id="aws-analytics-reference-architecture.SingletonBucket.addCorsRule"></a>

```typescript
public addCorsRule(rule: CorsRule): void
```

Adds a cross-origin access configuration for objects in an Amazon S3 bucket.

###### `rule`<sup>Required</sup> <a name="rule" id="aws-analytics-reference-architecture.SingletonBucket.addCorsRule.parameter.rule"></a>

- *Type:* @aws-cdk/aws-s3.CorsRule

The CORS configuration rule to add.

---

##### `addInventory` <a name="addInventory" id="aws-analytics-reference-architecture.SingletonBucket.addInventory"></a>

```typescript
public addInventory(inventory: Inventory): void
```

Add an inventory configuration.

###### `inventory`<sup>Required</sup> <a name="inventory" id="aws-analytics-reference-architecture.SingletonBucket.addInventory.parameter.inventory"></a>

- *Type:* @aws-cdk/aws-s3.Inventory

configuration to add.

---

##### `addLifecycleRule` <a name="addLifecycleRule" id="aws-analytics-reference-architecture.SingletonBucket.addLifecycleRule"></a>

```typescript
public addLifecycleRule(rule: LifecycleRule): void
```

Add a lifecycle rule to the bucket.

###### `rule`<sup>Required</sup> <a name="rule" id="aws-analytics-reference-architecture.SingletonBucket.addLifecycleRule.parameter.rule"></a>

- *Type:* @aws-cdk/aws-s3.LifecycleRule

The rule to add.

---

##### `addMetric` <a name="addMetric" id="aws-analytics-reference-architecture.SingletonBucket.addMetric"></a>

```typescript
public addMetric(metric: BucketMetrics): void
```

Adds a metrics configuration for the CloudWatch request metrics from the bucket.

###### `metric`<sup>Required</sup> <a name="metric" id="aws-analytics-reference-architecture.SingletonBucket.addMetric.parameter.metric"></a>

- *Type:* @aws-cdk/aws-s3.BucketMetrics

The metric configuration to add.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.fromBucketArn">fromBucketArn</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.fromBucketAttributes">fromBucketAttributes</a></code> | Creates a Bucket construct that represents an external bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.fromBucketName">fromBucketName</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.validateBucketName">validateBucketName</a></code> | Thrown an exception if the given bucket name is not valid. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.getOrCreate">getOrCreate</a></code> | Get the Amazon S3 Bucket from the AWS CDK Stack based on the provided name. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SingletonBucket.isConstruct"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SingletonBucket.isConstruct.parameter.x"></a>

- *Type:* any

---

##### `isResource` <a name="isResource" id="aws-analytics-reference-architecture.SingletonBucket.isResource"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-analytics-reference-architecture.SingletonBucket.isResource.parameter.construct"></a>

- *Type:* @aws-cdk/core.IConstruct

---

##### `fromBucketArn` <a name="fromBucketArn" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketArn"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.fromBucketArn(scope: Construct, id: string, bucketArn: string)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketArn.parameter.id"></a>

- *Type:* string

---

###### `bucketArn`<sup>Required</sup> <a name="bucketArn" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketArn.parameter.bucketArn"></a>

- *Type:* string

---

##### `fromBucketAttributes` <a name="fromBucketAttributes" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketAttributes"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.fromBucketAttributes(scope: Construct, id: string, attrs: BucketAttributes)
```

Creates a Bucket construct that represents an external bucket.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketAttributes.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketAttributes.parameter.attrs"></a>

- *Type:* @aws-cdk/aws-s3.BucketAttributes

A `BucketAttributes` object.

Can be obtained from a call to
`bucket.export()` or manually created.

---

##### `fromBucketName` <a name="fromBucketName" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketName"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.fromBucketName(scope: Construct, id: string, bucketName: string)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketName.parameter.id"></a>

- *Type:* string

---

###### `bucketName`<sup>Required</sup> <a name="bucketName" id="aws-analytics-reference-architecture.SingletonBucket.fromBucketName.parameter.bucketName"></a>

- *Type:* string

---

##### `validateBucketName` <a name="validateBucketName" id="aws-analytics-reference-architecture.SingletonBucket.validateBucketName"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.validateBucketName(physicalName: string)
```

Thrown an exception if the given bucket name is not valid.

###### `physicalName`<sup>Required</sup> <a name="physicalName" id="aws-analytics-reference-architecture.SingletonBucket.validateBucketName.parameter.physicalName"></a>

- *Type:* string

name of the bucket.

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.SingletonBucket.getOrCreate"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.getOrCreate(scope: Construct, bucketName: string)
```

Get the Amazon S3 Bucket from the AWS CDK Stack based on the provided name.

The method adds a prefix (ara-) and a suffix (-{ACCOUNT_ID}) to the provided name.
If no bucket exists, it creates a new one.

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonBucket.getOrCreate.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

###### `bucketName`<sup>Required</sup> <a name="bucketName" id="aws-analytics-reference-architecture.SingletonBucket.getOrCreate.parameter.bucketName"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.env">env</a></code> | <code>@aws-cdk/core.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.stack">stack</a></code> | <code>@aws-cdk/core.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.bucketArn">bucketArn</a></code> | <code>string</code> | The ARN of the bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.bucketDomainName">bucketDomainName</a></code> | <code>string</code> | The IPv4 DNS name of the specified bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.bucketDualStackDomainName">bucketDualStackDomainName</a></code> | <code>string</code> | The IPv6 DNS name of the specified bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.bucketName">bucketName</a></code> | <code>string</code> | The name of the bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.bucketRegionalDomainName">bucketRegionalDomainName</a></code> | <code>string</code> | The regional domain name of the specified bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.bucketWebsiteDomainName">bucketWebsiteDomainName</a></code> | <code>string</code> | The Domain name of the static website. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.bucketWebsiteUrl">bucketWebsiteUrl</a></code> | <code>string</code> | The URL of the static website. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.encryptionKey">encryptionKey</a></code> | <code>@aws-cdk/aws-kms.IKey</code> | Optional KMS encryption key associated with this bucket. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.isWebsite">isWebsite</a></code> | <code>boolean</code> | If this bucket has been configured for static website hosting. |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.property.policy">policy</a></code> | <code>@aws-cdk/aws-s3.BucketPolicy</code> | The resource policy associated with this bucket. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SingletonBucket.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-analytics-reference-architecture.SingletonBucket.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* @aws-cdk/core.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="aws-analytics-reference-architecture.SingletonBucket.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* @aws-cdk/core.Stack

The stack in which this resource is defined.

---

##### `bucketArn`<sup>Required</sup> <a name="bucketArn" id="aws-analytics-reference-architecture.SingletonBucket.property.bucketArn"></a>

```typescript
public readonly bucketArn: string;
```

- *Type:* string

The ARN of the bucket.

---

##### `bucketDomainName`<sup>Required</sup> <a name="bucketDomainName" id="aws-analytics-reference-architecture.SingletonBucket.property.bucketDomainName"></a>

```typescript
public readonly bucketDomainName: string;
```

- *Type:* string

The IPv4 DNS name of the specified bucket.

---

##### `bucketDualStackDomainName`<sup>Required</sup> <a name="bucketDualStackDomainName" id="aws-analytics-reference-architecture.SingletonBucket.property.bucketDualStackDomainName"></a>

```typescript
public readonly bucketDualStackDomainName: string;
```

- *Type:* string

The IPv6 DNS name of the specified bucket.

---

##### `bucketName`<sup>Required</sup> <a name="bucketName" id="aws-analytics-reference-architecture.SingletonBucket.property.bucketName"></a>

```typescript
public readonly bucketName: string;
```

- *Type:* string

The name of the bucket.

---

##### `bucketRegionalDomainName`<sup>Required</sup> <a name="bucketRegionalDomainName" id="aws-analytics-reference-architecture.SingletonBucket.property.bucketRegionalDomainName"></a>

```typescript
public readonly bucketRegionalDomainName: string;
```

- *Type:* string

The regional domain name of the specified bucket.

---

##### `bucketWebsiteDomainName`<sup>Required</sup> <a name="bucketWebsiteDomainName" id="aws-analytics-reference-architecture.SingletonBucket.property.bucketWebsiteDomainName"></a>

```typescript
public readonly bucketWebsiteDomainName: string;
```

- *Type:* string

The Domain name of the static website.

---

##### `bucketWebsiteUrl`<sup>Required</sup> <a name="bucketWebsiteUrl" id="aws-analytics-reference-architecture.SingletonBucket.property.bucketWebsiteUrl"></a>

```typescript
public readonly bucketWebsiteUrl: string;
```

- *Type:* string

The URL of the static website.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="aws-analytics-reference-architecture.SingletonBucket.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* @aws-cdk/aws-kms.IKey

Optional KMS encryption key associated with this bucket.

---

##### `isWebsite`<sup>Optional</sup> <a name="isWebsite" id="aws-analytics-reference-architecture.SingletonBucket.property.isWebsite"></a>

```typescript
public readonly isWebsite: boolean;
```

- *Type:* boolean

If this bucket has been configured for static website hosting.

---

##### `policy`<sup>Optional</sup> <a name="policy" id="aws-analytics-reference-architecture.SingletonBucket.property.policy"></a>

```typescript
public readonly policy: BucketPolicy;
```

- *Type:* @aws-cdk/aws-s3.BucketPolicy

The resource policy associated with this bucket.

If `autoCreatePolicy` is true, a `BucketPolicy` will be created upon the
first call to addToResourcePolicy(s).

---


### SingletonGlueDefaultRole <a name="SingletonGlueDefaultRole" id="aws-analytics-reference-architecture.SingletonGlueDefaultRole"></a>

SingletonGlueDefaultRole Construct to automatically setup a new Amazon IAM role to use with AWS Glue jobs.

The role is created with AWSGlueServiceRole policy and authorize all actions on S3.
The Construct provides a getOrCreate method for SingletonInstantiation

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDefaultRole.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-analytics-reference-architecture.SingletonGlueDefaultRole.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDefaultRole.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDefaultRole.getOrCreate">getOrCreate</a></code> | *No description.* |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SingletonGlueDefaultRole.isConstruct"></a>

```typescript
import { SingletonGlueDefaultRole } from 'aws-analytics-reference-architecture'

SingletonGlueDefaultRole.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SingletonGlueDefaultRole.isConstruct.parameter.x"></a>

- *Type:* any

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.SingletonGlueDefaultRole.getOrCreate"></a>

```typescript
import { SingletonGlueDefaultRole } from 'aws-analytics-reference-architecture'

SingletonGlueDefaultRole.getOrCreate(scope: Construct)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonGlueDefaultRole.getOrCreate.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDefaultRole.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDefaultRole.property.iamRole">iamRole</a></code> | <code>@aws-cdk/aws-iam.Role</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SingletonGlueDefaultRole.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `iamRole`<sup>Required</sup> <a name="iamRole" id="aws-analytics-reference-architecture.SingletonGlueDefaultRole.property.iamRole"></a>

```typescript
public readonly iamRole: Role;
```

- *Type:* @aws-cdk/aws-iam.Role

---


### SynchronousAthenaQuery <a name="SynchronousAthenaQuery" id="aws-analytics-reference-architecture.SynchronousAthenaQuery"></a>

SynchronousAthenaQuery Construct to execute an Amazon Athena query synchronously.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer"></a>

```typescript
import { SynchronousAthenaQuery } from 'aws-analytics-reference-architecture'

new SynchronousAthenaQuery(scope: Construct, id: string, props: SynchronousAthenaQueryProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps">SynchronousAthenaQueryProps</a></code> | the CrawlerStartWait [properties]{@link SynchronousAthenaQueryProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

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
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.isConstruct"></a>

```typescript
import { SynchronousAthenaQuery } from 'aws-analytics-reference-architecture'

SynchronousAthenaQuery.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQuery.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SynchronousAthenaQuery.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

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
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | the Scope of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.id">id</a></code> | <code>string</code> | the ID of the CDK Construct. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.SynchronousCrawlerProps">SynchronousCrawlerProps</a></code> | the CrawlerStartWait [properties]{@link SynchronousCrawlerProps}. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SynchronousCrawler.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

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
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="aws-analytics-reference-architecture.SynchronousCrawler.isConstruct"></a>

```typescript
import { SynchronousCrawler } from 'aws-analytics-reference-architecture'

SynchronousCrawler.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-analytics-reference-architecture.SynchronousCrawler.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousCrawler.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-analytics-reference-architecture.SynchronousCrawler.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---


## Structs <a name="Structs" id="Structs"></a>

### BatchReplayerProps <a name="BatchReplayerProps" id="aws-analytics-reference-architecture.BatchReplayerProps"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.BatchReplayerProps.Initializer"></a>

```typescript
import { BatchReplayerProps } from 'aws-analytics-reference-architecture'

const batchReplayerProps: BatchReplayerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.dataset">dataset</a></code> | <code><a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.sinkBucket">sinkBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.frequency">frequency</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.outputFileMaxSizeInBytes">outputFileMaxSizeInBytes</a></code> | <code>number</code> | *No description.* |

---

##### `dataset`<sup>Required</sup> <a name="dataset" id="aws-analytics-reference-architecture.BatchReplayerProps.property.dataset"></a>

```typescript
public readonly dataset: PreparedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PreparedDataset">PreparedDataset</a>

---

##### `sinkBucket`<sup>Required</sup> <a name="sinkBucket" id="aws-analytics-reference-architecture.BatchReplayerProps.property.sinkBucket"></a>

```typescript
public readonly sinkBucket: Bucket;
```

- *Type:* @aws-cdk/aws-s3.Bucket

---

##### `frequency`<sup>Optional</sup> <a name="frequency" id="aws-analytics-reference-architecture.BatchReplayerProps.property.frequency"></a>

```typescript
public readonly frequency: number;
```

- *Type:* number

---

##### `outputFileMaxSizeInBytes`<sup>Optional</sup> <a name="outputFileMaxSizeInBytes" id="aws-analytics-reference-architecture.BatchReplayerProps.property.outputFileMaxSizeInBytes"></a>

```typescript
public readonly outputFileMaxSizeInBytes: number;
```

- *Type:* number

---

### DataGeneratorProps <a name="DataGeneratorProps" id="aws-analytics-reference-architecture.DataGeneratorProps"></a>

The properties for DataGenerator Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.DataGeneratorProps.Initializer"></a>

```typescript
import { DataGeneratorProps } from 'aws-analytics-reference-architecture'

const dataGeneratorProps: DataGeneratorProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataGeneratorProps.property.dataset">dataset</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | Source dataset used to generate the data by replying it. |
| <code><a href="#aws-analytics-reference-architecture.DataGeneratorProps.property.sinkArn">sinkArn</a></code> | <code>string</code> | Sink Arn to receive the generated data. |
| <code><a href="#aws-analytics-reference-architecture.DataGeneratorProps.property.frequency">frequency</a></code> | <code>number</code> | Frequency (in Seconds) of the data generation. |

---

##### `dataset`<sup>Required</sup> <a name="dataset" id="aws-analytics-reference-architecture.DataGeneratorProps.property.dataset"></a>

```typescript
public readonly dataset: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

Source dataset used to generate the data by replying it.

Use a pre-defined [Dataset]{@link Dataset} or create a [custom one]{@link Dataset.constructor}.

---

##### `sinkArn`<sup>Required</sup> <a name="sinkArn" id="aws-analytics-reference-architecture.DataGeneratorProps.property.sinkArn"></a>

```typescript
public readonly sinkArn: string;
```

- *Type:* string

Sink Arn to receive the generated data.

Sink must be an Amazon S3 bucket.

---

##### `frequency`<sup>Optional</sup> <a name="frequency" id="aws-analytics-reference-architecture.DataGeneratorProps.property.frequency"></a>

```typescript
public readonly frequency: number;
```

- *Type:* number
- *Default:* 30 min (1800s)

Frequency (in Seconds) of the data generation.

Should be > 60s.

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
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.sinkLocation">sinkLocation</a></code> | <code>@aws-cdk/aws-s3.Location</code> | Sink must be an Amazon S3 Location composed of a bucket and a key. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueDatabase">sourceGlueDatabase</a></code> | <code>@aws-cdk/aws-glue.Database</code> | Source AWS Glue Database containing the schema of the stream. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueTable">sourceGlueTable</a></code> | <code>@aws-cdk/aws-glue.Table</code> | Source AWS Glue Table containing the schema of the stream. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceKinesisDataStream">sourceKinesisDataStream</a></code> | <code>@aws-cdk/aws-kinesis.Stream</code> | Source must be an Amazon Kinesis Data Stream. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.deliveryInterval">deliveryInterval</a></code> | <code>number</code> | Delivery interval in seconds. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporterProps.property.deliverySize">deliverySize</a></code> | <code>number</code> | Maximum delivery size in MB. |

---

##### `sinkLocation`<sup>Required</sup> <a name="sinkLocation" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.sinkLocation"></a>

```typescript
public readonly sinkLocation: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

Sink must be an Amazon S3 Location composed of a bucket and a key.

---

##### `sourceGlueDatabase`<sup>Required</sup> <a name="sourceGlueDatabase" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueDatabase"></a>

```typescript
public readonly sourceGlueDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue.Database

Source AWS Glue Database containing the schema of the stream.

---

##### `sourceGlueTable`<sup>Required</sup> <a name="sourceGlueTable" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueTable"></a>

```typescript
public readonly sourceGlueTable: Table;
```

- *Type:* @aws-cdk/aws-glue.Table

Source AWS Glue Table containing the schema of the stream.

---

##### `sourceKinesisDataStream`<sup>Required</sup> <a name="sourceKinesisDataStream" id="aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceKinesisDataStream"></a>

```typescript
public readonly sourceKinesisDataStream: Stream;
```

- *Type:* @aws-cdk/aws-kinesis.Stream

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

### DatasetProps <a name="DatasetProps" id="aws-analytics-reference-architecture.DatasetProps"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.DatasetProps.Initializer"></a>

```typescript
import { DatasetProps } from 'aws-analytics-reference-architecture'

const datasetProps: DatasetProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DatasetProps.property.createSourceTable">createSourceTable</a></code> | <code>string</code> | The CREATE TABLE DDL command to create the source AWS Glue Table. |
| <code><a href="#aws-analytics-reference-architecture.DatasetProps.property.generateData">generateData</a></code> | <code>string</code> | The SELECT query used to generate new data. |
| <code><a href="#aws-analytics-reference-architecture.DatasetProps.property.location">location</a></code> | <code>@aws-cdk/aws-s3.Location</code> | The Amazon S3 Location of the source dataset. |
| <code><a href="#aws-analytics-reference-architecture.DatasetProps.property.startDatetime">startDatetime</a></code> | <code>string</code> | The minimum datetime value in the dataset used to calculate time offset. |
| <code><a href="#aws-analytics-reference-architecture.DatasetProps.property.createTargetTable">createTargetTable</a></code> | <code>string</code> | The CREATE TABLE DDL command to create the target AWS Glue Table. |

---

##### `createSourceTable`<sup>Required</sup> <a name="createSourceTable" id="aws-analytics-reference-architecture.DatasetProps.property.createSourceTable"></a>

```typescript
public readonly createSourceTable: string;
```

- *Type:* string

The CREATE TABLE DDL command to create the source AWS Glue Table.

---

##### `generateData`<sup>Required</sup> <a name="generateData" id="aws-analytics-reference-architecture.DatasetProps.property.generateData"></a>

```typescript
public readonly generateData: string;
```

- *Type:* string

The SELECT query used to generate new data.

---

##### `location`<sup>Required</sup> <a name="location" id="aws-analytics-reference-architecture.DatasetProps.property.location"></a>

```typescript
public readonly location: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

The Amazon S3 Location of the source dataset.

It's composed of an Amazon S3 bucketName and an Amazon S3 objectKey

---

##### `startDatetime`<sup>Required</sup> <a name="startDatetime" id="aws-analytics-reference-architecture.DatasetProps.property.startDatetime"></a>

```typescript
public readonly startDatetime: string;
```

- *Type:* string

The minimum datetime value in the dataset used to calculate time offset.

---

##### `createTargetTable`<sup>Optional</sup> <a name="createTargetTable" id="aws-analytics-reference-architecture.DatasetProps.property.createTargetTable"></a>

```typescript
public readonly createTargetTable: string;
```

- *Type:* string
- *Default:* Use the same DDL as the source table

The CREATE TABLE DDL command to create the target AWS Glue Table.

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
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.eksAdminRoleArn">eksAdminRoleArn</a></code> | <code>string</code> | Amazon IAM Role to be added to Amazon EKS master roles that will give access to kubernetes cluster from AWS console UI. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.eksClusterName">eksClusterName</a></code> | <code>string</code> | Name of the Amazon EKS cluster to be created. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.eksVpcAttributes">eksVpcAttributes</a></code> | <code>@aws-cdk/aws-ec2.VpcAttributes</code> | Attributes of the VPC where to deploy the EKS cluster VPC should have at least two private and public subnets in different Availability Zones All private subnets should have the following tags: 'for-use-with-amazon-emr-managed-policies'='true' 'kubernetes.io/role/internal-elb'='1' All public subnets should have the following tag: 'kubernetes.io/role/elb'='1'. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.emrEksNodegroups">emrEksNodegroups</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup">EmrEksNodegroup</a>[]</code> | List of EmrEksNodegroup to create in the cluster in addition to the default [nodegroups]{@link EmrEksNodegroup}. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksClusterProps.property.kubernetesVersion">kubernetesVersion</a></code> | <code>@aws-cdk/aws-eks.KubernetesVersion</code> | Kubernetes version for Amazon EKS cluster that will be created. |

---

##### `eksAdminRoleArn`<sup>Required</sup> <a name="eksAdminRoleArn" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksAdminRoleArn"></a>

```typescript
public readonly eksAdminRoleArn: string;
```

- *Type:* string

Amazon IAM Role to be added to Amazon EKS master roles that will give access to kubernetes cluster from AWS console UI.

---

##### `eksClusterName`<sup>Optional</sup> <a name="eksClusterName" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksClusterName"></a>

```typescript
public readonly eksClusterName: string;
```

- *Type:* string
- *Default:* The [default cluster name]{@link EmrEksCluster.DEFAULT_CLUSTER_NAME}

Name of the Amazon EKS cluster to be created.

---

##### `eksVpcAttributes`<sup>Optional</sup> <a name="eksVpcAttributes" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksVpcAttributes"></a>

```typescript
public readonly eksVpcAttributes: VpcAttributes;
```

- *Type:* @aws-cdk/aws-ec2.VpcAttributes

Attributes of the VPC where to deploy the EKS cluster VPC should have at least two private and public subnets in different Availability Zones All private subnets should have the following tags: 'for-use-with-amazon-emr-managed-policies'='true' 'kubernetes.io/role/internal-elb'='1' All public subnets should have the following tag: 'kubernetes.io/role/elb'='1'.

---

##### `emrEksNodegroups`<sup>Optional</sup> <a name="emrEksNodegroups" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.emrEksNodegroups"></a>

```typescript
public readonly emrEksNodegroups: EmrEksNodegroup[];
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroup">EmrEksNodegroup</a>[]
- *Default:* Don't create additional nodegroups

List of EmrEksNodegroup to create in the cluster in addition to the default [nodegroups]{@link EmrEksNodegroup}.

---

##### `kubernetesVersion`<sup>Optional</sup> <a name="kubernetesVersion" id="aws-analytics-reference-architecture.EmrEksClusterProps.property.kubernetesVersion"></a>

```typescript
public readonly kubernetesVersion: KubernetesVersion;
```

- *Type:* @aws-cdk/aws-eks.KubernetesVersion
- *Default:* v1.20 version is used

Kubernetes version for Amazon EKS cluster that will be created.

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
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.amiType">amiType</a></code> | <code>@aws-cdk/aws-eks.NodegroupAmiType</code> | The AMI type for your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.capacityType">capacityType</a></code> | <code>@aws-cdk/aws-eks.CapacityType</code> | The capacity type of the nodegroup. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.desiredSize">desiredSize</a></code> | <code>number</code> | The current number of worker nodes that the managed node group should maintain. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.diskSize">diskSize</a></code> | <code>number</code> | The root device disk size (in GiB) for your node group instances. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.forceUpdate">forceUpdate</a></code> | <code>boolean</code> | Force the update if the existing node group's pods are unable to be drained due to a pod disruption budget issue. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceType">instanceType</a></code> | <code>@aws-cdk/aws-ec2.InstanceType</code> | The instance type to use for your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceTypes">instanceTypes</a></code> | <code>@aws-cdk/aws-ec2.InstanceType[]</code> | The instance types to use for your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.labels">labels</a></code> | <code>{[ key: string ]: string}</code> | The Kubernetes labels to be applied to the nodes in the node group when they are created. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.launchTemplateSpec">launchTemplateSpec</a></code> | <code>@aws-cdk/aws-eks.LaunchTemplateSpec</code> | Launch template specification used for the nodegroup. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.maxSize">maxSize</a></code> | <code>number</code> | The maximum number of worker nodes that the managed node group can scale out to. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.minSize">minSize</a></code> | <code>number</code> | The minimum number of worker nodes that the managed node group can scale in to. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodegroupName">nodegroupName</a></code> | <code>string</code> | Name of the Nodegroup. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodeRole">nodeRole</a></code> | <code>@aws-cdk/aws-iam.IRole</code> | The IAM role to associate with your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.releaseVersion">releaseVersion</a></code> | <code>string</code> | The AMI version of the Amazon EKS-optimized AMI to use with your node group (for example, `1.14.7-YYYYMMDD`). |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.remoteAccess">remoteAccess</a></code> | <code>@aws-cdk/aws-eks.NodegroupRemoteAccess</code> | The remote access (SSH) configuration to use with your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnets">subnets</a></code> | <code>@aws-cdk/aws-ec2.SubnetSelection</code> | The subnets to use for the Auto Scaling group that is created for your node group. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | The metadata to apply to the node group to assist with categorization and organization. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.taints">taints</a></code> | <code>@aws-cdk/aws-eks.TaintSpec[]</code> | The Kubernetes taints to be applied to the nodes in the node group when they are created. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.mountNvme">mountNvme</a></code> | <code>boolean</code> | Set to true if using instance types with local NVMe drives to mount them automatically at boot time. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnet">subnet</a></code> | <code>@aws-cdk/aws-ec2.ISubnet</code> | Configure the Amazon EKS NodeGroup in this subnet. |

---

##### `amiType`<sup>Optional</sup> <a name="amiType" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.amiType"></a>

```typescript
public readonly amiType: NodegroupAmiType;
```

- *Type:* @aws-cdk/aws-eks.NodegroupAmiType
- *Default:* auto-determined from the instanceTypes property when launchTemplateSpec property is not specified

The AMI type for your node group.

If you explicitly specify the launchTemplate with custom AMI, do not specify this property, or
the node group deployment will fail. In other cases, you will need to specify correct amiType for the nodegroup.

---

##### `capacityType`<sup>Optional</sup> <a name="capacityType" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.capacityType"></a>

```typescript
public readonly capacityType: CapacityType;
```

- *Type:* @aws-cdk/aws-eks.CapacityType
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

##### ~~`instanceType`~~<sup>Optional</sup> <a name="instanceType" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceType"></a>

- *Deprecated:* Use `instanceTypes` instead.

```typescript
public readonly instanceType: InstanceType;
```

- *Type:* @aws-cdk/aws-ec2.InstanceType
- *Default:* t3.medium

The instance type to use for your node group.

Currently, you can specify a single instance type for a node group.
The default value for this parameter is `t3.medium`. If you choose a GPU instance type, be sure to specify the
`AL2_x86_64_GPU` with the amiType parameter.

---

##### `instanceTypes`<sup>Optional</sup> <a name="instanceTypes" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceTypes"></a>

```typescript
public readonly instanceTypes: InstanceType[];
```

- *Type:* @aws-cdk/aws-ec2.InstanceType[]
- *Default:* t3.medium will be used according to the cloudformation document.

The instance types to use for your node group.

> [- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-eks-nodegroup.html#cfn-eks-nodegroup-instancetypes](- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-eks-nodegroup.html#cfn-eks-nodegroup-instancetypes)

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

- *Type:* @aws-cdk/aws-eks.LaunchTemplateSpec
- *Default:* no launch template

Launch template specification used for the nodegroup.

> [- https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html](- https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html)

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

- *Type:* @aws-cdk/aws-iam.IRole
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

- *Type:* @aws-cdk/aws-eks.NodegroupRemoteAccess
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

- *Type:* @aws-cdk/aws-ec2.SubnetSelection
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

- *Type:* @aws-cdk/aws-eks.TaintSpec[]
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

- *Type:* @aws-cdk/aws-ec2.ISubnet
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
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.executionRole">executionRole</a></code> | <code>@aws-cdk/aws-iam.IRole</code> | The Amazon IAM role used as the execution role. |
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.managedEndpointName">managedEndpointName</a></code> | <code>string</code> | The name of the EMR managed endpoint. |
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.virtualClusterId">virtualClusterId</a></code> | <code>string</code> | The Id of the Amazon EMR virtual cluster containing the managed endpoint. |
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.configurationOverrides">configurationOverrides</a></code> | <code>string</code> | The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint. |
| <code><a href="#aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.emrOnEksVersion">emrOnEksVersion</a></code> | <code>string</code> | The Amazon EMR version to use. |

---

##### `executionRole`<sup>Required</sup> <a name="executionRole" id="aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.executionRole"></a>

```typescript
public readonly executionRole: IRole;
```

- *Type:* @aws-cdk/aws-iam.IRole

The Amazon IAM role used as the execution role.

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
- *Default:* Configuration related to the [default nodegroup for notebook]{@link EmrEksNodegroup.NOTEBOOK_EXECUTOR}

The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint.

---

##### `emrOnEksVersion`<sup>Optional</sup> <a name="emrOnEksVersion" id="aws-analytics-reference-architecture.EmrManagedEndpointOptions.property.emrOnEksVersion"></a>

```typescript
public readonly emrOnEksVersion: string;
```

- *Type:* string
- *Default:* The [default Amazon EMR version]{@link EmrEksCluster.DEFAULT_EMR_VERSION}

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

### ExampleProps <a name="ExampleProps" id="aws-analytics-reference-architecture.ExampleProps"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.ExampleProps.Initializer"></a>

```typescript
import { ExampleProps } from 'aws-analytics-reference-architecture'

const exampleProps: ExampleProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.ExampleProps.property.name">name</a></code> | <code>string</code> | Name used to qualify the CfnOutput in the Stack. |
| <code><a href="#aws-analytics-reference-architecture.ExampleProps.property.value">value</a></code> | <code>string</code> | Value used in the CfnOutput in the Stack. |

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-analytics-reference-architecture.ExampleProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string
- *Default:* Set to 'defaultMessage' if not provided

Name used to qualify the CfnOutput in the Stack.

---

##### `value`<sup>Optional</sup> <a name="value" id="aws-analytics-reference-architecture.ExampleProps.property.value"></a>

```typescript
public readonly value: string;
```

- *Type:* string
- *Default:* Set to 'defaultValue!' if not provided

Value used in the CfnOutput in the Stack.

---

### FlywayRunnerProps <a name="FlywayRunnerProps" id="aws-analytics-reference-architecture.FlywayRunnerProps"></a>

Properties needed to run flyway migration scripts.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.FlywayRunnerProps.Initializer"></a>

```typescript
import { FlywayRunnerProps } from 'aws-analytics-reference-architecture'

const flywayRunnerProps: FlywayRunnerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.cluster">cluster</a></code> | <code>@aws-cdk/aws-redshift.Cluster</code> | The cluster to run migration scripts against. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.databaseName">databaseName</a></code> | <code>string</code> | The database name to run migration scripts against. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.migrationScriptsFolderAbsolutePath">migrationScriptsFolderAbsolutePath</a></code> | <code>string</code> | The absolute path to the flyway migration scripts. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.vpc">vpc</a></code> | <code>@aws-cdk/aws-ec2.Vpc</code> | The vpc hosting the cluster. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.logRetention">logRetention</a></code> | <code>@aws-cdk/aws-logs.RetentionDays</code> | Period to keep the logs around. |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunnerProps.property.replaceDictionary">replaceDictionary</a></code> | <code>{[ key: string ]: string}</code> | A key-value map of string (encapsulated between `${` and `}`) to replace in the SQL files given. |

---

##### `cluster`<sup>Required</sup> <a name="cluster" id="aws-analytics-reference-architecture.FlywayRunnerProps.property.cluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* @aws-cdk/aws-redshift.Cluster

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

- *Type:* @aws-cdk/aws-ec2.Vpc

The vpc hosting the cluster.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="aws-analytics-reference-architecture.FlywayRunnerProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* @aws-cdk/aws-logs.RetentionDays
- *Default:* logs.RetentionDays.ONE_DAY (1 day)

Period to keep the logs around.

---

##### `replaceDictionary`<sup>Optional</sup> <a name="replaceDictionary" id="aws-analytics-reference-architecture.FlywayRunnerProps.property.replaceDictionary"></a>

```typescript
public readonly replaceDictionary: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

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
| <code><a href="#aws-analytics-reference-architecture.LakeFormationS3LocationProps.property.s3Location">s3Location</a></code> | <code>@aws-cdk/aws-s3.Location</code> | S3 location to be registered with Lakeformation. |

---

##### `s3Location`<sup>Required</sup> <a name="s3Location" id="aws-analytics-reference-architecture.LakeFormationS3LocationProps.property.s3Location"></a>

```typescript
public readonly s3Location: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

S3 location to be registered with Lakeformation.

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
| <code><a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.executionPolicy">executionPolicy</a></code> | <code>@aws-cdk/aws-iam.ManagedPolicy</code> | The name of the policy to be used for the execution Role to pass to ManagedEndpoint, this role should allow access to any resource needed for the job including: Amazon S3 buckets, Amazon DynamoDB, AWS Glue Data Catalog. |
| <code><a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.configurationOverrides">configurationOverrides</a></code> | <code>string</code> | The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint an example can be found [here] (https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/core/src/emr-eks-data-platform/resources/k8s/emr-eks-config/critical.json). |
| <code><a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.emrOnEksVersion">emrOnEksVersion</a></code> | <code>string</code> | The version of Amazon EMR to deploy. |

---

##### `executionPolicy`<sup>Required</sup> <a name="executionPolicy" id="aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.executionPolicy"></a>

```typescript
public readonly executionPolicy: ManagedPolicy;
```

- *Type:* @aws-cdk/aws-iam.ManagedPolicy

The name of the policy to be used for the execution Role to pass to ManagedEndpoint, this role should allow access to any resource needed for the job including: Amazon S3 buckets, Amazon DynamoDB, AWS Glue Data Catalog.

---

##### `configurationOverrides`<sup>Optional</sup> <a name="configurationOverrides" id="aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.configurationOverrides"></a>

```typescript
public readonly configurationOverrides: string;
```

- *Type:* string

The JSON configuration overrides for Amazon EMR on EKS configuration attached to the managed endpoint an example can be found [here] (https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/core/src/emr-eks-data-platform/resources/k8s/emr-eks-config/critical.json).

---

##### `emrOnEksVersion`<sup>Optional</sup> <a name="emrOnEksVersion" id="aws-analytics-reference-architecture.NotebookManagedEndpointOptions.property.emrOnEksVersion"></a>

```typescript
public readonly emrOnEksVersion: string;
```

- *Type:* string

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
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatformProps.property.idpRelayStateParameterName">idpRelayStateParameterName</a></code> | <code>string</code> | Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio Value can be set with {@link IdpRelayState} Enum or through a value provided by the user. |

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
- *Default:* Use the {@link EmrVirtualClusterOptions} default namespace

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

Used when IAM Authentication is selected with IAM federation with an external identity provider (IdP) for Amazon EMR Studio Value can be set with {@link IdpRelayState} Enum or through a value provided by the user.

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
| <code><a href="#aws-analytics-reference-architecture.NotebookUserOptions.property.identityName">identityName</a></code> | <code>string</code> | Required Name of the identity as it appears in AWS SSO console, or the name to be given to a user in IAM_AUTHENTICATED. |
| <code><a href="#aws-analytics-reference-architecture.NotebookUserOptions.property.notebookManagedEndpoints">notebookManagedEndpoints</a></code> | <code><a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions">NotebookManagedEndpointOptions</a>[]</code> | Required Array of {@link NotebookManagedEndpointOptions} this defines the managed endpoint the notebook/workspace user will have access to. |
| <code><a href="#aws-analytics-reference-architecture.NotebookUserOptions.property.identityType">identityType</a></code> | <code>string</code> | Required Type of the identity either GROUP or USER, to be used when SSO is used as an authentication mode {@see SSOIdentityType}. |

---

##### `identityName`<sup>Required</sup> <a name="identityName" id="aws-analytics-reference-architecture.NotebookUserOptions.property.identityName"></a>

```typescript
public readonly identityName: string;
```

- *Type:* string

Required Name of the identity as it appears in AWS SSO console, or the name to be given to a user in IAM_AUTHENTICATED.

---

##### `notebookManagedEndpoints`<sup>Required</sup> <a name="notebookManagedEndpoints" id="aws-analytics-reference-architecture.NotebookUserOptions.property.notebookManagedEndpoints"></a>

```typescript
public readonly notebookManagedEndpoints: NotebookManagedEndpointOptions[];
```

- *Type:* <a href="#aws-analytics-reference-architecture.NotebookManagedEndpointOptions">NotebookManagedEndpointOptions</a>[]

Required Array of {@link NotebookManagedEndpointOptions} this defines the managed endpoint the notebook/workspace user will have access to.

---

##### `identityType`<sup>Optional</sup> <a name="identityType" id="aws-analytics-reference-architecture.NotebookUserOptions.property.identityType"></a>

```typescript
public readonly identityType: string;
```

- *Type:* string

Required Type of the identity either GROUP or USER, to be used when SSO is used as an authentication mode {@see SSOIdentityType}.

---

### PreparedDatasetProps <a name="PreparedDatasetProps" id="aws-analytics-reference-architecture.PreparedDatasetProps"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.PreparedDatasetProps.Initializer"></a>

```typescript
import { PreparedDatasetProps } from 'aws-analytics-reference-architecture'

const preparedDatasetProps: PreparedDatasetProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.dateTimeColumnToFilter">dateTimeColumnToFilter</a></code> | <code>string</code> | Datetime column for filtering data. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.location">location</a></code> | <code>@aws-cdk/aws-s3.Location</code> | The Amazon S3 Location of the source dataset. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.manifestLocation">manifestLocation</a></code> | <code>@aws-cdk/aws-s3.Location</code> | Manifest file in csv format with two columns: start, path. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.startDatetime">startDatetime</a></code> | <code>string</code> | The minimum datetime value in the dataset used to calculate time offset. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDatasetProps.property.dateTimeColumnsToAdjust">dateTimeColumnsToAdjust</a></code> | <code>string[]</code> | Array of column names with datetime to adjust. |

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

- *Type:* @aws-cdk/aws-s3.Location

The Amazon S3 Location of the source dataset.

It's composed of an Amazon S3 bucketName and an Amazon S3 objectKey

---

##### `manifestLocation`<sup>Required</sup> <a name="manifestLocation" id="aws-analytics-reference-architecture.PreparedDatasetProps.property.manifestLocation"></a>

```typescript
public readonly manifestLocation: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

Manifest file in csv format with two columns: start, path.

---

##### `startDatetime`<sup>Required</sup> <a name="startDatetime" id="aws-analytics-reference-architecture.PreparedDatasetProps.property.startDatetime"></a>

```typescript
public readonly startDatetime: string;
```

- *Type:* string

The minimum datetime value in the dataset used to calculate time offset.

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
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccountProps.property.accountID">accountID</a></code> | <code>string</code> | The account ID to grant on the S3 location. |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccountProps.property.bucket">bucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | The S3 Bucket object to grant cross account access. |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccountProps.property.key">key</a></code> | <code>@aws-cdk/aws-kms.Key</code> | The KMS Key used to encrypt the bucket. |
| <code><a href="#aws-analytics-reference-architecture.S3CrossAccountProps.property.objectKey">objectKey</a></code> | <code>string</code> | The S3 object key to grant cross account access (S3 prefix without the bucket name). |

---

##### `accountID`<sup>Required</sup> <a name="accountID" id="aws-analytics-reference-architecture.S3CrossAccountProps.property.accountID"></a>

```typescript
public readonly accountID: string;
```

- *Type:* string

The account ID to grant on the S3 location.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="aws-analytics-reference-architecture.S3CrossAccountProps.property.bucket"></a>

```typescript
public readonly bucket: Bucket;
```

- *Type:* @aws-cdk/aws-s3.Bucket

The S3 Bucket object to grant cross account access.

---

##### `key`<sup>Optional</sup> <a name="key" id="aws-analytics-reference-architecture.S3CrossAccountProps.property.key"></a>

```typescript
public readonly key: Key;
```

- *Type:* @aws-cdk/aws-kms.Key
- *Default:* No resource based policy is created on any KMS key

The KMS Key used to encrypt the bucket.

---

##### `objectKey`<sup>Optional</sup> <a name="objectKey" id="aws-analytics-reference-architecture.S3CrossAccountProps.property.objectKey"></a>

```typescript
public readonly objectKey: string;
```

- *Type:* string
- *Default:* Grant cross account for the entire bucket

The S3 object key to grant cross account access (S3 prefix without the bucket name).

---

### SynchronousAthenaQueryProps <a name="SynchronousAthenaQueryProps" id="aws-analytics-reference-architecture.SynchronousAthenaQueryProps"></a>

The properties for SynchronousAthenaQuery Construct.

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.Initializer"></a>

```typescript
import { SynchronousAthenaQueryProps } from 'aws-analytics-reference-architecture'

const synchronousAthenaQueryProps: SynchronousAthenaQueryProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.resultPath">resultPath</a></code> | <code>@aws-cdk/aws-s3.Location</code> | The Amazon S3 Location for the query results (without trailing slash). |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.statement">statement</a></code> | <code>string</code> | The name of the Athena query to execute. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.executionRoleStatements">executionRoleStatements</a></code> | <code>@aws-cdk/aws-iam.PolicyStatement[]</code> | The Amazon IAM Policy Statements used to run the query. |
| <code><a href="#aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.timeout">timeout</a></code> | <code>number</code> | The timeout in seconds to wait for query success. |

---

##### `resultPath`<sup>Required</sup> <a name="resultPath" id="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.resultPath"></a>

```typescript
public readonly resultPath: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

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

- *Type:* @aws-cdk/aws-iam.PolicyStatement[]
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

## Classes <a name="Classes" id="Classes"></a>

### Dataset <a name="Dataset" id="aws-analytics-reference-architecture.Dataset"></a>

Dataset enum-like class providing pre-defined datasets metadata and custom dataset creation.

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.Dataset.Initializer"></a>

```typescript
import { Dataset } from 'aws-analytics-reference-architecture'

new Dataset(props: DatasetProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Dataset.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.DatasetProps">DatasetProps</a></code> | the DatasetProps. |

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.Dataset.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.DatasetProps">DatasetProps</a>

the DatasetProps.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Dataset.parseCreateSourceQuery">parseCreateSourceQuery</a></code> | Parse the CREATE TABLE statement template for the source. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.parseCreateTargetQuery">parseCreateTargetQuery</a></code> | Parse the CREATE TABLE statement template for the source. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.parseGenerateQuery">parseGenerateQuery</a></code> | Parse the CREATE TABLE statement template for the target. |

---

##### `parseCreateSourceQuery` <a name="parseCreateSourceQuery" id="aws-analytics-reference-architecture.Dataset.parseCreateSourceQuery"></a>

```typescript
public parseCreateSourceQuery(database: string, table: string, bucket: string, key: string): string
```

Parse the CREATE TABLE statement template for the source.

###### `database`<sup>Required</sup> <a name="database" id="aws-analytics-reference-architecture.Dataset.parseCreateSourceQuery.parameter.database"></a>

- *Type:* string

the database name to parse.

---

###### `table`<sup>Required</sup> <a name="table" id="aws-analytics-reference-architecture.Dataset.parseCreateSourceQuery.parameter.table"></a>

- *Type:* string

the table name to parse.

---

###### `bucket`<sup>Required</sup> <a name="bucket" id="aws-analytics-reference-architecture.Dataset.parseCreateSourceQuery.parameter.bucket"></a>

- *Type:* string

the bucket name to parse.

---

###### `key`<sup>Required</sup> <a name="key" id="aws-analytics-reference-architecture.Dataset.parseCreateSourceQuery.parameter.key"></a>

- *Type:* string

the key to parse.

---

##### `parseCreateTargetQuery` <a name="parseCreateTargetQuery" id="aws-analytics-reference-architecture.Dataset.parseCreateTargetQuery"></a>

```typescript
public parseCreateTargetQuery(database: string, table: string, bucket: string, key: string): string
```

Parse the CREATE TABLE statement template for the source.

###### `database`<sup>Required</sup> <a name="database" id="aws-analytics-reference-architecture.Dataset.parseCreateTargetQuery.parameter.database"></a>

- *Type:* string

the database name to parse.

---

###### `table`<sup>Required</sup> <a name="table" id="aws-analytics-reference-architecture.Dataset.parseCreateTargetQuery.parameter.table"></a>

- *Type:* string

the table name to parse.

---

###### `bucket`<sup>Required</sup> <a name="bucket" id="aws-analytics-reference-architecture.Dataset.parseCreateTargetQuery.parameter.bucket"></a>

- *Type:* string

the bucket name to parse.

---

###### `key`<sup>Required</sup> <a name="key" id="aws-analytics-reference-architecture.Dataset.parseCreateTargetQuery.parameter.key"></a>

- *Type:* string

the key to parse.

---

##### `parseGenerateQuery` <a name="parseGenerateQuery" id="aws-analytics-reference-architecture.Dataset.parseGenerateQuery"></a>

```typescript
public parseGenerateQuery(database: string, sourceTable: string, targetTable: string): string
```

Parse the CREATE TABLE statement template for the target.

###### `database`<sup>Required</sup> <a name="database" id="aws-analytics-reference-architecture.Dataset.parseGenerateQuery.parameter.database"></a>

- *Type:* string

the database name to parse.

---

###### `sourceTable`<sup>Required</sup> <a name="sourceTable" id="aws-analytics-reference-architecture.Dataset.parseGenerateQuery.parameter.sourceTable"></a>

- *Type:* string

the source table name to parse.

---

###### `targetTable`<sup>Required</sup> <a name="targetTable" id="aws-analytics-reference-architecture.Dataset.parseGenerateQuery.parameter.targetTable"></a>

- *Type:* string

the target table name to parse.

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.createSourceTable">createSourceTable</a></code> | <code>string</code> | The CREATE TABLE DDL command to create the source AWS Glue Table. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.createTargetTable">createTargetTable</a></code> | <code>string</code> | The CREATE TABLE DDL command to create the target AWS Glue Table. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.generateData">generateData</a></code> | <code>string</code> | The SELECT query used to generate new data. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.location">location</a></code> | <code>@aws-cdk/aws-s3.Location</code> | The Amazon S3 Location of the source dataset. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.offset">offset</a></code> | <code>number</code> | The offset of the Dataset (difference between min datetime and now) in Seconds. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.tableName">tableName</a></code> | <code>string</code> | The name of the SQL table extracted from path. |

---

##### `createSourceTable`<sup>Required</sup> <a name="createSourceTable" id="aws-analytics-reference-architecture.Dataset.property.createSourceTable"></a>

```typescript
public readonly createSourceTable: string;
```

- *Type:* string

The CREATE TABLE DDL command to create the source AWS Glue Table.

---

##### `createTargetTable`<sup>Required</sup> <a name="createTargetTable" id="aws-analytics-reference-architecture.Dataset.property.createTargetTable"></a>

```typescript
public readonly createTargetTable: string;
```

- *Type:* string

The CREATE TABLE DDL command to create the target AWS Glue Table.

---

##### `generateData`<sup>Required</sup> <a name="generateData" id="aws-analytics-reference-architecture.Dataset.property.generateData"></a>

```typescript
public readonly generateData: string;
```

- *Type:* string

The SELECT query used to generate new data.

---

##### `location`<sup>Required</sup> <a name="location" id="aws-analytics-reference-architecture.Dataset.property.location"></a>

```typescript
public readonly location: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

The Amazon S3 Location of the source dataset.

---

##### `offset`<sup>Required</sup> <a name="offset" id="aws-analytics-reference-architecture.Dataset.property.offset"></a>

```typescript
public readonly offset: number;
```

- *Type:* number

The offset of the Dataset (difference between min datetime and now) in Seconds.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="aws-analytics-reference-architecture.Dataset.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

The name of the SQL table extracted from path.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.DATASETS_BUCKET">DATASETS_BUCKET</a></code> | <code>string</code> | The bucket name of the AWS Analytics Reference Architecture datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_CUSTOMER">RETAIL_100GB_CUSTOMER</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The customer dataset part of 100GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_CUSTOMER_ADDRESS">RETAIL_100GB_CUSTOMER_ADDRESS</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The customer address dataset part of 100GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_ITEM">RETAIL_100GB_ITEM</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The item dataset part of 100GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_PROMO">RETAIL_100GB_PROMO</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The promotion dataset part of 100GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_STORE">RETAIL_100GB_STORE</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The store dataset part of 100GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_STORE_SALE">RETAIL_100GB_STORE_SALE</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The store sale dataset part of 100GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_WAREHOUSE">RETAIL_100GB_WAREHOUSE</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The warehouse dataset part 100GB of retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_WEB_SALE">RETAIL_100GB_WEB_SALE</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The web sale dataset part of 100GB retail datasets. |

---

##### `DATASETS_BUCKET`<sup>Required</sup> <a name="DATASETS_BUCKET" id="aws-analytics-reference-architecture.Dataset.property.DATASETS_BUCKET"></a>

```typescript
public readonly DATASETS_BUCKET: string;
```

- *Type:* string

The bucket name of the AWS Analytics Reference Architecture datasets.

---

##### `RETAIL_100GB_CUSTOMER`<sup>Required</sup> <a name="RETAIL_100GB_CUSTOMER" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_CUSTOMER"></a>

```typescript
public readonly RETAIL_100GB_CUSTOMER: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The customer dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_CUSTOMER_ADDRESS`<sup>Required</sup> <a name="RETAIL_100GB_CUSTOMER_ADDRESS" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_CUSTOMER_ADDRESS"></a>

```typescript
public readonly RETAIL_100GB_CUSTOMER_ADDRESS: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The customer address dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_ITEM`<sup>Required</sup> <a name="RETAIL_100GB_ITEM" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_ITEM"></a>

```typescript
public readonly RETAIL_100GB_ITEM: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The item dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_PROMO`<sup>Required</sup> <a name="RETAIL_100GB_PROMO" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_PROMO"></a>

```typescript
public readonly RETAIL_100GB_PROMO: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The promotion dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_STORE`<sup>Required</sup> <a name="RETAIL_100GB_STORE" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_STORE"></a>

```typescript
public readonly RETAIL_100GB_STORE: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The store dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_STORE_SALE`<sup>Required</sup> <a name="RETAIL_100GB_STORE_SALE" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_STORE_SALE"></a>

```typescript
public readonly RETAIL_100GB_STORE_SALE: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The store sale dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_WAREHOUSE`<sup>Required</sup> <a name="RETAIL_100GB_WAREHOUSE" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_WAREHOUSE"></a>

```typescript
public readonly RETAIL_100GB_WAREHOUSE: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The warehouse dataset part 100GB of retail datasets.

---

##### `RETAIL_100GB_WEB_SALE`<sup>Required</sup> <a name="RETAIL_100GB_WEB_SALE" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_WEB_SALE"></a>

```typescript
public readonly RETAIL_100GB_WEB_SALE: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The web sale dataset part of 100GB retail datasets.

---

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
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.CRITICAL_ALL">CRITICAL_ALL</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_DRIVER">NOTEBOOK_DRIVER</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_EXECUTOR">NOTEBOOK_EXECUTOR</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_WITHOUT_PODTEMPLATE">NOTEBOOK_WITHOUT_PODTEMPLATE</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_DRIVER">SHARED_DRIVER</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_EXECUTOR">SHARED_EXECUTOR</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroup.property.TOOLING_ALL">TOOLING_ALL</a></code> | <code><a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a></code> | *No description.* |

---

##### `CRITICAL_ALL`<sup>Required</sup> <a name="CRITICAL_ALL" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.CRITICAL_ALL"></a>

```typescript
public readonly CRITICAL_ALL: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

---

##### `NOTEBOOK_DRIVER`<sup>Required</sup> <a name="NOTEBOOK_DRIVER" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_DRIVER"></a>

```typescript
public readonly NOTEBOOK_DRIVER: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

---

##### `NOTEBOOK_EXECUTOR`<sup>Required</sup> <a name="NOTEBOOK_EXECUTOR" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_EXECUTOR"></a>

```typescript
public readonly NOTEBOOK_EXECUTOR: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS.

---

##### `NOTEBOOK_WITHOUT_PODTEMPLATE`<sup>Required</sup> <a name="NOTEBOOK_WITHOUT_PODTEMPLATE" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_WITHOUT_PODTEMPLATE"></a>

```typescript
public readonly NOTEBOOK_WITHOUT_PODTEMPLATE: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

---

##### `SHARED_DRIVER`<sup>Required</sup> <a name="SHARED_DRIVER" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_DRIVER"></a>

```typescript
public readonly SHARED_DRIVER: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

---

##### `SHARED_EXECUTOR`<sup>Required</sup> <a name="SHARED_EXECUTOR" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_EXECUTOR"></a>

```typescript
public readonly SHARED_EXECUTOR: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

---

##### `TOOLING_ALL`<sup>Required</sup> <a name="TOOLING_ALL" id="aws-analytics-reference-architecture.EmrEksNodegroup.property.TOOLING_ALL"></a>

```typescript
public readonly TOOLING_ALL: EmrEksNodegroupOptions;
```

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

---

### PreparedDataset <a name="PreparedDataset" id="aws-analytics-reference-architecture.PreparedDataset"></a>

PreparedDataset enum-like class providing pre-defined datasets metadata and custom dataset creation.

PreparedDataset has following properties:

1. Data is partitioned by timestamp (a range in seconds). Each folder stores data within a given range. 
There is no constraint on how long the timestamp range can be. But each file must not be larger than 100MB.
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
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.location">location</a></code> | <code>@aws-cdk/aws-s3.Location</code> | The Amazon S3 Location of the source dataset. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.manifestLocation">manifestLocation</a></code> | <code>@aws-cdk/aws-s3.Location</code> | Manifest file in csv format with two columns: start, path. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.offset">offset</a></code> | <code>number</code> | The offset of the Dataset (difference between min datetime and now) in Seconds. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.startDateTime">startDateTime</a></code> | <code>string</code> | Start datetime replaying this dataset. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.tableName">tableName</a></code> | <code>string</code> | The name of the SQL table extracted from path. |
| <code><a href="#aws-analytics-reference-architecture.PreparedDataset.property.dateTimeColumnsToAdjust">dateTimeColumnsToAdjust</a></code> | <code>string[]</code> | Array of column names with datetime to adjust. |

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

- *Type:* @aws-cdk/aws-s3.Location

The Amazon S3 Location of the source dataset.

---

##### `manifestLocation`<sup>Required</sup> <a name="manifestLocation" id="aws-analytics-reference-architecture.PreparedDataset.property.manifestLocation"></a>

```typescript
public readonly manifestLocation: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

Manifest file in csv format with two columns: start, path.

---

##### `offset`<sup>Required</sup> <a name="offset" id="aws-analytics-reference-architecture.PreparedDataset.property.offset"></a>

```typescript
public readonly offset: number;
```

- *Type:* number

The offset of the Dataset (difference between min datetime and now) in Seconds.

---

##### `startDateTime`<sup>Required</sup> <a name="startDateTime" id="aws-analytics-reference-architecture.PreparedDataset.property.startDateTime"></a>

```typescript
public readonly startDateTime: string;
```

- *Type:* string

Start datetime replaying this dataset.

Your data set may start from 1 Jan 2020 
But you can specify this to 1 Feb 2020 to omit the first month data.

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

Bucket is public and

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

### IdpRelayState <a name="IdpRelayState" id="aws-analytics-reference-architecture.IdpRelayState"></a>

Enum to define the RelayState of different IdPs Used in EMR Studio Prop in the IAM_FEDERATED scenario.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.IdpRelayState.MICROSOFT_AZURE">MICROSOFT_AZURE</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.IdpRelayState.PING_FEDERATE">PING_FEDERATE</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.IdpRelayState.PING_ONE">PING_ONE</a></code> | *No description.* |

---

##### `MICROSOFT_AZURE` <a name="MICROSOFT_AZURE" id="aws-analytics-reference-architecture.IdpRelayState.MICROSOFT_AZURE"></a>

---


##### `PING_FEDERATE` <a name="PING_FEDERATE" id="aws-analytics-reference-architecture.IdpRelayState.PING_FEDERATE"></a>

---


##### `PING_ONE` <a name="PING_ONE" id="aws-analytics-reference-architecture.IdpRelayState.PING_ONE"></a>

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


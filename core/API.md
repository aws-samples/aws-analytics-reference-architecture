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



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.AthenaDefaultSetup.property.resultBucket">resultBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |

---

##### `resultBucket`<sup>Required</sup> <a name="resultBucket" id="aws-analytics-reference-architecture.AthenaDefaultSetup.property.resultBucket"></a>

```typescript
public readonly resultBucket: Bucket;
```

- *Type:* @aws-cdk/aws-s3.Bucket

---


### BatchReplayer <a name="BatchReplayer" id="aws-analytics-reference-architecture.BatchReplayer"></a>

Replay the data in the given PartitionedDataset.

It will dump files into the `sinkBucket` based on the given `frequency`. The computation is in a Step Function with two Lambda steps.  1. resources/lambdas/find-file-paths Read the manifest file and output a list of S3 file paths within that batch time range  2. resources/lambdas/write-in-batch Take a file path, filter only records within given time range, adjust the the time with offset to make it looks like just being generated. Then write the output to the `sinkBucket`

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



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.dataset">dataset</a></code> | <code><a href="#aws-analytics-reference-architecture.PartitionedDataset">PartitionedDataset</a></code> | Dataset used for replay. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.frequency">frequency</a></code> | <code>number</code> | Frequency (in Seconds) of the replaying. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.sinkBucket">sinkBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | Sink bucket where the batch replayer will put data in. |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayer.property.outputFileMaxSizeInBytes">outputFileMaxSizeInBytes</a></code> | <code>number</code> | Maximum file size for each output file. |

---

##### `dataset`<sup>Required</sup> <a name="dataset" id="aws-analytics-reference-architecture.BatchReplayer.property.dataset"></a>

```typescript
public readonly dataset: PartitionedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PartitionedDataset">PartitionedDataset</a>

Dataset used for replay.

---

##### `frequency`<sup>Required</sup> <a name="frequency" id="aws-analytics-reference-architecture.BatchReplayer.property.frequency"></a>

```typescript
public readonly frequency: number;
```

- *Type:* number

Frequency (in Seconds) of the replaying.

The batch job will start for every given frequency and replay the data in that period

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

If the output batch file is, larger than that, it will be splitted into multiple files that fit this size.  Default to 100MB (max value)

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



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.property.dataset">dataset</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | Dataset used to generate data. |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.property.frequency">frequency</a></code> | <code>number</code> | Frequency (in Seconds) of the data generation. |
| <code><a href="#aws-analytics-reference-architecture.DataGenerator.property.sinkArn">sinkArn</a></code> | <code>string</code> | Sink Arn to receive the generated data. |

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



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.cleanDatabase">cleanDatabase</a></code> | <code>@aws-cdk/aws-glue.Database</code> | AWS Glue Database for Clean data. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.rawDatabase">rawDatabase</a></code> | <code>@aws-cdk/aws-glue.Database</code> | AWS Glue Database for Raw data. |
| <code><a href="#aws-analytics-reference-architecture.DataLakeCatalog.property.transformDatabase">transformDatabase</a></code> | <code>@aws-cdk/aws-glue.Database</code> | AWS Glue Database for Transform data. |

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

Source can be an Amazon Kinesis Data Stream. Target can be an Amazon S3 bucket.

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



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeExporter.property.cfnIngestionStream">cfnIngestionStream</a></code> | <code>@aws-cdk/aws-kinesisfirehose.CfnDeliveryStream</code> | Constructs a new instance of the DataLakeExporter class. |

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

This construct is based on 3 Amazon S3 buckets configured with AWS best practices:   * S3 buckets for Raw/Cleaned/Transformed data,   * data lifecycle optimization/transitioning to different Amazon S3 storage classes   * server side buckets encryption managed by KMS  By default the transitioning rules to Amazon S3 storage classes are configured as following:   * Raw data is moved to Infrequent Access after 30 days and archived to Glacier after 90 days   * Clean and Transformed data is moved to Infrequent Access after 90 days and is not archived  Usage example: ```typescript import * as cdk from '@aws-cdk/core'; import { DataLakeStorage } from 'aws-analytics-reference-architecture';  const exampleApp = new cdk.App(); const stack = new cdk.Stack(exampleApp, 'DataLakeStorageStack');  new DataLakeStorage(stack, 'myDataLakeStorage', {   rawInfrequentAccessDelay: 90,   rawArchiveDelay: 180,   cleanInfrequentAccessDelay: 180,   cleanArchiveDelay: 360,   transformInfrequentAccessDelay: 180,   transformArchiveDelay: 360, }); ```

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



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.cleanBucket">cleanBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.rawBucket">rawBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.DataLakeStorage.property.transformBucket">transformBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |

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





### EmrEksCluster <a name="EmrEksCluster" id="aws-analytics-reference-architecture.EmrEksCluster"></a>

EmrEksCluster Construct packaging all the ressources required to run Amazon EMR on Amazon EKS.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup">addEmrEksNodegroup</a></code> | Add new Amazon EMR on EKS nodegroups to the cluster. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster">addEmrVirtualCluster</a></code> | Add a new Amazon EMR Virtual Cluster linked to Amazon EKS Cluster. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint">addManagedEndpoint</a></code> | Creates a new Amazon EMR managed endpoint to be used with Amazon EMR Virtual Cluster . |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.addNodegroupCapacity">addNodegroupCapacity</a></code> | Add a new Amazon EKS Nodegroup to the cluster. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole">createExecutionRole</a></code> | Create and configure a new Amazon IAM Role usable as an execution role. |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.uploadPodTemplate">uploadPodTemplate</a></code> | Upload podTemplates to the Amazon S3 location used by the cluster. |

---

##### `addEmrEksNodegroup` <a name="addEmrEksNodegroup" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup"></a>

```typescript
public addEmrEksNodegroup(id: string, props: EmrEksNodegroupOptions)
```

###### `id`<sup>Required</sup> <a name="id" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksNodegroupOptions">EmrEksNodegroupOptions</a>

the EmrEksNodegroupOptions [properties]{@link EmrEksNodegroupOptions}.

---

##### `addEmrVirtualCluster` <a name="addEmrVirtualCluster" id="aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster"></a>

```typescript
public addEmrVirtualCluster(scope: Construct, options: EmrVirtualClusterOptions)
```

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
public addManagedEndpoint(scope: Construct, id: string, options: EmrManagedEndpointOptions)
```

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
public addNodegroupCapacity(nodegroupId: string, options: EmrEksNodegroupOptions)
```

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
public createExecutionRole(scope: Construct, id: string, policy: IManagedPolicy, name?: string)
```

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
public uploadPodTemplate(id: string, filePath: string)
```

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
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.getOrCreate">getOrCreate</a></code> | Get an existing EmrEksCluster based on the cluster name property or create a new one. |

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate"></a>

```typescript
import { EmrEksCluster } from 'aws-analytics-reference-architecture'

EmrEksCluster.getOrCreate(scope: Construct, props: EmrEksClusterProps)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

###### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.EmrEksClusterProps">EmrEksClusterProps</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.criticalDefaultConfig">criticalDefaultConfig</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.eksCluster">eksCluster</a></code> | <code>@aws-cdk/aws-eks.Cluster</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.notebookDefaultConfig">notebookDefaultConfig</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.podTemplateLocation">podTemplateLocation</a></code> | <code>@aws-cdk/aws-s3.Location</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.EmrEksCluster.property.sharedDefaultConfig">sharedDefaultConfig</a></code> | <code>string</code> | *No description.* |

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

Example Construct to help onboarding contributors.

This example includes best practices for code comment/documentation generation, and for default parameters pattern in CDK using Props with Optional properties

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





### FlywayRunner <a name="FlywayRunner" id="aws-analytics-reference-architecture.FlywayRunner"></a>

A CDK construct that runs flyway migration scripts against a redshift cluster.

This construct is based on two main resource, an AWS Lambda hosting a flyway runner and one custom resource invoking it when content of migrationScriptsFolderAbsolutePath changes.  Usage example:  *This example assume that migration SQL files are located in `resources/sql` of the cdk project.* ```typescript import * as path from 'path'; import * as ec2 from '@aws-cdk/aws-ec2'; import * as redshift from '@aws-cdk/aws-redshift'; import * as cdk from '@aws-cdk/core';  import { FlywayRunner } from 'aws-analytics-reference-architecture';  const integTestApp = new cdk.App(); const stack = new cdk.Stack(integTestApp, 'fywayRunnerTest');  const vpc = new ec2.Vpc(stack, 'Vpc');  const dbName = 'testdb'; const cluster = new redshift.Cluster(stack, 'Redshift', {    removalPolicy: cdk.RemovalPolicy.DESTROY,    masterUser: {      masterUsername: 'admin',    },    vpc,    defaultDatabaseName: dbName, });  new FlywayRunner(stack, 'testMigration', {    migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),    cluster: cluster,    vpc: vpc,    databaseName: dbName, }); ```

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



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.FlywayRunner.property.runner">runner</a></code> | <code>@aws-cdk/core.CustomResource</code> | *No description.* |

---

##### `runner`<sup>Required</sup> <a name="runner" id="aws-analytics-reference-architecture.FlywayRunner.property.runner"></a>

```typescript
public readonly runner: CustomResource;
```

- *Type:* @aws-cdk/core.CustomResource

---


### NotebookPlatform <a name="NotebookPlatform" id="aws-analytics-reference-architecture.NotebookPlatform"></a>

A CDK construct to create a notebook infrastructure based on Amazon EMR Studio and assign users to it.

This construct is initialized through a constructor that takes as argument an interface defined in {@link NotebookPlatformProps} The construct has a method to add users {@link addUser} the method take as argument {@link NotebookUserOptions}  Resources deployed:  * An S3 Bucket used by EMR Studio to store the Jupyter notebooks * A KMS encryption Key used to encrypt an S3 bucket used by EMR Studio to store jupyter notebooks * An EMR Studio service Role as defined here, and allowed to access the S3 bucket and KMS key created above * An EMR Studio User Role as defined here - The policy template which is leveraged is the Basic one from the Amazon EMR Studio documentation * Multiple EMR on EKS Managed Endpoints, each for a user or a group of users * An execution role to be passed to the Managed endpoint from a policy provided by the user * Multiple Session Policies that are used to map an EMR Studio user or group to a set of resources they are allowed to access. These resources are: <br />    - EMR Virtual Cluster - created above <br />    - ManagedEndpoint <br />   Usage example:  ```typescript const emrEks = EmrEksCluster.getOrCreate(stack, {    eksAdminRoleArn: 'arn:aws:iam::012345678912:role/Admin-Admin',    eksClusterName: 'cluster', });  const notebookPlatform = new NotebookPlatform(stack, 'platform-notebook', {    emrEks: emrEks,    eksNamespace: 'platformns',    studioName: 'platform',    studioAuthMode: StudioAuthMode.SSO, });   const policy1 = new ManagedPolicy(stack, 'MyPolicy1', {    statements: [      new PolicyStatement({        resources: ['*'],        actions: ['s3:*'],      }),      new PolicyStatement({        resources: [          stack.formatArn({            account: Aws.ACCOUNT_ID,            region: Aws.REGION,            service: 'logs',            resource: '*',            arnFormat: ArnFormat.NO_RESOURCE_NAME,          }),        ],        actions: [          'logs:*',        ],      }),    ], });  notebookPlatform.addUser([{    identityName: 'user1',    identityType: SSOIdentityType.USER,    notebookManagedEndpoints: [{      emrOnEksVersion: 'emr-6.3.0-latest',      executionPolicy: policy1,    }], }]);  ```

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
| <code><a href="#aws-analytics-reference-architecture.NotebookPlatform.addUser">addUser</a></code> | *No description.* |

---

##### `addUser` <a name="addUser" id="aws-analytics-reference-architecture.NotebookPlatform.addUser"></a>

```typescript
public addUser(userList: NotebookUserOptions[])
```

###### `userList`<sup>Required</sup> <a name="userList" id="aws-analytics-reference-architecture.NotebookPlatform.addUser.parameter.userList"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.NotebookUserOptions">NotebookUserOptions</a>[]

list of users.

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


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonBucket.getOrCreate">getOrCreate</a></code> | Get the Amazon S3 Bucket from the AWS CDK Stack based on the provided name. |

---

##### `getOrCreate` <a name="getOrCreate" id="aws-analytics-reference-architecture.SingletonBucket.getOrCreate"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.getOrCreate(scope: Construct, bucketName: string)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-analytics-reference-architecture.SingletonBucket.getOrCreate.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

###### `bucketName`<sup>Required</sup> <a name="bucketName" id="aws-analytics-reference-architecture.SingletonBucket.getOrCreate.parameter.bucketName"></a>

- *Type:* string

---



### SingletonGlueDefaultRole <a name="SingletonGlueDefaultRole" id="aws-analytics-reference-architecture.SingletonGlueDefaultRole"></a>

SingletonGlueDefaultRole Construct to automatically setup a new Amazon IAM role to use with AWS Glue jobs.

The role is created with AWSGlueServiceRole policy and authorize all actions on S3. The Construct provides a getOrCreate method for SingletonInstantiation


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDefaultRole.getOrCreate">getOrCreate</a></code> | *No description.* |

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
| <code><a href="#aws-analytics-reference-architecture.SingletonGlueDefaultRole.property.iamRole">iamRole</a></code> | <code>@aws-cdk/aws-iam.Role</code> | *No description.* |

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
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.dataset">dataset</a></code> | <code><a href="#aws-analytics-reference-architecture.PartitionedDataset">PartitionedDataset</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.sinkBucket">sinkBucket</a></code> | <code>@aws-cdk/aws-s3.Bucket</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.frequency">frequency</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.BatchReplayerProps.property.outputFileMaxSizeInBytes">outputFileMaxSizeInBytes</a></code> | <code>number</code> | *No description.* |

---

##### `dataset`<sup>Required</sup> <a name="dataset" id="aws-analytics-reference-architecture.BatchReplayerProps.property.dataset"></a>

```typescript
public readonly dataset: PartitionedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PartitionedDataset">PartitionedDataset</a>

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

Some of the Amazon EKS Nodegroup parameters are overriden: -  NodegroupName by the id and an index per AZ -  LaunchTemplate spec -  SubnetList by either the subnet parameter or one subnet per Amazon EKS Cluster AZ. -  Labels and Taints are automatically used to tag the nodegroup for the cluster autoscaler

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

If you explicitly specify the launchTemplate with custom AMI, do not specify this property, or the node group deployment will fail. In other cases, you will need to specify correct amiType for the nodegroup.

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

If not specified, the nodewgroup will initially create `minSize` instances.

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

If an update fails because pods could not be drained, you can force the update after it fails to terminate the old node whether or not any pods are running on the node.

---

##### ~~`instanceType`~~<sup>Optional</sup> <a name="instanceType" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceType"></a>

- *Deprecated:* Use `instanceTypes` instead.

```typescript
public readonly instanceType: InstanceType;
```

- *Type:* @aws-cdk/aws-ec2.InstanceType
- *Default:* t3.medium

The instance type to use for your node group.

Currently, you can specify a single instance type for a node group. The default value for this parameter is `t3.medium`. If you choose a GPU instance type, be sure to specify the `AL2_x86_64_GPU` with the amiType parameter.

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

The Amazon EKS worker node kubelet daemon makes calls to AWS APIs on your behalf. Worker nodes receive permissions for these API calls through an IAM instance profile and associated policies. Before you can launch worker nodes and register them into a cluster, you must create an IAM role for those worker nodes to use when they are launched.

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

Disabled by default, however, if you specify an Amazon EC2 SSH key but do not specify a source security group when you create a managed node group, then port 22 on the worker nodes is opened to the internet (0.0.0.0/0)

---

##### `subnets`<sup>Optional</sup> <a name="subnets" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnets"></a>

```typescript
public readonly subnets: SubnetSelection;
```

- *Type:* @aws-cdk/aws-ec2.SubnetSelection
- *Default:* private subnets

The subnets to use for the Auto Scaling group that is created for your node group.

By specifying the SubnetSelection, the selected subnets will automatically apply required tags i.e. `kubernetes.io/cluster/CLUSTER_NAME` with a value of `shared`, where `CLUSTER_NAME` is replaced with the name of your cluster.

---

##### `tags`<sup>Optional</sup> <a name="tags" id="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* None

The metadata to apply to the node group to assist with categorization and organization.

Each tag consists of a key and an optional value, both of which you define. Node group tags do not propagate to any other resources associated with the node group, such as the Amazon EC2 instances or subnets.

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

Use this setting for resource dependencies like an Amazon RDS database.  The subnet must include the availability zone information because the nodegroup is tagged with the AZ for the K8S Cluster Autoscaler.

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

The properties for the Example Construct class.

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

Example:  * The SQL file:     ```sql    SELECT * FROM ${TABLE_NAME};    ``` * The replacement map:     ```typescript    replaceDictionary = {      TABLE_NAME: 'my_table'    }    ```

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

### PartitionedDatasetProps <a name="PartitionedDatasetProps" id="aws-analytics-reference-architecture.PartitionedDatasetProps"></a>

#### Initializer <a name="Initializer" id="aws-analytics-reference-architecture.PartitionedDatasetProps.Initializer"></a>

```typescript
import { PartitionedDatasetProps } from 'aws-analytics-reference-architecture'

const partitionedDatasetProps: PartitionedDatasetProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDatasetProps.property.dateTimeColumnToFilter">dateTimeColumnToFilter</a></code> | <code>string</code> | Datetime column for filtering data. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDatasetProps.property.location">location</a></code> | <code>@aws-cdk/aws-s3.Location</code> | The Amazon S3 Location of the source dataset. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDatasetProps.property.manifestLocation">manifestLocation</a></code> | <code>@aws-cdk/aws-s3.Location</code> | Manifest file in csv format with two columns: start, path. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDatasetProps.property.startDatetime">startDatetime</a></code> | <code>string</code> | The minimum datetime value in the dataset used to calculate time offset. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDatasetProps.property.dateTimeColumnsToAdjust">dateTimeColumnsToAdjust</a></code> | <code>string[]</code> | Array of column names with datetime to adjust. |

---

##### `dateTimeColumnToFilter`<sup>Required</sup> <a name="dateTimeColumnToFilter" id="aws-analytics-reference-architecture.PartitionedDatasetProps.property.dateTimeColumnToFilter"></a>

```typescript
public readonly dateTimeColumnToFilter: string;
```

- *Type:* string

Datetime column for filtering data.

---

##### `location`<sup>Required</sup> <a name="location" id="aws-analytics-reference-architecture.PartitionedDatasetProps.property.location"></a>

```typescript
public readonly location: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

The Amazon S3 Location of the source dataset.

It's composed of an Amazon S3 bucketName and an Amazon S3 objectKey

---

##### `manifestLocation`<sup>Required</sup> <a name="manifestLocation" id="aws-analytics-reference-architecture.PartitionedDatasetProps.property.manifestLocation"></a>

```typescript
public readonly manifestLocation: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

Manifest file in csv format with two columns: start, path.

---

##### `startDatetime`<sup>Required</sup> <a name="startDatetime" id="aws-analytics-reference-architecture.PartitionedDatasetProps.property.startDatetime"></a>

```typescript
public readonly startDatetime: string;
```

- *Type:* string

The minimum datetime value in the dataset used to calculate time offset.

---

##### `dateTimeColumnsToAdjust`<sup>Optional</sup> <a name="dateTimeColumnsToAdjust" id="aws-analytics-reference-architecture.PartitionedDatasetProps.property.dateTimeColumnsToAdjust"></a>

```typescript
public readonly dateTimeColumnsToAdjust: string[];
```

- *Type:* string[]

Array of column names with datetime to adjust.

The source data will have date in the past 2021-01-01T00:00:00 while the data replayer will have have the current time. The difference (aka. offset) must be added to all datetime columns

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
public parseCreateSourceQuery(database: string, table: string, bucket: string, key: string)
```

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
public parseCreateTargetQuery(database: string, table: string, bucket: string, key: string)
```

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
public parseGenerateQuery(database: string, sourceTable: string, targetTable: string)
```

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
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_CUSTOMER">RETAIL_1GB_CUSTOMER</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The customer dataset part of 1GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_CUSTOMER_ADDRESS">RETAIL_1GB_CUSTOMER_ADDRESS</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The customer address dataset part of 1GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_ITEM">RETAIL_1GB_ITEM</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The item dataset part of 1GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_PROMO">RETAIL_1GB_PROMO</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The promotion dataset part of 1GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_STORE">RETAIL_1GB_STORE</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The store dataset part of 1GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_STORE_SALE">RETAIL_1GB_STORE_SALE</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The store sale dataset part of 1GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_WAREHOUSE">RETAIL_1GB_WAREHOUSE</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The warehouse dataset part of 1GB retail datasets. |
| <code><a href="#aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_WEB_SALE">RETAIL_1GB_WEB_SALE</a></code> | <code><a href="#aws-analytics-reference-architecture.Dataset">Dataset</a></code> | The web sale dataset part of 1GB retail datasets. |

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

##### `RETAIL_1GB_CUSTOMER`<sup>Required</sup> <a name="RETAIL_1GB_CUSTOMER" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_CUSTOMER"></a>

```typescript
public readonly RETAIL_1GB_CUSTOMER: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The customer dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_CUSTOMER_ADDRESS`<sup>Required</sup> <a name="RETAIL_1GB_CUSTOMER_ADDRESS" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_CUSTOMER_ADDRESS"></a>

```typescript
public readonly RETAIL_1GB_CUSTOMER_ADDRESS: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The customer address dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_ITEM`<sup>Required</sup> <a name="RETAIL_1GB_ITEM" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_ITEM"></a>

```typescript
public readonly RETAIL_1GB_ITEM: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The item dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_PROMO`<sup>Required</sup> <a name="RETAIL_1GB_PROMO" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_PROMO"></a>

```typescript
public readonly RETAIL_1GB_PROMO: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The promotion dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_STORE`<sup>Required</sup> <a name="RETAIL_1GB_STORE" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_STORE"></a>

```typescript
public readonly RETAIL_1GB_STORE: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The store dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_STORE_SALE`<sup>Required</sup> <a name="RETAIL_1GB_STORE_SALE" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_STORE_SALE"></a>

```typescript
public readonly RETAIL_1GB_STORE_SALE: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The store sale dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_WAREHOUSE`<sup>Required</sup> <a name="RETAIL_1GB_WAREHOUSE" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_WAREHOUSE"></a>

```typescript
public readonly RETAIL_1GB_WAREHOUSE: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The warehouse dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_WEB_SALE`<sup>Required</sup> <a name="RETAIL_1GB_WEB_SALE" id="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_WEB_SALE"></a>

```typescript
public readonly RETAIL_1GB_WEB_SALE: Dataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.Dataset">Dataset</a>

The web sale dataset part of 1GB retail datasets.

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

### PartitionedDataset <a name="PartitionedDataset" id="aws-analytics-reference-architecture.PartitionedDataset"></a>

PartitionedDataset enum-like class providing pre-defined datasets metadata and custom dataset creation.

PartitionDataset has following properties:  1. Data is partitioned by timestamp (in seconds). Each folder stores data within a given range.  There is no constraint on how long the timestange range can be. But each file must not be larger tahn 100MB. Here is an example: |- time_range_start=16000000000     |- file1.csv 100MB     |- file2.csv 50MB |- time_range_start=16000000300 // 5 minute range (300 sec)     |- file1.csv 1MB |- time_range_start=16000000600     |- file1.csv 100MB     |- file2.csv 100MB     |- whichever-file-name-is-fine-as-we-have-manifest-files.csv 50MB 2. It has a manefest CSV file with two columns: start and path. Start is the timestamp start        , path 16000000000  , s3://<path>/<to>/<folder>/time_range_start=16000000000/file1.csv 16000000000  , s3://<path>/<to>/<folder>/time_range_start=16000000000/file2.csv 16000000300  , s3://<path>/<to>/<folder>/time_range_start=16000000300/file1.csv 16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/file1.csv 16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/file2.csv 16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/whichever-file....csv

#### Initializers <a name="Initializers" id="aws-analytics-reference-architecture.PartitionedDataset.Initializer"></a>

```typescript
import { PartitionedDataset } from 'aws-analytics-reference-architecture'

new PartitionedDataset(props: PartitionedDatasetProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.Initializer.parameter.props">props</a></code> | <code><a href="#aws-analytics-reference-architecture.PartitionedDatasetProps">PartitionedDatasetProps</a></code> | the DatasetProps. |

---

##### `props`<sup>Required</sup> <a name="props" id="aws-analytics-reference-architecture.PartitionedDataset.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-analytics-reference-architecture.PartitionedDatasetProps">PartitionedDatasetProps</a>

the DatasetProps.

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.property.dateTimeColumnToFilter">dateTimeColumnToFilter</a></code> | <code>string</code> | Datetime column for filtering data. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.property.location">location</a></code> | <code>@aws-cdk/aws-s3.Location</code> | The Amazon S3 Location of the source dataset. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.property.manifestLocation">manifestLocation</a></code> | <code>@aws-cdk/aws-s3.Location</code> | Manifest file in csv format with two columns: start, path. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.property.offset">offset</a></code> | <code>number</code> | The offset of the Dataset (difference between min datetime and now) in Seconds. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.property.startDateTime">startDateTime</a></code> | <code>string</code> | Start datetime replaying this dataset. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.property.tableName">tableName</a></code> | <code>string</code> | The name of the SQL table extracted from path. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.property.dateTimeColumnsToAdjust">dateTimeColumnsToAdjust</a></code> | <code>string[]</code> | Array of column names with datetime to adjust. |

---

##### `dateTimeColumnToFilter`<sup>Required</sup> <a name="dateTimeColumnToFilter" id="aws-analytics-reference-architecture.PartitionedDataset.property.dateTimeColumnToFilter"></a>

```typescript
public readonly dateTimeColumnToFilter: string;
```

- *Type:* string

Datetime column for filtering data.

---

##### `location`<sup>Required</sup> <a name="location" id="aws-analytics-reference-architecture.PartitionedDataset.property.location"></a>

```typescript
public readonly location: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

The Amazon S3 Location of the source dataset.

---

##### `manifestLocation`<sup>Required</sup> <a name="manifestLocation" id="aws-analytics-reference-architecture.PartitionedDataset.property.manifestLocation"></a>

```typescript
public readonly manifestLocation: Location;
```

- *Type:* @aws-cdk/aws-s3.Location

Manifest file in csv format with two columns: start, path.

---

##### `offset`<sup>Required</sup> <a name="offset" id="aws-analytics-reference-architecture.PartitionedDataset.property.offset"></a>

```typescript
public readonly offset: number;
```

- *Type:* number

The offset of the Dataset (difference between min datetime and now) in Seconds.

---

##### `startDateTime`<sup>Required</sup> <a name="startDateTime" id="aws-analytics-reference-architecture.PartitionedDataset.property.startDateTime"></a>

```typescript
public readonly startDateTime: string;
```

- *Type:* string

Start datetime replaying this dataset.

Your data set may start from 1 Jan 2020  But you can specify this to 1 Feb 2020 to omit the first month data.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="aws-analytics-reference-architecture.PartitionedDataset.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

The name of the SQL table extracted from path.

---

##### `dateTimeColumnsToAdjust`<sup>Optional</sup> <a name="dateTimeColumnsToAdjust" id="aws-analytics-reference-architecture.PartitionedDataset.property.dateTimeColumnsToAdjust"></a>

```typescript
public readonly dateTimeColumnsToAdjust: string[];
```

- *Type:* string[]

Array of column names with datetime to adjust.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.property.DATASETS_BUCKET">DATASETS_BUCKET</a></code> | <code>string</code> | The bucket name of the AWS Analytics Reference Architecture datasets. |
| <code><a href="#aws-analytics-reference-architecture.PartitionedDataset.property.RETAIL_1GB_WEB_SALE">RETAIL_1GB_WEB_SALE</a></code> | <code><a href="#aws-analytics-reference-architecture.PartitionedDataset">PartitionedDataset</a></code> | The web sale dataset part of 1GB retail datasets. |

---

##### `DATASETS_BUCKET`<sup>Required</sup> <a name="DATASETS_BUCKET" id="aws-analytics-reference-architecture.PartitionedDataset.property.DATASETS_BUCKET"></a>

```typescript
public readonly DATASETS_BUCKET: string;
```

- *Type:* string

The bucket name of the AWS Analytics Reference Architecture datasets.

---

##### `RETAIL_1GB_WEB_SALE`<sup>Required</sup> <a name="RETAIL_1GB_WEB_SALE" id="aws-analytics-reference-architecture.PartitionedDataset.property.RETAIL_1GB_WEB_SALE"></a>

```typescript
public readonly RETAIL_1GB_WEB_SALE: PartitionedDataset;
```

- *Type:* <a href="#aws-analytics-reference-architecture.PartitionedDataset">PartitionedDataset</a>

The web sale dataset part of 1GB retail datasets.

---


## Enums <a name="Enums" id="Enums"></a>

### IdpRelayState <a name="IdpRelayState" id="aws-analytics-reference-architecture.IdpRelayState"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.IdpRelayState.MICROSOFT_AZURE">MICROSOFT_AZURE</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.IdpRelayState.PING_FEDERATE">PING_FEDERATE</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.IdpRelayState.PING_ONE">PING_ONE</a></code> | *No description.* |

---

Enum to define the RelayState of different IdPs Used in EMR Studio Prop in the IAM_FEDERATED scenario.

#### `MICROSOFT_AZURE` <a name="MICROSOFT_AZURE" id="aws-analytics-reference-architecture.IdpRelayState.MICROSOFT_AZURE"></a>

---


#### `PING_FEDERATE` <a name="PING_FEDERATE" id="aws-analytics-reference-architecture.IdpRelayState.PING_FEDERATE"></a>

---


#### `PING_ONE` <a name="PING_ONE" id="aws-analytics-reference-architecture.IdpRelayState.PING_ONE"></a>

---


### SSOIdentityType <a name="SSOIdentityType" id="aws-analytics-reference-architecture.SSOIdentityType"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.SSOIdentityType.USER">USER</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.SSOIdentityType.GROUP">GROUP</a></code> | *No description.* |

---

Enum to define the type of identity Type in EMR studio.

#### `USER` <a name="USER" id="aws-analytics-reference-architecture.SSOIdentityType.USER"></a>

---


#### `GROUP` <a name="GROUP" id="aws-analytics-reference-architecture.SSOIdentityType.GROUP"></a>

---


### StudioAuthMode <a name="StudioAuthMode" id="aws-analytics-reference-architecture.StudioAuthMode"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-analytics-reference-architecture.StudioAuthMode.IAM">IAM</a></code> | *No description.* |
| <code><a href="#aws-analytics-reference-architecture.StudioAuthMode.SSO">SSO</a></code> | *No description.* |

---

Enum to define authentication mode for Amazon EMR Studio.

#### `IAM` <a name="IAM" id="aws-analytics-reference-architecture.StudioAuthMode.IAM"></a>

---


#### `SSO` <a name="SSO" id="aws-analytics-reference-architecture.StudioAuthMode.SSO"></a>

---


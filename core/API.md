# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### AthenaDefaultSetup <a name="aws-analytics-reference-architecture.AthenaDefaultSetup"></a>

AthenaDefaultSetup Construct to automatically setup a new Amazon Athena Workgroup with proper configuration for out-of-the-box usage.

#### Initializers <a name="aws-analytics-reference-architecture.AthenaDefaultSetup.Initializer"></a>

```typescript
import { AthenaDefaultSetup } from 'aws-analytics-reference-architecture'

new AthenaDefaultSetup(scope: Construct, id: string)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.AthenaDefaultSetup.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.AthenaDefaultSetup.parameter.id"></a>

- *Type:* `string`

the ID of the CDK Construct.

---



#### Properties <a name="Properties"></a>

##### `resultBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.AthenaDefaultSetup.property.resultBucket"></a>

```typescript
public readonly resultBucket: Bucket;
```

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---


### DataGenerator <a name="aws-analytics-reference-architecture.DataGenerator"></a>

DataGenerator Construct to replay data from an existing dataset into a target replacing datetime to current datetime Target can be an Amazon S3 bucket or an Amazon Kinesis Data Stream.

DataGenerator can use pre-defined or custom datasets available in the [Dataset]{@link Dataset} Class

#### Initializers <a name="aws-analytics-reference-architecture.DataGenerator.Initializer"></a>

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

```typescript
public readonly dataset: Dataset;
```

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

Dataset used to generate data.

---

##### `frequency`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.property.frequency"></a>

```typescript
public readonly frequency: number;
```

- *Type:* `number`

Frequency (in Seconds) of the data generation.

---

##### `sinkArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.property.sinkArn"></a>

```typescript
public readonly sinkArn: string;
```

- *Type:* `string`

Sink Arn to receive the generated data.

---

#### Constants <a name="Constants"></a>

##### `DATA_GENERATOR_DATABASE` <a name="aws-analytics-reference-architecture.DataGenerator.property.DATA_GENERATOR_DATABASE"></a>

- *Type:* `string`

AWS Glue Database name used by the DataGenerator.

---

### DataLakeCatalog <a name="aws-analytics-reference-architecture.DataLakeCatalog"></a>

A Data Lake Catalog composed of 3 AWS Glue Database configured with AWS best practices:   Databases for Raw/Cleaned/Transformed data,.

#### Initializers <a name="aws-analytics-reference-architecture.DataLakeCatalog.Initializer"></a>

```typescript
import { DataLakeCatalog } from 'aws-analytics-reference-architecture'

new DataLakeCatalog(scope: Construct, id: string)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.parameter.id"></a>

- *Type:* `string`

the ID of the CDK Construct.

---



#### Properties <a name="Properties"></a>

##### `cleanDatabase`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.property.cleanDatabase"></a>

```typescript
public readonly cleanDatabase: Database;
```

- *Type:* [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database)

AWS Glue Database for Clean data.

---

##### `rawDatabase`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.property.rawDatabase"></a>

```typescript
public readonly rawDatabase: Database;
```

- *Type:* [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database)

AWS Glue Database for Raw data.

---

##### `transformDatabase`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.property.transformDatabase"></a>

```typescript
public readonly transformDatabase: Database;
```

- *Type:* [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database)

AWS Glue Database for Transform data.

---


### DataLakeStorage <a name="aws-analytics-reference-architecture.DataLakeStorage"></a>

A Data Lake Storage composed of 3 Amazon S3 Buckets configured with AWS best practices:   S3 buckets for Raw/Cleaned/Transformed data,   data lifecycle optimization/transitioning to different Amazon S3 storage classes   server side buckets encryption managed by KMS.

#### Initializers <a name="aws-analytics-reference-architecture.DataLakeStorage.Initializer"></a>

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

```typescript
public readonly cleanBucket: Bucket;
```

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---

##### `rawBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.property.rawBucket"></a>

```typescript
public readonly rawBucket: Bucket;
```

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---

##### `transformBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.property.transformBucket"></a>

```typescript
public readonly transformBucket: Bucket;
```

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---


### Ec2SsmRole <a name="aws-analytics-reference-architecture.Ec2SsmRole"></a>

#### Initializers <a name="aws-analytics-reference-architecture.Ec2SsmRole.Initializer"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

new Ec2SsmRole(scope: Construct, id: string, props: RoleProps)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Ec2SsmRole.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Ec2SsmRole.parameter.id"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Ec2SsmRole.parameter.props"></a>

- *Type:* [`@aws-cdk/aws-iam.RoleProps`](#@aws-cdk/aws-iam.RoleProps)

the RoleProps properties.

---





### EmrEksCluster <a name="aws-analytics-reference-architecture.EmrEksCluster"></a>

EmrEksCluster Construct packaging all the ressources required to run Amazon EMR on Amazon EKS.

#### Initializers <a name="aws-analytics-reference-architecture.EmrEksCluster.Initializer"></a>

```typescript
import { EmrEksCluster } from 'aws-analytics-reference-architecture'

new EmrEksCluster(scope: Construct, id: string, props: EmrEksClusterProps)
```

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.id"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksClusterProps`](#aws-analytics-reference-architecture.EmrEksClusterProps)

the EmrEksClusterProps [properties]{@link EmrEksClusterProps}.

---

#### Methods <a name="Methods"></a>

##### `addEmrEksNodegroup` <a name="aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup"></a>

```typescript
public addEmrEksNodegroup(props: EmrEksNodegroupOptions)
```

###### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

the EmrEksNodegroupOptions [properties]{@link EmrEksNodegroupOptions}.

---

##### `addEmrVirtualCluster` <a name="aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster"></a>

```typescript
public addEmrVirtualCluster(props: EmrVirtualClusterProps)
```

###### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrVirtualClusterProps`](#aws-analytics-reference-architecture.EmrVirtualClusterProps)

the EmrEksNodegroupProps [properties]{@link EmrVirtualClusterProps}.

---

##### `addManagedEndpoint` <a name="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint"></a>

```typescript
public addManagedEndpoint(id: string, virtualClusterId: string, executionRoleArn: string, acmCertificateArn?: string, emrOnEksVersion?: string, configurationOverrides?: string)
```

###### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.id"></a>

- *Type:* `string`

unique id for endpoint.

---

###### `virtualClusterId`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.virtualClusterId"></a>

- *Type:* `string`

Amazon Emr Virtual Cluster Id.

---

###### `executionRoleArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.executionRoleArn"></a>

- *Type:* `string`

IAM execution role to attach.

---

###### `acmCertificateArn`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.acmCertificateArn"></a>

- *Type:* `string`

ACM Certificate Arn to be attached to the managed endpoint,.

---

###### `emrOnEksVersion`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.emrOnEksVersion"></a>

- *Type:* `string`

EmrOnEks version to be used.

---

###### `configurationOverrides`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.configurationOverrides"></a>

- *Type:* `string`

The JSON configuration override for Amazon EMR Managed Endpoint,.

---

##### `addNodegroupCapacity` <a name="aws-analytics-reference-architecture.EmrEksCluster.addNodegroupCapacity"></a>

```typescript
public addNodegroupCapacity(nodegroupId: string, options: EmrEksNodegroupOptions)
```

###### `nodegroupId`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.nodegroupId"></a>

- *Type:* `string`

the ID of the nodegroup.

---

###### `options`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.options"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

the EmrEksNodegroup [properties]{@link EmrEksNodegroupOptions}.

---

##### `createExecutionRole` <a name="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole"></a>

```typescript
public createExecutionRole(policy: Policy)
```

###### `policy`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.policy"></a>

- *Type:* [`@aws-cdk/aws-iam.Policy`](#@aws-cdk/aws-iam.Policy)

the execution policy to attach to the role.

---


#### Properties <a name="Properties"></a>

##### `eksCluster`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.property.eksCluster"></a>

```typescript
public readonly eksCluster: Cluster;
```

- *Type:* [`@aws-cdk/aws-eks.Cluster`](#@aws-cdk/aws-eks.Cluster)

---

#### Constants <a name="Constants"></a>

##### `DEFAULT_EKS_VERSION` <a name="aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_EKS_VERSION"></a>

- *Type:* [`@aws-cdk/aws-eks.KubernetesVersion`](#@aws-cdk/aws-eks.KubernetesVersion)

---

##### `DEFAULT_EMR_VERSION` <a name="aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_EMR_VERSION"></a>

- *Type:* `string`

---

### Example <a name="aws-analytics-reference-architecture.Example"></a>

Example Construct to help onboarding contributors.

This example includes best practices for code comment/documentation generation,
and for default parameters pattern in CDK using Props with Optional properties

#### Initializers <a name="aws-analytics-reference-architecture.Example.Initializer"></a>

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

#### Initializers <a name="aws-analytics-reference-architecture.SingletonBucket.Initializer"></a>

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

#### Initializers <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer"></a>

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

#### Initializers <a name="aws-analytics-reference-architecture.SynchronousCrawler.Initializer"></a>

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

### AthenaDefaultSetupProps <a name="aws-analytics-reference-architecture.AthenaDefaultSetupProps"></a>

The properties for AthenaDefaultSetup Construct.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { AthenaDefaultSetupProps } from 'aws-analytics-reference-architecture'

const athenaDefaultSetupProps: AthenaDefaultSetupProps = { ... }
```

### DataGeneratorProps <a name="aws-analytics-reference-architecture.DataGeneratorProps"></a>

The properties for DataGenerator Construct.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DataGeneratorProps } from 'aws-analytics-reference-architecture'

const dataGeneratorProps: DataGeneratorProps = { ... }
```

##### `dataset`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGeneratorProps.property.dataset"></a>

```typescript
public readonly dataset: Dataset;
```

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

Source dataset used to generate the data by replying it.

Use a pre-defined [Dataset]{@link Dataset} or create a [custom one]{@link Dataset.constructor}.

---

##### `sinkArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGeneratorProps.property.sinkArn"></a>

```typescript
public readonly sinkArn: string;
```

- *Type:* `string`

Sink Arn to receive the generated data.

Sink must be an Amazon S3 bucket.

---

##### `frequency`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataGeneratorProps.property.frequency"></a>

```typescript
public readonly frequency: number;
```

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

```typescript
public readonly cleanArchiveDelay: number;
```

- *Type:* `number`
- *Default:* Objects are not archived to Glacier

Delay (in days) before archiving CLEAN data to frozen storage (Glacier storage class).

---

##### `cleanInfrequentAccessDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.cleanInfrequentAccessDelay"></a>

```typescript
public readonly cleanInfrequentAccessDelay: number;
```

- *Type:* `number`
- *Default:* Move objects to Infrequent Access after 90 days

Delay (in days) before moving CLEAN data to cold storage (Infrequent Access storage class).

---

##### `rawArchiveDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.rawArchiveDelay"></a>

```typescript
public readonly rawArchiveDelay: number;
```

- *Type:* `number`
- *Default:* Move objects to Glacier after 90 days

Delay (in days) before archiving RAW data to frozen storage (Glacier storage class).

---

##### `rawInfrequentAccessDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.rawInfrequentAccessDelay"></a>

```typescript
public readonly rawInfrequentAccessDelay: number;
```

- *Type:* `number`
- *Default:* Move objects to Infrequent Access after 30 days

Delay (in days) before moving RAW data to cold storage (Infrequent Access storage class).

---

##### `transformArchiveDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.transformArchiveDelay"></a>

```typescript
public readonly transformArchiveDelay: number;
```

- *Type:* `number`
- *Default:* Objects are not archived to Glacier

Delay (in days) before archiving TRANSFORM data to frozen storage (Glacier storage class).

---

##### `transformInfrequentAccessDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.transformInfrequentAccessDelay"></a>

```typescript
public readonly transformInfrequentAccessDelay: number;
```

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

##### `createSourceTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.createSourceTable"></a>

```typescript
public readonly createSourceTable: string;
```

- *Type:* `string`

The CREATE TABLE DDL command to create the source AWS Glue Table.

---

##### `generateData`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.generateData"></a>

```typescript
public readonly generateData: string;
```

- *Type:* `string`

The SELECT query used to generate new data.

---

##### `location`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.location"></a>

```typescript
public readonly location: Location;
```

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

The Amazon S3 Location of the source dataset.

It's composed of an Amazon S3 bucketName and an Amazon S3 objectKey

---

##### `startDatetime`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.startDatetime"></a>

```typescript
public readonly startDatetime: string;
```

- *Type:* `string`

The minimum datetime value in the dataset used to calculate time offset.

---

##### `createTargetTable`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.createTargetTable"></a>

```typescript
public readonly createTargetTable: string;
```

- *Type:* `string`
- *Default:* Use the same DDL as the source table

The CREATE TABLE DDL command to create the target AWS Glue Table.

---

### EmrEksClusterProps <a name="aws-analytics-reference-architecture.EmrEksClusterProps"></a>

The properties for the EmrEksCluster Construct class.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { EmrEksClusterProps } from 'aws-analytics-reference-architecture'

const emrEksClusterProps: EmrEksClusterProps = { ... }
```

##### `eksAdminRoleArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksAdminRoleArn"></a>

```typescript
public readonly eksAdminRoleArn: string;
```

- *Type:* `string`

Amazon IAM Role to be added to Amazon EKS master roles that will give access to kubernetes cluster from AWS console UI.

---

##### `acmCertificateArn`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.acmCertificateArn"></a>

```typescript
public readonly acmCertificateArn: string;
```

- *Type:* `string`
- *Default:* attempt to generate and import certificate using locally installed openssl utility

ACM Certificate ARN used with EMR on EKS managed endpoint.

---

##### `eksClusterName`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksClusterName"></a>

```typescript
public readonly eksClusterName: string;
```

- *Type:* `string`
- *Default:* automatically generated cluster name

Name of the Amazon EKS cluster to be created.

---

##### `emrEksNodegroups`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.emrEksNodegroups"></a>

```typescript
public readonly emrEksNodegroups: EmrEksNodegroup[];
```

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroup`](#aws-analytics-reference-architecture.EmrEksNodegroup)[]
- *Default:* Create a default set of EmrEksNodegroup

List of EmrEksNodegroup to create in the cluster.

---

##### `emrOnEksVersion`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.emrOnEksVersion"></a>

```typescript
public readonly emrOnEksVersion: string;
```

- *Type:* `string`
- *Default:* emr-6.3.0-latest

EMR on EKS managed endpoint version.

---

##### `kubernetesVersion`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.kubernetesVersion"></a>

```typescript
public readonly kubernetesVersion: KubernetesVersion;
```

- *Type:* [`@aws-cdk/aws-eks.KubernetesVersion`](#@aws-cdk/aws-eks.KubernetesVersion)
- *Default:* v1.20 version is used

Kubernetes version for Amazon EKS cluster that will be created.

---

### EmrEksNodegroupOptions <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions"></a>

The Options for adding EmrEksNodegroup to an EmrEksCluster.

Some of the Amazon EKS Nodegroup parameters are overriden:
-  NodegroupName by the id and an index per AZ
-  LaunchTemplate spec
-  SubnetList by either the subnet parameter or one subnet per Amazon EKS Cluster AZ.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { EmrEksNodegroupOptions } from 'aws-analytics-reference-architecture'

const emrEksNodegroupOptions: EmrEksNodegroupOptions = { ... }
```

##### `amiType`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.amiType"></a>

```typescript
public readonly amiType: NodegroupAmiType;
```

- *Type:* [`@aws-cdk/aws-eks.NodegroupAmiType`](#@aws-cdk/aws-eks.NodegroupAmiType)
- *Default:* auto-determined from the instanceTypes property.

The AMI type for your node group.

---

##### `capacityType`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.capacityType"></a>

```typescript
public readonly capacityType: CapacityType;
```

- *Type:* [`@aws-cdk/aws-eks.CapacityType`](#@aws-cdk/aws-eks.CapacityType)
- *Default:* ON_DEMAND

The capacity type of the nodegroup.

---

##### `desiredSize`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.desiredSize"></a>

```typescript
public readonly desiredSize: number;
```

- *Type:* `number`
- *Default:* 2

The current number of worker nodes that the managed node group should maintain.

If not specified,
the nodewgroup will initially create `minSize` instances.

---

##### `diskSize`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.diskSize"></a>

```typescript
public readonly diskSize: number;
```

- *Type:* `number`
- *Default:* 20

The root device disk size (in GiB) for your node group instances.

---

##### `forceUpdate`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.forceUpdate"></a>

```typescript
public readonly forceUpdate: boolean;
```

- *Type:* `boolean`
- *Default:* true

Force the update if the existing node group's pods are unable to be drained due to a pod disruption budget issue.

If an update fails because pods could not be drained, you can force the update after it fails to terminate the old
node whether or not any pods are
running on the node.

---

##### ~~`instanceType`~~<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceType"></a>

- *Deprecated:* Use `instanceTypes` instead.

```typescript
public readonly instanceType: InstanceType;
```

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)
- *Default:* t3.medium

The instance type to use for your node group.

Currently, you can specify a single instance type for a node group.
The default value for this parameter is `t3.medium`. If you choose a GPU instance type, be sure to specify the
`AL2_x86_64_GPU` with the amiType parameter.

---

##### `instanceTypes`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceTypes"></a>

```typescript
public readonly instanceTypes: InstanceType[];
```

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)[]
- *Default:* t3.medium will be used according to the cloudformation document.

The instance types to use for your node group.

> - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-eks-nodegroup.html#cfn-eks-nodegroup-instancetypes

---

##### `labels`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.labels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}
- *Default:* None

The Kubernetes labels to be applied to the nodes in the node group when they are created.

---

##### `launchTemplateSpec`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.launchTemplateSpec"></a>

```typescript
public readonly launchTemplateSpec: LaunchTemplateSpec;
```

- *Type:* [`@aws-cdk/aws-eks.LaunchTemplateSpec`](#@aws-cdk/aws-eks.LaunchTemplateSpec)
- *Default:* no launch template

Launch template specification used for the nodegroup.

> - https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html

---

##### `maxSize`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.maxSize"></a>

```typescript
public readonly maxSize: number;
```

- *Type:* `number`
- *Default:* desiredSize

The maximum number of worker nodes that the managed node group can scale out to.

Managed node groups can support up to 100 nodes by default.

---

##### `minSize`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.minSize"></a>

```typescript
public readonly minSize: number;
```

- *Type:* `number`
- *Default:* 1

The minimum number of worker nodes that the managed node group can scale in to.

This number must be greater than or equal to zero.

---

##### `nodegroupName`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodegroupName"></a>

```typescript
public readonly nodegroupName: string;
```

- *Type:* `string`
- *Default:* resource ID

Name of the Nodegroup.

---

##### `nodeRole`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodeRole"></a>

```typescript
public readonly nodeRole: IRole;
```

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)
- *Default:* None. Auto-generated if not specified.

The IAM role to associate with your node group.

The Amazon EKS worker node kubelet daemon
makes calls to AWS APIs on your behalf. Worker nodes receive permissions for these API calls through
an IAM instance profile and associated policies. Before you can launch worker nodes and register them
into a cluster, you must create an IAM role for those worker nodes to use when they are launched.

---

##### `releaseVersion`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.releaseVersion"></a>

```typescript
public readonly releaseVersion: string;
```

- *Type:* `string`
- *Default:* The latest available AMI version for the node group's current Kubernetes version is used.

The AMI version of the Amazon EKS-optimized AMI to use with your node group (for example, `1.14.7-YYYYMMDD`).

---

##### `remoteAccess`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.remoteAccess"></a>

```typescript
public readonly remoteAccess: NodegroupRemoteAccess;
```

- *Type:* [`@aws-cdk/aws-eks.NodegroupRemoteAccess`](#@aws-cdk/aws-eks.NodegroupRemoteAccess)
- *Default:* disabled

The remote access (SSH) configuration to use with your node group.

Disabled by default, however, if you
specify an Amazon EC2 SSH key but do not specify a source security group when you create a managed node group,
then port 22 on the worker nodes is opened to the internet (0.0.0.0/0)

---

##### `subnets`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnets"></a>

```typescript
public readonly subnets: SubnetSelection;
```

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* private subnets

The subnets to use for the Auto Scaling group that is created for your node group.

By specifying the
SubnetSelection, the selected subnets will automatically apply required tags i.e.
`kubernetes.io/cluster/CLUSTER_NAME` with a value of `shared`, where `CLUSTER_NAME` is replaced with
the name of your cluster.

---

##### `tags`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}
- *Default:* None

The metadata to apply to the node group to assist with categorization and organization.

Each tag consists of
a key and an optional value, both of which you define. Node group tags do not propagate to any other resources
associated with the node group, such as the Amazon EC2 instances or subnets.

---

##### `taints`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.taints"></a>

```typescript
public readonly taints: TaintSpec[];
```

- *Type:* [`@aws-cdk/aws-eks.TaintSpec`](#@aws-cdk/aws-eks.TaintSpec)[]
- *Default:* None

The Kubernetes taints to be applied to the nodes in the node group when they are created.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* `string`

Nodegroup ID.

---

##### `mountNvme`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.mountNvme"></a>

```typescript
public readonly mountNvme: boolean;
```

- *Type:* `boolean`
- *Default:* false

Set to true if using instance types with local NVMe drives to mount them automatically at boot time.

---

##### `subnet`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnet"></a>

```typescript
public readonly subnet: ISubnet;
```

- *Type:* [`@aws-cdk/aws-ec2.ISubnet`](#@aws-cdk/aws-ec2.ISubnet)
- *Default:* One NodeGroup is deployed per cluster AZ

Configure the Amazon EKS NodeGroup in this subnet.

Use this setting for resource dependencies like an Amazon RD

---

### EmrVirtualClusterProps <a name="aws-analytics-reference-architecture.EmrVirtualClusterProps"></a>

The properties for the EmrVirtualCluster Construct class.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { EmrVirtualClusterProps } from 'aws-analytics-reference-architecture'

const emrVirtualClusterProps: EmrVirtualClusterProps = { ... }
```

##### `name`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrVirtualClusterProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* `string`

name of the  EmrVirtualCluster to be created.

---

##### `createNamespace`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrVirtualClusterProps.property.createNamespace"></a>

```typescript
public readonly createNamespace: boolean;
```

- *Type:* `boolean`
- *Default:* Do not create the namespace

creates EKS namespace.

---

##### `eksNamespace`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrVirtualClusterProps.property.eksNamespace"></a>

```typescript
public readonly eksNamespace: string;
```

- *Type:* `string`
- *Default:* Use the default namespace

name of the  EKS namespace to be linked to the EMR virtual Cluster.

---

### ExampleProps <a name="aws-analytics-reference-architecture.ExampleProps"></a>

The properties for the Example Construct class.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { ExampleProps } from 'aws-analytics-reference-architecture'

const exampleProps: ExampleProps = { ... }
```

##### `name`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.ExampleProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* `string`
- *Default:* Set to 'defaultMessage' if not provided

Name used to qualify the CfnOutput in the Stack.

---

##### `value`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.ExampleProps.property.value"></a>

```typescript
public readonly value: string;
```

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

```typescript
public readonly resultPath: Location;
```

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

The Amazon S3 Location for the query results (without trailing slash).

---

##### `statement`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.statement"></a>

```typescript
public readonly statement: string;
```

- *Type:* `string`

The name of the Athena query to execute.

---

##### `executionRoleStatements`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.executionRoleStatements"></a>

```typescript
public readonly executionRoleStatements: PolicyStatement[];
```

- *Type:* [`@aws-cdk/aws-iam.PolicyStatement`](#@aws-cdk/aws-iam.PolicyStatement)[]
- *Default:* No Policy Statements are added to the execution role

The Amazon IAM Policy Statements used to run the query.

---

##### `timeout`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.timeout"></a>

```typescript
public readonly timeout: number;
```

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

```typescript
public readonly crawlerName: string;
```

- *Type:* `string`

The name of the Crawler to use.

---

##### `timeout`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawlerProps.property.timeout"></a>

```typescript
public readonly timeout: number;
```

- *Type:* `number`
- *Default:* 300 seconds

The timeout in seconds to wait for the Crawler success.

---

## Classes <a name="Classes"></a>

### Dataset <a name="aws-analytics-reference-architecture.Dataset"></a>

Dataset enum-like class providing pre-defined datasets metadata and custom dataset creation.

#### Initializers <a name="aws-analytics-reference-architecture.Dataset.Initializer"></a>

```typescript
import { Dataset } from 'aws-analytics-reference-architecture'

new Dataset(props: DatasetProps)
```

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.props"></a>

- *Type:* [`aws-analytics-reference-architecture.DatasetProps`](#aws-analytics-reference-architecture.DatasetProps)

the DatasetProps.

---

#### Methods <a name="Methods"></a>

##### `parseCreateSourceQuery` <a name="aws-analytics-reference-architecture.Dataset.parseCreateSourceQuery"></a>

```typescript
public parseCreateSourceQuery(database: string, table: string, bucket: string, key: string)
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

##### `parseCreateTargetQuery` <a name="aws-analytics-reference-architecture.Dataset.parseCreateTargetQuery"></a>

```typescript
public parseCreateTargetQuery(database: string, table: string, bucket: string, key: string)
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

##### `createSourceTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.createSourceTable"></a>

```typescript
public readonly createSourceTable: string;
```

- *Type:* `string`

The CREATE TABLE DDL command to create the source AWS Glue Table.

---

##### `createTargetTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.createTargetTable"></a>

```typescript
public readonly createTargetTable: string;
```

- *Type:* `string`

The CREATE TABLE DDL command to create the target AWS Glue Table.

---

##### `generateData`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.generateData"></a>

```typescript
public readonly generateData: string;
```

- *Type:* `string`

The SELECT query used to generate new data.

---

##### `location`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.location"></a>

```typescript
public readonly location: Location;
```

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

The Amazon S3 Location of the source dataset.

---

##### `offset`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.offset"></a>

```typescript
public readonly offset: number;
```

- *Type:* `number`

The offset of the Dataset (difference between min datetime and now) in Seconds.

---

##### `tableName`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* `string`

The name of the SQL table extracted from path.

---

#### Constants <a name="Constants"></a>

##### `DATASETS_BUCKET` <a name="aws-analytics-reference-architecture.Dataset.property.DATASETS_BUCKET"></a>

- *Type:* `string`

The bucket name of the AWS Analytics Reference Architecture datasets.

---

##### `RETAIL_100GB_CUSTOMER` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_CUSTOMER"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_CUSTOMER_ADDRESS` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_CUSTOMER_ADDRESS"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer address dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_ITEM` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_ITEM"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The item dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_PROMO` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_PROMO"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The promotion dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_STORE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_STORE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_STORE_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_STORE_SALE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store sale dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_WAREHOUSE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_WAREHOUSE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The warehouse dataset part 100GB of retail datasets.

---

##### `RETAIL_100GB_WEB_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_WEB_SALE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The web sale dataset part of 100GB retail datasets.

---

##### `RETAIL_1GB_CUSTOMER` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_CUSTOMER"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_CUSTOMER_ADDRESS` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_CUSTOMER_ADDRESS"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer address dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_ITEM` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_ITEM"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The item dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_PROMO` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_PROMO"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The promotion dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_STORE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_STORE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_STORE_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_STORE_SALE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store sale dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_WAREHOUSE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_WAREHOUSE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The warehouse dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_WEB_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_WEB_SALE"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The web sale dataset part of 1GB retail datasets.

---

### EmrEksNodegroup <a name="aws-analytics-reference-architecture.EmrEksNodegroup"></a>

#### Initializers <a name="aws-analytics-reference-architecture.EmrEksNodegroup.Initializer"></a>

```typescript
import { EmrEksNodegroup } from 'aws-analytics-reference-architecture'

new EmrEksNodegroup()
```




#### Constants <a name="Constants"></a>

##### `CRITICAL_ALL` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.CRITICAL_ALL"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `NOTEBOOK_DRIVER` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_DRIVER"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `NOTEBOOK_EXECUTOR` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_EXECUTOR"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `SHARED_DRIVER` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_DRIVER"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `SHARED_EXECUTOR` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_EXECUTOR"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `TOOLING_ALL` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.TOOLING_ALL"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---



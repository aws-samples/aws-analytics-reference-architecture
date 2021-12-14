# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="constructs"></a>

### AthenaDefaultSetup <a name="aws-analytics-reference-architecture.AthenaDefaultSetup" id="awsanalyticsreferencearchitectureathenadefaultsetup"></a>

AthenaDefaultSetup Construct to automatically setup a new Amazon Athena Workgroup with proper configuration for out-of-the-box usage.

#### Initializers <a name="aws-analytics-reference-architecture.AthenaDefaultSetup.Initializer" id="awsanalyticsreferencearchitectureathenadefaultsetupinitializer"></a>

```typescript
import { AthenaDefaultSetup } from 'aws-analytics-reference-architecture'

new AthenaDefaultSetup(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitectureathenadefaultsetupparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | the Scope of the CDK Construct. |
| [`id`](#awsanalyticsreferencearchitectureathenadefaultsetupparameterid)<span title="Required">*</span> | `string` | the ID of the CDK Construct. |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.AthenaDefaultSetup.parameter.scope" id="awsanalyticsreferencearchitectureathenadefaultsetupparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.AthenaDefaultSetup.parameter.id" id="awsanalyticsreferencearchitectureathenadefaultsetupparameterid"></a>

- *Type:* `string`

the ID of the CDK Construct.

---



#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`resultBucket`](#awsanalyticsreferencearchitectureathenadefaultsetuppropertyresultbucket)<span title="Required">*</span> | [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket) | *No description.* |

---

##### `resultBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.AthenaDefaultSetup.property.resultBucket" id="awsanalyticsreferencearchitectureathenadefaultsetuppropertyresultbucket"></a>

```typescript
public readonly resultBucket: Bucket;
```

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---


### DataGenerator <a name="aws-analytics-reference-architecture.DataGenerator" id="awsanalyticsreferencearchitecturedatagenerator"></a>

DataGenerator Construct to replay data from an existing dataset into a target replacing datetime to current datetime Target can be an Amazon S3 bucket or an Amazon Kinesis Data Stream.

DataGenerator can use pre-defined or custom datasets available in the [Dataset]{@link Dataset} Class

#### Initializers <a name="aws-analytics-reference-architecture.DataGenerator.Initializer" id="awsanalyticsreferencearchitecturedatageneratorinitializer"></a>

```typescript
import { DataGenerator } from 'aws-analytics-reference-architecture'

new DataGenerator(scope: Construct, id: string, props: DataGeneratorProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitecturedatageneratorparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | the Scope of the CDK Construct. |
| [`id`](#awsanalyticsreferencearchitecturedatageneratorparameterid)<span title="Required">*</span> | `string` | the ID of the CDK Construct. |
| [`props`](#awsanalyticsreferencearchitecturedatageneratorparameterprops)<span title="Required">*</span> | [`aws-analytics-reference-architecture.DataGeneratorProps`](#aws-analytics-reference-architecture.DataGeneratorProps) | the DataGenerator [properties]{@link DataGeneratorProps}. |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.parameter.scope" id="awsanalyticsreferencearchitecturedatageneratorparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.parameter.id" id="awsanalyticsreferencearchitecturedatageneratorparameterid"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.parameter.props" id="awsanalyticsreferencearchitecturedatageneratorparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.DataGeneratorProps`](#aws-analytics-reference-architecture.DataGeneratorProps)

the DataGenerator [properties]{@link DataGeneratorProps}.

---



#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`dataset`](#awsanalyticsreferencearchitecturedatageneratorpropertydataset)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | Dataset used to generate data. |
| [`frequency`](#awsanalyticsreferencearchitecturedatageneratorpropertyfrequency)<span title="Required">*</span> | `number` | Frequency (in Seconds) of the data generation. |
| [`sinkArn`](#awsanalyticsreferencearchitecturedatageneratorpropertysinkarn)<span title="Required">*</span> | `string` | Sink Arn to receive the generated data. |

---

##### `dataset`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.property.dataset" id="awsanalyticsreferencearchitecturedatageneratorpropertydataset"></a>

```typescript
public readonly dataset: Dataset;
```

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

Dataset used to generate data.

---

##### `frequency`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.property.frequency" id="awsanalyticsreferencearchitecturedatageneratorpropertyfrequency"></a>

```typescript
public readonly frequency: number;
```

- *Type:* `number`

Frequency (in Seconds) of the data generation.

---

##### `sinkArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGenerator.property.sinkArn" id="awsanalyticsreferencearchitecturedatageneratorpropertysinkarn"></a>

```typescript
public readonly sinkArn: string;
```

- *Type:* `string`

Sink Arn to receive the generated data.

---

#### Constants <a name="Constants" id="constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`DATA_GENERATOR_DATABASE`](#awsanalyticsreferencearchitecturedatageneratorpropertydatageneratordatabase)<span title="Required">*</span> | `string` | AWS Glue Database name used by the DataGenerator. |

---

##### `DATA_GENERATOR_DATABASE` <a name="aws-analytics-reference-architecture.DataGenerator.property.DATA_GENERATOR_DATABASE" id="awsanalyticsreferencearchitecturedatageneratorpropertydatageneratordatabase"></a>

- *Type:* `string`

AWS Glue Database name used by the DataGenerator.

---

### DataLakeCatalog <a name="aws-analytics-reference-architecture.DataLakeCatalog" id="awsanalyticsreferencearchitecturedatalakecatalog"></a>

A Data Lake Catalog composed of 3 AWS Glue Database configured with AWS best practices:   Databases for Raw/Cleaned/Transformed data,.

#### Initializers <a name="aws-analytics-reference-architecture.DataLakeCatalog.Initializer" id="awsanalyticsreferencearchitecturedatalakecataloginitializer"></a>

```typescript
import { DataLakeCatalog } from 'aws-analytics-reference-architecture'

new DataLakeCatalog(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitecturedatalakecatalogparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | the Scope of the CDK Construct. |
| [`id`](#awsanalyticsreferencearchitecturedatalakecatalogparameterid)<span title="Required">*</span> | `string` | the ID of the CDK Construct. |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.parameter.scope" id="awsanalyticsreferencearchitecturedatalakecatalogparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.parameter.id" id="awsanalyticsreferencearchitecturedatalakecatalogparameterid"></a>

- *Type:* `string`

the ID of the CDK Construct.

---



#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`cleanDatabase`](#awsanalyticsreferencearchitecturedatalakecatalogpropertycleandatabase)<span title="Required">*</span> | [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database) | AWS Glue Database for Clean data. |
| [`rawDatabase`](#awsanalyticsreferencearchitecturedatalakecatalogpropertyrawdatabase)<span title="Required">*</span> | [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database) | AWS Glue Database for Raw data. |
| [`transformDatabase`](#awsanalyticsreferencearchitecturedatalakecatalogpropertytransformdatabase)<span title="Required">*</span> | [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database) | AWS Glue Database for Transform data. |

---

##### `cleanDatabase`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.property.cleanDatabase" id="awsanalyticsreferencearchitecturedatalakecatalogpropertycleandatabase"></a>

```typescript
public readonly cleanDatabase: Database;
```

- *Type:* [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database)

AWS Glue Database for Clean data.

---

##### `rawDatabase`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.property.rawDatabase" id="awsanalyticsreferencearchitecturedatalakecatalogpropertyrawdatabase"></a>

```typescript
public readonly rawDatabase: Database;
```

- *Type:* [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database)

AWS Glue Database for Raw data.

---

##### `transformDatabase`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeCatalog.property.transformDatabase" id="awsanalyticsreferencearchitecturedatalakecatalogpropertytransformdatabase"></a>

```typescript
public readonly transformDatabase: Database;
```

- *Type:* [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database)

AWS Glue Database for Transform data.

---


### DataLakeExporter <a name="aws-analytics-reference-architecture.DataLakeExporter" id="awsanalyticsreferencearchitecturedatalakeexporter"></a>

DataLakeExporter Construct to export data from a stream to the data lake.

Source can be an Amazon Kinesis Data Stream. Target can be an Amazon S3 bucket.

#### Initializers <a name="aws-analytics-reference-architecture.DataLakeExporter.Initializer" id="awsanalyticsreferencearchitecturedatalakeexporterinitializer"></a>

```typescript
import { DataLakeExporter } from 'aws-analytics-reference-architecture'

new DataLakeExporter(scope: Construct, id: string, props: DataLakeExporterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitecturedatalakeexporterparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | *No description.* |
| [`id`](#awsanalyticsreferencearchitecturedatalakeexporterparameterid)<span title="Required">*</span> | `string` | *No description.* |
| [`props`](#awsanalyticsreferencearchitecturedatalakeexporterparameterprops)<span title="Required">*</span> | [`aws-analytics-reference-architecture.DataLakeExporterProps`](#aws-analytics-reference-architecture.DataLakeExporterProps) | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeExporter.parameter.scope" id="awsanalyticsreferencearchitecturedatalakeexporterparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeExporter.parameter.id" id="awsanalyticsreferencearchitecturedatalakeexporterparameterid"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeExporter.parameter.props" id="awsanalyticsreferencearchitecturedatalakeexporterparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.DataLakeExporterProps`](#aws-analytics-reference-architecture.DataLakeExporterProps)

---



#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`cfnIngestionStream`](#awsanalyticsreferencearchitecturedatalakeexporterpropertycfningestionstream)<span title="Required">*</span> | [`@aws-cdk/aws-kinesisfirehose.CfnDeliveryStream`](#@aws-cdk/aws-kinesisfirehose.CfnDeliveryStream) | Constructs a new instance of the DataLakeExporter class. |

---

##### `cfnIngestionStream`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeExporter.property.cfnIngestionStream" id="awsanalyticsreferencearchitecturedatalakeexporterpropertycfningestionstream"></a>

```typescript
public readonly cfnIngestionStream: CfnDeliveryStream;
```

- *Type:* [`@aws-cdk/aws-kinesisfirehose.CfnDeliveryStream`](#@aws-cdk/aws-kinesisfirehose.CfnDeliveryStream)

Constructs a new instance of the DataLakeExporter class.

---


### DataLakeStorage <a name="aws-analytics-reference-architecture.DataLakeStorage" id="awsanalyticsreferencearchitecturedatalakestorage"></a>

A Data Lake Storage composed of 3 Amazon S3 Buckets configured with AWS best practices:   S3 buckets for Raw/Cleaned/Transformed data,   data lifecycle optimization/transitioning to different Amazon S3 storage classes   server side buckets encryption managed by KMS.

#### Initializers <a name="aws-analytics-reference-architecture.DataLakeStorage.Initializer" id="awsanalyticsreferencearchitecturedatalakestorageinitializer"></a>

```typescript
import { DataLakeStorage } from 'aws-analytics-reference-architecture'

new DataLakeStorage(scope: Construct, id: string, props: DataLakeStorageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitecturedatalakestorageparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | the Scope of the CDK Construct. |
| [`id`](#awsanalyticsreferencearchitecturedatalakestorageparameterid)<span title="Required">*</span> | `string` | the ID of the CDK Construct. |
| [`props`](#awsanalyticsreferencearchitecturedatalakestorageparameterprops)<span title="Required">*</span> | [`aws-analytics-reference-architecture.DataLakeStorageProps`](#aws-analytics-reference-architecture.DataLakeStorageProps) | the DataLakeStorageProps properties. |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.parameter.scope" id="awsanalyticsreferencearchitecturedatalakestorageparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.parameter.id" id="awsanalyticsreferencearchitecturedatalakestorageparameterid"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.parameter.props" id="awsanalyticsreferencearchitecturedatalakestorageparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.DataLakeStorageProps`](#aws-analytics-reference-architecture.DataLakeStorageProps)

the DataLakeStorageProps properties.

---



#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`cleanBucket`](#awsanalyticsreferencearchitecturedatalakestoragepropertycleanbucket)<span title="Required">*</span> | [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket) | *No description.* |
| [`rawBucket`](#awsanalyticsreferencearchitecturedatalakestoragepropertyrawbucket)<span title="Required">*</span> | [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket) | *No description.* |
| [`transformBucket`](#awsanalyticsreferencearchitecturedatalakestoragepropertytransformbucket)<span title="Required">*</span> | [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket) | *No description.* |

---

##### `cleanBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.property.cleanBucket" id="awsanalyticsreferencearchitecturedatalakestoragepropertycleanbucket"></a>

```typescript
public readonly cleanBucket: Bucket;
```

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---

##### `rawBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.property.rawBucket" id="awsanalyticsreferencearchitecturedatalakestoragepropertyrawbucket"></a>

```typescript
public readonly rawBucket: Bucket;
```

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---

##### `transformBucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeStorage.property.transformBucket" id="awsanalyticsreferencearchitecturedatalakestoragepropertytransformbucket"></a>

```typescript
public readonly transformBucket: Bucket;
```

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

---


### Ec2SsmRole <a name="aws-analytics-reference-architecture.Ec2SsmRole" id="awsanalyticsreferencearchitectureec2ssmrole"></a>

Construct extending IAM Role with AmazonSSMManagedInstanceCore managed policy.

#### Initializers <a name="aws-analytics-reference-architecture.Ec2SsmRole.Initializer" id="awsanalyticsreferencearchitectureec2ssmroleinitializer"></a>

```typescript
import { Ec2SsmRole } from 'aws-analytics-reference-architecture'

new Ec2SsmRole(scope: Construct, id: string, props: RoleProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitectureec2ssmroleparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | the Scope of the CDK Construct. |
| [`id`](#awsanalyticsreferencearchitectureec2ssmroleparameterid)<span title="Required">*</span> | `string` | the ID of the CDK Construct. |
| [`props`](#awsanalyticsreferencearchitectureec2ssmroleparameterprops)<span title="Required">*</span> | [`@aws-cdk/aws-iam.RoleProps`](#@aws-cdk/aws-iam.RoleProps) | the RoleProps properties. |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Ec2SsmRole.parameter.scope" id="awsanalyticsreferencearchitectureec2ssmroleparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Ec2SsmRole.parameter.id" id="awsanalyticsreferencearchitectureec2ssmroleparameterid"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Ec2SsmRole.parameter.props" id="awsanalyticsreferencearchitectureec2ssmroleparameterprops"></a>

- *Type:* [`@aws-cdk/aws-iam.RoleProps`](#@aws-cdk/aws-iam.RoleProps)

the RoleProps properties.

---





### EmrEksCluster <a name="aws-analytics-reference-architecture.EmrEksCluster" id="awsanalyticsreferencearchitectureemrekscluster"></a>

EmrEksCluster Construct packaging all the ressources required to run Amazon EMR on Amazon EKS.

#### Initializers <a name="aws-analytics-reference-architecture.EmrEksCluster.Initializer" id="awsanalyticsreferencearchitectureemreksclusterinitializer"></a>

```typescript
import { EmrEksCluster } from 'aws-analytics-reference-architecture'

new EmrEksCluster(scope: Construct, id: string, props: EmrEksClusterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitectureemreksclusterparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | the Scope of the CDK Construct. |
| [`id`](#awsanalyticsreferencearchitectureemreksclusterparameterid)<span title="Required">*</span> | `string` | the ID of the CDK Construct. |
| [`props`](#awsanalyticsreferencearchitectureemreksclusterparameterprops)<span title="Required">*</span> | [`aws-analytics-reference-architecture.EmrEksClusterProps`](#aws-analytics-reference-architecture.EmrEksClusterProps) | the EmrEksClusterProps [properties]{@link EmrEksClusterProps}. |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.scope" id="awsanalyticsreferencearchitectureemreksclusterparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.id" id="awsanalyticsreferencearchitectureemreksclusterparameterid"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.props" id="awsanalyticsreferencearchitectureemreksclusterparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksClusterProps`](#aws-analytics-reference-architecture.EmrEksClusterProps)

the EmrEksClusterProps [properties]{@link EmrEksClusterProps}.

---

#### Methods <a name="Methods" id="methods"></a>

| **Name** | **Description** |
| --- | --- |
| [`addEmrEksNodegroup`](#awsanalyticsreferencearchitectureemreksclusteraddemreksnodegroup) | Add a new Amazon EKS Nodegroup to the cluster with Amazon EMR on EKS best practices and configured for Cluster Autoscaler. |
| [`addEmrVirtualCluster`](#awsanalyticsreferencearchitectureemreksclusteraddemrvirtualcluster) | Add a new Amazon EMR Virtual Cluster linked to EKS Cluster. |
| [`addManagedEndpoint`](#awsanalyticsreferencearchitectureemreksclusteraddmanagedendpoint) | Creates a new Amazon EMR managed endpoint to be used with Amazon EMR Virtual Cluster . |
| [`addNodegroupCapacity`](#awsanalyticsreferencearchitectureemreksclusteraddnodegroupcapacity) | Add a new Amazon EMR on EKS Nodegroup to the cluster. |
| [`createExecutionRole`](#awsanalyticsreferencearchitectureemreksclustercreateexecutionrole) | Create and configure a new Amazon IAM Role usable as an execution role. |

---

##### `addEmrEksNodegroup` <a name="aws-analytics-reference-architecture.EmrEksCluster.addEmrEksNodegroup" id="awsanalyticsreferencearchitectureemreksclusteraddemreksnodegroup"></a>

```typescript
public addEmrEksNodegroup(props: EmrEksNodegroupOptions)
```

###### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.props" id="awsanalyticsreferencearchitectureemreksclusterparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

the EmrEksNodegroupOptions [properties]{@link EmrEksNodegroupOptions}.

---

##### `addEmrVirtualCluster` <a name="aws-analytics-reference-architecture.EmrEksCluster.addEmrVirtualCluster" id="awsanalyticsreferencearchitectureemreksclusteraddemrvirtualcluster"></a>

```typescript
public addEmrVirtualCluster(props: EmrVirtualClusterProps)
```

###### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.props" id="awsanalyticsreferencearchitectureemreksclusterparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrVirtualClusterProps`](#aws-analytics-reference-architecture.EmrVirtualClusterProps)

the EmrEksNodegroupProps [properties]{@link EmrVirtualClusterProps}.

---

##### `addManagedEndpoint` <a name="aws-analytics-reference-architecture.EmrEksCluster.addManagedEndpoint" id="awsanalyticsreferencearchitectureemreksclusteraddmanagedendpoint"></a>

```typescript
public addManagedEndpoint(scope: Construct, serviceToken: string, id: string, virtualClusterId: string, executionRole: IRole, acmCertificateArn?: string, emrOnEksVersion?: string, configurationOverrides?: string)
```

###### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.scope" id="awsanalyticsreferencearchitectureemreksclusterparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

###### `serviceToken`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.serviceToken" id="awsanalyticsreferencearchitectureemreksclusterparameterservicetoken"></a>

- *Type:* `string`

---

###### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.id" id="awsanalyticsreferencearchitectureemreksclusterparameterid"></a>

- *Type:* `string`

unique id for endpoint.

---

###### `virtualClusterId`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.virtualClusterId" id="awsanalyticsreferencearchitectureemreksclusterparametervirtualclusterid"></a>

- *Type:* `string`

Amazon Emr Virtual Cluster Id.

---

###### `executionRole`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.executionRole" id="awsanalyticsreferencearchitectureemreksclusterparameterexecutionrole"></a>

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)

IAM execution role to attach.

---

###### `acmCertificateArn`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.acmCertificateArn" id="awsanalyticsreferencearchitectureemreksclusterparameteracmcertificatearn"></a>

- *Type:* `string`

ACM Certificate Arn to be attached to the managed endpoint,.

---

###### `emrOnEksVersion`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.emrOnEksVersion" id="awsanalyticsreferencearchitectureemreksclusterparameteremroneksversion"></a>

- *Type:* `string`

EmrOnEks version to be used.

---

###### `configurationOverrides`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.configurationOverrides" id="awsanalyticsreferencearchitectureemreksclusterparameterconfigurationoverrides"></a>

- *Type:* `string`

The JSON configuration override for Amazon EMR Managed Endpoint,.

---

##### `addNodegroupCapacity` <a name="aws-analytics-reference-architecture.EmrEksCluster.addNodegroupCapacity" id="awsanalyticsreferencearchitectureemreksclusteraddnodegroupcapacity"></a>

```typescript
public addNodegroupCapacity(nodegroupId: string, options: EmrEksNodegroupOptions)
```

###### `nodegroupId`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.nodegroupId" id="awsanalyticsreferencearchitectureemreksclusterparameternodegroupid"></a>

- *Type:* `string`

the ID of the nodegroup.

---

###### `options`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.options" id="awsanalyticsreferencearchitectureemreksclusterparameteroptions"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

the EmrEksNodegroup [properties]{@link EmrEksNodegroupOptions}.

---

##### `createExecutionRole` <a name="aws-analytics-reference-architecture.EmrEksCluster.createExecutionRole" id="awsanalyticsreferencearchitectureemreksclustercreateexecutionrole"></a>

```typescript
public createExecutionRole(policy: Policy)
```

###### `policy`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.policy" id="awsanalyticsreferencearchitectureemreksclusterparameterpolicy"></a>

- *Type:* [`@aws-cdk/aws-iam.Policy`](#@aws-cdk/aws-iam.Policy)

the execution policy to attach to the role.

---

#### Static Functions <a name="Static Functions" id="static-functions"></a>

| **Name** | **Description** |
| --- | --- |
| [`getOrCreate`](#awsanalyticsreferencearchitectureemreksclustergetorcreate) | *No description.* |

---

##### `getOrCreate` <a name="aws-analytics-reference-architecture.EmrEksCluster.getOrCreate" id="awsanalyticsreferencearchitectureemreksclustergetorcreate"></a>

```typescript
import { EmrEksCluster } from 'aws-analytics-reference-architecture'

EmrEksCluster.getOrCreate(scope: Construct, eksAdminRoleArn: string, kubernetesVersion: KubernetesVersion, clusterName: string)
```

###### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.scope" id="awsanalyticsreferencearchitectureemreksclusterparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

###### `eksAdminRoleArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.eksAdminRoleArn" id="awsanalyticsreferencearchitectureemreksclusterparametereksadminrolearn"></a>

- *Type:* `string`

---

###### `kubernetesVersion`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.kubernetesVersion" id="awsanalyticsreferencearchitectureemreksclusterparameterkubernetesversion"></a>

- *Type:* [`@aws-cdk/aws-eks.KubernetesVersion`](#@aws-cdk/aws-eks.KubernetesVersion)

---

###### `clusterName`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.parameter.clusterName" id="awsanalyticsreferencearchitectureemreksclusterparameterclustername"></a>

- *Type:* `string`

---

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`criticalDefaultConfig`](#awsanalyticsreferencearchitectureemreksclusterpropertycriticaldefaultconfig)<span title="Required">*</span> | `string` | *No description.* |
| [`eksCluster`](#awsanalyticsreferencearchitectureemreksclusterpropertyekscluster)<span title="Required">*</span> | [`@aws-cdk/aws-eks.Cluster`](#@aws-cdk/aws-eks.Cluster) | *No description.* |
| [`managedEndpointProviderServiceToken`](#awsanalyticsreferencearchitectureemreksclusterpropertymanagedendpointproviderservicetoken)<span title="Required">*</span> | `string` | *No description.* |
| [`notebookDefaultConfig`](#awsanalyticsreferencearchitectureemreksclusterpropertynotebookdefaultconfig)<span title="Required">*</span> | `string` | *No description.* |
| [`sharedDefaultConfig`](#awsanalyticsreferencearchitectureemreksclusterpropertyshareddefaultconfig)<span title="Required">*</span> | `string` | *No description.* |

---

##### `criticalDefaultConfig`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.property.criticalDefaultConfig" id="awsanalyticsreferencearchitectureemreksclusterpropertycriticaldefaultconfig"></a>

```typescript
public readonly criticalDefaultConfig: string;
```

- *Type:* `string`

---

##### `eksCluster`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.property.eksCluster" id="awsanalyticsreferencearchitectureemreksclusterpropertyekscluster"></a>

```typescript
public readonly eksCluster: Cluster;
```

- *Type:* [`@aws-cdk/aws-eks.Cluster`](#@aws-cdk/aws-eks.Cluster)

---

##### `managedEndpointProviderServiceToken`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.property.managedEndpointProviderServiceToken" id="awsanalyticsreferencearchitectureemreksclusterpropertymanagedendpointproviderservicetoken"></a>

```typescript
public readonly managedEndpointProviderServiceToken: string;
```

- *Type:* `string`

---

##### `notebookDefaultConfig`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.property.notebookDefaultConfig" id="awsanalyticsreferencearchitectureemreksclusterpropertynotebookdefaultconfig"></a>

```typescript
public readonly notebookDefaultConfig: string;
```

- *Type:* `string`

---

##### `sharedDefaultConfig`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksCluster.property.sharedDefaultConfig" id="awsanalyticsreferencearchitectureemreksclusterpropertyshareddefaultconfig"></a>

```typescript
public readonly sharedDefaultConfig: string;
```

- *Type:* `string`

---

#### Constants <a name="Constants" id="constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`DEFAULT_EKS_VERSION`](#awsanalyticsreferencearchitectureemreksclusterpropertydefaulteksversion)<span title="Required">*</span> | [`@aws-cdk/aws-eks.KubernetesVersion`](#@aws-cdk/aws-eks.KubernetesVersion) | *No description.* |
| [`DEFAULT_EMR_VERSION`](#awsanalyticsreferencearchitectureemreksclusterpropertydefaultemrversion)<span title="Required">*</span> | `string` | *No description.* |

---

##### `DEFAULT_EKS_VERSION` <a name="aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_EKS_VERSION" id="awsanalyticsreferencearchitectureemreksclusterpropertydefaulteksversion"></a>

- *Type:* [`@aws-cdk/aws-eks.KubernetesVersion`](#@aws-cdk/aws-eks.KubernetesVersion)

---

##### `DEFAULT_EMR_VERSION` <a name="aws-analytics-reference-architecture.EmrEksCluster.property.DEFAULT_EMR_VERSION" id="awsanalyticsreferencearchitectureemreksclusterpropertydefaultemrversion"></a>

- *Type:* `string`

---

### Example <a name="aws-analytics-reference-architecture.Example" id="awsanalyticsreferencearchitectureexample"></a>

Example Construct to help onboarding contributors.

This example includes best practices for code comment/documentation generation, and for default parameters pattern in CDK using Props with Optional properties

#### Initializers <a name="aws-analytics-reference-architecture.Example.Initializer" id="awsanalyticsreferencearchitectureexampleinitializer"></a>

```typescript
import { Example } from 'aws-analytics-reference-architecture'

new Example(scope: Construct, id: string, props: ExampleProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitectureexampleparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | the Scope of the CDK Construct. |
| [`id`](#awsanalyticsreferencearchitectureexampleparameterid)<span title="Required">*</span> | `string` | the ID of the CDK Construct. |
| [`props`](#awsanalyticsreferencearchitectureexampleparameterprops)<span title="Required">*</span> | [`aws-analytics-reference-architecture.ExampleProps`](#aws-analytics-reference-architecture.ExampleProps) | the ExampleProps properties. |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Example.parameter.scope" id="awsanalyticsreferencearchitectureexampleparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Example.parameter.id" id="awsanalyticsreferencearchitectureexampleparameterid"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Example.parameter.props" id="awsanalyticsreferencearchitectureexampleparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.ExampleProps`](#aws-analytics-reference-architecture.ExampleProps)

the ExampleProps properties.

---





### FlywayRunner <a name="aws-analytics-reference-architecture.FlywayRunner" id="awsanalyticsreferencearchitectureflywayrunner"></a>

A CDK construct that runs flyway migration scripts against a redshift cluster.

This construct is based on two main resource, an AWS Lambda hosting a flyway runner and one custom resource invoking it when content of migrationScriptsFolderAbsolutePath changes.  Usage example:  *This example assume that migration SQL files are located in `resources/sql` of the cdk project.* ```typescript import * as path from 'path'; import * as ec2 from '@aws-cdk/aws-ec2'; import * as redshift from '@aws-cdk/aws-redshift'; import * as cdk from '@aws-cdk/core';  import { FlywayRunner } from 'aws-analytics-reference-architecture';  const integTestApp = new cdk.App(); const stack = new cdk.Stack(integTestApp, 'fywayRunnerTest');  const vpc = new ec2.Vpc(stack, 'Vpc');  const dbName = 'testdb'; const cluster = new redshift.Cluster(stack, 'Redshift', {    removalPolicy: cdk.RemovalPolicy.DESTROY,    masterUser: {      masterUsername: 'admin',    },    vpc,    defaultDatabaseName: dbName, });  new FlywayRunner(stack, 'testMigration', {    migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),    cluster: cluster,    vpc: vpc,    databaseName: dbName, }); ```

#### Initializers <a name="aws-analytics-reference-architecture.FlywayRunner.Initializer" id="awsanalyticsreferencearchitectureflywayrunnerinitializer"></a>

```typescript
import { FlywayRunner } from 'aws-analytics-reference-architecture'

new FlywayRunner(scope: Construct, id: string, props: FlywayRunnerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitectureflywayrunnerparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | *No description.* |
| [`id`](#awsanalyticsreferencearchitectureflywayrunnerparameterid)<span title="Required">*</span> | `string` | *No description.* |
| [`props`](#awsanalyticsreferencearchitectureflywayrunnerparameterprops)<span title="Required">*</span> | [`aws-analytics-reference-architecture.FlywayRunnerProps`](#aws-analytics-reference-architecture.FlywayRunnerProps) | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.FlywayRunner.parameter.scope" id="awsanalyticsreferencearchitectureflywayrunnerparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.FlywayRunner.parameter.id" id="awsanalyticsreferencearchitectureflywayrunnerparameterid"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.FlywayRunner.parameter.props" id="awsanalyticsreferencearchitectureflywayrunnerparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.FlywayRunnerProps`](#aws-analytics-reference-architecture.FlywayRunnerProps)

---



#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`runner`](#awsanalyticsreferencearchitectureflywayrunnerpropertyrunner)<span title="Required">*</span> | [`@aws-cdk/core.CustomResource`](#@aws-cdk/core.CustomResource) | *No description.* |

---

##### `runner`<sup>Required</sup> <a name="aws-analytics-reference-architecture.FlywayRunner.property.runner" id="awsanalyticsreferencearchitectureflywayrunnerpropertyrunner"></a>

```typescript
public readonly runner: CustomResource;
```

- *Type:* [`@aws-cdk/core.CustomResource`](#@aws-cdk/core.CustomResource)

---


### SingletonBucket <a name="aws-analytics-reference-architecture.SingletonBucket" id="awsanalyticsreferencearchitecturesingletonbucket"></a>

An Amazon S3 Bucket implementing the singleton pattern.

#### Initializers <a name="aws-analytics-reference-architecture.SingletonBucket.Initializer" id="awsanalyticsreferencearchitecturesingletonbucketinitializer"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

new SingletonBucket(scope: Construct, id: string, props?: BucketProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitecturesingletonbucketparameterscope)<span title="Required">*</span> | [`constructs.Construct`](#constructs.Construct) | *No description.* |
| [`id`](#awsanalyticsreferencearchitecturesingletonbucketparameterid)<span title="Required">*</span> | `string` | *No description.* |
| [`props`](#awsanalyticsreferencearchitecturesingletonbucketparameterprops) | [`@aws-cdk/aws-s3.BucketProps`](#@aws-cdk/aws-s3.BucketProps) | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.scope" id="awsanalyticsreferencearchitecturesingletonbucketparameterscope"></a>

- *Type:* [`constructs.Construct`](#constructs.Construct)

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.id" id="awsanalyticsreferencearchitecturesingletonbucketparameterid"></a>

- *Type:* `string`

---

##### `props`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.props" id="awsanalyticsreferencearchitecturesingletonbucketparameterprops"></a>

- *Type:* [`@aws-cdk/aws-s3.BucketProps`](#@aws-cdk/aws-s3.BucketProps)

---


#### Static Functions <a name="Static Functions" id="static-functions"></a>

| **Name** | **Description** |
| --- | --- |
| [`getOrCreate`](#awsanalyticsreferencearchitecturesingletonbucketgetorcreate) | Get the Amazon S3 Bucket from the AWS CDK Stack based on the provided name. |

---

##### `getOrCreate` <a name="aws-analytics-reference-architecture.SingletonBucket.getOrCreate" id="awsanalyticsreferencearchitecturesingletonbucketgetorcreate"></a>

```typescript
import { SingletonBucket } from 'aws-analytics-reference-architecture'

SingletonBucket.getOrCreate(scope: Construct, bucketName: string)
```

###### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.scope" id="awsanalyticsreferencearchitecturesingletonbucketparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

###### `bucketName`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonBucket.parameter.bucketName" id="awsanalyticsreferencearchitecturesingletonbucketparameterbucketname"></a>

- *Type:* `string`

---



### SingletonGlueDefaultRole <a name="aws-analytics-reference-architecture.SingletonGlueDefaultRole" id="awsanalyticsreferencearchitecturesingletongluedefaultrole"></a>

SingletonGlueDefaultRole Construct to automatically setup a new Amazon IAM role to use with AWS Glue jobs.

The role is created with AWSGlueServiceRole policy and authorize all actions on S3. The Construct provides a getOrCreate method for SingletonInstantiation


#### Static Functions <a name="Static Functions" id="static-functions"></a>

| **Name** | **Description** |
| --- | --- |
| [`getOrCreate`](#awsanalyticsreferencearchitecturesingletongluedefaultrolegetorcreate) | *No description.* |

---

##### `getOrCreate` <a name="aws-analytics-reference-architecture.SingletonGlueDefaultRole.getOrCreate" id="awsanalyticsreferencearchitecturesingletongluedefaultrolegetorcreate"></a>

```typescript
import { SingletonGlueDefaultRole } from 'aws-analytics-reference-architecture'

SingletonGlueDefaultRole.getOrCreate(scope: Construct)
```

###### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonGlueDefaultRole.parameter.scope" id="awsanalyticsreferencearchitecturesingletongluedefaultroleparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`iamRole`](#awsanalyticsreferencearchitecturesingletongluedefaultrolepropertyiamrole)<span title="Required">*</span> | [`@aws-cdk/aws-iam.Role`](#@aws-cdk/aws-iam.Role) | *No description.* |

---

##### `iamRole`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SingletonGlueDefaultRole.property.iamRole" id="awsanalyticsreferencearchitecturesingletongluedefaultrolepropertyiamrole"></a>

```typescript
public readonly iamRole: Role;
```

- *Type:* [`@aws-cdk/aws-iam.Role`](#@aws-cdk/aws-iam.Role)

---


### SynchronousAthenaQuery <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery" id="awsanalyticsreferencearchitecturesynchronousathenaquery"></a>

SynchronousAthenaQuery Construct to execute an Amazon Athena query synchronously.

#### Initializers <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery.Initializer" id="awsanalyticsreferencearchitecturesynchronousathenaqueryinitializer"></a>

```typescript
import { SynchronousAthenaQuery } from 'aws-analytics-reference-architecture'

new SynchronousAthenaQuery(scope: Construct, id: string, props: SynchronousAthenaQueryProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitecturesynchronousathenaqueryparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | the Scope of the CDK Construct. |
| [`id`](#awsanalyticsreferencearchitecturesynchronousathenaqueryparameterid)<span title="Required">*</span> | `string` | the ID of the CDK Construct. |
| [`props`](#awsanalyticsreferencearchitecturesynchronousathenaqueryparameterprops)<span title="Required">*</span> | [`aws-analytics-reference-architecture.SynchronousAthenaQueryProps`](#aws-analytics-reference-architecture.SynchronousAthenaQueryProps) | the CrawlerStartWait [properties]{@link SynchronousAthenaQueryProps}. |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery.parameter.scope" id="awsanalyticsreferencearchitecturesynchronousathenaqueryparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery.parameter.id" id="awsanalyticsreferencearchitecturesynchronousathenaqueryparameterid"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQuery.parameter.props" id="awsanalyticsreferencearchitecturesynchronousathenaqueryparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.SynchronousAthenaQueryProps`](#aws-analytics-reference-architecture.SynchronousAthenaQueryProps)

the CrawlerStartWait [properties]{@link SynchronousAthenaQueryProps}.

---





### SynchronousCrawler <a name="aws-analytics-reference-architecture.SynchronousCrawler" id="awsanalyticsreferencearchitecturesynchronouscrawler"></a>

CrawlerStartWait Construct to start an AWS Glue Crawler execution and asynchronously wait for completion.

#### Initializers <a name="aws-analytics-reference-architecture.SynchronousCrawler.Initializer" id="awsanalyticsreferencearchitecturesynchronouscrawlerinitializer"></a>

```typescript
import { SynchronousCrawler } from 'aws-analytics-reference-architecture'

new SynchronousCrawler(scope: Construct, id: string, props: SynchronousCrawlerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#awsanalyticsreferencearchitecturesynchronouscrawlerparameterscope)<span title="Required">*</span> | [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct) | the Scope of the CDK Construct. |
| [`id`](#awsanalyticsreferencearchitecturesynchronouscrawlerparameterid)<span title="Required">*</span> | `string` | the ID of the CDK Construct. |
| [`props`](#awsanalyticsreferencearchitecturesynchronouscrawlerparameterprops)<span title="Required">*</span> | [`aws-analytics-reference-architecture.SynchronousCrawlerProps`](#aws-analytics-reference-architecture.SynchronousCrawlerProps) | the CrawlerStartWait [properties]{@link SynchronousCrawlerProps}. |

---

##### `scope`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawler.parameter.scope" id="awsanalyticsreferencearchitecturesynchronouscrawlerparameterscope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

the Scope of the CDK Construct.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawler.parameter.id" id="awsanalyticsreferencearchitecturesynchronouscrawlerparameterid"></a>

- *Type:* `string`

the ID of the CDK Construct.

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawler.parameter.props" id="awsanalyticsreferencearchitecturesynchronouscrawlerparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.SynchronousCrawlerProps`](#aws-analytics-reference-architecture.SynchronousCrawlerProps)

the CrawlerStartWait [properties]{@link SynchronousCrawlerProps}.

---





## Structs <a name="Structs" id="structs"></a>

### DataGeneratorProps <a name="aws-analytics-reference-architecture.DataGeneratorProps" id="awsanalyticsreferencearchitecturedatageneratorprops"></a>

The properties for DataGenerator Construct.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { DataGeneratorProps } from 'aws-analytics-reference-architecture'

const dataGeneratorProps: DataGeneratorProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`dataset`](#awsanalyticsreferencearchitecturedatageneratorpropspropertydataset)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | Source dataset used to generate the data by replying it. |
| [`sinkArn`](#awsanalyticsreferencearchitecturedatageneratorpropspropertysinkarn)<span title="Required">*</span> | `string` | Sink Arn to receive the generated data. |
| [`frequency`](#awsanalyticsreferencearchitecturedatageneratorpropspropertyfrequency) | `number` | Frequency (in Seconds) of the data generation. |

---

##### `dataset`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGeneratorProps.property.dataset" id="awsanalyticsreferencearchitecturedatageneratorpropspropertydataset"></a>

```typescript
public readonly dataset: Dataset;
```

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

Source dataset used to generate the data by replying it.

Use a pre-defined [Dataset]{@link Dataset} or create a [custom one]{@link Dataset.constructor}.

---

##### `sinkArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataGeneratorProps.property.sinkArn" id="awsanalyticsreferencearchitecturedatageneratorpropspropertysinkarn"></a>

```typescript
public readonly sinkArn: string;
```

- *Type:* `string`

Sink Arn to receive the generated data.

Sink must be an Amazon S3 bucket.

---

##### `frequency`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataGeneratorProps.property.frequency" id="awsanalyticsreferencearchitecturedatageneratorpropspropertyfrequency"></a>

```typescript
public readonly frequency: number;
```

- *Type:* `number`
- *Default:* 30 min (1800s)

Frequency (in Seconds) of the data generation.

Should be > 60s.

---

### DataLakeExporterProps <a name="aws-analytics-reference-architecture.DataLakeExporterProps" id="awsanalyticsreferencearchitecturedatalakeexporterprops"></a>

The properties for DataLakeExporter Construct.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { DataLakeExporterProps } from 'aws-analytics-reference-architecture'

const dataLakeExporterProps: DataLakeExporterProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`sinkLocation`](#awsanalyticsreferencearchitecturedatalakeexporterpropspropertysinklocation)<span title="Required">*</span> | [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location) | Sink must be an Amazon S3 Location composed of a bucket and a key. |
| [`sourceGlueDatabase`](#awsanalyticsreferencearchitecturedatalakeexporterpropspropertysourcegluedatabase)<span title="Required">*</span> | [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database) | Source AWS Glue Database containing the schema of the stream. |
| [`sourceGlueTable`](#awsanalyticsreferencearchitecturedatalakeexporterpropspropertysourcegluetable)<span title="Required">*</span> | [`@aws-cdk/aws-glue.Table`](#@aws-cdk/aws-glue.Table) | Source AWS Glue Table containing the schema of the stream. |
| [`sourceKinesisDataStream`](#awsanalyticsreferencearchitecturedatalakeexporterpropspropertysourcekinesisdatastream)<span title="Required">*</span> | [`@aws-cdk/aws-kinesis.Stream`](#@aws-cdk/aws-kinesis.Stream) | Source must be an Amazon Kinesis Data Stream. |
| [`deliveryInterval`](#awsanalyticsreferencearchitecturedatalakeexporterpropspropertydeliveryinterval) | `number` | Delivery interval in seconds. |
| [`deliverySize`](#awsanalyticsreferencearchitecturedatalakeexporterpropspropertydeliverysize) | `number` | Maximum delivery size in MB. |

---

##### `sinkLocation`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeExporterProps.property.sinkLocation" id="awsanalyticsreferencearchitecturedatalakeexporterpropspropertysinklocation"></a>

```typescript
public readonly sinkLocation: Location;
```

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

Sink must be an Amazon S3 Location composed of a bucket and a key.

---

##### `sourceGlueDatabase`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueDatabase" id="awsanalyticsreferencearchitecturedatalakeexporterpropspropertysourcegluedatabase"></a>

```typescript
public readonly sourceGlueDatabase: Database;
```

- *Type:* [`@aws-cdk/aws-glue.Database`](#@aws-cdk/aws-glue.Database)

Source AWS Glue Database containing the schema of the stream.

---

##### `sourceGlueTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceGlueTable" id="awsanalyticsreferencearchitecturedatalakeexporterpropspropertysourcegluetable"></a>

```typescript
public readonly sourceGlueTable: Table;
```

- *Type:* [`@aws-cdk/aws-glue.Table`](#@aws-cdk/aws-glue.Table)

Source AWS Glue Table containing the schema of the stream.

---

##### `sourceKinesisDataStream`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DataLakeExporterProps.property.sourceKinesisDataStream" id="awsanalyticsreferencearchitecturedatalakeexporterpropspropertysourcekinesisdatastream"></a>

```typescript
public readonly sourceKinesisDataStream: Stream;
```

- *Type:* [`@aws-cdk/aws-kinesis.Stream`](#@aws-cdk/aws-kinesis.Stream)

Source must be an Amazon Kinesis Data Stream.

---

##### `deliveryInterval`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeExporterProps.property.deliveryInterval" id="awsanalyticsreferencearchitecturedatalakeexporterpropspropertydeliveryinterval"></a>

```typescript
public readonly deliveryInterval: number;
```

- *Type:* `number`
- *Default:* Set to 900 seconds

Delivery interval in seconds.

The frequency of the data delivery is defined by this interval.

---

##### `deliverySize`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeExporterProps.property.deliverySize" id="awsanalyticsreferencearchitecturedatalakeexporterpropspropertydeliverysize"></a>

```typescript
public readonly deliverySize: number;
```

- *Type:* `number`
- *Default:* Set to 128 MB

Maximum delivery size in MB.

The frequency of the data delivery is defined by this maximum delivery size.

---

### DataLakeStorageProps <a name="aws-analytics-reference-architecture.DataLakeStorageProps" id="awsanalyticsreferencearchitecturedatalakestorageprops"></a>

Properties for the DataLakeStorage Construct.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { DataLakeStorageProps } from 'aws-analytics-reference-architecture'

const dataLakeStorageProps: DataLakeStorageProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`cleanArchiveDelay`](#awsanalyticsreferencearchitecturedatalakestoragepropspropertycleanarchivedelay) | `number` | Delay (in days) before archiving CLEAN data to frozen storage (Glacier storage class). |
| [`cleanInfrequentAccessDelay`](#awsanalyticsreferencearchitecturedatalakestoragepropspropertycleaninfrequentaccessdelay) | `number` | Delay (in days) before moving CLEAN data to cold storage (Infrequent Access storage class). |
| [`rawArchiveDelay`](#awsanalyticsreferencearchitecturedatalakestoragepropspropertyrawarchivedelay) | `number` | Delay (in days) before archiving RAW data to frozen storage (Glacier storage class). |
| [`rawInfrequentAccessDelay`](#awsanalyticsreferencearchitecturedatalakestoragepropspropertyrawinfrequentaccessdelay) | `number` | Delay (in days) before moving RAW data to cold storage (Infrequent Access storage class). |
| [`transformArchiveDelay`](#awsanalyticsreferencearchitecturedatalakestoragepropspropertytransformarchivedelay) | `number` | Delay (in days) before archiving TRANSFORM data to frozen storage (Glacier storage class). |
| [`transformInfrequentAccessDelay`](#awsanalyticsreferencearchitecturedatalakestoragepropspropertytransforminfrequentaccessdelay) | `number` | Delay (in days) before moving TRANSFORM data to cold storage (Infrequent Access storage class). |

---

##### `cleanArchiveDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.cleanArchiveDelay" id="awsanalyticsreferencearchitecturedatalakestoragepropspropertycleanarchivedelay"></a>

```typescript
public readonly cleanArchiveDelay: number;
```

- *Type:* `number`
- *Default:* Objects are not archived to Glacier

Delay (in days) before archiving CLEAN data to frozen storage (Glacier storage class).

---

##### `cleanInfrequentAccessDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.cleanInfrequentAccessDelay" id="awsanalyticsreferencearchitecturedatalakestoragepropspropertycleaninfrequentaccessdelay"></a>

```typescript
public readonly cleanInfrequentAccessDelay: number;
```

- *Type:* `number`
- *Default:* Move objects to Infrequent Access after 90 days

Delay (in days) before moving CLEAN data to cold storage (Infrequent Access storage class).

---

##### `rawArchiveDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.rawArchiveDelay" id="awsanalyticsreferencearchitecturedatalakestoragepropspropertyrawarchivedelay"></a>

```typescript
public readonly rawArchiveDelay: number;
```

- *Type:* `number`
- *Default:* Move objects to Glacier after 90 days

Delay (in days) before archiving RAW data to frozen storage (Glacier storage class).

---

##### `rawInfrequentAccessDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.rawInfrequentAccessDelay" id="awsanalyticsreferencearchitecturedatalakestoragepropspropertyrawinfrequentaccessdelay"></a>

```typescript
public readonly rawInfrequentAccessDelay: number;
```

- *Type:* `number`
- *Default:* Move objects to Infrequent Access after 30 days

Delay (in days) before moving RAW data to cold storage (Infrequent Access storage class).

---

##### `transformArchiveDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.transformArchiveDelay" id="awsanalyticsreferencearchitecturedatalakestoragepropspropertytransformarchivedelay"></a>

```typescript
public readonly transformArchiveDelay: number;
```

- *Type:* `number`
- *Default:* Objects are not archived to Glacier

Delay (in days) before archiving TRANSFORM data to frozen storage (Glacier storage class).

---

##### `transformInfrequentAccessDelay`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DataLakeStorageProps.property.transformInfrequentAccessDelay" id="awsanalyticsreferencearchitecturedatalakestoragepropspropertytransforminfrequentaccessdelay"></a>

```typescript
public readonly transformInfrequentAccessDelay: number;
```

- *Type:* `number`
- *Default:* Move objects to Infrequent Access after 90 days

Delay (in days) before moving TRANSFORM data to cold storage (Infrequent Access storage class).

---

### DatasetProps <a name="aws-analytics-reference-architecture.DatasetProps" id="awsanalyticsreferencearchitecturedatasetprops"></a>

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { DatasetProps } from 'aws-analytics-reference-architecture'

const datasetProps: DatasetProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`createSourceTable`](#awsanalyticsreferencearchitecturedatasetpropspropertycreatesourcetable)<span title="Required">*</span> | `string` | The CREATE TABLE DDL command to create the source AWS Glue Table. |
| [`generateData`](#awsanalyticsreferencearchitecturedatasetpropspropertygeneratedata)<span title="Required">*</span> | `string` | The SELECT query used to generate new data. |
| [`location`](#awsanalyticsreferencearchitecturedatasetpropspropertylocation)<span title="Required">*</span> | [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location) | The Amazon S3 Location of the source dataset. |
| [`startDatetime`](#awsanalyticsreferencearchitecturedatasetpropspropertystartdatetime)<span title="Required">*</span> | `string` | The minimum datetime value in the dataset used to calculate time offset. |
| [`createTargetTable`](#awsanalyticsreferencearchitecturedatasetpropspropertycreatetargettable) | `string` | The CREATE TABLE DDL command to create the target AWS Glue Table. |

---

##### `createSourceTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.createSourceTable" id="awsanalyticsreferencearchitecturedatasetpropspropertycreatesourcetable"></a>

```typescript
public readonly createSourceTable: string;
```

- *Type:* `string`

The CREATE TABLE DDL command to create the source AWS Glue Table.

---

##### `generateData`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.generateData" id="awsanalyticsreferencearchitecturedatasetpropspropertygeneratedata"></a>

```typescript
public readonly generateData: string;
```

- *Type:* `string`

The SELECT query used to generate new data.

---

##### `location`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.location" id="awsanalyticsreferencearchitecturedatasetpropspropertylocation"></a>

```typescript
public readonly location: Location;
```

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

The Amazon S3 Location of the source dataset.

It's composed of an Amazon S3 bucketName and an Amazon S3 objectKey

---

##### `startDatetime`<sup>Required</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.startDatetime" id="awsanalyticsreferencearchitecturedatasetpropspropertystartdatetime"></a>

```typescript
public readonly startDatetime: string;
```

- *Type:* `string`

The minimum datetime value in the dataset used to calculate time offset.

---

##### `createTargetTable`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.DatasetProps.property.createTargetTable" id="awsanalyticsreferencearchitecturedatasetpropspropertycreatetargettable"></a>

```typescript
public readonly createTargetTable: string;
```

- *Type:* `string`
- *Default:* Use the same DDL as the source table

The CREATE TABLE DDL command to create the target AWS Glue Table.

---

### EmrEksClusterProps <a name="aws-analytics-reference-architecture.EmrEksClusterProps" id="awsanalyticsreferencearchitectureemreksclusterprops"></a>

The properties for the EmrEksCluster Construct class.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { EmrEksClusterProps } from 'aws-analytics-reference-architecture'

const emrEksClusterProps: EmrEksClusterProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`eksAdminRoleArn`](#awsanalyticsreferencearchitectureemreksclusterpropspropertyeksadminrolearn)<span title="Required">*</span> | `string` | Amazon IAM Role to be added to Amazon EKS master roles that will give access to kubernetes cluster from AWS console UI. |
| [`acmCertificateArn`](#awsanalyticsreferencearchitectureemreksclusterpropspropertyacmcertificatearn) | `string` | ACM Certificate ARN used with EMR on EKS managed endpoint. |
| [`eksClusterName`](#awsanalyticsreferencearchitectureemreksclusterpropspropertyeksclustername) | `string` | Name of the Amazon EKS cluster to be created. |
| [`emrEksNodegroups`](#awsanalyticsreferencearchitectureemreksclusterpropspropertyemreksnodegroups) | [`aws-analytics-reference-architecture.EmrEksNodegroup`](#aws-analytics-reference-architecture.EmrEksNodegroup)[] | List of EmrEksNodegroup to create in the cluster in addition to the default [nodegroups] {@link EmrEksNodegroup}. |
| [`emrOnEksVersion`](#awsanalyticsreferencearchitectureemreksclusterpropspropertyemroneksversion) | `string` | EMR on EKS managed endpoint version. |
| [`kubernetesVersion`](#awsanalyticsreferencearchitectureemreksclusterpropspropertykubernetesversion) | [`@aws-cdk/aws-eks.KubernetesVersion`](#@aws-cdk/aws-eks.KubernetesVersion) | Kubernetes version for Amazon EKS cluster that will be created. |

---

##### `eksAdminRoleArn`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksAdminRoleArn" id="awsanalyticsreferencearchitectureemreksclusterpropspropertyeksadminrolearn"></a>

```typescript
public readonly eksAdminRoleArn: string;
```

- *Type:* `string`

Amazon IAM Role to be added to Amazon EKS master roles that will give access to kubernetes cluster from AWS console UI.

---

##### `acmCertificateArn`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.acmCertificateArn" id="awsanalyticsreferencearchitectureemreksclusterpropspropertyacmcertificatearn"></a>

```typescript
public readonly acmCertificateArn: string;
```

- *Type:* `string`
- *Default:* generate and import certificate using locally installed openssl utility

ACM Certificate ARN used with EMR on EKS managed endpoint.

---

##### `eksClusterName`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.eksClusterName" id="awsanalyticsreferencearchitectureemreksclusterpropspropertyeksclustername"></a>

```typescript
public readonly eksClusterName: string;
```

- *Type:* `string`
- *Default:* automatically generated cluster name

Name of the Amazon EKS cluster to be created.

---

##### `emrEksNodegroups`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.emrEksNodegroups" id="awsanalyticsreferencearchitectureemreksclusterpropspropertyemreksnodegroups"></a>

```typescript
public readonly emrEksNodegroups: EmrEksNodegroup[];
```

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroup`](#aws-analytics-reference-architecture.EmrEksNodegroup)[]
- *Default:* Don't create additional nodegroups

List of EmrEksNodegroup to create in the cluster in addition to the default [nodegroups] {@link EmrEksNodegroup}.

---

##### `emrOnEksVersion`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.emrOnEksVersion" id="awsanalyticsreferencearchitectureemreksclusterpropspropertyemroneksversion"></a>

```typescript
public readonly emrOnEksVersion: string;
```

- *Type:* `string`
- *Default:* emr-6.3.0-latest

EMR on EKS managed endpoint version.

---

##### `kubernetesVersion`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksClusterProps.property.kubernetesVersion" id="awsanalyticsreferencearchitectureemreksclusterpropspropertykubernetesversion"></a>

```typescript
public readonly kubernetesVersion: KubernetesVersion;
```

- *Type:* [`@aws-cdk/aws-eks.KubernetesVersion`](#@aws-cdk/aws-eks.KubernetesVersion)
- *Default:* v1.20 version is used

Kubernetes version for Amazon EKS cluster that will be created.

---

### EmrEksNodegroupOptions <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions" id="awsanalyticsreferencearchitectureemreksnodegroupoptions"></a>

The Options for adding EmrEksNodegroup to an EmrEksCluster.

Some of the Amazon EKS Nodegroup parameters are overriden: -  NodegroupName by the id and an index per AZ -  LaunchTemplate spec -  SubnetList by either the subnet parameter or one subnet per Amazon EKS Cluster AZ.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { EmrEksNodegroupOptions } from 'aws-analytics-reference-architecture'

const emrEksNodegroupOptions: EmrEksNodegroupOptions = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`amiType`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyamitype) | [`@aws-cdk/aws-eks.NodegroupAmiType`](#@aws-cdk/aws-eks.NodegroupAmiType) | The AMI type for your node group. |
| [`capacityType`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertycapacitytype) | [`@aws-cdk/aws-eks.CapacityType`](#@aws-cdk/aws-eks.CapacityType) | The capacity type of the nodegroup. |
| [`desiredSize`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertydesiredsize) | `number` | The current number of worker nodes that the managed node group should maintain. |
| [`diskSize`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertydisksize) | `number` | The root device disk size (in GiB) for your node group instances. |
| [`forceUpdate`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyforceupdate) | `boolean` | Force the update if the existing node group's pods are unable to be drained due to a pod disruption budget issue. |
| [`instanceType`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyinstancetype) | [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType) | The instance type to use for your node group. |
| [`instanceTypes`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyinstancetypes) | [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)[] | The instance types to use for your node group. |
| [`labels`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertylabels) | {[ key: string ]: `string`} | The Kubernetes labels to be applied to the nodes in the node group when they are created. |
| [`launchTemplateSpec`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertylaunchtemplatespec) | [`@aws-cdk/aws-eks.LaunchTemplateSpec`](#@aws-cdk/aws-eks.LaunchTemplateSpec) | Launch template specification used for the nodegroup. |
| [`maxSize`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertymaxsize) | `number` | The maximum number of worker nodes that the managed node group can scale out to. |
| [`minSize`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyminsize) | `number` | The minimum number of worker nodes that the managed node group can scale in to. |
| [`nodegroupName`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertynodegroupname) | `string` | Name of the Nodegroup. |
| [`nodeRole`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertynoderole) | [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole) | The IAM role to associate with your node group. |
| [`releaseVersion`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyreleaseversion) | `string` | The AMI version of the Amazon EKS-optimized AMI to use with your node group (for example, `1.14.7-YYYYMMDD`). |
| [`remoteAccess`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyremoteaccess) | [`@aws-cdk/aws-eks.NodegroupRemoteAccess`](#@aws-cdk/aws-eks.NodegroupRemoteAccess) | The remote access (SSH) configuration to use with your node group. |
| [`subnets`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertysubnets) | [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection) | The subnets to use for the Auto Scaling group that is created for your node group. |
| [`tags`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertytags) | {[ key: string ]: `string`} | The metadata to apply to the node group to assist with categorization and organization. |
| [`taints`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertytaints) | [`@aws-cdk/aws-eks.TaintSpec`](#@aws-cdk/aws-eks.TaintSpec)[] | The Kubernetes taints to be applied to the nodes in the node group when they are created. |
| [`id`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyid)<span title="Required">*</span> | `string` | Nodegroup ID. |
| [`mountNvme`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertymountnvme) | `boolean` | Set to true if using instance types with local NVMe drives to mount them automatically at boot time. |
| [`subnet`](#awsanalyticsreferencearchitectureemreksnodegroupoptionspropertysubnet) | [`@aws-cdk/aws-ec2.ISubnet`](#@aws-cdk/aws-ec2.ISubnet) | Configure the Amazon EKS NodeGroup in this subnet. |

---

##### `amiType`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.amiType" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyamitype"></a>

```typescript
public readonly amiType: NodegroupAmiType;
```

- *Type:* [`@aws-cdk/aws-eks.NodegroupAmiType`](#@aws-cdk/aws-eks.NodegroupAmiType)
- *Default:* auto-determined from the instanceTypes property.

The AMI type for your node group.

---

##### `capacityType`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.capacityType" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertycapacitytype"></a>

```typescript
public readonly capacityType: CapacityType;
```

- *Type:* [`@aws-cdk/aws-eks.CapacityType`](#@aws-cdk/aws-eks.CapacityType)
- *Default:* ON_DEMAND

The capacity type of the nodegroup.

---

##### `desiredSize`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.desiredSize" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertydesiredsize"></a>

```typescript
public readonly desiredSize: number;
```

- *Type:* `number`
- *Default:* 2

The current number of worker nodes that the managed node group should maintain.

If not specified, the nodewgroup will initially create `minSize` instances.

---

##### `diskSize`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.diskSize" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertydisksize"></a>

```typescript
public readonly diskSize: number;
```

- *Type:* `number`
- *Default:* 20

The root device disk size (in GiB) for your node group instances.

---

##### `forceUpdate`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.forceUpdate" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyforceupdate"></a>

```typescript
public readonly forceUpdate: boolean;
```

- *Type:* `boolean`
- *Default:* true

Force the update if the existing node group's pods are unable to be drained due to a pod disruption budget issue.

If an update fails because pods could not be drained, you can force the update after it fails to terminate the old node whether or not any pods are running on the node.

---

##### ~~`instanceType`~~<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceType" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyinstancetype"></a>

- *Deprecated:* Use `instanceTypes` instead.

```typescript
public readonly instanceType: InstanceType;
```

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)
- *Default:* t3.medium

The instance type to use for your node group.

Currently, you can specify a single instance type for a node group. The default value for this parameter is `t3.medium`. If you choose a GPU instance type, be sure to specify the `AL2_x86_64_GPU` with the amiType parameter.

---

##### `instanceTypes`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.instanceTypes" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyinstancetypes"></a>

```typescript
public readonly instanceTypes: InstanceType[];
```

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)[]
- *Default:* t3.medium will be used according to the cloudformation document.

The instance types to use for your node group.

> - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-eks-nodegroup.html#cfn-eks-nodegroup-instancetypes

---

##### `labels`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.labels" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertylabels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}
- *Default:* None

The Kubernetes labels to be applied to the nodes in the node group when they are created.

---

##### `launchTemplateSpec`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.launchTemplateSpec" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertylaunchtemplatespec"></a>

```typescript
public readonly launchTemplateSpec: LaunchTemplateSpec;
```

- *Type:* [`@aws-cdk/aws-eks.LaunchTemplateSpec`](#@aws-cdk/aws-eks.LaunchTemplateSpec)
- *Default:* no launch template

Launch template specification used for the nodegroup.

> - https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html

---

##### `maxSize`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.maxSize" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertymaxsize"></a>

```typescript
public readonly maxSize: number;
```

- *Type:* `number`
- *Default:* desiredSize

The maximum number of worker nodes that the managed node group can scale out to.

Managed node groups can support up to 100 nodes by default.

---

##### `minSize`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.minSize" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyminsize"></a>

```typescript
public readonly minSize: number;
```

- *Type:* `number`
- *Default:* 1

The minimum number of worker nodes that the managed node group can scale in to.

This number must be greater than or equal to zero.

---

##### `nodegroupName`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodegroupName" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertynodegroupname"></a>

```typescript
public readonly nodegroupName: string;
```

- *Type:* `string`
- *Default:* resource ID

Name of the Nodegroup.

---

##### `nodeRole`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.nodeRole" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertynoderole"></a>

```typescript
public readonly nodeRole: IRole;
```

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)
- *Default:* None. Auto-generated if not specified.

The IAM role to associate with your node group.

The Amazon EKS worker node kubelet daemon makes calls to AWS APIs on your behalf. Worker nodes receive permissions for these API calls through an IAM instance profile and associated policies. Before you can launch worker nodes and register them into a cluster, you must create an IAM role for those worker nodes to use when they are launched.

---

##### `releaseVersion`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.releaseVersion" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyreleaseversion"></a>

```typescript
public readonly releaseVersion: string;
```

- *Type:* `string`
- *Default:* The latest available AMI version for the node group's current Kubernetes version is used.

The AMI version of the Amazon EKS-optimized AMI to use with your node group (for example, `1.14.7-YYYYMMDD`).

---

##### `remoteAccess`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.remoteAccess" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyremoteaccess"></a>

```typescript
public readonly remoteAccess: NodegroupRemoteAccess;
```

- *Type:* [`@aws-cdk/aws-eks.NodegroupRemoteAccess`](#@aws-cdk/aws-eks.NodegroupRemoteAccess)
- *Default:* disabled

The remote access (SSH) configuration to use with your node group.

Disabled by default, however, if you specify an Amazon EC2 SSH key but do not specify a source security group when you create a managed node group, then port 22 on the worker nodes is opened to the internet (0.0.0.0/0)

---

##### `subnets`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnets" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertysubnets"></a>

```typescript
public readonly subnets: SubnetSelection;
```

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* private subnets

The subnets to use for the Auto Scaling group that is created for your node group.

By specifying the SubnetSelection, the selected subnets will automatically apply required tags i.e. `kubernetes.io/cluster/CLUSTER_NAME` with a value of `shared`, where `CLUSTER_NAME` is replaced with the name of your cluster.

---

##### `tags`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.tags" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertytags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}
- *Default:* None

The metadata to apply to the node group to assist with categorization and organization.

Each tag consists of a key and an optional value, both of which you define. Node group tags do not propagate to any other resources associated with the node group, such as the Amazon EC2 instances or subnets.

---

##### `taints`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.taints" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertytaints"></a>

```typescript
public readonly taints: TaintSpec[];
```

- *Type:* [`@aws-cdk/aws-eks.TaintSpec`](#@aws-cdk/aws-eks.TaintSpec)[]
- *Default:* None

The Kubernetes taints to be applied to the nodes in the node group when they are created.

---

##### `id`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.id" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertyid"></a>

```typescript
public readonly id: string;
```

- *Type:* `string`

Nodegroup ID.

---

##### `mountNvme`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.mountNvme" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertymountnvme"></a>

```typescript
public readonly mountNvme: boolean;
```

- *Type:* `boolean`
- *Default:* false

Set to true if using instance types with local NVMe drives to mount them automatically at boot time.

---

##### `subnet`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrEksNodegroupOptions.property.subnet" id="awsanalyticsreferencearchitectureemreksnodegroupoptionspropertysubnet"></a>

```typescript
public readonly subnet: ISubnet;
```

- *Type:* [`@aws-cdk/aws-ec2.ISubnet`](#@aws-cdk/aws-ec2.ISubnet)
- *Default:* One NodeGroup is deployed per cluster AZ

Configure the Amazon EKS NodeGroup in this subnet.

Use this setting for resource dependencies like an Amazon RD

---

### EmrVirtualClusterProps <a name="aws-analytics-reference-architecture.EmrVirtualClusterProps" id="awsanalyticsreferencearchitectureemrvirtualclusterprops"></a>

The properties for the EmrVirtualCluster Construct class.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { EmrVirtualClusterProps } from 'aws-analytics-reference-architecture'

const emrVirtualClusterProps: EmrVirtualClusterProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`name`](#awsanalyticsreferencearchitectureemrvirtualclusterpropspropertyname)<span title="Required">*</span> | `string` | name of the  EmrVirtualCluster to be created. |
| [`createNamespace`](#awsanalyticsreferencearchitectureemrvirtualclusterpropspropertycreatenamespace) | `boolean` | creates EKS namespace. |
| [`eksNamespace`](#awsanalyticsreferencearchitectureemrvirtualclusterpropspropertyeksnamespace) | `string` | name of the  EKS namespace to be linked to the EMR virtual Cluster. |

---

##### `name`<sup>Required</sup> <a name="aws-analytics-reference-architecture.EmrVirtualClusterProps.property.name" id="awsanalyticsreferencearchitectureemrvirtualclusterpropspropertyname"></a>

```typescript
public readonly name: string;
```

- *Type:* `string`

name of the  EmrVirtualCluster to be created.

---

##### `createNamespace`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrVirtualClusterProps.property.createNamespace" id="awsanalyticsreferencearchitectureemrvirtualclusterpropspropertycreatenamespace"></a>

```typescript
public readonly createNamespace: boolean;
```

- *Type:* `boolean`
- *Default:* Do not create the namespace

creates EKS namespace.

---

##### `eksNamespace`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.EmrVirtualClusterProps.property.eksNamespace" id="awsanalyticsreferencearchitectureemrvirtualclusterpropspropertyeksnamespace"></a>

```typescript
public readonly eksNamespace: string;
```

- *Type:* `string`
- *Default:* Use the default namespace

name of the  EKS namespace to be linked to the EMR virtual Cluster.

---

### ExampleProps <a name="aws-analytics-reference-architecture.ExampleProps" id="awsanalyticsreferencearchitectureexampleprops"></a>

The properties for the Example Construct class.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { ExampleProps } from 'aws-analytics-reference-architecture'

const exampleProps: ExampleProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`name`](#awsanalyticsreferencearchitectureexamplepropspropertyname) | `string` | Name used to qualify the CfnOutput in the Stack. |
| [`value`](#awsanalyticsreferencearchitectureexamplepropspropertyvalue) | `string` | Value used in the CfnOutput in the Stack. |

---

##### `name`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.ExampleProps.property.name" id="awsanalyticsreferencearchitectureexamplepropspropertyname"></a>

```typescript
public readonly name: string;
```

- *Type:* `string`
- *Default:* Set to 'defaultMessage' if not provided

Name used to qualify the CfnOutput in the Stack.

---

##### `value`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.ExampleProps.property.value" id="awsanalyticsreferencearchitectureexamplepropspropertyvalue"></a>

```typescript
public readonly value: string;
```

- *Type:* `string`
- *Default:* Set to 'defaultValue!' if not provided

Value used in the CfnOutput in the Stack.

---

### FlywayRunnerProps <a name="aws-analytics-reference-architecture.FlywayRunnerProps" id="awsanalyticsreferencearchitectureflywayrunnerprops"></a>

Properties needed to run flyway migration scripts.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { FlywayRunnerProps } from 'aws-analytics-reference-architecture'

const flywayRunnerProps: FlywayRunnerProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`cluster`](#awsanalyticsreferencearchitectureflywayrunnerpropspropertycluster)<span title="Required">*</span> | [`@aws-cdk/aws-redshift.Cluster`](#@aws-cdk/aws-redshift.Cluster) | The cluster to run migration scripts against. |
| [`databaseName`](#awsanalyticsreferencearchitectureflywayrunnerpropspropertydatabasename)<span title="Required">*</span> | `string` | The database name to run migration scripts against. |
| [`migrationScriptsFolderAbsolutePath`](#awsanalyticsreferencearchitectureflywayrunnerpropspropertymigrationscriptsfolderabsolutepath)<span title="Required">*</span> | `string` | The absolute path to the flyway migration scripts. |
| [`vpc`](#awsanalyticsreferencearchitectureflywayrunnerpropspropertyvpc)<span title="Required">*</span> | [`@aws-cdk/aws-ec2.Vpc`](#@aws-cdk/aws-ec2.Vpc) | The vpc hosting the cluster. |
| [`logRetention`](#awsanalyticsreferencearchitectureflywayrunnerpropspropertylogretention) | [`@aws-cdk/aws-logs.RetentionDays`](#@aws-cdk/aws-logs.RetentionDays) | Period to keep the logs around. |
| [`replaceDictionary`](#awsanalyticsreferencearchitectureflywayrunnerpropspropertyreplacedictionary) | {[ key: string ]: `string`} | A key-value map of string (encapsulated between `${` and `}`) to replace in the SQL files given. |

---

##### `cluster`<sup>Required</sup> <a name="aws-analytics-reference-architecture.FlywayRunnerProps.property.cluster" id="awsanalyticsreferencearchitectureflywayrunnerpropspropertycluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* [`@aws-cdk/aws-redshift.Cluster`](#@aws-cdk/aws-redshift.Cluster)

The cluster to run migration scripts against.

---

##### `databaseName`<sup>Required</sup> <a name="aws-analytics-reference-architecture.FlywayRunnerProps.property.databaseName" id="awsanalyticsreferencearchitectureflywayrunnerpropspropertydatabasename"></a>

```typescript
public readonly databaseName: string;
```

- *Type:* `string`

The database name to run migration scripts against.

---

##### `migrationScriptsFolderAbsolutePath`<sup>Required</sup> <a name="aws-analytics-reference-architecture.FlywayRunnerProps.property.migrationScriptsFolderAbsolutePath" id="awsanalyticsreferencearchitectureflywayrunnerpropspropertymigrationscriptsfolderabsolutepath"></a>

```typescript
public readonly migrationScriptsFolderAbsolutePath: string;
```

- *Type:* `string`

The absolute path to the flyway migration scripts.

Those scripts needs to follow expected flyway naming convention.

> https://flywaydb.org/documentation/concepts/migrations.html#sql-based-migrations for more details.

---

##### `vpc`<sup>Required</sup> <a name="aws-analytics-reference-architecture.FlywayRunnerProps.property.vpc" id="awsanalyticsreferencearchitectureflywayrunnerpropspropertyvpc"></a>

```typescript
public readonly vpc: Vpc;
```

- *Type:* [`@aws-cdk/aws-ec2.Vpc`](#@aws-cdk/aws-ec2.Vpc)

The vpc hosting the cluster.

---

##### `logRetention`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.FlywayRunnerProps.property.logRetention" id="awsanalyticsreferencearchitectureflywayrunnerpropspropertylogretention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* [`@aws-cdk/aws-logs.RetentionDays`](#@aws-cdk/aws-logs.RetentionDays)
- *Default:* logs.RetentionDays.ONE_DAY (1 day)

Period to keep the logs around.

---

##### `replaceDictionary`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.FlywayRunnerProps.property.replaceDictionary" id="awsanalyticsreferencearchitectureflywayrunnerpropspropertyreplacedictionary"></a>

```typescript
public readonly replaceDictionary: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}

A key-value map of string (encapsulated between `${` and `}`) to replace in the SQL files given.

Example:  * The SQL file:     ```sql    SELECT * FROM ${TABLE_NAME};    ``` * The replacement map:     ```typescript    replaceDictionary = {      TABLE_NAME: 'my_table'    }    ```

---

### SynchronousAthenaQueryProps <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps" id="awsanalyticsreferencearchitecturesynchronousathenaqueryprops"></a>

The properties for SynchronousAthenaQuery Construct.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { SynchronousAthenaQueryProps } from 'aws-analytics-reference-architecture'

const synchronousAthenaQueryProps: SynchronousAthenaQueryProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`resultPath`](#awsanalyticsreferencearchitecturesynchronousathenaquerypropspropertyresultpath)<span title="Required">*</span> | [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location) | The Amazon S3 Location for the query results (without trailing slash). |
| [`statement`](#awsanalyticsreferencearchitecturesynchronousathenaquerypropspropertystatement)<span title="Required">*</span> | `string` | The name of the Athena query to execute. |
| [`executionRoleStatements`](#awsanalyticsreferencearchitecturesynchronousathenaquerypropspropertyexecutionrolestatements) | [`@aws-cdk/aws-iam.PolicyStatement`](#@aws-cdk/aws-iam.PolicyStatement)[] | The Amazon IAM Policy Statements used to run the query. |
| [`timeout`](#awsanalyticsreferencearchitecturesynchronousathenaquerypropspropertytimeout) | `number` | The timeout in seconds to wait for query success. |

---

##### `resultPath`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.resultPath" id="awsanalyticsreferencearchitecturesynchronousathenaquerypropspropertyresultpath"></a>

```typescript
public readonly resultPath: Location;
```

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

The Amazon S3 Location for the query results (without trailing slash).

---

##### `statement`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.statement" id="awsanalyticsreferencearchitecturesynchronousathenaquerypropspropertystatement"></a>

```typescript
public readonly statement: string;
```

- *Type:* `string`

The name of the Athena query to execute.

---

##### `executionRoleStatements`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.executionRoleStatements" id="awsanalyticsreferencearchitecturesynchronousathenaquerypropspropertyexecutionrolestatements"></a>

```typescript
public readonly executionRoleStatements: PolicyStatement[];
```

- *Type:* [`@aws-cdk/aws-iam.PolicyStatement`](#@aws-cdk/aws-iam.PolicyStatement)[]
- *Default:* No Policy Statements are added to the execution role

The Amazon IAM Policy Statements used to run the query.

---

##### `timeout`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SynchronousAthenaQueryProps.property.timeout" id="awsanalyticsreferencearchitecturesynchronousathenaquerypropspropertytimeout"></a>

```typescript
public readonly timeout: number;
```

- *Type:* `number`
- *Default:* 60 seconds

The timeout in seconds to wait for query success.

---

### SynchronousCrawlerProps <a name="aws-analytics-reference-architecture.SynchronousCrawlerProps" id="awsanalyticsreferencearchitecturesynchronouscrawlerprops"></a>

The properties for SynchronousCrawler Construct.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { SynchronousCrawlerProps } from 'aws-analytics-reference-architecture'

const synchronousCrawlerProps: SynchronousCrawlerProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`crawlerName`](#awsanalyticsreferencearchitecturesynchronouscrawlerpropspropertycrawlername)<span title="Required">*</span> | `string` | The name of the Crawler to use. |
| [`timeout`](#awsanalyticsreferencearchitecturesynchronouscrawlerpropspropertytimeout) | `number` | The timeout in seconds to wait for the Crawler success. |

---

##### `crawlerName`<sup>Required</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawlerProps.property.crawlerName" id="awsanalyticsreferencearchitecturesynchronouscrawlerpropspropertycrawlername"></a>

```typescript
public readonly crawlerName: string;
```

- *Type:* `string`

The name of the Crawler to use.

---

##### `timeout`<sup>Optional</sup> <a name="aws-analytics-reference-architecture.SynchronousCrawlerProps.property.timeout" id="awsanalyticsreferencearchitecturesynchronouscrawlerpropspropertytimeout"></a>

```typescript
public readonly timeout: number;
```

- *Type:* `number`
- *Default:* 300 seconds

The timeout in seconds to wait for the Crawler success.

---

## Classes <a name="Classes" id="classes"></a>

### Dataset <a name="aws-analytics-reference-architecture.Dataset" id="awsanalyticsreferencearchitecturedataset"></a>

Dataset enum-like class providing pre-defined datasets metadata and custom dataset creation.

#### Initializers <a name="aws-analytics-reference-architecture.Dataset.Initializer" id="awsanalyticsreferencearchitecturedatasetinitializer"></a>

```typescript
import { Dataset } from 'aws-analytics-reference-architecture'

new Dataset(props: DatasetProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`props`](#awsanalyticsreferencearchitecturedatasetparameterprops)<span title="Required">*</span> | [`aws-analytics-reference-architecture.DatasetProps`](#aws-analytics-reference-architecture.DatasetProps) | the DatasetProps. |

---

##### `props`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.props" id="awsanalyticsreferencearchitecturedatasetparameterprops"></a>

- *Type:* [`aws-analytics-reference-architecture.DatasetProps`](#aws-analytics-reference-architecture.DatasetProps)

the DatasetProps.

---

#### Methods <a name="Methods" id="methods"></a>

| **Name** | **Description** |
| --- | --- |
| [`parseCreateSourceQuery`](#awsanalyticsreferencearchitecturedatasetparsecreatesourcequery) | Parse the CREATE TABLE statement template for the source. |
| [`parseCreateTargetQuery`](#awsanalyticsreferencearchitecturedatasetparsecreatetargetquery) | Parse the CREATE TABLE statement template for the source. |
| [`parseGenerateQuery`](#awsanalyticsreferencearchitecturedatasetparsegeneratequery) | Parse the CREATE TABLE statement template for the target. |

---

##### `parseCreateSourceQuery` <a name="aws-analytics-reference-architecture.Dataset.parseCreateSourceQuery" id="awsanalyticsreferencearchitecturedatasetparsecreatesourcequery"></a>

```typescript
public parseCreateSourceQuery(database: string, table: string, bucket: string, key: string)
```

###### `database`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.database" id="awsanalyticsreferencearchitecturedatasetparameterdatabase"></a>

- *Type:* `string`

the database name to parse.

---

###### `table`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.table" id="awsanalyticsreferencearchitecturedatasetparametertable"></a>

- *Type:* `string`

the table name to parse.

---

###### `bucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.bucket" id="awsanalyticsreferencearchitecturedatasetparameterbucket"></a>

- *Type:* `string`

the bucket name to parse.

---

###### `key`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.key" id="awsanalyticsreferencearchitecturedatasetparameterkey"></a>

- *Type:* `string`

the key to parse.

---

##### `parseCreateTargetQuery` <a name="aws-analytics-reference-architecture.Dataset.parseCreateTargetQuery" id="awsanalyticsreferencearchitecturedatasetparsecreatetargetquery"></a>

```typescript
public parseCreateTargetQuery(database: string, table: string, bucket: string, key: string)
```

###### `database`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.database" id="awsanalyticsreferencearchitecturedatasetparameterdatabase"></a>

- *Type:* `string`

the database name to parse.

---

###### `table`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.table" id="awsanalyticsreferencearchitecturedatasetparametertable"></a>

- *Type:* `string`

the table name to parse.

---

###### `bucket`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.bucket" id="awsanalyticsreferencearchitecturedatasetparameterbucket"></a>

- *Type:* `string`

the bucket name to parse.

---

###### `key`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.key" id="awsanalyticsreferencearchitecturedatasetparameterkey"></a>

- *Type:* `string`

the key to parse.

---

##### `parseGenerateQuery` <a name="aws-analytics-reference-architecture.Dataset.parseGenerateQuery" id="awsanalyticsreferencearchitecturedatasetparsegeneratequery"></a>

```typescript
public parseGenerateQuery(database: string, sourceTable: string, targetTable: string)
```

###### `database`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.database" id="awsanalyticsreferencearchitecturedatasetparameterdatabase"></a>

- *Type:* `string`

the database name to parse.

---

###### `sourceTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.sourceTable" id="awsanalyticsreferencearchitecturedatasetparametersourcetable"></a>

- *Type:* `string`

the source table name to parse.

---

###### `targetTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.parameter.targetTable" id="awsanalyticsreferencearchitecturedatasetparametertargettable"></a>

- *Type:* `string`

the target table name to parse.

---


#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`createSourceTable`](#awsanalyticsreferencearchitecturedatasetpropertycreatesourcetable)<span title="Required">*</span> | `string` | The CREATE TABLE DDL command to create the source AWS Glue Table. |
| [`createTargetTable`](#awsanalyticsreferencearchitecturedatasetpropertycreatetargettable)<span title="Required">*</span> | `string` | The CREATE TABLE DDL command to create the target AWS Glue Table. |
| [`generateData`](#awsanalyticsreferencearchitecturedatasetpropertygeneratedata)<span title="Required">*</span> | `string` | The SELECT query used to generate new data. |
| [`location`](#awsanalyticsreferencearchitecturedatasetpropertylocation)<span title="Required">*</span> | [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location) | The Amazon S3 Location of the source dataset. |
| [`offset`](#awsanalyticsreferencearchitecturedatasetpropertyoffset)<span title="Required">*</span> | `number` | The offset of the Dataset (difference between min datetime and now) in Seconds. |
| [`tableName`](#awsanalyticsreferencearchitecturedatasetpropertytablename)<span title="Required">*</span> | `string` | The name of the SQL table extracted from path. |

---

##### `createSourceTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.createSourceTable" id="awsanalyticsreferencearchitecturedatasetpropertycreatesourcetable"></a>

```typescript
public readonly createSourceTable: string;
```

- *Type:* `string`

The CREATE TABLE DDL command to create the source AWS Glue Table.

---

##### `createTargetTable`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.createTargetTable" id="awsanalyticsreferencearchitecturedatasetpropertycreatetargettable"></a>

```typescript
public readonly createTargetTable: string;
```

- *Type:* `string`

The CREATE TABLE DDL command to create the target AWS Glue Table.

---

##### `generateData`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.generateData" id="awsanalyticsreferencearchitecturedatasetpropertygeneratedata"></a>

```typescript
public readonly generateData: string;
```

- *Type:* `string`

The SELECT query used to generate new data.

---

##### `location`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.location" id="awsanalyticsreferencearchitecturedatasetpropertylocation"></a>

```typescript
public readonly location: Location;
```

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)

The Amazon S3 Location of the source dataset.

---

##### `offset`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.offset" id="awsanalyticsreferencearchitecturedatasetpropertyoffset"></a>

```typescript
public readonly offset: number;
```

- *Type:* `number`

The offset of the Dataset (difference between min datetime and now) in Seconds.

---

##### `tableName`<sup>Required</sup> <a name="aws-analytics-reference-architecture.Dataset.property.tableName" id="awsanalyticsreferencearchitecturedatasetpropertytablename"></a>

```typescript
public readonly tableName: string;
```

- *Type:* `string`

The name of the SQL table extracted from path.

---

#### Constants <a name="Constants" id="constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`DATASETS_BUCKET`](#awsanalyticsreferencearchitecturedatasetpropertydatasetsbucket)<span title="Required">*</span> | `string` | The bucket name of the AWS Analytics Reference Architecture datasets. |
| [`RETAIL_100GB_CUSTOMER`](#awsanalyticsreferencearchitecturedatasetpropertyretail100gbcustomer)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The customer dataset part of 100GB retail datasets. |
| [`RETAIL_100GB_CUSTOMER_ADDRESS`](#awsanalyticsreferencearchitecturedatasetpropertyretail100gbcustomeraddress)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The customer address dataset part of 100GB retail datasets. |
| [`RETAIL_100GB_ITEM`](#awsanalyticsreferencearchitecturedatasetpropertyretail100gbitem)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The item dataset part of 100GB retail datasets. |
| [`RETAIL_100GB_PROMO`](#awsanalyticsreferencearchitecturedatasetpropertyretail100gbpromo)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The promotion dataset part of 100GB retail datasets. |
| [`RETAIL_100GB_STORE`](#awsanalyticsreferencearchitecturedatasetpropertyretail100gbstore)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The store dataset part of 100GB retail datasets. |
| [`RETAIL_100GB_STORE_SALE`](#awsanalyticsreferencearchitecturedatasetpropertyretail100gbstoresale)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The store sale dataset part of 100GB retail datasets. |
| [`RETAIL_100GB_WAREHOUSE`](#awsanalyticsreferencearchitecturedatasetpropertyretail100gbwarehouse)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The warehouse dataset part 100GB of retail datasets. |
| [`RETAIL_100GB_WEB_SALE`](#awsanalyticsreferencearchitecturedatasetpropertyretail100gbwebsale)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The web sale dataset part of 100GB retail datasets. |
| [`RETAIL_1GB_CUSTOMER`](#awsanalyticsreferencearchitecturedatasetpropertyretail1gbcustomer)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The customer dataset part of 1GB retail datasets. |
| [`RETAIL_1GB_CUSTOMER_ADDRESS`](#awsanalyticsreferencearchitecturedatasetpropertyretail1gbcustomeraddress)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The customer address dataset part of 1GB retail datasets. |
| [`RETAIL_1GB_ITEM`](#awsanalyticsreferencearchitecturedatasetpropertyretail1gbitem)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The item dataset part of 1GB retail datasets. |
| [`RETAIL_1GB_PROMO`](#awsanalyticsreferencearchitecturedatasetpropertyretail1gbpromo)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The promotion dataset part of 1GB retail datasets. |
| [`RETAIL_1GB_STORE`](#awsanalyticsreferencearchitecturedatasetpropertyretail1gbstore)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The store dataset part of 1GB retail datasets. |
| [`RETAIL_1GB_STORE_SALE`](#awsanalyticsreferencearchitecturedatasetpropertyretail1gbstoresale)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The store sale dataset part of 1GB retail datasets. |
| [`RETAIL_1GB_WAREHOUSE`](#awsanalyticsreferencearchitecturedatasetpropertyretail1gbwarehouse)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The warehouse dataset part of 1GB retail datasets. |
| [`RETAIL_1GB_WEB_SALE`](#awsanalyticsreferencearchitecturedatasetpropertyretail1gbwebsale)<span title="Required">*</span> | [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset) | The web sale dataset part of 1GB retail datasets. |

---

##### `DATASETS_BUCKET` <a name="aws-analytics-reference-architecture.Dataset.property.DATASETS_BUCKET" id="awsanalyticsreferencearchitecturedatasetpropertydatasetsbucket"></a>

- *Type:* `string`

The bucket name of the AWS Analytics Reference Architecture datasets.

---

##### `RETAIL_100GB_CUSTOMER` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_CUSTOMER" id="awsanalyticsreferencearchitecturedatasetpropertyretail100gbcustomer"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_CUSTOMER_ADDRESS` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_CUSTOMER_ADDRESS" id="awsanalyticsreferencearchitecturedatasetpropertyretail100gbcustomeraddress"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer address dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_ITEM` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_ITEM" id="awsanalyticsreferencearchitecturedatasetpropertyretail100gbitem"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The item dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_PROMO` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_PROMO" id="awsanalyticsreferencearchitecturedatasetpropertyretail100gbpromo"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The promotion dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_STORE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_STORE" id="awsanalyticsreferencearchitecturedatasetpropertyretail100gbstore"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_STORE_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_STORE_SALE" id="awsanalyticsreferencearchitecturedatasetpropertyretail100gbstoresale"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store sale dataset part of 100GB retail datasets.

---

##### `RETAIL_100GB_WAREHOUSE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_WAREHOUSE" id="awsanalyticsreferencearchitecturedatasetpropertyretail100gbwarehouse"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The warehouse dataset part 100GB of retail datasets.

---

##### `RETAIL_100GB_WEB_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_100GB_WEB_SALE" id="awsanalyticsreferencearchitecturedatasetpropertyretail100gbwebsale"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The web sale dataset part of 100GB retail datasets.

---

##### `RETAIL_1GB_CUSTOMER` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_CUSTOMER" id="awsanalyticsreferencearchitecturedatasetpropertyretail1gbcustomer"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_CUSTOMER_ADDRESS` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_CUSTOMER_ADDRESS" id="awsanalyticsreferencearchitecturedatasetpropertyretail1gbcustomeraddress"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The customer address dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_ITEM` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_ITEM" id="awsanalyticsreferencearchitecturedatasetpropertyretail1gbitem"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The item dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_PROMO` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_PROMO" id="awsanalyticsreferencearchitecturedatasetpropertyretail1gbpromo"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The promotion dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_STORE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_STORE" id="awsanalyticsreferencearchitecturedatasetpropertyretail1gbstore"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_STORE_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_STORE_SALE" id="awsanalyticsreferencearchitecturedatasetpropertyretail1gbstoresale"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The store sale dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_WAREHOUSE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_WAREHOUSE" id="awsanalyticsreferencearchitecturedatasetpropertyretail1gbwarehouse"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The warehouse dataset part of 1GB retail datasets.

---

##### `RETAIL_1GB_WEB_SALE` <a name="aws-analytics-reference-architecture.Dataset.property.RETAIL_1GB_WEB_SALE" id="awsanalyticsreferencearchitecturedatasetpropertyretail1gbwebsale"></a>

- *Type:* [`aws-analytics-reference-architecture.Dataset`](#aws-analytics-reference-architecture.Dataset)

The web sale dataset part of 1GB retail datasets.

---

### EmrEksNodegroup <a name="aws-analytics-reference-architecture.EmrEksNodegroup" id="awsanalyticsreferencearchitectureemreksnodegroup"></a>

#### Initializers <a name="aws-analytics-reference-architecture.EmrEksNodegroup.Initializer" id="awsanalyticsreferencearchitectureemreksnodegroupinitializer"></a>

```typescript
import { EmrEksNodegroup } from 'aws-analytics-reference-architecture'

new EmrEksNodegroup()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---




#### Constants <a name="Constants" id="constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`CRITICAL_ALL`](#awsanalyticsreferencearchitectureemreksnodegrouppropertycriticalall)<span title="Required">*</span> | [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions) | *No description.* |
| [`NOTEBOOK_DRIVER`](#awsanalyticsreferencearchitectureemreksnodegrouppropertynotebookdriver)<span title="Required">*</span> | [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions) | *No description.* |
| [`NOTEBOOK_EXECUTOR`](#awsanalyticsreferencearchitectureemreksnodegrouppropertynotebookexecutor)<span title="Required">*</span> | [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions) | Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS. |
| [`NOTEBOOK_WITHOUT_PODTEMPLATE`](#awsanalyticsreferencearchitectureemreksnodegrouppropertynotebookwithoutpodtemplate)<span title="Required">*</span> | [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions) | *No description.* |
| [`SHARED_DRIVER`](#awsanalyticsreferencearchitectureemreksnodegrouppropertyshareddriver)<span title="Required">*</span> | [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions) | *No description.* |
| [`SHARED_EXECUTOR`](#awsanalyticsreferencearchitectureemreksnodegrouppropertysharedexecutor)<span title="Required">*</span> | [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions) | *No description.* |
| [`TOOLING_ALL`](#awsanalyticsreferencearchitectureemreksnodegrouppropertytoolingall)<span title="Required">*</span> | [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions) | *No description.* |

---

##### `CRITICAL_ALL` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.CRITICAL_ALL" id="awsanalyticsreferencearchitectureemreksnodegrouppropertycriticalall"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `NOTEBOOK_DRIVER` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_DRIVER" id="awsanalyticsreferencearchitectureemreksnodegrouppropertynotebookdriver"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `NOTEBOOK_EXECUTOR` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_EXECUTOR" id="awsanalyticsreferencearchitectureemreksnodegrouppropertynotebookexecutor"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

Default nodegroup configuration for EMR Studio notebooks used with EMR on EKS.

---

##### `NOTEBOOK_WITHOUT_PODTEMPLATE` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.NOTEBOOK_WITHOUT_PODTEMPLATE" id="awsanalyticsreferencearchitectureemreksnodegrouppropertynotebookwithoutpodtemplate"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `SHARED_DRIVER` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_DRIVER" id="awsanalyticsreferencearchitectureemreksnodegrouppropertyshareddriver"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `SHARED_EXECUTOR` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.SHARED_EXECUTOR" id="awsanalyticsreferencearchitectureemreksnodegrouppropertysharedexecutor"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---

##### `TOOLING_ALL` <a name="aws-analytics-reference-architecture.EmrEksNodegroup.property.TOOLING_ALL" id="awsanalyticsreferencearchitectureemreksnodegrouppropertytoolingall"></a>

- *Type:* [`aws-analytics-reference-architecture.EmrEksNodegroupOptions`](#aws-analytics-reference-architecture.EmrEksNodegroupOptions)

---



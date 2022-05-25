import { Database, Table } from '@aws-cdk/aws-glue-alpha';
import { Role, ServicePrincipal, PolicyStatement, PolicyDocument, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Stream } from 'aws-cdk-lib/aws-kinesis';
import { CfnDeliveryStream } from 'aws-cdk-lib/aws-kinesisfirehose';
import { LogGroup, RetentionDays, LogStream } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Aws, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ContextOptions } from './common/context-options';
import { TrackedConstruct, TrackedConstructProps } from './common/tracked-construct';


/**
 * The properties for DataLakeExporter Construct.
 */
export interface DataLakeExporterProps {
  /**
   * Amazon S3 sink Bucket where the data lake exporter write data.
   */
  readonly sinkBucket: Bucket;
  /**
   * Amazon S3 sink object key where the data lake exporter write data.
   * @default - The data is written at the bucket root
   */
  readonly sinkObjectKey?: string;
  /**
   * Source must be an Amazon Kinesis Data Stream.
   */
  readonly sourceKinesisDataStream: Stream;
  /**
   * Source AWS Glue Database containing the schema of the stream.
   */
  readonly sourceGlueDatabase: Database;
  /**
   * Source AWS Glue Table containing the schema of the stream.
   */
  readonly sourceGlueTable: Table;
  /**
   * Delivery interval in seconds. The frequency of the data delivery is defined by this interval.
   * @default - Set to 900 seconds
   */
  readonly deliveryInterval?: Number;
  /**
   * Maximum delivery size in MB. The frequency of the data delivery is defined by this maximum delivery size.
   * @default - Set to 128 MB
   */
  readonly deliverySize?: Number;
}


/**
 * DataLakeExporter Construct to export data from a stream to the data lake.
 * Source can be an Amazon Kinesis Data Stream.
 * Target can be an Amazon S3 bucket.
 */
export class DataLakeExporter extends TrackedConstruct {

  /**
   * Constructs a new instance of the DataLakeExporter class
   * @param {Construct} scope the Scope of the AWS CDK Construct
   * @param {string} id the ID of the AWS CDK Construct
   * @param {DataLakeExporterProps} props the DataLakeExporter [properties]{@link DataLakeExporterProps}
   * @access public
   */
  public readonly cfnIngestionStream: CfnDeliveryStream;

  constructor(scope: Construct, id: string, props: DataLakeExporterProps) {
    const trackedConstructProps : TrackedConstructProps = {
      trackingCode: ContextOptions.DATA_LAKE_ID,
    };

    super(scope, id, trackedConstructProps);

    if ( props.deliverySize || 128 > 128 ) { throw 'deliverySize cannot be more than 128MB';}
    if ( props.deliveryInterval || 900 > 900 ) { throw 'deliveryInterval cannot be more than 900s';}

    // const stack = Stack.of(this);


    // Create log group for storing Amazon Kinesis Firehose logs.
    const logGroup = new LogGroup(this, 'dataLakeExporterLogGroup', {
      logGroupName: '/aws/data-lake-exporter/',
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK,
    });

    // Create the Kinesis Firehose log stream.
    const firehoseLogStream = new LogStream(this, 'dataLakeExporterLogStream', {
      logGroup: logGroup,
      logStreamName: 'firehose-stream',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const policyDocumentKinesisFirehose = new PolicyDocument({
      statements: [
        new PolicyStatement({
          resources: [
            `${logGroup.logGroupArn}:log-stream:${firehoseLogStream.logStreamName}`,
          ],
          actions: [
            'logs:PutLogEvents',
          ],
        }),
      ],
    });

    const managedPolicyKinesisFirehose = new ManagedPolicy(this, 'managedPolicyKinesisFirehose', {
      document: policyDocumentKinesisFirehose,
    });

    // Create an Amazon IAM Role used by Amazon Kinesis Firehose delivery stream
    const roleKinesisFirehose = new Role(this, 'dataLakeExporterRole', {
      assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
      managedPolicies: [managedPolicyKinesisFirehose],
    });

    roleKinesisFirehose.node.addDependency(managedPolicyKinesisFirehose);

    const grantSink = props.sinkBucket.grantWrite(roleKinesisFirehose);
    const grantSource = props.sourceKinesisDataStream.grantRead(roleKinesisFirehose);
    const grantTable = props.sourceGlueTable.grantRead(roleKinesisFirehose);
    const grantGlue = props.sourceGlueTable.grantToUnderlyingResources(roleKinesisFirehose, ['glue:GetTableVersions']);


    // Create the Delivery stream from Cfn because L2 Construct doesn't support conversion to parquet and custom partitioning
    this.cfnIngestionStream = new CfnDeliveryStream(this, 'dataLakeExporter', {
      deliveryStreamType: 'KinesisStreamAsSource',
      extendedS3DestinationConfiguration: {
        bucketArn: props.sinkBucket.bucketArn,
        bufferingHints: {
          intervalInSeconds: props.deliveryInterval || 900,
          sizeInMBs: props.deliverySize || 128,
        },
        cloudWatchLoggingOptions: {
          logGroupName: logGroup.logGroupName,
          logStreamName: firehoseLogStream.logStreamName,
        },
        roleArn: roleKinesisFirehose.roleArn,
        errorOutputPrefix: `${props.sinkObjectKey}-error`,
        prefix: props.sinkObjectKey,
        compressionFormat: 'UNCOMPRESSED',
        s3BackupMode: 'Disabled',
        dataFormatConversionConfiguration: {
          enabled: true,
          inputFormatConfiguration: {
            deserializer: {
              openXJsonSerDe: {},
            },
          },
          outputFormatConfiguration: {
            serializer: {
              parquetSerDe: {},
            },
          },
          schemaConfiguration: {
            roleArn: roleKinesisFirehose.roleArn,
            catalogId: Aws.ACCOUNT_ID,
            region: Aws.REGION,
            databaseName: props.sourceGlueDatabase.databaseName,
            tableName: props.sourceGlueTable.tableName,
          },
        },
      },
      kinesisStreamSourceConfiguration: {
        kinesisStreamArn: props.sourceKinesisDataStream.streamArn,
        roleArn: roleKinesisFirehose.roleArn,
      },
    });

    // Need to enforce a dependancy because the grant methods generate an IAM Policy without dependency on the Firehose
    this.cfnIngestionStream.node.addDependency(grantSink);
    this.cfnIngestionStream.node.addDependency(grantSource);
    this.cfnIngestionStream.node.addDependency(grantTable);
    this.cfnIngestionStream.node.addDependency(grantGlue);

  }
}

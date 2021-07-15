import { Bucket, StorageClass, BucketEncryption } from '@aws-cdk/aws-s3';
import { Construct, Stack, RemovalPolicy, Duration } from '@aws-cdk/core';

/**
 * @summary Properties for the DataLakeStorage Construct
 */

export interface DataLakeStorageProps {
  /**
   * Delay (in days) before moving RAW data to cold storage (Infrequent Access storage class)
   * @default -  Move objects to Infrequent Access after 30 days
   */
  readonly rawInfrequentAccessDelay?: number;

  /**
   * Delay (in days) before archiving RAW data to frozen storage (Glacier storage class)
   * @default -  Move objects to Glacier after 90 days
   */
  readonly rawArchiveDelay?: number;

  /**
   * Delay (in days) before moving CLEAN data to cold storage (Infrequent Access storage class)
   * @default -  Move objects to Infrequent Access after 90 days
   */
  readonly cleanInfrequentAccessDelay?: number;

  /**
   *
   * Delay (in days) before archiving CLEAN data to frozen storage (Glacier storage class)
   * @default -  Objects are not archived to Glacier
   */
  readonly cleanArchiveDelay?: number;

  /**
   * Delay (in days) before moving TRANSFORM data to cold storage (Infrequent Access storage class)
   * @default -  Move objects to Infrequent Access after 90 days
   */
  readonly transformInfrequentAccessDelay?: number;

  /**
   * Delay (in days) before archiving TRANSFORM data to frozen storage (Glacier storage class)
   * @default -  Objects are not archived to Glacier
   */
  readonly transformArchiveDelay?: number;
}

/**
 * @summary A Data Lake Storage including AWS best practices:
 *  * S3 buckets for Raw, Cleaned and Transformed data
 *  * Data lifecycle optimization
 *  * Encryption
 */

export class DataLakeStorage extends Construct {

  public readonly rawBucket: Bucket;
  public readonly cleanBucket: Bucket;
  public readonly transformBucket: Bucket;

  /**
     * Construct a new instance of DataLakeStorage based on S3 buckets with best practices configuration
     * @param {Construct} scope the Scope of the CDK Construct
     * @param {string} id the ID of the CDK Construct
     * @param {DataLakeStorageProps} props the DataLakeStorageProps [Properties]{@link DataLakeStorageProps}
     * @since 1.0.0
     * @access public
     */

  constructor(scope: Construct, id: string, props: DataLakeStorageProps) {
    super(scope, id);

    // Get the account ID from the stack, is used for S3 buckets unique naming
    const accountId = Stack.of(this).account;

    // Prepare Amazon S3 Lifecycle Rules for raw data
    const rawTransitions = [
      {
        storageClass: StorageClass.INFREQUENT_ACCESS,
        transitionAfter: Duration.days(props.rawInfrequentAccessDelay || 30),
      },
      {
        storageClass: StorageClass.GLACIER,
        transitionAfter: Duration.days(props.rawArchiveDelay || 90),
      },
    ];

    // Create the raw data bucket with the raw transitions
    this.rawBucket = new Bucket(scope, 'RawBucket', {
      bucketName: 'ara-raw' + accountId,
      encryption: BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          transitions: rawTransitions,
        },
      ],
    });

    // Prepare Amazon S3 Lifecycle Rules for clean data
    const cleanTransitions = [
      {
        storageClass: StorageClass.INFREQUENT_ACCESS,
        transitionAfter: Duration.days(props.cleanInfrequentAccessDelay || 90),
      },
    ];
    if ( props.cleanArchiveDelay ) {
      cleanTransitions.push(
        {
          storageClass: StorageClass.GLACIER,
          transitionAfter: Duration.days(props.cleanArchiveDelay),
        },
      );
    }

    // Create the clean data bucket
    this.cleanBucket = new Bucket(scope, 'CleanBucket', {
      bucketName: 'ara-clean' + accountId,
      encryption: BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          transitions: cleanTransitions,
        },
      ],
    });

    // Prepare Amazon S3 Lifecycle Rules for clean data
    const transformTransitions = [
      {
        storageClass: StorageClass.INFREQUENT_ACCESS,
        transitionAfter: Duration.days(props.transformInfrequentAccessDelay || 90),
      },
    ];
    if ( props.transformArchiveDelay ) {
      transformTransitions.push(
        {
          storageClass: StorageClass.GLACIER,
          transitionAfter: Duration.days(props.transformArchiveDelay),
        },
      );
    }

    // Create the transform data bucket
    this.transformBucket = new Bucket(scope, 'TransformBucket', {
      bucketName: 'ara-transform' + accountId,
      encryption: BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          transitions: transformTransitions,
        },
      ],
    });
  }
}
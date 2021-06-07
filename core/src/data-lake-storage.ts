import { Bucket, StorageClass, BucketEncryption } from '@aws-cdk/aws-s3';
import { Construct, Stack, RemovalPolicy, Duration } from '@aws-cdk/core';

/**
 * @summary Properties for DataLakeStorage Construct
 *
 */

export interface DataLakeStorageProps {
}

/**
 * @summary A Data Lake Storage including AWS best practices:
 *  - S3 buckets for Raw, Cleaned and Transformed data
 *  - Data lifecycle optimization
 *  - Encryption
 *
 */

export class DataLakeStorage extends Construct {

  rawBucket: Bucket;
  cleanBucket: Bucket;
  transformBucket: Bucket;

  /**
     * Construct a new instance of DataLakeStorage based on S3 buckets with best practices configuration
     * @param {Construct} scope the Scope of the CDK Construct
     * @param {string} id the ID of the CDK Construct
     * @since 1.0.0
     * @access public
     */

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Get the account ID from the stack, is used for S3 buckets unique naming
    const accountId = Stack.of(this).account;

    // Create the raw data bucket
    this.rawBucket = new Bucket(scope, 'RawBucket', {
      bucketName: 'ara-raw' + accountId,
      encryption: BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(30),
            },
            {
              storageClass: StorageClass.GLACIER,
              transitionAfter: Duration.days(90),
            },
          ],
        },
      ],
    });

    // Create the clean data bucket
    this.cleanBucket = new Bucket(scope, 'CleanBucket', {
      bucketName: 'ara-clean' + accountId,
      encryption: BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(365),
            },
          ],
        },
      ],
    });

    // Create the transform data bucket
    this.transformBucket = new Bucket(scope, 'TransformBucket', {
      bucketName: 'ara-transform' + accountId,
      encryption: BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(365),
            },
          ],
        },
      ],
    });
  }
}
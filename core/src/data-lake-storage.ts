import * as s3 from '@aws-cdk/aws-s3';
import { Construct, Stack, RemovalPolicy, Duration } from '@aws-cdk/core';

/**
 * Properties for DataLakeStorage Construct
 *
 */

export interface DataLakeStorageProps {
}

/**
 * A Data Lake Storage including AWS best practices:
 *  - S3 buckets for Raw, Cleaned and Transformed data
 *  - Data lifecycle optimization
 *  - Encryption
 *
 */

export class DataLakeStorage extends Construct {

  rawBucket: s3.Bucket;
  cleanBucket: s3.Bucket;
  transformBucket: s3.Bucket;

  /**
     * Return S3 buckets with best practices configuration for Data Lakes
     * @param scope the Scope of the CDK Stack
     * @param id the ID of the CDK Stack
     */

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Get the account ID from the stack, is used for S3 buckets unique naming
    const accountId = Stack.of(this).account;

    // Create the raw data bucket
    this.rawBucket = new s3.Bucket(scope, 'RawBucket', {
      bucketName: 'ara-raw' + accountId,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: Duration.days(90),
            },
          ],
        },
      ],
    });

    // Create the clean data bucket
    this.cleanBucket = new s3.Bucket(scope, 'CleanBucket', {
      bucketName: 'ara-clean' + accountId,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(365),
            },
          ],
        },
      ],
    });

    // Create the transform data bucket
    this.transformBucket = new s3.Bucket(scope, 'TransformBucket', {
      bucketName: 'ara-transform' + accountId,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(365),
            },
          ],
        },
      ],
    });
  }
}
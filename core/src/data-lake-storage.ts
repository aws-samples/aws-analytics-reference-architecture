// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Bucket, BucketEncryption, StorageClass } from 'aws-cdk-lib/aws-s3';
import { Duration } from 'aws-cdk-lib';
import { AraBucket } from './ara-bucket';
import { Construct } from 'constructs';
import { ContextOptions } from './common/context-options';
import { TrackedConstruct, TrackedConstructProps } from './common/tracked-construct';

/**
 * Properties for the DataLakeStorage Construct
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
 * A CDK Construct that creates the storage layers of a data lake composed of Amazon S3 Buckets.
 *
 * This construct is based on 3 Amazon S3 buckets configured with AWS best practices:
 *  * S3 buckets for Raw/Cleaned/Transformed data,
 *  * data lifecycle optimization/transitioning to different Amazon S3 storage classes
 *  * server side buckets encryption managed by KMS customer key
 *  * Default single KMS key
 *  * SSL communication enforcement
 *  * access logged to an S3 bucket
 *  * All public access blocked
 *
 * By default the transitioning rules to Amazon S3 storage classes are configured as following:
 *  * Raw data is moved to Infrequent Access after 30 days and archived to Glacier after 90 days
 *  * Clean and Transformed data is moved to Infrequent Access after 90 days and is not archived
 *
 * Objects and buckets are automatically deleted when the CDK application is detroyed.
 *
 * For custom requirements, consider using {@link AraBucket}.
 *
 * Usage example:
 * ```typescript
 * import * as cdk from 'aws-cdk-lib';
 * import { DataLakeStorage } from 'aws-analytics-reference-architecture';
 *
 * const exampleApp = new cdk.App();
 * const stack = new cdk.Stack(exampleApp, 'DataLakeStorageStack');
 *
 * new DataLakeStorage(stack, 'MyDataLakeStorage', {
 *  rawInfrequentAccessDelay: 90,
 *  rawArchiveDelay: 180,
 *  cleanInfrequentAccessDelay: 180,
 *  cleanArchiveDelay: 360,
 *  transformInfrequentAccessDelay: 180,
 *  transformArchiveDelay: 360,
 * });
 * ```
 */

export class DataLakeStorage extends TrackedConstruct {

  public readonly rawBucket: Bucket;
  public readonly cleanBucket: Bucket;
  public readonly transformBucket: Bucket;

  /**
   * Construct a new instance of DataLakeStorage based on Amazon S3 buckets with best practices configuration
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataLakeStorageProps} props the DataLakeStorageProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props?: DataLakeStorageProps) {

    const trackedConstructProps: TrackedConstructProps = {
      trackingCode: ContextOptions.DATA_LAKE_ID,
    };

    super(scope, id, trackedConstructProps);

    var rawInfrequentAccessDelay = 30;
    var rawArchiveDelay = 90;
    var cleanInfrequentAccessDelay = 90;
    var cleanArchiveDelay = undefined;
    var transformInfrequentAccessDelay = 90;
    var transformArchiveDelay = undefined;

    if (props) {
      if (props.rawInfrequentAccessDelay) {
        if (props.rawInfrequentAccessDelay < 30) {
          throw new Error('Transitioning to infrequent access storage class cannot be done before 30 days');
        } else {
          rawInfrequentAccessDelay = props.rawInfrequentAccessDelay;
        }
      }
      if (props.rawArchiveDelay) {
        if (props.rawArchiveDelay < 90) {
          throw new Error('Archiving to glacier storage class cannot be done before 90 days');
        } else {
          rawArchiveDelay = props.rawArchiveDelay;
        }
      }
      if (props.cleanInfrequentAccessDelay) {
        if (props.cleanInfrequentAccessDelay < 30) {
          throw new Error('Transitioning to infrequent access storage class cannot be done before 30 days');
        } else {
          cleanInfrequentAccessDelay = props.cleanInfrequentAccessDelay;
        }
      }
      if (props.cleanArchiveDelay) {
        if (props.cleanArchiveDelay < 90) {
          throw new Error('Archiving to glacier storage class cannot be done before 90 days');
        } else {
          cleanArchiveDelay = props.cleanArchiveDelay;
        }
      }
      if (props.transformInfrequentAccessDelay) {
        if (props.transformInfrequentAccessDelay < 30) {
          throw new Error('Transitioning to infrequent access storage class cannot be done before 30 days');
        } else {
          transformInfrequentAccessDelay = props.transformInfrequentAccessDelay;
        }
      }
      if (props.transformArchiveDelay) {
        if (props.transformArchiveDelay < 90) {
          throw new Error('Archiving to glacier storage class cannot be done before 90 days');
        } else {
          transformArchiveDelay = props.transformArchiveDelay;
        }
      }
    }

    // Prepare Amazon S3 Lifecycle Rules for raw data
    const rawTransitions = [
      {
        storageClass: StorageClass.INFREQUENT_ACCESS,
        transitionAfter: Duration.days(rawInfrequentAccessDelay),
      },
      {
        storageClass: StorageClass.GLACIER,
        transitionAfter: Duration.days(rawArchiveDelay),
      },
    ];

    // Create the raw data bucket with the raw transitions
    this.rawBucket = AraBucket.getOrCreate(this, {
      encryption: BucketEncryption.KMS,
      bucketName: 'raw',
      lifecycleRules: [
        {
          transitions: rawTransitions,
          abortIncompleteMultipartUploadAfter: Duration.days(1),
        },
      ],
      serverAccessLogsPrefix: 'raw-bucket',
    });

    // Prepare Amazon S3 Lifecycle Rules for clean data
    const cleanTransitions = [
      {
        storageClass: StorageClass.INFREQUENT_ACCESS,
        transitionAfter: Duration.days(cleanInfrequentAccessDelay),
      },
    ];
    if (cleanArchiveDelay) {
      cleanTransitions.push(
        {
          storageClass: StorageClass.GLACIER,
          transitionAfter: Duration.days(cleanArchiveDelay),
        },
      );
    }

    // Create the clean data bucket
    this.cleanBucket = AraBucket.getOrCreate(this, {
      encryption: BucketEncryption.KMS,
      bucketName: 'clean',
      lifecycleRules: [
        {
          transitions: cleanTransitions,
          abortIncompleteMultipartUploadAfter: Duration.days(1),
        },
      ],
      serverAccessLogsPrefix: 'clean-bucket',
    });

    // Prepare Amazon S3 Lifecycle Rules for clean data
    const transformTransitions = [
      {
        storageClass: StorageClass.INFREQUENT_ACCESS,
        transitionAfter: Duration.days(transformInfrequentAccessDelay),
      },
    ];
    if (transformArchiveDelay) {
      transformTransitions.push(
        {
          storageClass: StorageClass.GLACIER,
          transitionAfter: Duration.days(transformArchiveDelay),
        },
      );
    }

    // Create the transform data bucket
    this.transformBucket = AraBucket.getOrCreate(this, {
      encryption: BucketEncryption.KMS,
      bucketName: 'transform',
      lifecycleRules: [
        {
          transitions: transformTransitions,
          abortIncompleteMultipartUploadAfter: Duration.days(1),
        },
      ],
      serverAccessLogsPrefix: 'transform-bucket',
    });
  }
}

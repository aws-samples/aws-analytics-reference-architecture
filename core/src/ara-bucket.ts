// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { IRole } from 'aws-cdk-lib/aws-iam';
import { IKey } from 'aws-cdk-lib/aws-kms';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  BucketMetrics,
  CorsRule,
  IBucket,
  IntelligentTieringConfiguration,
  Inventory,
  LifecycleRule,
  ObjectOwnership,
} from 'aws-cdk-lib/aws-s3';
import { Aws, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SingletonKey } from './singleton-kms-key';

export interface AraBucketProps{
  /**
   * The Amazon S3 bucket name. The bucket name is postfixed with the AWS account ID and the AWS region
   */
  readonly bucketName: string;

  /**
   * The log file prefix to use for the bucket's access logs.
   * @default - access are not logged
   */
  readonly serverAccessLogsPrefix?: string;

  /**
   * Destination bucket for the server access logs.
   * @default - if serverAccessLogsPrefix is defined, use a unique bucket across the stack called `s3-access-logs`
   */
  readonly serverAccessLogsBucket?: IBucket;

  /**
   * The encryption mode for the bucket
   * @default - Server side encryption with AWS managed key (SSE-KMS)
   */
  readonly encryption?: BucketEncryption;

  /**
   * The KMS key for the bucket encryption
   * @default - if encryption is KMS, use a unique KMS key across the stack called `AraDefaultKmsKey`
   */
  readonly encryptionKey?: IKey ;

  /**
   * Enforces SSL for requests.
   * @default true
   */
  readonly enforceSSL?: boolean;

  /**
   * Specifies whether Amazon S3 should use an S3 Bucket Key with server-side encryption using KMS (SSE-KMS) for new objects in the bucket.
   * @default true
   */
  readonly bucketKeyEnabled?: boolean;

  /**
   * Policy to apply when the bucket is removed from this stack.
   * @default - destroy the bucket
   */
  readonly removalPolicy?: RemovalPolicy;

  /**
   * Whether all objects should be automatically deleted when the bucket is removed from the stack or when the stack is deleted.
   * Requires the `removalPolicy` to be set to `RemovalPolicy.DESTROY`.
   * @default true
   */
  readonly autoDeleteObjects?: boolean;

  /**
   * The block public access configuration of this bucket.
   * @default - Block all public access and no ACL or bucket policy can grant public access.
   */
  readonly blockPublicAccess?: BlockPublicAccess;

  /**
   * Whether this bucket should have versioning turned on or not.
   * @default false
   */
  readonly versioned?: boolean;

  /**
   * Rules that define how Amazon S3 manages objects during their lifetime.
   * @default - No lifecycle rules.
   */
  readonly lifecycleRules?: LifecycleRule[];

  /**
   * Specifies a canned ACL that grants predefined permissions to the bucket.
   * @default BucketAccessControl.PRIVATE
   */
  readonly accessControl?: BucketAccessControl;

  /**
   * Grants public read access to all objects in the bucket.
   * Similar to calling `bucket.grantPublicAccess()`
   * @default false
   */
  readonly publicReadAccess?: boolean;

  /**
   * The metrics configuration of this bucket.
   * @default - No metrics configuration.
   */
  readonly metrics?: BucketMetrics[];

  /**
   * The CORS configuration of this bucket.
   * @default - No CORS configuration.
   */
  readonly cors?: CorsRule[];

  /**
   * The inventory configuration of the bucket.
   * @default - No inventory configuration
  */
  readonly inventories?: Inventory[];

  /**
   * The objectOwnership of the bucket.
   * @default - No ObjectOwnership configuration, uploading account will own the object.
   */
  readonly objectOwnership?: ObjectOwnership;

  /**
   * Whether this bucket should have transfer acceleration turned on or not.
   * @default false
   */
  readonly transferAcceleration?: boolean;

  /**
   * The role to be used by the notifications handler
   * @default - a new role will be created.
   */
  readonly notificationsHandlerRole?: IRole;

  /**
   * Inteligent Tiering Configurations
   * @default No Intelligent Tiiering Configurations.
   */
  readonly intelligentTieringConfigurations?: IntelligentTieringConfiguration[];
}

/**
* An Amazon S3 Bucket following best practices for the AWS Analytics Reference Architecture.
* The bucket name is mandatory and is used as the CDK id.
* The bucket name is postfixed with the AWS account ID and the AWS region.
*
* The bucket has the following default properties:
*  * the encryption mode is KMS managed by AWS
*  * if the encryption mode is KMS customer managed, the encryption key is a default and unique KMS key for ARA
*  * the KMS key is used as a bucket key
*  * the SSL is enforced
*  * the objects are automatically deleted when the bucket is deleted
*  * the access are logged in a default and unique S3 bucket for ARA if serverAccessLogsPrefix is provided
*  * the access are not logged if serverAccessLogsPrefix is  not provided
*  * the public access is blocked and no bucket policy or object permission can grant public access
*
* All standard S3 Bucket properties can be provided to not use the defaults.
* Usage example:
* ```typescript
* import * as cdk from 'aws-cdk-lib';
* import { AraBucket } from 'aws-analytics-reference-architecture';
*
* const exampleApp = new cdk.App();
* const stack = new cdk.Stack(exampleApp, 'AraBucketStack');
*
* new AraBucket(stack, {
*  bucketName: 'test-bucket',
*  serverAccessLogsPrefix: 'test-bucket',
* });
* ```
*/
export class AraBucket extends Bucket {

  /**
  * Get the Amazon S3 Bucket from the AWS CDK Stack based on the provided name.
  * If no bucket exists, it creates a new one based on the provided properties.
  */
  public static getOrCreate(scope: Construct, props: AraBucketProps) {
    const stack = Stack.of(scope);
    const id = `${props.bucketName}`;

    const stackBucket = stack.nestedStackParent ? stack.nestedStackParent.node.tryFindChild(id) as Bucket : stack.node.tryFindChild(id) as Bucket;

    return stackBucket || new AraBucket(stack, props);
  }

  /**
  * Constructs a new instance of the AraBucket class
  * @param {Construct} scope the Scope of the CDK Construct
  * @param {AraBucketProps} props the AraBucketProps [properties]{@link AraBucketProps}
  * @access private
  */

  private constructor(scope: Construct, props: AraBucketProps) {

    var serverAccessLogsBucket = undefined;
    if ( props.serverAccessLogsPrefix ) {
      serverAccessLogsBucket = props.serverAccessLogsBucket || AraBucket.getOrCreate(scope, { bucketName: 's3-access-logs', encryption: BucketEncryption.S3_MANAGED });
    }

    // If using KMS encryption then use a customer managed key, if not set the key to undefined
    let bucketEncryptionKey: IKey | undefined = BucketEncryption.KMS == props.encryption ? props.encryptionKey || SingletonKey.getOrCreate(scope, 'DefaultKmsKey') : undefined;

    // If the bucket is for s3 access logs, we remove the bucketname to ensure uniqueness across stacks
    let bucketName = (props.bucketName == 's3-access-logs') ? undefined : `${props.bucketName}-${Aws.ACCOUNT_ID}-${Aws.REGION}`;
    // set the right default parameters in the S3 bucket props
    const bucketProps = {
      ...props,
      ...{
        bucketName: bucketName,
        encryption: props.encryption ? props.encryption : BucketEncryption.KMS_MANAGED,
        encryptionKey: bucketEncryptionKey,
        bucketKeyEnabled: BucketEncryption.KMS == props.encryption ? true : false,
        enforceSSL: props.enforceSSL || true,
        removalPolicy: props.removalPolicy || RemovalPolicy.DESTROY,
        autoDeleteObjects: props.autoDeleteObjects || true,
        serverAccessLogsBucket: serverAccessLogsBucket,
        serverAccessLogsPrefix: props.serverAccessLogsPrefix,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        lifecycleRules: props.lifecycleRules || [{ abortIncompleteMultipartUploadAfter: Duration.days(1) }],
      },
    };
    // build the S3 bucket
    super(scope, props.bucketName, bucketProps);
  }
}

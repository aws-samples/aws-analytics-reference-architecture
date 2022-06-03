// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { AccountPrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

/**
 * The props for S3CrossAccount construct
 */
export interface S3CrossAccountProps {

  /**
   * The S3 Bucket object to grant cross account access.
   * This needs to be a Bucket object and not an IBucket because the construct modifies the Bucket policy
   */
  readonly s3Bucket: Bucket;

  /**
   * The S3 object key to grant cross account access (S3 prefix without the bucket name)
   * @default - Grant cross account for the entire bucket
   */
  readonly s3ObjectKey?: string;

  /**
   * The account ID to grant on the S3 location
   */
  readonly accountId: string;
}

/**
 * This CDK construct grants cross account permissions on an Amazon S3 location.
 * It uses a bucket policy and an Amazon KMS Key policy if the bucket is encrypted with KMS.
 * The cross account permission is granted to the entire account and not to a specific principal in this account.
 * It's the responsibility of the target account to grant permissions to the relevant principals.
 *
 * Usage example:
 * ```typescript
 * import * as cdk from 'aws-cdk-lib';
 * import { S3CrossAccount } from 'aws-analytics-reference-architecture';
 *
 * const exampleApp = new cdk.App();
 * const stack = new cdk.Stack(exampleApp, 'S3CrossAccountStack');
 *
 * const myBucket = new Bucket(stack, 'MyBucket')
 *
 * new S3CrossAccount(stack, 'S3CrossAccountGrant', {
 *   bucket: myBucket,
 *   objectKey: 'my-data',
 *   accountId: '1234567891011',
 * });
 * ```
 */
export class S3CrossAccount extends Construct {

  constructor(scope: Construct, id: string, props: S3CrossAccountProps) {
    super(scope, id);

    // Get the target account as a Principal
    const targetAccount = new AccountPrincipal(props.accountId);

    // // Get the bucket from the S3 location to attache a bucket policy
    // props.bucket.addToResourcePolicy(
    //   new PolicyStatement({
    //     principals: [
    //       targetAccount,
    //     ],
    //     actions: [
    //       's3:GetObject',
    //       's3:PutObject',
    //       's3:DeleteObject',
    //       's3:ListBucketMultipartUploads',
    //       's3:ListMultipartUploadParts',
    //       's3:AbortMultipartUpload',
    //       's3:ListBucket',
    //     ],
    //     resources: [
    //       props.bucket.arnForObjects(props.objectKey || '') + '/*',
    //       props.bucket.bucketArn,
    //     ],
    //   }),
    // );

    // // If the bucket is encrypted with a custom KMS key, attach a policy to the key to grant encrypt and decrypt
    // if (props.bucket.encryptionKey)  props.bucket.encryptionKey.grantEncryptDecrypt(targetAccount);

    const objectKey = props.s3ObjectKey ? props.s3ObjectKey + '/*' : '*';
    props.s3Bucket.grantReadWrite(targetAccount, objectKey);
  };
}

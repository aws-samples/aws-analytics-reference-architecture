// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyStatement, AccountPrincipal } from '@aws-cdk/aws-iam';
import { Key } from '@aws-cdk/aws-kms';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';

/**
 * The props for S3CrossAccount construct
 */
export interface S3CrossAccountProps {

  /**
   * The S3 Bucket object to grant cross account access
   */
  readonly bucket: Bucket;

  /**
   * The S3 object key to grant cross account access (S3 prefix without the bucket name)
   * @default - Grant cross account for the entire bucket
   */
  readonly objectKey?: string;

  /**
   * The KMS Key used to encrypt the bucket
   * @default - No resource based policy is created on any KMS key
   */
  readonly key?: Key;

  /**
   * The account ID to grant on the S3 location
   */
  readonly accountID: string;
}

/**
 * This CDK construct grants cross account permissions on an Amazon S3 location.
 * It uses a bucket policy and an Amazon KMS Key policy if the bucket is encrypted with KMS.
 * The cross account permission is granted to the entire account and not to a specific principal in this account.
 * It's the responsibility of the target account to grant permissions to the relevant principals.
 *
 * Usage example:
 * ```typescript
 * import * as cdk from '@aws-cdk/core';
 * import { S3CrossAccount } from 'aws-analytics-reference-architecture';
 *
 * const exampleApp = new cdk.App();
 * const stack = new cdk.Stack(exampleApp, 'S3CrossAccountStack');
 *
 * new S3CrossAccount(stack, 'S3CrossAccountGrant', {
 *   s3Location:{
 *     bucketName: 'my-bucket',
 *     objectKey: 'my-prefix',
 *   }
 * });
 * ```
 */
export class S3CrossAccount extends Construct {

  constructor(scope: Construct, id: string, props: S3CrossAccountProps) {
    super(scope, id);

    // Get the target account as a Principal
    const targetAccount = new AccountPrincipal(props.accountID);

    // Get the bucket from the S3 location to attache a bucket policy
    props.bucket.addToResourcePolicy(
      new PolicyStatement({
        principals: [
          targetAccount,
        ],
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject',
          's3:ListBucketMultipartUploads',
          's3:ListMultipartUploadParts',
          's3:AbortMultipartUpload',
          's3:ListBucket',
        ],
        resources: [
          props.bucket.arnForObjects(props.objectKey || '') + '/*',
          props.bucket.bucketArn,
        ],
      }),
    );

    // TODO this need to be changed as the ARN only get the resolved at deployment time
    // If the bucket is encrypted with a custom KMS key, attach a policy to the key
    if (props.bucket.encryptionKey) {
      if (props.key && props.bucket.encryptionKey.keyArn == props.key.keyArn) {
        props.key.grantDecrypt(targetAccount);
      }
    } else {
      throw new Error('The bucket is encrypted so S3CrossAccount should take a KMS key as parameter');
    }
  };
}

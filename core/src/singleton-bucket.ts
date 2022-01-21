// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { BlockPublicAccess, Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { Construct, Stack, Aws, RemovalPolicy } from '@aws-cdk/core';

/**
 * An Amazon S3 Bucket implementing the singleton pattern
 */
export class SingletonBucket extends Bucket {

  /**
   * Get the Amazon S3 Bucket from the AWS CDK Stack based on the provided name.
   * The method adds a prefix (ara-) and a suffix (-{ACCOUNT_ID}) to the provided name.
   * If no bucket exists, it creates a new one.
   */
  public static getOrCreate(scope: Construct, bucketName: string) {
    const stack = Stack.of(scope);
    const id = `${bucketName}Bucket`;
    return stack.node.tryFindChild(id) as Bucket || new Bucket(stack, id, {
      bucketName: `ara-${bucketName}-${Aws.ACCOUNT_ID}`,
      encryption: BucketEncryption.KMS_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
  }
}

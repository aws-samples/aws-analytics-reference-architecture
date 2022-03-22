// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CfnWorkGroup } from '@aws-cdk/aws-athena';
import {BlockPublicAccess, Bucket, BucketEncryption} from '@aws-cdk/aws-s3';
import {Aws, Construct, RemovalPolicy} from '@aws-cdk/core';
import { SingletonBucket } from './singleton-bucket';
import {SingletonKey} from "./singleton-kms-key";

/**
 * AthenaDefaultSetup Construct to automatically setup a new Amazon Athena Workgroup with proper configuration for out-of-the-box usage
 */

export class AthenaDefaultSetup extends Construct {

  public readonly resultBucket: Bucket;

  /**
   * Constructs a new instance of the AthenaDefaultSetup class
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @access public
   */

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Singleton Amazon S3 bucket for Amazon Athena Query logs
    this.resultBucket = new Bucket(this, 'athenaLog', {
      bucketName: 'ara-raw-athena-log' + Aws.REGION + Aws.ACCOUNT_ID,
      encryption: BucketEncryption.KMS,
      encryptionKey: SingletonKey.getOrCreate(this, 'stackEncryptionKey'),
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: SingletonBucket.getOrCreate(this, 'ara-s3accesslogs'),
      serverAccessLogsPrefix: 'athena-log-bucket',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    new CfnWorkGroup(this, 'athenaDefaultWorkgroup', {
      name: 'default',
      recursiveDeleteOption: true,
      workGroupConfiguration: {
        publishCloudWatchMetricsEnabled: false,
        resultConfiguration: {
          outputLocation: this.resultBucket.s3UrlForObject('athena-console-results'),
        },
      },
    });

  }
}

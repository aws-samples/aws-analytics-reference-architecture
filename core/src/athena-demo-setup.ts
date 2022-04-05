// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CfnWorkGroup } from '@aws-cdk/aws-athena';
import {Bucket} from '@aws-cdk/aws-s3';
import {Construct} from '@aws-cdk/core';
import { AraBucket } from './common/ara-bucket';

/**
 * AthenaDemoSetup Construct to automatically setup a new Amazon Athena Workgroup with proper configuration for out-of-the-box demo
 */

export class AthenaDemoSetup extends Construct {

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
    this.resultBucket = AraBucket.getOrCreate(this, {
      bucketName: 'athena-logs',
      serverAccessLogsPrefix: 'athena-logs-bucket',
    });

    new CfnWorkGroup(this, 'athenaDemoWorkgroup', {
      name: 'demo',
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

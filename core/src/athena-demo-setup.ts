// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CfnWorkGroup } from 'aws-cdk-lib/aws-athena';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AraBucket } from './ara-bucket';

export interface AthenaDemoSetupProps {

  /**
   * The Amazon Athena workgroup name. The name is also used 
   * @default - `demo` is used
   */
  readonly workgroupName?: string;
}

/**
 * AthenaDemoSetup Construct to automatically setup a new Amazon Athena Workgroup with proper configuration for out-of-the-box demo
 */

export class AthenaDemoSetup extends Construct {

  public readonly resultBucket: Bucket;
  public readonly athenaWorkgroup: CfnWorkGroup;

  /**
   * Constructs a new instance of the AthenaDefaultSetup class
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @access public
   */

  constructor(scope: Construct, id: string, props: AthenaDemoSetupProps) {
    super(scope, id);

    const workgroupName = props.workgroupName || 'demo'; 
    // Singleton Amazon S3 bucket for Amazon Athena Query logs
    this.resultBucket = AraBucket.getOrCreate(this, {
      bucketName: `${workgroupName}-athena-logs`,
      serverAccessLogsPrefix: `${workgroupName}-athena-logs-bucket`,
    });

    this.athenaWorkgroup = new CfnWorkGroup(this, 'athenaDemoWorkgroup', {
      name: workgroupName,
      recursiveDeleteOption: true,
      workGroupConfiguration: {
        requesterPaysEnabled: true,
        publishCloudWatchMetricsEnabled: false,
        resultConfiguration: {
          outputLocation: this.resultBucket.s3UrlForObject('athena-console-results'),
        },
      },
    });

  }
}


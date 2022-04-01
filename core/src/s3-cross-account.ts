// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyStatement, AccountPrincipal } from "@aws-cdk/aws-iam";
import { Bucket, Location } from "@aws-cdk/aws-s3";
import { Construct } from "constructs";

export interface S3CrossAccountProps {

  /**
   * The S3 location to grant cross account access
   */
  readonly s3Location: Location;

  /**
   * The account ID to grant cross account access
   */
  readonly accountID: string;
}

export class S3CrossAccount extends Construct {

  constructor(scope: Construct, id: string, props: S3CrossAccountProps) {
    super(scope, id);
    
    // Get the target account as a Principal
    const targetAccount = new AccountPrincipal(props.accountID);

    // Get the bucket from the S3 location to attache a bucket policy
    const bucket = Bucket.fromBucketName(this, 'Bucket', props.s3Location.bucketName);
    bucket.addToResourcePolicy(
      new PolicyStatement({
        principals: [
          targetAccount,
        ],
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject',
          's3:ListBucket',
        ],
        resources: [
          bucket.arnForObjects(props.s3Location.objectKey),
        ]
      })
    );

    // If the bucket is encrypted with a custom KMS key, attach a policy to the key
    if (bucket.encryptionKey) {
      bucket.encryptionKey.addToResourcePolicy(
        new PolicyStatement({
          principals: [
            targetAccount,
          ],
          actions: [
            'kms:Decrypt',
          ],
        })
      );
    };
  };
}
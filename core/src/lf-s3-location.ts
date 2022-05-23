// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lakeformation from 'aws-cdk-lib/aws-lakeformation';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

/**
* The props for LF-S3-Location Construct.
*/
export interface LakeFormationS3LocationProps {
  /**
   * S3 Bucket to be registered with Lakeformation
   */
  readonly s3Bucket: Bucket;
  /**
   * S3 object key to be registered with Lakeformation
   * @default - The entire bucket is registered
   */
  readonly s3ObjectKey?: string;
}

/**
 * This CDK construct aims to register an S3 Location for Lakeformation with Read and Write access. 
 * If the location is in a different account, cross account access should be granted via the [S3CrossAccount]{@link S3CrossAccount} construct.
 *
 * This construct instantiate 2 objects:
 * * An IAM role with read/write permissions to the S3 location and read access to the KMS key used to encypt the bucket
 * * A CfnResource is based on an IAM role with 2 policies folowing the least privilege AWS best practices:
 * * Policy 1 is for GetObject, PutObject, DeleteObject from S3 bucket
 * * Policy 2 is to list S3 Buckets
 *
 * Policy 1 takes as an input S3 object arn
 * Policy 2 takes as an input S3 bucket arn
 *
 *
 * The CDK construct instantiate the cfnresource in order to register the S3 location with Lakeformation using the IAM role defined above.
 *
 * Usage example:
 * ```typescript
 * import * as cdk from 'aws-cdk-lib';
 * import { LakeformationS3Location } from 'aws-analytics-reference-architecture';
 *
 * const exampleApp = new cdk.App();
 * const stack = new cdk.Stack(exampleApp, 'LakeformationS3LocationStack');
 * 
 * const myBucket = new Bucket(stack, 'MyBucket')
 * 
 * new LakeformationS3Location(stack, 'MyLakeformationS3Location', {
 *   bucketName: myBucket,
 *   objectKey: 'my-prefix',
 * });
 * ```
 */
export class LakeformationS3Location extends Construct {

  public readonly dataAccessRole: Role;

  constructor(scope: Construct, id: string, props: LakeFormationS3LocationProps) {
    super(scope, id);

    // Create an Amazon IAM Role used by Lakeformation to register S3 location
    this.dataAccessRole = new Role(this, 'LFS3AccessRole', {
      assumedBy: new ServicePrincipal('lakeformation.amazonaws.com'),
    });

    const objectKey = props.s3ObjectKey ? props.s3ObjectKey + '/*' : '*';
    // add policy to access S3 for Read and Write
    // this.dataAccessRole.addToPolicy(
    //   new PolicyStatement({
    //     resources: [
    //       props.s3Bucket.arnForObjects(objectKey),
    //       props.s3Bucket.bucketArn,
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
    //   }),
    // );

    // // add policy to access KMS key used for the bucket encryption
    // if (bucket.encryptionKey) {
    //   this.dataAccessRole.addToPolicy(
    //     new PolicyStatement({
    //       resources: [
    //         bucket.encryptionKey?.keyArn,
    //       ],
    //       actions: [
    //         'kms:Decrypt',
    //       ],
    //     }),
    //   );
    // }

    props.s3Bucket.grantReadWrite(this.dataAccessRole, objectKey)

    new lakeformation.CfnResource(this, 'MyCfnResource', {
      resourceArn: props.s3Bucket.arnForObjects(objectKey),
      useServiceLinkedRole: false,
      roleArn: this.dataAccessRole.roleArn,
    });
  }
}

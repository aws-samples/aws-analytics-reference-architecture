// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Arn, Aws, Stack } from 'aws-cdk-lib';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lakeformation from 'aws-cdk-lib/aws-lakeformation';
import { Location } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

/**
* The props for LF-S3-Location Construct.
*/
export interface LakeFormationS3LocationProps {
  /**
   * S3 location to be registered with Lakeformation
   */
  readonly s3Location: Location;
  /**
   * KMS key used to encrypt the S3 Location
   * @default - No encryption is used
   */
  readonly kmsKeyId: string;
  /**
   * Account ID owning the S3 location
   * @default - Current account is used
   */
  readonly accountId?: string;
}

/**
 * This CDK construct aims to register an S3 Location for Lakeformation with Read and Write access.
 * If the location is in a different account, cross account access should be granted via the [S3CrossAccount]{@link S3CrossAccount} construct.
 * If the S3 location is encrypted with KMS, the key must be explicitly passed to the construct because CDK cannot retrieve bucket encryption key from imported buckets. 
 * Imported buckets are generally used in cross account setup like data mesh.
 *
 * This construct instantiate 2 objects:
 * * An IAM role with read/write permissions to the S3 location and encrypt/decrypt access to the KMS key used to encypt the bucket
 * * A CfnResource is based on an IAM role with 2 policy statement folowing the least privilege AWS best practices:
 *   * Statement 1 for S3 permissions
 *   * Statement 2 for KMS permissions if the bucket is encrypted
 *
 * The CDK construct instantiate the CfnResource in order to register the S3 location with Lakeformation using the IAM role defined above.
 *
 * Usage example:
 * ```typescript
 * import * as cdk from 'aws-cdk-lib';
 * import { LakeformationS3Location } from 'aws-analytics-reference-architecture';
 *
 * const exampleApp = new cdk.App();
 * const stack = new cdk.Stack(exampleApp, 'LakeformationS3LocationStack');
 *
 * const myKey = new Key(stack, 'MyKey')
 * const myBucket = new Bucket(stack, 'MyBucket', {
 *   encryptionKey: myKey,
 * })
 *
 * new LakeFormationS3Location(stack, 'MyLakeformationS3Location', {
 *   s3Location: {
 *     bucketName: myBucket.bucketName,
 *     objectKey: 'my-prefix',
 *   },
 *   kmsKeyId: myBucket.encryptionKey.keyId,
 * });
 * ```
 */
export class LakeFormationS3Location extends Construct {

  public readonly dataAccessRole: Role;

  constructor(scope: Construct, id: string, props: LakeFormationS3LocationProps) {
    super(scope, id);

    // Create an Amazon IAM Role used by Lakeformation to register S3 location
    this.dataAccessRole = new Role(this, 'LFS3AccessRole', {
      assumedBy: new ServicePrincipal('lakeformation.amazonaws.com'),
    });

    // add policy to access S3 for Read and Write
    this.dataAccessRole.addToPolicy(
      new PolicyStatement({
        resources: [
          Arn.format({
            account: '',
            region: '',
            resource: props.s3Location.bucketName,
            service: 's3',
            resourceName: props.s3Location.objectKey ? props.s3Location.objectKey + '/*' : '*',
          }, Stack.of(this)),
          Arn.format({
            account: '',
            region: '',
            resource: props.s3Location.bucketName,
            service: 's3',
          }, Stack.of(this)),
        ],
        actions: [
          "s3:GetObject*",
          "s3:GetBucket*",
          "s3:List*",
          "s3:DeleteObject*",
          "s3:PutObject",
          "s3:PutObjectLegalHold",
          "s3:PutObjectRetention",
          "s3:PutObjectTagging",
          "s3:PutObjectVersionTagging",
          "s3:Abort*",
        ],
      }),
    );

    // add policy to access KMS key used for the bucket encryption
    if (props.kmsKeyId) {
      this.dataAccessRole.addToPolicy(
        new PolicyStatement({
          resources: [
            Arn.format({
              region: Aws.REGION,
              resource: 'key',
              service: 'kms',
              account: props.accountId ? props.accountId : Aws.ACCOUNT_ID,
              resourceName: props.kmsKeyId,
            }, Stack.of(this))
          ],
          actions: [
            'kms:Encrypt*',
            'kms:Decrypt*',
            'kms:ReEncrypt*',
            'kms:GenerateDataKey*',
            'kms:Describe*',
          ],
        }),
      );
    }

    new lakeformation.CfnResource(this, 'MyCfnResource', {
      resourceArn: Arn.format({
        account: '',
        region: '',
        resource: props.s3Location.bucketName,
        service: 's3',
        resourceName: props.s3Location.objectKey ? props.s3Location.objectKey + '/*' : '*',
      }, Stack.of(this)),
      useServiceLinkedRole: false,
      roleArn: this.dataAccessRole.roleArn,
    });
  }
}

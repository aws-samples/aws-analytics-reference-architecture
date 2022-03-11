import * as lakeformation from '@aws-cdk/aws-lakeformation';
import { Construct} from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { Location } from '@aws-cdk/aws-s3';
import { PolicyStatement, Role, ServicePrincipal, } from '@aws-cdk/aws-iam';

/**
 * The props for LF-S3-Location Construct.
 */
export interface LakeFormationS3LocationProps {
   /**
    * S3 bucket to be registered with Lakeformation
    */
    s3bucket:Location;
}

  /**
   * This CDK construct aims to register an S3 Location for Lakeformation with Read and Write access.
   * 
   * This construct is based on an IAM role with 2 policies folowing the least privilege AWS best practices:
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
   * import * as cdk from '@aws-cdk/core';
   * import { LakeformationS3Location } from 'aws-analytics-reference-architecture';
   * 
   * const exampleApp = new cdk.App();
   * const stack = new cdk.Stack(exampleApp, 'LakeformationS3LocationStack');
   * 
   * new LakeformationS3Location(stack, 'MyLakeformationS3Location', {
   * s3bucket:{
      bucketName: 'test',
      objectKey: 'test',
    }
   * });
   * ```
   */
export class LakeformationS3Location extends Construct {
   
    constructor(scope: Construct, id: string, props: LakeFormationS3LocationProps) {
      super(scope, id);

        /**
         * Create an Amazon IAM Role used by Lakeformation to register S3 location
         */
        const role = new Role(this, 'LFS3AccessRole', {
               assumedBy: new ServicePrincipal('lakeformation.amazonaws.com'),
        });
         
        // add policy to access S3 for Read and Write
        role.addToPolicy(
            new PolicyStatement({
                resources: [
                s3.Bucket.fromBucketName(
                    this,
                    "BucketByName",
                    props.s3bucket.bucketName
                    ).arnForObjects(props.s3bucket.objectKey)
                ],
                actions: [
                    's3:GetObject',
                    's3:PutObject',
                    's3:DeleteObject',
                ],
            }),
        );

        // add policy to list S3 bucket
        role.addToPolicy(
            new PolicyStatement({
                resources: [
                s3.Bucket.fromBucketName(
                    this,
                    "BucketName",
                    props.s3bucket.bucketName
                    ).bucketArn
                ],
                actions: [
                    's3:ListBucket'
                ],
            }),
        );

             

      //// The code below shows an example of how to instantiate the cfnresource
        new lakeformation.CfnResource(this, 'MyCfnResource', {
            resourceArn: s3.Bucket.fromBucketName(
            this,
            "BucketByNameCfn",
            props.s3bucket.bucketName
            ).arnForObjects(props.s3bucket.objectKey),

            useServiceLinkedRole: false,
      
            // the properties below are optional
            roleArn: role.roleArn
        });  

    }
}
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
   * The LakeformationS3Location aims to register an S3 Location for Lakeformation with Read and Write access
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
                    "BucketByName",
                    props.s3bucket.bucketName
                    ).bucketArn
                ],
                actions: [
                    's3:ListBucket'
                ],
            }),
        );

             

      //// The code below shows an example of how to instantiate the cfnreousrce
        new lakeformation.CfnResource(this, 'MyCfnResource', {
            resourceArn: s3.Bucket.fromBucketName(
            this,
            "BucketByName",
            props.s3bucket.bucketName
            ).arnForObjects(props.s3bucket.objectKey),

            useServiceLinkedRole: false,
      
            // the properties below are optional
            roleArn: role.roleArn
        });  

    }
}
import * as lakeformation from '@aws-cdk/aws-lakeformation';
import { Construct} from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { Location } from '@aws-cdk/aws-s3';
import { PolicyStatement, Role, ServicePrincipal, } from '@aws-cdk/aws-iam';

/**
* The props for LF-S3-Location Construct.
*/
export interface LakeFormationS3LocationProps {
  /**
  * S3 location to be registered with Lakeformation
  */
  s3Location: Location;
}

/**
* This CDK construct aims to register an S3 Location for Lakeformation with Read and Write access.
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
* import * as cdk from '@aws-cdk/core';
* import { LakeformationS3Location } from 'aws-analytics-reference-architecture';
* 
* const exampleApp = new cdk.App();
* const stack = new cdk.Stack(exampleApp, 'LakeformationS3LocationStack');
* 
* new LakeformationS3Location(stack, 'MyLakeformationS3Location', {
*   s3bucket:{
*     bucketName: 'test',
*     objectKey: 'test',
*   }
* });
* ```
*/
export class LakeformationS3Location extends Construct {
  
  constructor(scope: Construct, id: string, props: LakeFormationS3LocationProps) {
    super(scope, id);
  
    // Create a bucket from the S3 location
    const bucket = Bucket.fromBucketName(this, "LocationBucket", props.s3Location.bucketName);
    
    // Create an Amazon IAM Role used by Lakeformation to register S3 location
    const role = new Role(this, 'LFS3AccessRole', {
      assumedBy: new ServicePrincipal('lakeformation.amazonaws.com'),
    });
    
    // add policy to access S3 for Read and Write
    role.addToPolicy(
      new PolicyStatement({
        resources: [
          bucket.arnForObjects(props.s3Location.objectKey),
          bucket.bucketArn,
        ],
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject',
          's3:ListBucket',
        ],
      }),
    );
        
    // add policy to access KMS key used for the bucket encryption 
    if (bucket.encryptionKey){
      role.addToPolicy(
        new PolicyStatement({
          resources: [
            bucket.encryptionKey?.keyArn,
          ],
          actions: [
            'kms:Decrypt',
            'kms:GenerateDataKey',
          ],
        }),
      );
    }

    new lakeformation.CfnResource(this, 'MyCfnResource', {
      resourceArn: bucket.arnForObjects(props.s3Location.objectKey),
      useServiceLinkedRole: false,
      roleArn: role.roleArn,
    });
  }
}
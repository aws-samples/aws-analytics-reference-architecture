// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import { S3CrossAccount, S3CrossAccountProps } from '../s3-cross-account';

/**
 * Properties for the DataProduct Construct
 */
export interface DataProductProps {
    /**
    * S3CrossAccountProps for S3CrossAccount construct
    */
    readonly crossAccountAccessProps: S3CrossAccountProps;
}

/**
 * This CDK Construct enables creation of a new Data Product in Data Domain account by granting cross-account access to Central Gov. account.
 * It relies on S3CrossAccount Construct.
 * Currently, this construct adds no extra functionality compared to S3CrossAccount. It only provides API in data mesh specific context.
 * Therefore, one can use either {@link S3CrossAccount} or DataProduct to grant cross account permissions on an Amazon S3 location.
 * In the future, this construct will also trigger a process to register new Data Product when UI is not used.
 * 
 * Usage example:
 * ```typescript
 * import { App, Stack } from 'aws-cdk-lib';
 * import { DataProduct, DataLakeStorage } from 'aws-analytics-reference-architecture';
 * 
 * const exampleApp = new App();
 * const stack = new Stack(exampleApp, 'DataProductStack');
 * 
 * const myBucket = new DataLakeStorage(stack, 'MyDataLakeStorage');
 * 
 * new DataProduct(stack, 'MyDataProduct', { crossAccountAccessProps: {
 *  bucket: myBucket.cleanBucket,
 *  objectKey: 'my-data'
 *  accountId: '1234567891011'
 * }});
 * ```
 * 
 */
export class DataProduct extends Construct {
    /**
     * Construct a new instance of DataProduct.
     * @param {Construct} scope the Scope of the CDK Construct
     * @param {string} id the ID of the CDK Construct
     * @param {DataProductProps} props the DataProductProps properties
     * @access public
     */

    constructor(scope: Construct, id: string, props: DataProductProps) {
        super(scope, id);

        // cross-account bucket policy to grant access to Central Governance account
        new S3CrossAccount(this, 'CentralCrossAccountAccess', props.crossAccountAccessProps);

        // TODO: Make optional trigger for an EventBridge event via CustomResource in Central Gov. account if used without the UI
        // --> This is to create a new data product by passing database name and table names to central account
    }
}

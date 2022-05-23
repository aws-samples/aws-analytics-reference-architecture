// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Database } from '@aws-cdk/aws-glue-alpha';
import { Construct } from 'constructs';


/**
 * A Data Lake Catalog composed of 3 AWS Glue Database configured with AWS best practices:
 *  Databases for Raw/Cleaned/Transformed data,
 */

export class DataLakeCatalog extends Construct {

  /**
     * AWS Glue Database for Raw data
     */
  public readonly rawDatabase: Database;
  /**
     * AWS Glue Database for Clean data
     */
  public readonly cleanDatabase: Database;
  /**
     * AWS Glue Database for Transform data
     */
  public readonly transformDatabase: Database;

  /**
     * Construct a new instance of DataLakeCatalog based on S3 buckets with best practices configuration
     * @param {Construct} scope the Scope of the CDK Construct
     * @param {string} id the ID of the CDK Construct
     * @access public
     */

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.rawDatabase = new Database(this, 'raw-database', {
      databaseName: 'raw',
    });

    this.cleanDatabase = new Database(this, 'clean-database', {
      databaseName: 'clean',
    });

    this.transformDatabase = new Database(this, 'transform-database', {
      databaseName: 'transform',
    });
  }
}
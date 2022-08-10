// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PreBundledPysparkJobExecutable } from '../common/pre-bundled-pyspark-job-executable';
import { GlueVersion, Job, PythonVersion } from '@aws-cdk/aws-glue-alpha';
import { PreparedDataset } from './prepared-dataset';
import { Construct } from 'constructs';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket, Location } from 'aws-cdk-lib/aws-s3';
import { AraBucket } from '../ara-bucket';
import { SynchronousGlueJob } from '../synchronous-glue-job';
 
/**
 * The properties for the Bring Your Own Data generator
 */
export interface CustomDatasetProps {
  /**
   * The S3 location of the input data
   */
  readonly s3Location: Location;
  /**
   * The format of the input data
   */
  readonly inputFormat: CustomDatasetInputFormat;
  /**
   * The datetime column to use for data generation as the time reference
   */
  readonly datetimeColumn: string;
  /**
   * The datetime columns to use for data generation
   */
  readonly datetimeColumnsToAdjust: string[];
  /**
   * The interval to partition data and optimize the data generation
   */
  readonly partitionRange: number;
}

enum CustomDatasetInputFormat {
  CSV = 'csv',
  PARQUET = 'parquet',
  JSON = 'json',
}

/**
 * A CustomDataset is a dataset that you need to prepare for the [BatchReplayer](@link BatchReplayer) to generate data.
 * The dataset is transformed into a [PreparedDataset](@link PreparedDataset) by a Glue Job that runs synchronously during the CDK deploy.
 * 
 * The Glue job is applying the following transformations to the input dataset:
 * 1. Read the input dataset based on its format. Currently, it supports data in CSV, JSON and Parquet
 * 2. Group rows into tumbling windows based on the partition range parameter provided. 
 * The partition range should be adapted to the data volume and the total dataset time range
 * 3. Write data into the output bucket partitioned by the tumbling window time. For example, one partition for every 5 minutes
 * 4. Generate a manifest file based on the previous output to be used by the BatchReplayer for generating data
 */
export class CustomDataset extends Construct {

  /**
   * The prepared dataset generated from the custom dataset
   */
   readonly preparedDataset: PreparedDataset;

  /**
   * Constructs a new instance of a CustomDataset construct that extends a PreparedDataset
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {CustomDatasetProps} props the CustomDataset [properties]{@link CustomDatasetProps}
   */
  constructor(scope: Construct, id: string, props: CustomDatasetProps) {
    
    super(scope, id);

    // the source bucket to read data from
    const sourceBucket = Bucket.fromBucketAttributes(scope, 'InputBucket', {
      bucketName: props.s3Location.bucketName,
    })

    // the sink bucket used by the Glue job to write the prepared dataset
    const outputBucket = AraBucket.getOrCreate(scope, {
      bucketName: 'custom-dataset',
    });

    const glueRole = new Role(scope, 'CustomDatasetRole', {
      assumedBy: new ServicePrincipal('glue.amazonaws.com'),
    });
    sourceBucket.grantRead(glueRole, props.s3Location.objectKey + '/*');
    outputBucket.grantReadWrite(glueRole, props.s3Location.objectKey + '/*');
    outputBucket.grantReadWrite(glueRole, props.s3Location.objectKey + '_manifest');
    outputBucket.grantReadWrite(glueRole, props.s3Location.objectKey + '-manifest.csv');
    
    // Glue job to prepare the dataset
    new SynchronousGlueJob(scope, 'CustomDatasetJob', {
      executable: PreBundledPysparkJobExecutable.pythonEtl({
        glueVersion: GlueVersion.V3_0,
        pythonVersion: PythonVersion.THREE,
        codePath: 'data-generator/resources/glue/custom-dataset/script.py',
      }),
      defaultArguments: {
        s3_input_bucket: props.s3Location.bucketName,
        s3_input_prefix: props.s3Location.objectKey,
        s3_output_bucket: outputBucket.bucketName,
        s3_output_prefix: props.s3Location.objectKey,
        input_format: props.inputFormat,
        datetime_column: props.datetimeColumn,
        partition_range: props.partitionRange.toString(),
      },
      role: glueRole,
    });

    // Create a prepared dataset based on the output of the Glue job
    this.preparedDataset = new PreparedDataset({
      location: {
        bucketName: outputBucket.bucketName,
        objectKey: props.s3Location.objectKey,
      },
      startDatetime: '',
      manifestLocation: {
        bucketName: outputBucket.bucketName,
        objectKey: props.s3Location.objectKey,
      },
      dateTimeColumnToFilter: props.datetimeColumn,
      dateTimeColumnsToAdjust: props.datetimeColumnsToAdjust,
    });
  }
}


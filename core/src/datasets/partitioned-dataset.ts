// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Location } from "@aws-cdk/aws-s3";

export interface PartitionedDatasetProps {
  /**
   * The minimum datetime value in the dataset used to calculate time offset
   */
  readonly startDatetime: string;

  /**
   * The Amazon S3 Location of the source dataset.
   * It's composed of an Amazon S3 bucketName and an Amazon S3 objectKey
   */
  readonly location: Location;

  /**
   * Manifest file in csv format with two columns: start, path
   */
  readonly manifestLocation: Location;

  /**
   * Datetime column for filtering data
   */
  readonly dateTimeColumnToFilter: string;

  /**
   * Array of column names with datetime to adjust.
   * The source data will have date in the past 2021-01-01T00:00:00 while
   * the data replayer will have have the current time. The difference (aka. offset)
   * must be added to all datetime columns
   */
  readonly dateTimeColumnsToAdjust?: string[];
}

/**
 * PartitionedDataset enum-like class providing pre-defined datasets metadata and custom dataset creation.
 * 
 * PartitionDataset has following properties:
 * 
 * 1. Data is partitioned by timestamp (in seconds). Each folder stores data within a given range. 
 * There is no constraint on how long the timestange range can be. But each file must not be larger tahn 100MB.
 * Here is an example:
 * |- time_range_start=16000000000
 *    |- file1.csv 100MB
 *    |- file2.csv 50MB
 * |- time_range_start=16000000300 // 5 minute range (300 sec)
 *    |- file1.csv 1MB
 * |- time_range_start=16000000600
 *    |- file1.csv 100MB
 *    |- file2.csv 100MB
 *    |- whichever-file-name-is-fine-as-we-have-manifest-files.csv 50MB
 * 2. It has a manefest CSV file with two columns: start and path. Start is the timestamp
 * start        , path
 * 16000000000  , s3://<path>/<to>/<folder>/time_range_start=16000000000/file1.csv
 * 16000000000  , s3://<path>/<to>/<folder>/time_range_start=16000000000/file2.csv
 * 16000000300  , s3://<path>/<to>/<folder>/time_range_start=16000000300/file1.csv
 * 16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/file1.csv
 * 16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/file2.csv
 * 16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/whichever-file....csv
 */
export class PartitionedDataset {
  /**
   * The bucket name of the AWS Analytics Reference Architecture datasets
   */
  public static readonly DATASETS_BUCKET =
    "aws-analytics-reference-architecture";

  /**
   * The web sale dataset part of 1GB retail datasets
   */
  public static readonly RETAIL_1GB_WEB_SALE = new PartitionedDataset({
    location: {
      bucketName: PartitionedDataset.DATASETS_BUCKET,
      objectKey: "sample-datasets/prepared-data/web-sales",
    },
    startDatetime: "2021-01-01T00:00:00.000Z",
    manifestLocation: {
      bucketName: PartitionedDataset.DATASETS_BUCKET,
      objectKey: "sample-datasets/prepared-data/web-sales-manifest.csv",
    },
    dateTimeColumnToFilter: "sale_datetime",
    dateTimeColumnsToAdjust: ["sale_datetime"],
  });

  /**
   * Calculate the offset in Seconds from the startDatetime value and the current datetime
   * @param {string} startDatetime the min datetime value used as reference for offset
   * @access private
   */
  private static getOffset(startDatetime: string) {
    const now = new Date().getTime();
    const minDatetime = new Date(startDatetime).getTime();
    return Math.floor((now - minDatetime) / 1000);
  }

  /**
   * Start datetime replaying this dataset. Your data set may start from 1 Jan 2020 
   * But you can specify this to 1 Feb 2020 to omit the first month data.
   */
  readonly startDateTime: string;

  /**
   * The offset of the Dataset (difference between min datetime and now) in Seconds
   */
  readonly offset: number;

  /**
   * The Amazon S3 Location of the source dataset
   */
  readonly location: Location;

  /**
   * The name of the SQL table extracted from path
   */
  readonly tableName: string;

  /**
   * Manifest file in csv format with two columns: start, path
   */
  readonly manifestLocation: Location;

  /**
   * Datetime column for filtering data
   */
   readonly dateTimeColumnToFilter: string;

  /**
   * Array of column names with datetime to adjust
   */
  readonly dateTimeColumnsToAdjust?: string[];

  /**
   * Constructs a new instance of the Dataset class
   * @param {DatasetProps} props the DatasetProps
   * @access public
   */
  constructor(props: PartitionedDatasetProps) {
    this.startDateTime = props.startDatetime;
    this.offset = PartitionedDataset.getOffset(props.startDatetime);
    this.location = props.location;
    this.tableName = this.sqlTable();
    this.manifestLocation = props.manifestLocation;
    this.dateTimeColumnToFilter = props.dateTimeColumnToFilter;
    this.dateTimeColumnsToAdjust = props.dateTimeColumnsToAdjust;
  }

  /**
   * Extract the last part of the object key (with / delimiter) and replace '-' with '_' for SQL compatibility
   * @access private
   */
  private sqlTable() {
    const parsedPrefix = this.location.objectKey.split("/");
    const re = /\-/gi;
    return parsedPrefix[parsedPrefix.length - 1].replace(re, "_");
  }
}

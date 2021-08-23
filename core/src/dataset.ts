// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { readFileSync } from 'fs';
import { Location } from '@aws-cdk/aws-s3';


export interface DatasetProps {
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
  * The CREATE TABLE DDL command to create the AWS Glue Table
  */
  readonly createTable: string;
  /**
  * The SELECT query used to generate new data
  */
  readonly generateData: string;
}

/**
 * Dataset enum-like class providing pre-defined datasets metadata and custom dataset creation.
 */
export class Dataset {
  /**
   * The bucket name of the AWS Analytics Reference Architecture datasets
   */
  public static readonly DATASETS_BUCKET = 'aws-analytics-reference-architecture';
  /**
   * The web sale dataset part of retail datasets
   */
  public static readonly RETAIL_WEB_SALE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/web-sale',
    },
    startDatetime: '',
    createTable: '',
    generateData: '',
  });
  /**
   * The store sale dataset part of retail datasets
   */
  public static readonly RETAIL_STORE_SALE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/store-sale',
    },
    startDatetime: '2021-05-27T21:20:44.000Z',
    createTable: readFileSync('./src/sql/retail-store-sale-create.sql').toString(),
    generateData: readFileSync('./src/sql/retail-store-sale-generate.sql').toString(),
  });
  /**
   * The customer dataset part of retail datasets
   */
  public static readonly RETAIL_CUSTOMER = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/customer',
    },
    startDatetime: '',
    createTable: '',
    generateData: '',
  });
  /**
   * The customer address dataset part of retail datasets
   */
  public static readonly RETAIL_ADDRESS = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/address',
    },
    startDatetime: '',
    createTable: '',
    generateData: '',
  });
  /**
   * The item dataset part of retail datasets
   */
  public static readonly RETAIL_ITEM = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/item',
    },
    startDatetime: '',
    createTable: '',
    generateData: '',
  });
  /**
   * The promotion dataset part of retail datasets
   */
  public static readonly RETAIL_PROMO = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/promo',
    },
    startDatetime: '',
    createTable: '',
    generateData: '',
  });
  /**
   * The warehouse dataset part of retail datasets
   */
  public static readonly RETAIL_WAREHOUSE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/warehouse',
    },
    startDatetime: '',
    createTable: '',
    generateData: '',
  });
  /**
   * The store dataset part of retail datasets
   */
  public static readonly RETAIL_STORE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/store',
    },
    startDatetime: '',
    createTable: '',
    generateData: '',
  });
  /**
   * Calculate the offset in Seconds from the min datetime value and the current datetime
   * @param {string} startDatetime the min datetime value used as reference for offset
   * @access private
   */
  private static getOffset(startDatetime: string) {
    const now = new Date().getSeconds();
    const minDatetime = new Date(startDatetime).getSeconds();
    return now - minDatetime;
  }
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
   * The CREATE TABLE DDL command to create the AWS Glue Table
   */
  readonly createTable: string;
  /**
   * The SELECT query used to generate new data
   */
  readonly generateData: string;

  /**
   * Constructs a new instance of the Dataset class
   * @param {DatasetProps} props the DatasetProps
   * @access public
   */
  constructor(props: DatasetProps) {
    this.offset = Dataset.getOffset(props.startDatetime);
    this.location = props.location;
    this.createTable = props.createTable;
    this.generateData = props.generateData;
    this.tableName = this.sqlTable();
  }

  /**
   * Parse the CREATE TABLE statement template
   * @param {string} database the database name to parse
   * @param {string} table the table name to parse
   * @param {string} bucket the bucket name to parse
   * @param {string} key the key to parse
   * @access public
   */
  public parseCreateQuery(database: string, table: string, bucket: string, key: string) {
    const dbRe = /{{DATABASE}}/gi;
    const tableRe = /{{TABLE}}/gi;
    const bucketRe = /{{BUCKET}}/gi;
    const keyRe = /{{KEY}}/gi;
    return this.createTable
      .replace(dbRe, database)
      .replace(tableRe, table)
      .replace(bucketRe, bucket)
      .replace(keyRe, key);
  }

  /**
   * Parse the CREATE TABLE statement template
   * @param {string} database the database name to parse
   * @param {string} sourceTable the source table name to parse
   * @param {string} targetTable the target table name to parse
   * @access public
   */
  public parseGenerateQuery(database: string, sourceTable: string, targetTable: string) {
    const dbRe = /{{DATABASE}}/gi;
    const sourceTableRe = /{{SOURCE_TABLE}}/gi;
    const targetTableRe = /{{TARGET_TABLE}}/gi;
    return this.generateData
      .replace(dbRe, database)
      .replace(sourceTableRe, sourceTable)
      .replace(targetTableRe, targetTable);
  }

  /**
   * Extract the last part of the object key (with / delimiter) and replace '-' with '_' for SQL compatibility
   * @access private
   */
  private sqlTable() {
    const parsedPrefix = this.location.objectKey.split('/');
    const re = /\-/gi;
    return parsedPrefix[parsedPrefix.length-1].replace(re, '_');
  }
}
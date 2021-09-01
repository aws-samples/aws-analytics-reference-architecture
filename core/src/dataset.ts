// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Location } from '@aws-cdk/aws-s3';
import { retailCustomerCreate, retailCustomerGenerate } from './datasets/retail-customer';
import { retailCustomerAddressCreate, retailCustomerAddressGenerate } from './datasets/retail-customer-address';
import { retailItemCreate, retailItemGenerate } from './datasets/retail-item';
import { retailPromoCreate, retailPromoGenerate } from './datasets/retail-promo';
import { retailStoreCreate, retailStoreGenerate } from './datasets/retail-store';
import { retailStoreSaleCreate, retailStoreSaleGenerate } from './datasets/retail-store-sale';
import { retailWarehouseCreate, retailWarehouseGenerate } from './datasets/retail-warehouse';
import { retailWebSaleCreate, retailWebSaleGenerate } from './datasets/retail-web-sale';

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
   * The web sale dataset part of 1GB retail datasets
   */
  public static readonly RETAIL_1GB_WEB_SALE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/1GB/web-sale',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailWebSaleCreate,
    generateData: retailWebSaleGenerate,
  });
  /**
   * The store sale dataset part of 1GB retail datasets
   */
  public static readonly RETAIL_1GB_STORE_SALE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/1GB/store-sale',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailStoreSaleCreate,
    generateData: retailStoreSaleGenerate,
  });
  /**
   * The customer dataset part of 1GB retail datasets
   */
  public static readonly RETAIL_1GB_CUSTOMER = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/1GB/customer',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailCustomerCreate,
    generateData: retailCustomerGenerate,
  });
  /**
   * The customer address dataset part of 1GB retail datasets
   */
  public static readonly RETAIL_1GB_CUSTOMER_ADDRESS = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/1GB/customer-address',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailCustomerAddressCreate,
    generateData: retailCustomerAddressGenerate,
  });
  /**
   * The item dataset part of 1GB retail datasets
   */
  public static readonly RETAIL_1GB_ITEM = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/1GB/item',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailItemCreate,
    generateData: retailItemGenerate,
  });
  /**
   * The promotion dataset part of 1GB retail datasets
   */
  public static readonly RETAIL_1GB_PROMO = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/1GB/promo',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailPromoCreate,
    generateData: retailPromoGenerate,
  });
  /**
   * The warehouse dataset part of 1GB retail datasets
   */
  public static readonly RETAIL_1GB_WAREHOUSE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/1GB/warehouse',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailWarehouseCreate,
    generateData: retailWarehouseGenerate,
  });
  /**
   * The store dataset part of 1GB retail datasets
   */
  public static readonly RETAIL_1GB_STORE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/1GB/store',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailStoreCreate,
    generateData: retailStoreGenerate,
  });
  /**
   * The web sale dataset part of 100GB retail datasets
   */
  public static readonly RETAIL_100GB_WEB_SALE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/100GB/web-sale',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailWebSaleCreate,
    generateData: retailWebSaleGenerate,
  });
  /**
     * The store sale dataset part of 100GB retail datasets
     */
  public static readonly RETAIL_100GB_STORE_SALE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/100GB/store-sale',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailStoreSaleCreate,
    generateData: retailStoreSaleGenerate,
  });
  /**
     * The customer dataset part of 100GB retail datasets
     */
  public static readonly RETAIL_100GB_CUSTOMER = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/100GB/customer',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailCustomerCreate,
    generateData: retailCustomerGenerate,
  });
  /**
     * The customer address dataset part of 100GB retail datasets
     */
  public static readonly RETAIL_100GB_CUSTOMER_ADDRESS = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/100GB/customer-address',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailCustomerAddressCreate,
    generateData: retailCustomerAddressGenerate,
  });
  /**
     * The item dataset part of 100GB retail datasets
     */
  public static readonly RETAIL_100GB_ITEM = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/100GB/item',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailItemCreate,
    generateData: retailItemGenerate,
  });
  /**
     * The promotion dataset part of 100GB retail datasets
     */
  public static readonly RETAIL_100GB_PROMO = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/100GB/promo',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailPromoCreate,
    generateData: retailPromoGenerate,
  });
  /**
     * The warehouse dataset part 100GB of retail datasets
     */
  public static readonly RETAIL_100GB_WAREHOUSE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/100GB/warehouse',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailWarehouseCreate,
    generateData: retailWarehouseGenerate,
  });
  /**
     * The store dataset part of 100GB retail datasets
     */
  public static readonly RETAIL_100GB_STORE = new Dataset({
    location: {
      bucketName: Dataset.DATASETS_BUCKET,
      objectKey: 'datasets/retail/100GB/store',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    createTable: retailStoreCreate,
    generateData: retailStoreGenerate,
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
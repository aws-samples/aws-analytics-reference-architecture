// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Location } from 'aws-cdk-lib/aws-s3';

/**
 * The properties for the PreparedDataset class used by the BatchReplayer construct
 */

export interface PreparedDatasetProps {
  /**
   * The minimum datetime value in the dataset used to calculate time offset.
   * @default - The offset parameter is used.
   */
  readonly startDatetime?: string;

  /**
   * The offset in seconds for replaying data. It is the difference between the `startDatetime` and now.
   * @default - Calculate the offset from startDatetime parameter during CDK deployment
   */
  readonly offset?: string;

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
 * PreparedDataset is used by the [BatchReplayer]{@link BatchReplayer} to generate data in different targets.
 * 
 * One of the startDatetime or offset parameter needs to be passed to the constructor: 
 *  * StartDatetime is used for prepared datasets provided by the Analytics Reference Architecture because they are known during synthetize time.
 *  * Offset is used when a PreparedDataset is created from a CustomDataset because the startDatetime is not known during synthetize time.
 *
 * A PreparedDataset has following properties:
 *
 * 1. Data is partitioned by timestamp (a range in seconds). Each folder stores data within a given range.
 * There is no constraint on how long the timestamp range can be. But each file must not be larger than 100MB.
 * Creating new PreparedDataset requires to find the right balance between number of partitions and the amount of data read by each BatchReplayer (micro-)batch
 * The available PreparedDatasets have a timestamp range that fit the total dataset time range (see each dataset documentation below) to avoid having too many partitions. 
 *
 * Here is an example:
 *
 * |- time_range_start=16000000000
 *
 *    |- file1.csv 100MB
 *
 *    |- file2.csv 50MB
 *
 * |- time_range_start=16000000300 // 5 minute range (300 sec)
 *
 *    |- file1.csv 1MB
 *
 * |- time_range_start=16000000600
 *
 *    |- file1.csv 100MB
 *
 *    |- file2.csv 100MB
 *
 *    |- whichever-file-name-is-fine-as-we-have-manifest-files.csv 50MB
 *
 * 2. It has a manifest CSV file with two columns: start and path. Start is the timestamp
 *
 * start        , path
 *
 * 16000000000  , s3://<path>/<to>/<folder>/time_range_start=16000000000/file1.csv
 *
 * 16000000000  , s3://<path>/<to>/<folder>/time_range_start=16000000000/file2.csv
 *
 * 16000000300  , s3://<path>/<to>/<folder>/time_range_start=16000000300/file1.csv
 *
 * 16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/file1.csv
 *
 * 16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/file2.csv
 *
 * 16000000600  , s3://<path>/<to>/<folder>/time_range_start=16000000600/whichever-file....csv
 * 
 * If the stack is deployed in another region than eu-west-1, data transfer costs will apply.
 * The pre-defined PreparedDataset access is recharged to the consumer via Amazon S3 Requester Pay feature.
 */
export class PreparedDataset {

  /**
   * The bucket name of the AWS Analytics Reference Architecture datasets. 
   * Data transfer costs will aply if the stack is deployed in another region than eu-west-1.
   * The pre-defined PreparedDataset access is recharged to the consumer via Amazon S3 Requester Pay feature.
   */
  
  public static readonly DATASETS_BUCKET = 'aws-analytics-reference-architecture';

  /**
   * The web sale dataset part of 1GB retail datasets.
   * The time range is one week from min(sale_datetime) to max(sale_datetime)
   *
   * | Column name           | Column type | Example                  |
   * |-----------------------|-------------|--------------------------|
   * | item_id               | bigint      | 3935                     |
   * | order_id              | bigint      | 81837                    |
   * | quantity              | bigint      | 65                       |
   * | wholesale_cost        | double      | 32.98                    |
   * | list_price            | double      | 47.82                    |
   * | sales_price           | double      | 36.34                    |
   * | ext_discount_amt      | double      | 2828.8                   |
   * | ext_sales_price       | double      | 2362.1                   |
   * | ext_wholesale_cost    | double      | 2143.7                   |
   * | ext_list_price        | double      | 3108.3                   |
   * | ext_tax               | double      | 0.0                      |
   * | coupon_amt            | double      | 209.62                   |
   * | ext_ship_cost         | double      | 372.45                   |
   * | net_paid              | double      | 2152.48                  |
   * | net_paid_inc_tax      | double      | 2152.48                  |
   * | net_paid_inc_ship     | double      | 442.33                   |
   * | net_paid_inc_ship_tax | double      | 442.33                   |
   * | net_profit            | double      | 8.78                     |
   * | bill_customer_id      | string      | AAAAAAAALNLFAAAA         |
   * | ship_customer_id      | string      | AAAAAAAALPPJAAAA         |
   * | warehouse_id          | string      | AAAAAAAABAAAAAAA         |
   * | promo_id              | string      | AAAAAAAAPCAAAAAA         |
   * | ship_delay            | string      | OVERNIGHT                |
   * | ship_mode             | string      | SEA                      |
   * | ship_carrier          | string      | GREAT EASTERN            |
   * | sale_datetime         | string      | 2021-01-06T15:00:19.373Z |
   *
   * The BatchReplayer adds two columns ingestion_start and ingestion_end
   */
  public static readonly RETAIL_1_GB_WEB_SALE = new PreparedDataset({
    location: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/web-sale',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    manifestLocation: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/web-sale-manifest.csv',
    },
    dateTimeColumnToFilter: 'sale_datetime',
    dateTimeColumnsToAdjust: ['sale_datetime'],
  });

  /**
   * The store sale dataset part of 1GB retail datasets.
   * The time range is one week from min(sale_datetime) to max(sale_datetime)
   *
   * | Column name        | Column type | Example                  |
   * |--------------------|-------------|--------------------------|
   * | item_id            | bigint      | 3935                     |
   * | ticket_id          | bigint      | 81837                    |
   * | quantity           | bigint      | 96                       |
   * | wholesale_cost     | double      | 21.15                    |
   * | list_price         | double      | 21.78                    |
   * | sales_price        | double      | 21.18                    |
   * | ext_discount_amt   | double      | 0.0                      |
   * | ext_sales_price    | double      | 2033.28                  |
   * | ext_wholesale_cost | double      | 2030.4                   |
   * | ext_list_price     | double      | 2090.88                  |
   * | ext_tax            | double      | 81.1                     |
   * | coupon_amt         | double      | 0.0                      |
   * | net_paid           | double      | 2033.28                  |
   * | net_paid_inc_tax   | double      | 2114.38                  |
   * | net_profit         | double      | 2.88                     |
   * | customer_id        | string      | AAAAAAAAEOIDAAAA         |
   * | store_id           | string      | AAAAAAAABAAAAAAA         |
   * | promo_id           | string      | AAAAAAAAEEAAAAAA         |
   * | sale_datetime      | string      | 2021-01-04T22:20:04.144Z |
   *
   * The BatchReplayer adds two columns ingestion_start and ingestion_end
   */
  public static readonly RETAIL_1_GB_STORE_SALE = new PreparedDataset({
    location: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/store-sale',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    manifestLocation: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/store-sale-manifest.csv',
    },
    dateTimeColumnToFilter: 'sale_datetime',
    dateTimeColumnsToAdjust: ['sale_datetime'],
  });

  /**
   * The customer dataset part of 1GB retail datasets.
   * The time range is one week from min(customer_datetime) to max(customer_datetime)
   *
   * | Column name       	| Column type 	| Example                    	|
   * |-------------------	|-------------	|----------------------------	|
   * | customer_id       	| string      	| AAAAAAAAHCLFOHAA           	|
   * | salutation        	| string      	| Miss                       	|
   * | first_name        	| string      	| Tina                       	|
   * | last_name         	| string      	| Frias                      	|
   * | birth_country     	| string      	| GEORGIA                    	|
   * | email_address     	| string      	| Tina.Frias@jdK4TZ1qJXB.org 	|
   * | birth_date        	| string      	| 1924-06-14                 	|
   * | gender            	| string      	| F                          	|
   * | marital_status    	| string      	| D                          	|
   * | education_status  	| string      	| 2 yr Degree                	|
   * | purchase_estimate 	| bigint      	| 2500                       	|
   * | credit_rating     	| string      	| Low Risk                   	|
   * | buy_potential     	| string      	| 1001-5000                  	|
   * | vehicle_count     	| bigint      	| 1                          	|
   * | lower_bound       	| bigint      	| 170001                     	|
   * | upper_bound       	| bigint      	| 180000                     	|
   * | address_id        	| string      	| AAAAAAAALAFINEAA           	|
   * | customer_datetime 	| string      	| 2021-01-19T08:07:47.140Z   	|
   *
   * The BatchReplayer adds two columns ingestion_start and ingestion_end
   */
  public static readonly RETAIL_1_GB_CUSTOMER = new PreparedDataset({
    location: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/customer',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    manifestLocation: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/customer-manifest.csv',
    },
    dateTimeColumnToFilter: 'customer_datetime',
    dateTimeColumnsToAdjust: ['customer_datetime'],
  });

  /**
   * The customer address dataset part of 1GB retail datasets.
   * It can be joined with customer dataset on address_id column.
   * The time range is one week from min(address_datetime) to max(address_datetime)
   *
   * | Column name      | Column type | Example                  |
   * |------------------|-------------|--------------------------|
   * | address_id       | string      | AAAAAAAAINDKAAAA         |
   * | city             | string      | Farmington               |
   * | county           | string      | Greeley County           |
   * | state            | string      | KS                       |
   * | zip              | bigint      | 69145                    |
   * | country          | string      | United States            |
   * | gmt_offset       | double      | -6.0                     |
   * | location_type    | string      | apartment                |
   * | street           | string      | 390 Pine South Boulevard |
   * | address_datetime | string      | 2021-01-03T02:25:52.826Z |
   *
   * The BatchReplayer adds two columns ingestion_start and ingestion_end
   *
   */
  public static readonly RETAIL_1_GB_CUSTOMER_ADDRESS = new PreparedDataset({
    location: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/customer-address',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    manifestLocation: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/customer-address-manifest.csv',
    },
    dateTimeColumnToFilter: 'address_datetime',
    dateTimeColumnsToAdjust: ['address_datetime'],
  });

  /**
   * The item dataset part of 1GB retail datasets
   * The time range is one week from min(item_datetime) to max(item_datetime)
   *
   * | Column name   | Column type | Example                                        |
   * |---------------|-------------|------------------------------------------------|
   * |       item_id |      bigint |                                          15018 |
   * |     item_desc |      string | Even ready materials tell with a ministers; un |
   * |         brand |      string |                                 scholarmaxi #9 |
   * |         class |      string |                                        fishing |
   * |      category |      string |                                         Sports |
   * |      manufact |      string |                                    eseoughtpri |
   * |          size |      string |                                            N/A |
   * |         color |      string |                                        thistle |
   * |         units |      string |                                         Bundle |
   * |     container |      string |                                        Unknown |
   * |  product_name |      string |                          eingoughtbarantiought |
   * | item_datetime |      string |                       2021-01-01T18:17:56.718Z |
   *
   * The BatchReplayer adds two columns ingestion_start and ingestion_end
   */
  public static readonly RETAIL_1_GB_ITEM = new PreparedDataset({
    location: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/item',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    manifestLocation: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/item-manifest.csv',
    },
    dateTimeColumnToFilter: 'item_datetime',
    dateTimeColumnsToAdjust: ['item_datetime'],
  });

  /**
   * The promo dataset part of 1GB retail datasets
   * The time range is one week from min(promo_datetime) to max(promo_datetime)
   *
   * | Column name     | Column type | Example                  |
   * |-----------------|-------------|--------------------------|
   * |        promo_id |      string |         AAAAAAAAHIAAAAAA |
   * |            cost |      double |                   1000.0 |
   * | response_target |      bigint |                        1 |
   * |      promo_name |      string |                     anti |
   * |         purpose |      string |                  Unknown |
   * |  start_datetime |      string | 2021-01-01 00:00:35.890Z |
   * |    end_datetime |      string | 2021-01-02 13:16:09.785Z |
   * |  promo_datetime |      string | 2021-01-01 00:00:16.104Z |
   *
   * The BatchReplayer adds two columns ingestion_start and ingestion_end
   */
  public static readonly RETAIL_1_GB_PROMO = new PreparedDataset({
    location: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/promo',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    manifestLocation: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/promo-manifest.csv',
    },
    dateTimeColumnToFilter: 'promo_datetime',
    dateTimeColumnsToAdjust: ['promo_datetime'],
  });

  /**
   * The store dataset part of 1GB retail datasets
   * The time range is one week from min(store_datetime) to max(store_datetime)
   *
   * | Column name      | Column type | Example                  |
   * |------------------|-------------|--------------------------|
   * |         store_id |      string |         AAAAAAAAKAAAAAAA |
   * |       store_name |      string |                      bar |
   * | number_employees |      bigint |                      219 |
   * |      floor_space |      bigint |                  6505323 |
   * |            hours |      string |                 8AM-12AM |
   * |          manager |      string |             David Trahan |
   * |        market_id |      bigint |                       10 |
   * |   market_manager |      string |      Christopher Maxwell |
   * |             city |      string |                   Midway |
   * |           county |      string |        Williamson County |
   * |            state |      string |                       TN |
   * |              zip |      bigint |                    31904 |
   * |          country |      string |            United States |
   * |       gmt_offset |      double |                     -5.0 |
   * |   tax_percentage |      double |                      0.0 |
   * |           street |      string |            71 Cedar Blvd |
   * |   store_datetime |      string | 2021-01-01T00:00:00.017Z |
   *
   * The BatchReplayer adds two columns ingestion_start and ingestion_end
   */
  public static readonly RETAIL_1_GB_STORE = new PreparedDataset({
    location: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/store',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    manifestLocation: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/store-manifest.csv',
    },
    dateTimeColumnToFilter: 'store_datetime',
    dateTimeColumnsToAdjust: ['store_datetime'],
  });

  /**
   * The store dataset part of 1GB retail datasets
   * The time range is one week from min(warehouse_datetime) to max(warehouse_datetime)
   *
   * | Column name        | Column type | Example                  |
   * |--------------------|-------------|--------------------------|
   * |       warehouse_id |      string |         AAAAAAAAEAAAAAAA |
   * |     warehouse_name |      string |               Operations |
   * |             street |      string |    461 Second Johnson Wy |
   * |               city |      string |                 Fairview |
   * |                zip |      bigint |                    35709 |
   * |             county |      string |        Williamson County |
   * |              state |      string |                       TN |
   * |            country |      string |            United States |
   * |         gmt_offset |      double |                     -5.0 |
   * | warehouse_datetime |      string | 2021-01-01T00:00:00.123Z |
   *
   */
  public static readonly RETAIL_1_GB_WAREHOUSE = new PreparedDataset({
    location: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/warehouse',
    },
    startDatetime: '2021-01-01T00:00:00.000Z',
    manifestLocation: {
      bucketName: PreparedDataset.DATASETS_BUCKET,
      objectKey: 'datasets/prepared/retail/1GB/warehouse-manifest.csv',
    },
    dateTimeColumnToFilter: 'warehouse_datetime',
    dateTimeColumnsToAdjust: ['warehouse_datetime'],
  });

  /**
   * Calculate the offset in Seconds from the startDatetime value and the current datetime
   * @param {string} startDatetime the min datetime value used as reference for offset
   * @access private
   */
  private static getOffset(startDatetime: string) {
    const now = new Date().getTime();
    const minDatetime = new Date(startDatetime).getTime();
    return Math.floor((now - minDatetime) / 1000).toString();
  }

  /**
   * Start datetime replaying this dataset. Your data set may start from 1 Jan 2020
   * But you can specify this to 1 Feb 2020 to omit the first month data.
   */
  readonly startDateTime?: string;

  /**
   * The offset of the Dataset (difference between min datetime and now) in Seconds
   */
  readonly offset?: string;

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
  constructor(props: PreparedDatasetProps) {
    if (props.startDatetime === undefined && props.offset === undefined){
      throw new Error('[PreparedDataset] One of startDatetime or offset parameter must be passed');
    }
    if (props.startDatetime !== undefined && props.offset !== undefined){
      throw new Error('[PreparedDataset] Only one of startDatetime or offset parameter must be passed');
    }
    this.startDateTime = props.startDatetime;
    this.offset = props.startDatetime ? PreparedDataset.getOffset(props.startDatetime) : props.offset;
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
    const parsedPrefix = this.location.objectKey.split('/');
    const re = /\-/gi;
    return parsedPrefix[parsedPrefix.length - 1].replace(re, '_');
  }
}

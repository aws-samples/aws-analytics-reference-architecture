//import * as s3 from '@aws-cdk/aws-s3';
//import * as kinesis from '@aws-cdk/aws-kinesis';
import { Construct, Arn } from '@aws-cdk/core';

/**
 * @summary Dataset enum-like class providing pre-defined datasets metadata and custom dataset creation.
 */

export class Dataset {
  // Enums for pre-defined dataset
  public static DATASETS_LOCATION = 's3://aws-analytics-reference-architecture/datasets';
  public static RETAIL_WEBSALE = new Dataset(Dataset.DATASETS_LOCATION + '/retail/websale', 'sale_datetime');
  public static RETAIL_STORESALE = new Dataset(Dataset.DATASETS_LOCATION + '/retail/storesale', 'sale_datetime');
  public static RETAIL_CUSTOMER = new Dataset(Dataset.DATASETS_LOCATION + '/retail/customer', 'customer_datetime');
  public static RETAIL_ADDRESS = new Dataset(Dataset.DATASETS_LOCATION + '/retail/address', 'address_datetime');
  public static RETAIL_ITEM = new Dataset(Dataset.DATASETS_LOCATION + '/retail/item', 'item_datetime');
  public static RETAIL_PROMO = new Dataset(Dataset.DATASETS_LOCATION + '/retail/promo', 'promo_datetime');
  public static RETAIL_WAREHOUSE = new Dataset(Dataset.DATASETS_LOCATION + '/retail/warehouse', 'warehouse_datetime');
  public static RETAIL_STORE = new Dataset(Dataset.DATASETS_LOCATION + '/retail/store', 'store_datetime');

  /**
   * Constructs a new instance of the Dataset class
   * @param {string} location the S3 path where the dataset is located
   * @param {string} datetime the column name in the dataset containing event datetime
   * @since 1.0.1
   * @access public
   */
  constructor(public readonly location: string, public readonly datetime: string) { }
}

/**
 * @summary Properties for DataGenerator Construct.
 */

export interface DataGeneratorProps {
  /**
   * Sink Arn to receive the genarated data.
   * Sink can be an S3 bucket, a Kinesis Data Stream or a MSK topic.
   */
  readonly sinkArn: string;
  /**
   * Dataset S3 path source used to generate the data.
   * Use a pre-defined [Dataset]{@link Dataset} or create a [custom one]{@link Dataset.constructor}.
   */
  readonly sourceS3Path: string;
  /**
   * Dataset column containing the event datetime, updated by the DataGenerator with current datetime.
   * Use a pre-defined [Dataset]{@link Dataset} or create a [custom one]{@link Dataset.constructor}.
   */
  readonly sourceDatetime: string;
}

/**
 * @summary DataGenerator Construct to replay data from an existing dataset into a target replacing datetime to current datetime
 * Target can be an S3 bucket, a Kinesis Data Stream or a MSK topic.
 * DataGenerator provides pre-defined datasets to reuse or can use custom datasets.
 * If a custom dataset is used, an S3 Arn source and a datetime column must be provided.
 */

export class DataGenerator extends Construct {
  public readonly sinkArn: Arn;
  public readonly sourceS3Path: string;
  public readonly sourceDatetime: string;

  /**
   * Constructs a new instance of the DataGenerator class
   * @param {cdk.App} scope the Scope of the CDK Stack
   * @param {string} id the ID of the CDK Stack
   * @param {DataGeneratorProps} props the DataGenerator [properties]{@link DataGeneratorProps}
   * @since 1.0.1
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataGeneratorProps) {
    super(scope, id);

    // Validate parameters
    // check if the service in the sink is supported [S3, KDS, MSK]
    if ( ['s3', 'kinesis', 'msk'].includes(Arn.parse(props.sinkArn).service) ) {
      this.sinkArn = props.sinkArn;
    } else {
      throw new TypeError('DataGenerator sinkArn parameter should be S3, Kinesis Data Stream or MSK topic');
    }

    this.sourceS3Path = props.sourceS3Path;
    this.sourceDatetime = props.sourceDatetime;
  }
}
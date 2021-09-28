// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DataGenerator } from '../src/data-generator';
import { Dataset } from '../src/dataset';
import '@aws-cdk/assert/jest';


// Instantiate a custom Dataset
const customDataset = new Dataset({
  location: {
    bucketName: 'custom-bucket',
    objectKey: 'custom-prefix/custom-table',
  },
  startDatetime: '2021-06-27T21:20:44.000Z',
  createTable: 'CREATE TABLE',
  generateData: 'UNLOAD',
});

test('custom Dataset bucket', () => {
  // Test if bucket parameter is right
  expect(customDataset.location.bucketName).toEqual('custom-bucket');
});

test('custom Dataset location', () => {
  // Test if prefix parameter is right
  expect(customDataset.location.objectKey).toEqual('custom-prefix/custom-table');
});

test('custom Dataset createTable', () => {
  // Test if datetime parameter is right
  expect(customDataset.createTable).toEqual('CREATE TABLE');
});

test('custom Dataset createTable', () => {
  // Test if datetime parameter is right
  expect(customDataset.generateData).toEqual('UNLOAD');
});

test('ParseCreateQuery method', () => {
  // Test if create table statement is correctly parsed
  expect(Dataset.RETAIL_1GB_STORE_SALE.parseCreateQuery(
    DataGenerator.DATA_GENERATOR_DATABASE,
    Dataset.RETAIL_1GB_STORE_SALE.tableName,
    Dataset.RETAIL_1GB_STORE_SALE.location.bucketName,
    Dataset.RETAIL_1GB_STORE_SALE.location.objectKey,
  )).toEqual(`CREATE EXTERNAL TABLE IF NOT EXISTS ${DataGenerator.DATA_GENERATOR_DATABASE}.${Dataset.RETAIL_1GB_STORE_SALE.tableName}(
  item_id bigint,
  ticket_id bigint,
  quantity bigint,
  wholesale_cost double,
  list_price double,
  sales_price double,
  ext_discount_amt double,
  ext_sales_price double,
  ext_wholesale_cost double,
  ext_list_price double,
  ext_tax double,
  coupon_amt double,
  net_paid double,
  net_paid_inc_tax double,
  net_profit double,
  customer_id string,
  store_id string,
  promo_id string,
  sale_datetime string
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde'
LOCATION
  's3://${Dataset.RETAIL_1GB_STORE_SALE.location.bucketName}/${Dataset.RETAIL_1GB_STORE_SALE.location.objectKey}/'
TBLPROPERTIES (
  'skip.header.line.count'='1'
)`);
});

test('ParseGenerateQuery method', () => {
  // Test if generate data statement is correctly parsed
  expect(Dataset.RETAIL_1GB_STORE_SALE.parseGenerateQuery(
    DataGenerator.DATA_GENERATOR_DATABASE,
    Dataset.RETAIL_1GB_STORE_SALE.tableName+'_source',
    Dataset.RETAIL_1GB_STORE_SALE.tableName+'_target',
  ),
  ).toEqual(`INSERT INTO ${DataGenerator.DATA_GENERATOR_DATABASE}.${Dataset.RETAIL_1GB_STORE_SALE.tableName}`+'_target'+` (
  SELECT
    item_id,
    ticket_id,
    quantity,
    wholesale_cost,
    list_price,
    sales_price,
    ext_discount_amt,
    ext_sales_price,
    ext_wholesale_cost,
    ext_list_price,
    ext_tax,
    coupon_amt,
    net_paid,
    net_paid_inc_tax,
    net_profit,
    customer_id,
    store_id,
    promo_id,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(sale_datetime))) as sale_datetime
  FROM ${DataGenerator.DATA_GENERATOR_DATABASE}.${Dataset.RETAIL_1GB_STORE_SALE.tableName}`+'_source'+`
  WHERE sale_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)`);
});
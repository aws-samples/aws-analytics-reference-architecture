CREATE EXTERNAL TABLE IF NOT EXISTS `{{DATABASE}}.{{TABLE}}`(
  `item_id` bigint,
  `ticket_id` bigint,
  `quantity` bigint,
  `wholesale_cost` double,
  `list_price` double,
  `sales_price` double,
  `ext_discount_amt` double,
  `ext_sales_price` double,
  `ext_wholesale_cost` double,
  `ext_list_price` double,
  `ext_tax` double,
  `coupon_amt` double,
  `net_paid` double,
  `net_paid_inc_tax` double,
  `net_profit` double,
  `customer_id` string,
  `store_id` string,
  `promo_id` string,
  `sale_datetime` string)
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY ','
STORED AS INPUTFORMAT
  'org.apache.hadoop.mapred.TextInputFormat'
OUTPUTFORMAT
  'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
LOCATION
  's3://{{BUCKET}}{{KEY}}/'
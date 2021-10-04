export const retailStoreSaleCreate = `CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
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
ROW FORMAT DELIMITED 
  FIELDS TERMINATED BY ',' 
STORED AS INPUTFORMAT 
  'org.apache.hadoop.mapred.TextInputFormat' 
OUTPUTFORMAT 
  'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
LOCATION
  's3://{{BUCKET}}/{{KEY}}/'
TBLPROPERTIES (
  'skip.header.line.count'='1'
)`;

export const retailStoreSaleGenerate = `INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
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
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE sale_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)`;
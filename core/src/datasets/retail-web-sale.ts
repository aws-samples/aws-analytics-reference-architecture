export const retailWebSaleCreate = `CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
  item_id bigint,
  order_id bigint,
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
  ext_ship_cost double,
  net_paid double,
  net_paid_inc_tax double,
  net_paid_inc_ship double,
  net_paid_inc_ship_tax double,
  net_profit double,
  bill_customer_id string,
  ship_customer_id string,
  warehouse_id string,
  promo_id string,
  ship_delay string,
  ship_mode string,
  ship_carrier string,
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

export const retailWebSaleGenerate = `INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    item_id,
    order_id,
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
    ext_ship_cost,
    net_paid,
    net_paid_inc_tax,
    net_paid_inc_ship,
    net_paid_inc_ship_tax,
    net_profit,
    bill_customer_id,
    ship_customer_id,
    warehouse_id,
    promo_id,
    ship_delay,
    ship_mode,
    ship_carrier,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(sale_datetime))) as sale_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE sale_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)`;
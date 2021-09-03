export const retailPromoCreate = `CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
  promo_id string,
  cost double,
  response_target bigint,
  promo_name string,
  purpose string,
  start_datetime string,
  end_datetime string,
  promo_datetime string
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

export const retailPromoGenerate = `INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    promo_id,
    cost,
    response_target,
    promo_name,
    purpose,
    start_datetime,
    end_datetime,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(promo_datetime))) as promo_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE promo_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)`;
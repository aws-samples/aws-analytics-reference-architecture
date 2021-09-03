export const retailItemCreate = `CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
  item_id bigint,
  item_desc string,
  brand string,
  class string,
  category string,
  manufact string,
  size string,
  color string,
  units string,
  container string,
  product_name string,
  item_datetime string
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

export const retailItemGenerate = `INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    item_id,
    item_desc,
    brand,
    class,
    category,
    manufact,
    size,
    color,
    units,
    container,
    product_name,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(item_datetime))) as item_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE item_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)`;
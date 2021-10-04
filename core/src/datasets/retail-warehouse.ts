export const retailWarehouseCreate = `CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
  warehouse_id string,
  warehouse_name string,
  street string,
  city string,
  zip string,
  county string,
  state string,
  country string,
  gmt_offset string,
  warehouse_datetime string
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

export const retailWarehouseGenerate = `INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    warehouse_id,
    warehouse_name,
    street,
    city,
    zip,
    county,
    state,
    country,
    gmt_offset,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(warehouse_datetime))) as warehouse_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE warehouse_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)`;
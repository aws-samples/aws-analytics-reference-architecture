CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
  store_id string,
  store_name string,
  number_employees bigint,
  floor_space bigint,
  hours string,
  manager string,
  market_id bigint,
  market_manager string,
  city string,
  county string,
  state string,
  zip string,
  country string,
  gmt_offset string,
  tax_percentage double,
  street string,
  store_datetime string
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
)
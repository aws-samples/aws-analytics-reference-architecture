CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
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
)
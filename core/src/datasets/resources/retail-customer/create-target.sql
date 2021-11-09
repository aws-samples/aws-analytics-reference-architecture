CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
  customer_id string,
  salutation string,
  first_name string,
  last_name string,
  birth_country string,
  email_address string,
  birth_date string,
  gender string,
  marital_status string,
  education_status string,
  purchase_estimate bigint,
  credit_rating string,
  buy_potential string,
  vehicle_count bigint,
  lower_bound bigint,
  upper_bound bigint,
  address_id string,
  customer_datetime string
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
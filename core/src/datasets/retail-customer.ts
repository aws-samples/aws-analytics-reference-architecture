export const retailCustomerCreate = `CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
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
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde'
LOCATION
  's3://{{BUCKET}}/{{KEY}}/'
TBLPROPERTIES (
  'skip.header.line.count'='1'
)`;

export const retailCustomerGenerate = `INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    customer_id,
    salutation,
    first_name,
    last_name,
    birth_country,
    email_address,
    birth_date,
    gender,
    marital_status,
    education_status,
    purchase_estimate,
    credit_rating,
    buy_potential,
    vehicle_count,
    lower_bound,
    upper_bound,
    address_id,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(customer_datetime))) as customer_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE customer_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)`;
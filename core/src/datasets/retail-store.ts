export const retailStoreCreate = `CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
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
  zip bigint,
  country string,
  gmt_offset double,
  tax_percentage double,
  street string,
  store_datetime string
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde'
LOCATION
  's3://{{BUCKET}}/{{KEY}}/'
TBLPROPERTIES (
  'skip.header.line.count'='1'
)`;

export const retailStoreGenerate = `INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    store_id,
    store_name,
    number_employees,
    floor_space,
    hours,
    manager,
    market_id,
    market_manager,
    city,
    county,
    state,
    zip,
    country,
    gmt_offset,
    tax_percentage,
    street,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(store_datetime))) as store_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE store_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)`;
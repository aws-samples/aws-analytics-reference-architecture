export const retailCustomerAddressCreate = `CREATE EXTERNAL TABLE IF NOT EXISTS {{DATABASE}}.{{TABLE}}(
  address_id string,
  city string,
  county string,
  state string,
  zip bigint,
  country string,
  gmt_offset double,
  location_type string,
  street string,
  address_datetime string
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde'
LOCATION
  's3://{{BUCKET}}/{{KEY}}/'
TBLPROPERTIES (
  'skip.header.line.count'='1'
)`;

export const retailCustomerAddressGenerate = `INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    address_id,
    city,
    county,
    state,
    zip,
    country,
    gmt_offset,
    location_type,
    street,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(address_datetime))) as address_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE address_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)`;
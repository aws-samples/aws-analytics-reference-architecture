INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
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
)
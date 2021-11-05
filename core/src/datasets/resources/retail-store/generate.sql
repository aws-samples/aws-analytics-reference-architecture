INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
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
)
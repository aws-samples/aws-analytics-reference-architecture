INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
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
)
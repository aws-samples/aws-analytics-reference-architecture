INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    promo_id,
    cost,
    response_target,
    promo_name,
    purpose,
    start_datetime,
    end_datetime,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(promo_datetime))) as promo_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE promo_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)
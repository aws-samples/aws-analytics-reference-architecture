INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    item_id,
    item_desc,
    brand,
    class,
    category,
    manufact,
    size,
    color,
    units,
    container,
    product_name,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(item_datetime))) as item_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE item_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)
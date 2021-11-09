INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
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
)
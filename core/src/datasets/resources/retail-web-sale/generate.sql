INSERT INTO {{DATABASE}}.{{TARGET_TABLE}} (
  SELECT
    item_id,
    order_id,
    quantity,
    wholesale_cost,
    list_price,
    sales_price,
    ext_discount_amt,
    ext_sales_price,
    ext_wholesale_cost,
    ext_list_price,
    ext_tax,
    coupon_amt,
    ext_ship_cost,
    net_paid,
    net_paid_inc_tax,
    net_paid_inc_ship,
    net_paid_inc_ship_tax,
    net_profit,
    bill_customer_id,
    ship_customer_id,
    warehouse_id,
    promo_id,
    ship_delay,
    ship_mode,
    ship_carrier,
    to_iso8601(date_add('second', {{OFFSET}}, from_iso8601_timestamp(sale_datetime))) as sale_datetime
  FROM {{DATABASE}}.{{SOURCE_TABLE}}
  WHERE sale_datetime
    BETWEEN '{{MIN}}' AND '{{MAX}}'
)
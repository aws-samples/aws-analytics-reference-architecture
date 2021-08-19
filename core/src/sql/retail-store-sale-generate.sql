INSERT INTO `{{DATABASE}}.{{TARGET_TABLE}}` (
  SELECT
    `item_id`,
    `ticket_id`,
    `quantity`,
    `wholesale_cost`,
    `list_price`,
    `sales_price`,
    `ext_discount_amt`,
    `ext_sales_price`,
    `ext_wholesale_cost`,
    `ext_list_price`,
    `ext_tax`,
    `coupon_amt`,
    `net_paid`,
    `net_paid_inc_tax`,
    `net_profit`,
    `customer_id`,
    `store_id`,
    `promo_id`,
    format_datetime(date_add(Seconds, {{OFFSET}}, parse_datetime(`sale_datetime`, '%Y-%m-%dT%H:%i:%s.%fZ')),'%Y-%m-%dT%H:%i:%s.%fZ'),
  FROM `{{DATABASE}}.{{SOURCE_TABLE}}`
  WHERE 'sale_datetime'
    BETWEEN `{{MIN}}` AND `{{MAX}}`
)
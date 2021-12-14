-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

DROP TABLE IF EXISTS stg_mystore.store_sale CASCADE;

CREATE TABLE stg_mystore.store_sale
(
   item_id                 BIGINT           ENCODE az64 
  ,ticket_id               BIGINT           ENCODE az64
  ,quantity                BIGINT           ENCODE az64
  ,wholesale_cost          DECIMAL(15,2)
  ,list_price              DECIMAL(15,2)
  ,sales_price             DECIMAL(15,2)
  ,ext_discount_amt        DECIMAL(15,2)
  ,ext_sales_price         DECIMAL(15,2)
  ,ext_wholesale_cost      DECIMAL(15,2)
  ,ext_list_price          DECIMAL(15,2)
  ,ext_tax                 DECIMAL(15,2)
  ,coupon_amt              DECIMAL(15,2)
  ,net_paid                DECIMAL(15,2)
  ,net_paid_inc_tax        DECIMAL(15,2)
  ,net_profit              DECIMAL(15,2)
  ,customer_id             VARCHAR(16383)
  ,store_id                VARCHAR(16383)
  ,promo_id                VARCHAR(16383)
  ,sale_datetime           TIMESTAMP        SORTKEY
  ,processing_datetime     TIMESTAMP        ENCODE az64
  ,etl_processing_datetime TIMESTAMP        ENCODE az64
)
BACKUP NO
DISTKEY (customer_id);


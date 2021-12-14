-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

DROP TABLE IF EXISTS stg_mystore.wrk_sale_fact CASCADE;

CREATE TABLE stg_mystore.wrk_sale_fact
(
  sold_date_key      DATE SORTKEY
 ,sold_time_key      INT          ENCODE zstd
 ,sold_date          TIMESTAMP    ENCODE zstd
 ,customer_key       INT          ENCODE zstd
 ,ticket_id          VARCHAR(20)  ENCODE zstd
 ,item_id            INT          ENCODE az64
 ,quantity           INT          ENCODE az64
 ,wholesale_cost     DECIMAL(7,2) ENCODE az64
 ,list_price         DECIMAL(7,2) ENCODE az64
 ,sales_price        DECIMAL(7,2) ENCODE az64
 ,ext_discount_amt   DECIMAL(7,2) ENCODE zstd
 ,ext_sales_price    DECIMAL(7,2) ENCODE az64
 ,ext_wholesale_cost DECIMAL(7,2) ENCODE az64
 ,ext_list_price     DECIMAL(7,2) ENCODE az64
 ,ext_tax            DECIMAL(7,2) ENCODE az64
 ,coupon_amt         DECIMAL(7,2) ENCODE zstd
 ,net_paid           DECIMAL(7,2) ENCODE az64
 ,net_paid_inc_tax   DECIMAL(7,2) ENCODE az64
 ,net_profit         DECIMAL(7,2) ENCODE az64
 )
BACKUP NO
DISTKEY (customer_key);
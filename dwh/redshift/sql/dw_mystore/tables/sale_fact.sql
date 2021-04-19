-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

DROP TABLE IF EXISTS dw_mystore.sale_fact CASCADE;

CREATE TABLE dw_mystore.sale_fact
(
  sold_date_key      date SORTKEY  ENCODE	raw  NOT NULL
 ,sold_time_key      int           ENCODE	zstd NOT NULL
 ,sold_date          timestamp     ENCODE	zstd NOT NULL
 ,customer_key       int           ENCODE	zstd NOT NULL
 ,ticket_id          varchar(20)   ENCODE	zstd NOT NULL
 ,item_id            int           ENCODE	az64 NOT NULL
 ,quantity           int           ENCODE	az64
 ,wholesale_cost     decimal(15,2) ENCODE	az64 
 ,list_price         decimal(15,2) ENCODE	az64 
 ,sales_price        decimal(15,2) ENCODE	az64 
 ,ext_discount_amt   decimal(15,2) ENCODE	zstd 
 ,ext_sales_price    decimal(15,2) ENCODE	az64 
 ,ext_wholesale_cost decimal(15,2) ENCODE	az64 
 ,ext_list_price     decimal(15,2) ENCODE	az64 
 ,ext_tax            decimal(15,2) ENCODE	az64 
 ,coupon_amt         decimal(15,2) ENCODE	zstd 
 ,net_paid           decimal(15,2) ENCODE	az64 
 ,net_paid_inc_tax   decimal(15,2) ENCODE	az64 
 ,net_profit         decimal(15,2) ENCODE	az64 
 ,dw_insert_date     timestamp     ENCODE	az64 NOT NULL  DEFAULT SYSDATE
 ,dw_update_date     timestamp     ENCODE	lzo
 ,CONSTRAINT pk_sale_fact PRIMARY KEY ( ticket_id, item_id, sold_date )
 ,CONSTRAINT fk_date_dim_sale_fact FOREIGN KEY ( sold_date_key ) REFERENCES dw_mystore.date_dim ( date_key )
 ,CONSTRAINT fk_time_dim_sale_fact FOREIGN KEY ( sold_time_key ) REFERENCES dw_mystore.time_dim ( time_key )
 ,CONSTRAINT fk_customer_dim_sale_fact FOREIGN KEY ( customer_key ) REFERENCES dw_mystore.customer_dim ( customer_key )
)
DISTKEY (customer_key);








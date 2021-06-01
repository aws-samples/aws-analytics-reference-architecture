-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE PROCEDURE stg_mystore.sp_load_sale_fact (p_load_type VARCHAR, p_start_date DATE, p_end_date DATE)
AS $$
DECLARE
   l_load_type VARCHAR;
   l_start_ts TIMESTAMP;
   l_end_ts TIMESTAMP;
   l_start_date DATE;
   l_end_date DATE;
   l_part_start_date DATE;
   l_part_end_date DATE;
   l_store_sale_hwm TIMESTAMP;
   l_wrk_ins_sql VARCHAR(10000);
   l_schema VARCHAR;
   l_filter VARCHAR(500);

BEGIN

   CALL stg_mystore.sp_validate_parameters (p_load_type, p_start_date, p_end_date);

   l_load_type := UPPER(p_load_type);
   l_start_date := p_start_date;
   l_end_date := p_end_date;

   --
   -- Set variables and filters for load type.
   --

   IF (l_load_type = 'HISTORY') THEN

      l_schema := 'stg_mystore';
      l_filter := '';

      -- Copy data to stage table.

      CALL stg_mystore.sp_copy_data('store_sale', l_start_date, l_end_date);

   ELSEIF (l_load_type = 'INCREMENTAL') THEN

      -- Find high-watermark from last load.

      CALL stg_mystore.sp_return_high_water_mark('store_sale', l_store_sale_hwm);

      l_start_ts := l_store_sale_hwm;

      -- Set end date to high value to include all data.

      l_end_ts := TO_TIMESTAMP('2999-12-31', 'YYYY-MM-DD');

      l_part_start_date := TRUNC(l_start_ts);
      l_part_end_date := TRUNC(l_end_ts);

      l_schema := 'ext_clean_mystore';

      l_filter := '-- Filter on partition key for purning.
                  WHERE ss.sale_date >= ''' || l_part_start_date || '''
                  AND ss.sale_date <= ''' ||  l_part_end_date || '''
                  AND ss.sale_datetime > ''' || l_start_ts || '''
                  AND ss.sale_datetime < ''' || l_end_ts || '''';

   END IF; -- load_type

   --
   -- Load work table.
   --

   TRUNCATE TABLE stg_mystore.wrk_sale_fact;

   l_wrk_ins_sql:= 'INSERT INTO stg_mystore.wrk_sale_fact (
          sold_date_key
         ,sold_time_key
         ,sold_date
         ,customer_key
         ,ticket_id
         ,item_id
         ,quantity
         ,wholesale_cost
         ,list_price
         ,sales_price
         ,ext_discount_amt
         ,ext_sales_price
         ,ext_wholesale_cost
         ,ext_list_price
         ,ext_tax
         ,coupon_amt
         ,net_paid
         ,net_paid_inc_tax
         ,net_profit
      )
      SELECT
          NVL(dd.date_key, TO_DATE(''01-JAN-1900'', ''DD-MON-YYYY'')) AS sold_date_key
         ,NVL(td.time_key, -1) AS sold_time_key
         ,ss.sale_datetime AS sold_date
         ,NVL(cd.customer_key, -1) AS customer_key
         ,ss.ticket_id
         ,ss.item_id
         ,ss.quantity
         ,ss.wholesale_cost
         ,ss.list_price
         ,ss.sales_price
         ,ss.ext_discount_amt
         ,ss.ext_sales_price
         ,ss.ext_wholesale_cost
         ,ss.ext_list_price
         ,ss.ext_tax
         ,ss.coupon_amt
         ,ss.net_paid
         ,ss.net_paid_inc_tax
         ,ss.net_profit
      FROM   ' || l_schema ||'.store_sale ss
      LEFT OUTER JOIN dw_mystore.date_dim dd
         ON TRUNC(ss.sale_datetime) = dd.day_date
      LEFT OUTER JOIN dw_mystore.time_dim td
         ON EXTRACT(hour from ss.sale_datetime) = td."hour"
         AND EXTRACT(min from ss.sale_datetime) = td."minute"
         AND EXTRACT(sec from ss.sale_datetime) = td."second"
      LEFT OUTER JOIN dw_mystore.customer_dim cd
         ON ss.customer_id = cd.customer_id
         AND ss.sale_datetime >= cd.scd_start_date
         AND ss.sale_datetime < cd.scd_end_date
      ' || l_filter;

   RAISE INFO 'l_wrk_ins_sql: %', l_wrk_ins_sql;

   EXECUTE l_wrk_ins_sql;

   ANALYZE stg_mystore.wrk_sale_fact PREDICATE COLUMNS;

   --
   -- Merge into target.
   --

   DELETE FROM dw_mystore.sale_fact
   USING stg_mystore.wrk_sale_fact
   WHERE sale_fact.ticket_id = wrk_sale_fact.ticket_id
   AND   sale_fact.item_id = wrk_sale_fact.item_id
   AND   sale_fact.sold_date = wrk_sale_fact.sold_date;

   INSERT INTO dw_mystore.sale_fact (
       sold_date_key
      ,sold_time_key
      ,sold_date
      ,customer_key
      ,ticket_id
      ,item_id
      ,quantity
      ,wholesale_cost
      ,list_price
      ,sales_price
      ,ext_discount_amt
      ,ext_sales_price
      ,ext_wholesale_cost
      ,ext_list_price
      ,ext_tax
      ,coupon_amt
      ,net_paid
      ,net_paid_inc_tax
      ,net_profit
      ,dw_insert_date
      ,dw_update_date
   )
   SELECT
       sold_date_key
      ,sold_time_key
      ,sold_date
      ,customer_key
      ,ticket_id
      ,item_id
      ,quantity
      ,wholesale_cost
      ,list_price
      ,sales_price
      ,ext_discount_amt
      ,ext_sales_price
      ,ext_wholesale_cost
      ,ext_list_price
      ,ext_tax
      ,coupon_amt
      ,net_paid
      ,net_paid_inc_tax
      ,net_profit
      ,SYSDATE AS dw_insert_date
      ,NULL AS dw_update_date
   FROM stg_mystore.wrk_sale_fact;

   ANALYZE dw_mystore.sale_fact PREDICATE COLUMNS;

   IF (l_load_type = 'INCREMENTAL') THEN

      -- Store the high-watermark for the next load.

      -- store_sale.

      SELECT MAX(sf.sold_date)
      INTO   l_store_sale_hwm
      FROM   dw_mystore.sale_fact sf;

      IF (l_store_sale_hwm IS NOT NULL) THEN
         CALL stg_mystore.sp_update_high_water_mark ('store_sale', l_store_sale_hwm);
      END IF;

   END IF; -- load_type

END;
$$ LANGUAGE plpgsql;
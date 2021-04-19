-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE PROCEDURE stg_mystore.sp_load_customer_dim ()
AS $$
DECLARE
   l_store_customer_hwm TIMESTAMP;
   l_store_customer_start_ts TIMESTAMP;
   l_store_customer_end_ts TIMESTAMP;
   l_store_customer_address_hwm TIMESTAMP;
   l_store_customer_address_start_ts TIMESTAMP;
   l_store_customer_address_end_ts TIMESTAMP;

BEGIN

   --
   -- Set variables and filters.
   --

   -- Find high-watermarks from last load.

   CALL stg_mystore.sp_return_high_water_mark('store_customer', l_store_customer_hwm);
   l_store_customer_start_ts := l_store_customer_hwm;

   CALL stg_mystore.sp_return_high_water_mark('store_customer_address', l_store_customer_address_hwm);
   l_store_customer_address_start_ts := l_store_customer_address_hwm;

   -- Find new high-watermarks for next load.

   SELECT MAX(c.etl_processing_datetime)
   INTO l_store_customer_end_ts
   FROM stg_mystore.v_store_customer c;

   SELECT MAX(a.etl_processing_datetime)
   INTO l_store_customer_address_end_ts
   FROM stg_mystore.v_store_customer_address a;

   --
   -- Load work table.
   --

   TRUNCATE TABLE stg_mystore.wrk_customer_dim;

   INSERT INTO stg_mystore.wrk_customer_dim (
       customer_id
      ,salutation
      ,first_name
      ,last_name
      ,birth_country
      ,email_address
      ,birth_date
      ,gender
      ,marital_status
      ,education_status
      ,purchase_estimate
      ,credit_rating
      ,buy_potential
      ,vehicle_count
      ,income_band_lower_bound
      ,income_band_upper_bound
      ,customer_datetime
      ,address_id
      ,street
      ,city
      ,county
      ,state
      ,zip
      ,country
      ,gmt_offset
      ,location_type
      ,address_datetime
   )SELECT c.customer_id
      ,NVL(c.salutation, 'Unknown') AS salutation
      ,NVL(c.first_name, 'Unknown') AS first_name
      ,NVL(c.last_name, 'Unknown') AS last_name
      ,NVL(INITCAP(c.birth_country), 'Unknown') AS birth_country
      ,NVL(c.email_address, 'Unknown') AS email_address
      ,NVL(c.birth_date, TO_DATE('01/01/1000', 'DD/MM/YYYY')) AS birth_date
      ,NVL(CASE UPPER(c.gender)
              WHEN 'M' THEN 'Male'
              WHEN 'F' THEN 'Female'
              ELSE c.gender
           END, 'Unknown') AS gender
      ,NVL(CASE UPPER(c.marital_status)
              WHEN 'D' then 'Divorced'
              WHEN 'M' then 'Married'
              WHEN 'S' then 'Single'
              WHEN 'U' then 'Unknown'
              WHEN 'W' then 'Widowed'
           ELSE c.marital_status
           END, 'Unknown') AS marital_status
      ,NVL(c.education_status, 'Unknown') AS education_status
      ,NVL(c.purchase_estimate, -1) AS purchase_estimate
      ,NVL(c.credit_rating, 'Unknown') AS credit_rating
      ,NVL(c.buy_potential, 'Unknown') AS buy_potential
      ,NVL(c.vehicle_count, -1) AS vehicle_count
      ,NVL(c.lower_bound, -1) AS income_band_lower_bound
      ,NVL(c.upper_bound, -1) AS income_band_upper_bound
      ,NVL(c.customer_datetime, TO_TIMESTAMP('01/01/1000 00:00:00', 'DD/MM/YYYY HH24:MI:SS')) AS customer_datetime
      ,NVL(a.address_id, 'Unknown') AS address_id
      ,NVL(a.street, 'Unknown') AS street
      ,NVL(a.city, 'Unknown') AS city
      ,NVL(a.county, 'Unknown') AS county
      ,NVL(a.state, '#') AS state
      ,NVL(a.zip, 'Unknown') AS zip
      ,NVL(a.country, 'Unknown') AS country
      ,NVL(a.gmt_offset, -999) AS gmt_offset
      ,NVL(a.location_type, 'Unknown') AS location_type
      ,NVL(a.address_datetime, TO_TIMESTAMP('01/01/1000 00:00:00', 'DD/MM/YYYY HH24:MI:SS')) AS address_datetime
   FROM stg_mystore.v_store_customer c
   LEFT OUTER JOIN stg_mystore.v_store_customer_address a
      ON c.address_id = a.address_id
    WHERE (c.etl_processing_datetime > l_store_customer_start_ts
      OR a.etl_processing_datetime > l_store_customer_address_start_ts);

   
   ANALYZE stg_mystore.wrk_customer_dim PREDICATE COLUMNS;
   
   --
   -- Perform SCD Processing.
   --
   
   --
   -- Insert new rows.
   --
   
   INSERT INTO dw_mystore.customer_dim  ( 
       customer_id 
      ,salutation 
      ,first_name 
      ,last_name 
      ,birth_country 
      ,email_address 
      ,birth_date 
      ,gender 
      ,marital_status 
      ,education_status 
      ,purchase_estimate 
      ,credit_rating 
      ,buy_potential 
      ,vehicle_count 
      ,income_band_lower_bound 
      ,income_band_upper_bound 
      ,start_date 
      ,address_id 
      ,address_date
      ,street 
      ,city 
      ,county 
      ,state 
      ,zip 
      ,country 
      ,gmt_offset 
      ,location_type 
      ,scd_start_date 
      ,scd_end_date 
      ,scd_current_flag 
      ,dw_insert_date 
      ,dw_update_date
   )
   SELECT 
       wcd.customer_id 
      ,wcd.salutation 
      ,wcd.first_name 
      ,wcd.last_name 
      ,wcd.birth_country 
      ,wcd.email_address 
      ,wcd.birth_date 
      ,wcd.gender 
      ,wcd.marital_status 
      ,wcd.education_status 
      ,wcd.purchase_estimate 
      ,wcd.credit_rating 
      ,wcd.buy_potential 
      ,wcd.vehicle_count 
      ,wcd.income_band_lower_bound 
      ,wcd.income_band_upper_bound 
      ,wcd.customer_datetime
      ,wcd.address_id 
      ,wcd.address_datetime
      ,wcd.street 
      ,wcd.city 
      ,wcd.county 
      ,wcd.state 
      ,wcd.zip 
      ,wcd.country 
      ,wcd.gmt_offset 
      ,wcd.location_type 
      ,wcd.customer_datetime AS scd_start_date
      ,TO_TIMESTAMP('31/12/2999 00:00:00', 'DD/MM/YYYY HH24:MI:SS')  AS scd_end_date
      ,'Y' AS scd_current_flag
      ,SYSDATE AS dw_insert_date 
      ,NULL AS dw_update_date
   FROM stg_mystore.wrk_customer_dim wcd
   WHERE NOT EXISTS (
      SELECT 1
      FROM dw_mystore.customer_dim cd
      WHERE wcd.customer_id = cd.customer_id
   );
   
   --
   -- Update SCD Type 1 changes.
   --
   
   UPDATE dw_mystore.customer_dim
   SET 
       salutation                   = wcd.salutation
      ,first_name                   = wcd.first_name
      ,last_name                    = wcd.last_name
      ,birth_country                = wcd.birth_country
      ,email_address                = wcd.email_address
      ,birth_date                   = wcd.birth_date
      ,gender                       = wcd.gender
      ,marital_status               = wcd.marital_status
      ,education_status             = wcd.education_status
      ,purchase_estimate            = wcd.purchase_estimate
      ,credit_rating                = wcd.credit_rating
      ,buy_potential                = wcd.buy_potential
      ,vehicle_count                = wcd.vehicle_count
      ,income_band_lower_bound      = wcd.income_band_lower_bound
      ,income_band_upper_bound      = wcd.income_band_upper_bound
      ,start_date                   = wcd.customer_datetime
      ,dw_update_date               = SYSDATE
   FROM stg_mystore.wrk_customer_dim wcd
   INNER JOIN dw_mystore.customer_dim cd
      ON wcd.customer_id = cd.customer_id 
   WHERE (
        -- SCD Type 1 columns.
        cd.salutation                   <> wcd.salutation
     OR cd.first_name                   <> wcd.first_name
     OR cd.last_name                    <> wcd.last_name
     OR cd.birth_country                <> wcd.birth_country
     OR cd.email_address                <> wcd.email_address
     OR cd.birth_date                   <> wcd.birth_date
     OR cd.gender                       <> wcd.gender
     OR cd.marital_status               <> wcd.marital_status
     OR cd.education_status             <> wcd.education_status
     OR cd.purchase_estimate            <> wcd.purchase_estimate
     OR cd.credit_rating                <> wcd.credit_rating
     OR cd.buy_potential                <> wcd.buy_potential
     OR cd.vehicle_count                <> wcd.vehicle_count
     OR cd.income_band_lower_bound      <> wcd.income_band_lower_bound
     OR cd.income_band_upper_bound      <> wcd.income_band_upper_bound
     OR cd.start_date                   <> wcd.customer_datetime
   );
   
   --
   -- Process SCD Type 2 changes.
   --
   
   -- Update most recent prior version to close record.
   
   UPDATE dw_mystore.customer_dim
   SET 
       scd_end_date                 = wcd.address_datetime
      ,scd_current_flag             = 'N'
      ,dw_update_date               = SYSDATE
   FROM stg_mystore.wrk_customer_dim wcd
   INNER JOIN dw_mystore.customer_dim cd
      ON wcd.customer_id = cd.customer_id 
   WHERE (
        -- SCD Type 2 columns.
        cd.address_id     <> wcd.address_id   
     OR cd.city           <> wcd.city         
     OR cd.county         <> wcd.county       
     OR cd.state          <> wcd.state        
     OR cd.zip            <> wcd.zip          
     OR cd.country        <> wcd.country      
     OR cd.street         <> wcd.street
     OR cd.gmt_offset     <> wcd.gmt_offset   
     OR cd.location_type  <> wcd.location_type
   )
   AND 
       -- Most recent version.
       (cd.customer_id 
       ,cd.scd_start_date) IN (
         SELECT cdi.customer_id 
               ,MAX(cdi.scd_start_date)
         FROM dw_mystore.customer_dim cdi
         WHERE wcd.customer_id = cdi.customer_id 
         GROUP BY cdi.customer_id
   );
      
   -- Insert new record version.
   
   INSERT INTO dw_mystore.customer_dim  ( 
       customer_id 
      ,salutation 
      ,first_name 
      ,last_name 
      ,birth_country 
      ,email_address 
      ,birth_date 
      ,gender 
      ,marital_status 
      ,education_status 
      ,purchase_estimate 
      ,credit_rating 
      ,buy_potential 
      ,vehicle_count 
      ,income_band_lower_bound 
      ,income_band_upper_bound 
      ,start_date 
      ,address_id 
      ,address_date
      ,street 
      ,city 
      ,county 
      ,state 
      ,zip 
      ,country 
      ,gmt_offset 
      ,location_type 
      ,scd_start_date 
      ,scd_end_date 
      ,scd_current_flag 
      ,dw_insert_date 
      ,dw_update_date
   )
   SELECT 
       wcd.customer_id 
      ,wcd.salutation 
      ,wcd.first_name 
      ,wcd.last_name 
      ,wcd.birth_country 
      ,wcd.email_address 
      ,wcd.birth_date 
      ,wcd.gender 
      ,wcd.marital_status 
      ,wcd.education_status 
      ,wcd.purchase_estimate 
      ,wcd.credit_rating 
      ,wcd.buy_potential 
      ,wcd.vehicle_count 
      ,wcd.income_band_lower_bound 
      ,wcd.income_band_upper_bound 
      ,wcd.customer_datetime 
      ,wcd.address_id 
      ,wcd.address_datetime
      ,wcd.street 
      ,wcd.city 
      ,wcd.county 
      ,wcd.state 
      ,wcd.zip 
      ,wcd.country 
      ,wcd.gmt_offset 
      ,wcd.location_type 
      ,wcd.address_datetime AS scd_start_date
      ,TO_TIMESTAMP('31/12/2999 00:00:00', 'DD/MM/YYYY HH24:MI:SS')  AS scd_end_date
      ,'Y' AS scd_current_flag
      ,SYSDATE AS dw_insert_date 
      ,NULL AS dw_update_date
   FROM stg_mystore.wrk_customer_dim wcd
   INNER JOIN dw_mystore.customer_dim cd 
      ON wcd.customer_id = cd.customer_id 
   AND (
        -- SCD Type 2 column has changed.
        cd.address_id     <> wcd.address_id   
     OR cd.city           <> wcd.city         
     OR cd.county         <> wcd.county       
     OR cd.state          <> wcd.state        
     OR cd.zip            <> wcd.zip          
     OR cd.country        <> wcd.country      
     OR cd.street         <> wcd.street
     OR cd.gmt_offset     <> wcd.gmt_offset   
     OR cd.location_type  <> wcd.location_type
     )
  AND (
     -- Most recent version.
     cd.customer_id 
    ,cd.scd_start_date) IN (
         SELECT cdi.customer_id 
               ,MAX(cdi.scd_start_date)
         FROM dw_mystore.customer_dim cdi
         WHERE wcd.customer_id = cdi.customer_id 
         GROUP BY cdi.customer_id
   );

   ANALYZE dw_mystore.customer_dim PREDICATE COLUMNS;

   --
   -- Store high-watermarks for the next load.
   --

   -- store_customer.

   IF (l_store_customer_end_ts IS NOT NULL) THEN
      CALL stg_mystore.sp_update_high_water_mark ('store_customer', l_store_customer_end_ts);
   END IF;

   -- store_customer_address.

   IF (l_store_customer_address_end_ts IS NOT NULL) THEN
      CALL stg_mystore.sp_update_high_water_mark ('store_customer_address', l_store_customer_address_end_ts);
   END IF;


END;
$$ LANGUAGE plpgsql;
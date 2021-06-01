-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

--
-- Test 1: Initial load.
--

TRUNCATE TABLE dw_mystore.customer_dim;

DELETE FROM stg_mystore.dw_incremental_dates
WHERE source_table_name IN ('store_customer', 'store_customer_address');

-- Run load.

CALL stg_mystore.sp_load_customer_dim ();

-- Check output.

SELECT COUNT(*)
FROM dw_mystore.customer_dim cd;

SELECT *
FROM dw_mystore.customer_dim cd
order by cd.customer_id
LIMIT 100;

SELECT *
FROM stg_mystore.dw_incremental_dates
WHERE source_table_name IN ('store_customer', 'store_customer_address');

--
-- Reconcile source to target counts.
--

-- Source.

SELECT count(distinct sc.customer_id)
FROM ext_clean_mystore.store_customer sc;

SELECT COUNT(*)
FROM ext_clean_mystore.store_customer sc;

-- Target.

SELECT count(distinct cd.customer_id)
FROM dw_mystore.customer_dim cd
      -- Unknown record.
WHERE cd.customer_key <> -1;

-- May be more rows for new SCD2 versions.

SELECT COUNT(*)
FROM dw_mystore.customer_dim cd
      -- Unknown record.
WHERE cd.customer_key <> -1;

-- Pass.

--
-- Test 2: Rerun load to check incremental is not reloaded the same data.
--

SELECT MAX(c.dw_insert_date)
      ,MAX(c.dw_update_date)
FROM dw_mystore.customer_dim c;

CALL stg_mystore.sp_load_customer_dim ();

SELECT MAX(c.dw_insert_date)
      ,MAX(c.dw_update_date)
FROM dw_mystore.customer_dim c;

-- Pass.

--
-- Test 3: Type 1 update.
--

SELECT *
FROM dw_mystore.customer_dim cd
WHERE cd.customer_id = 'AAAAAAAAABLIAAAA';

--
-- As the source tables are using Apache Hudi, the following DMLs need to be run via a Spark job.
-- The database name will be different depending on the build.
--
-- The etl_processing_datetime will also need to be changed to be later than the
-- current high-watermark for the incremental
-- processing to work correctly.
--

INSERT INTO "dlra-clean-data660444162056"."store_customer"
        ( customer_id
        , salutation
        , first_name
        , last_name
        , birth_country
        , email_address
        , birth_date
        , gender
        , marital_status
        , education_status
        , purchase_estimate
        , credit_rating
        , buy_potential
        , vehicle_count
        , lower_bound
        , upper_bound
        , address_id
        , customer_datetime
        , processing_datetime
        , etl_processing_datetime
        , customer_date)
VALUES ( 'AAAAAAAAABLIAAAA'
       , 'Mrs.'
       , 'Test 2'
       , 'Chapman'
       , 'THAILAND'
       , 'Allen.Chapman@u7sBdnBsDo.org'
       , date '1985-01-30'
       , 'F'
       , 'M'
       , '2 yr Degree'
       , 8500
       , 'Good'
       , '1001-5000'
       , 4
       , 150001
       , 160000
       , 'AAAAAAAANALGAAAA'
       , timestamp '2021-01-19 20:35:14.757'
       , timestamp '2021-01-19 20:35:14.757'
       , timestamp '2021-01-19 20:35:14.757'
       , '2021-01-19');


-- Run load.

CALL stg_mystore.sp_load_customer_dim ();

-- CHECK OUTPUT: 

SELECT *
FROM dw_mystore.customer_dim cd
WHERE cd.customer_id = 'AAAAAAAAABLIAAAA'
ORDER BY cd.scd_start_date;

-- Pass.


---------------------------------------------------------------------------------------------------------------------------

--
-- Test 4: Type 2 processing. First change.
--

SELECT *
FROM dw_mystore.customer_dim cd
WHERE cd.customer_id = 'AAAAAAAAABLIAAAA';

-- Address update on source.
          
INSERT INTO "dlra-clean-data660444162056"."store_customer_address"
       ( address_id
       , city
       , county
       , state
       , zip
       , country
       , gmt_offset
       , location_type
       , street
       , address_datetime
       , processing_datetime
       , etl_processing_datetime
       , address_date)
VALUES ( 'AAAAAAAANALGAAAA'
       , 'Test 3'
       , 'Madison County'
       , 'IA'
       , '59303'
       , 'United States'
       , -6
       , 'apartment'
       , '943 Franklin  Dr.'
       , timestamp '2021-01-19 20:03:43.967'
       , timestamp '2021-01-19 20:03:43.967'
       , timestamp '2021-01-19 20:03:43.967'
       , '2021-01-19');

-- Run load.

CALL stg_mystore.sp_load_customer_dim ();

-- Check output:

SELECT *
FROM dw_mystore.customer_dim cd
WHERE cd.customer_id = 'AAAAAAAAABLIAAAA'
ORDER BY cd.scd_start_date;

-- Pass.

---------------------------------------------------------------------------------------------------------------------------

--
-- Test 5: Type 2 processing. Second change.
--

SELECT *
FROM dw_mystore.customer_dim cd
WHERE cd.customer_id = 'AAAAAAAAABLIAAAA';

-- Address update on source.

INSERT INTO "dlra-clean-data660444162056"."store_customer_address"
       ( address_id
       , city
       , county
       , state
       , zip
       , country
       , gmt_offset
       , location_type
       , street
       , address_datetime
       , processing_datetime
       , etl_processing_datetime
       , address_date)
VALUES ( 'AAAAAAAANALGAAAA'
       , 'Test 3'
       , 'Madison County'
       , 'IA'
       , '59303'
       , 'Test 4'
       , -6
       , 'apartment'
       , '943 Franklin  Dr.'
       , timestamp '2021-01-19 21:03:43.967'
       , timestamp '2021-01-19 21:03:43.967'
       , timestamp '2021-01-19 21:03:43.967'
       , date '2021-01-19');

-- Run load.

CALL stg_mystore.sp_load_customer_dim ();

-- Check output:

SELECT *
FROM dw_mystore.customer_dim cd
WHERE cd.customer_id = 'AAAAAAAAABLIAAAA'
ORDER BY cd.scd_start_date;

-- Pass.

---------------------------------------------------------------------------------------------------------------------------

--
-- Test 6: Type 2 processing. Third change.
--

SELECT *
FROM dw_mystore.customer_dim cd
WHERE cd.customer_id = 'AAAAAAAAABLIAAAA'
ORDER BY cd.scd_start_date;

-- Address update on source.

INSERT INTO "sample-datasets-clean"."store_customer_address" 
            (address_id, 
             address_datetime, 
             street, 
             city, 
             zip, 
             county, 
             state, 
             country, 
             gmt_offset, 
             location_type, 
             processing_datetime, 
             address_date) 
VALUES     ( 'AAAAAAAANALGAAAA', 
             timestamp '2020-10-21 03:27:15.809', 
             'Test 3', 
             'Test 5', 
             '84098', 
             'Test 4', 
             'CO', 
             'United States', 
             decimal '-7.00', 
             'apartment', 
             timestamp '2020-10-21 03:27:15.809', 
             '2020-10-21' ); 

-- Run load.

CALL stg_mystore.sp_load_customer_dim ();

-- CHECK OUTPUT: 

SELECT *
FROM dw_mystore.customer_dim cd
WHERE cd.customer_id = 'AAAAAAAAABLIAAAA'
ORDER BY cd.scd_start_date;

-- Pass.

-- Other:

-- Set high water marks.

insert
into stg_mystore.dw_incremental_dates ( source_table_name
                                      , start_date
                                      , dw_insert_date
                                      , dw_update_date
                                      , dw_batch_id)
values ( 'store_customer'
       , '2021-01-18 00:00:00'
       , SYSDATE
       , null
       , null);

insert
into stg_mystore.dw_incremental_dates ( source_table_name
                                      , start_date
                                      , dw_insert_date
                                      , dw_update_date
                                      , dw_batch_id)
values ( 'store_customer_address'
       , '2021-01-18 00:00:00'
       , SYSDATE
       , null
       , null);

SELECT *
FROM stg_mystore.dw_incremental_dates;


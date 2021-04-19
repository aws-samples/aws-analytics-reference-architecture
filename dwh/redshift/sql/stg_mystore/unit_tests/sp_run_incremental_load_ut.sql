-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

--
-- Test 1: First load.
--

-- Clear target tables.

TRUNCATE TABLE stg_mystore.dw_incremental_dates;
TRUNCATE TABLE dw_mystore.customer_dim;
TRUNCATE TABLE dw_mystore.sale_fact;

-- Check source data.

SELECT TRUNC(csc.customer_datetime), count(*)
FROM ext_clean_mystore.store_customer csc
GROUP BY TRUNC(csc.customer_datetime)
ORDER BY 1;

SELECT TRUNC(ca.address_datetime), count(*)
FROM ext_clean_mystore.store_customer_address ca
GROUP BY TRUNC(ca.address_datetime)
ORDER BY 1;

SELECT TRUNC(ss.sale_datetime), count(*)
FROM ext_clean_mystore.store_sale ss
GROUP BY TRUNC(ss.sale_datetime)
ORDER BY 1;

-- Run load.

CALL stg_mystore.sp_run_incremental_load ();

ANALYZE dw_mystore.customer_dim;
ANALYZE dw_mystore.date_dim;
ANALYZE dw_mystore.time_dim;
ANALYZE dw_mystore.sale_fact;


-- Check output.

-- Customer dim.

SELECT COUNT(*)
FROM dw_mystore.customer_dim;

SELECT *
FROM dw_mystore.customer_dim
LIMIT 1000;

-- Sale fact.

SELECT COUNT(*)
FROM dw_mystore.sale_fact;

SELECT *
FROM dw_mystore.sale_fact
LIMIT 1000;

SELECT *
FROM stg_mystore.dw_incremental_dates
ORDER BY 1;

-- Pass.

--------------------------------------------------------------------------------------

--
-- Test 2: Second load. No new data in source.
--

SELECT MAX(cd.dw_insert_date), MAX(cd.dw_update_date) 
FROM dw_mystore.customer_dim cd;

SELECT MAX(sf.dw_insert_date), MAX(sf.dw_update_date) 
FROM dw_mystore.sale_fact sf;

-- Run load.

CALL stg_mystore.sp_run_incremental_load ();

-- Assert: No new updates or inserts on target.

SELECT MAX(cd.dw_insert_date), MAX(cd.dw_update_date) 
FROM dw_mystore.customer_dim cd;

SELECT MAX(sf.dw_insert_date), MAX(sf.dw_update_date) 
FROM dw_mystore.sale_fact sf;

-- Assert: High-water-marks should not be changed.

SELECT *
FROM stg_mystore.dw_incremental_dates;

-- Pass.

--------------------------------------------------------------------------------------

-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

--
-- Test 1: First load.
--

-- Clear target tables.

TRUNCATE TABLE dw_mystore.customer_dim;
TRUNCATE TABLE dw_mystore.sale_fact;

-- Check source data.

SELECT TRUNC(csc.customer_datetime), count(*)
FROM ext_clean_mystore.store_customer csc
WHERE csc.customer_datetime >= '2021-01-01 13:00:00'
AND   csc.customer_datetime < '2021-01-01 14:00:00'
GROUP BY TRUNC(csc.customer_datetime)
ORDER BY 1;

SELECT TRUNC(ca.address_datetime), count(*)
FROM ext_clean_mystore.store_customer_address ca
WHERE ca.address_datetime >= '2021-01-01 13:00:00'
AND   ca.address_datetime  < '2021-01-01 14:00:00'
GROUP BY TRUNC(ca.address_datetime)
ORDER BY 1;

SELECT TRUNC(ss.sale_datetime), count(*)
FROM ext_clean_mystore.store_sale ss
WHERE ss.sale_datetime >= '2021-01-01 13:00:00'
AND   ss.sale_datetime  < '2021-01-01 14:00:00'
GROUP BY TRUNC(ss.sale_datetime)
ORDER BY 1;

-- Run load.

-- Run load.

CALL stg_mystore.sp_run_history_load ('2021-01-01 13:00:00', '2021-01-01 14:00:00');

-- Assert: One hour of data loaded.

SELECT MIN(cd.start_date ), MAX(cd.start_date), COUNT(*) 
FROM dw_mystore.customer_dim cd;

SELECT MIN(f.sold_date), MAX(f.sold_date), COUNT(*) 
FROM dw_mystore.sale_fact f;

-- Pass.

--------------------------------------------------------------------------------------

--
-- Test 2: Second load.
--

SELECT MIN(cd.start_date ), MAX(cd.start_date), COUNT(*) 
FROM dw_mystore.customer_dim cd;

SELECT MIN(f.sold_date), MAX(f.sold_date), COUNT(*) 
FROM dw_mystore.sale_fact f;

-- Run load.

CALL stg_mystore.sp_run_history_load ('2020-01-01 13:00:00', '2020-01-01 14:00:00');

-- Assert: No new updates or inserts on target.

SELECT MIN(cd.start_date ), MAX(cd.start_date), COUNT(*) 
FROM dw_mystore.customer_dim cd;

SELECT MIN(f.sold_date), MAX(f.sold_date), COUNT(*) 
FROM dw_mystore.sale_fact f;

-- Pass.

--------------------------------------------------------------------------------------

-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

--
-- Test 1: First load.
--

-- Clear target tables.

TRUNCATE TABLE dw_mystore.sale_fact;

DELETE FROM stg_mystore.dw_incremental_dates
WHERE source_table_name = 'store_sale';

-- Check source data.

SELECT MIN(ss.sale_datetime), MAX(ss.sale_datetime)
FROM ext_clean_mystore.store_sale ss;

SELECT TRUNC(ss.sale_datetime), count(*)
FROM ext_clean_mystore.store_sale ss
GROUP BY TRUNC(ss.sale_datetime)
ORDER BY 1;

SELECT TRUNC(ss.sale_datetime), count(*)
FROM ext_clean_mystore.store_sale ss
WHERE ss.sale_date >= '2021-01-18'
AND ss.sale_datetime > '2021-01-18 00:00:00'
GROUP BY TRUNC(ss.sale_datetime)
ORDER BY 1;

-- Set high water mark.

insert
into stg_mystore.dw_incremental_dates ( source_table_name
                                      , start_date
                                      , dw_insert_date
                                      , dw_update_date)
values ( 'store_sale'
       , '2021-03-19 13:35:32'
       , SYSDATE
       , null);

SELECT *
FROM stg_mystore.dw_incremental_dates;

-- Run load.

CALL stg_mystore.sp_load_sale_fact('INCREMENTAL', NULL, NULL);

-- Check output.

-- Sale fact.

SELECT COUNT(*)
FROM dw_mystore.sale_fact;

SELECT *
FROM dw_mystore.sale_fact
LIMIT 1000;

SELECT *
FROM stg_mystore.dw_incremental_dates
ORDER BY 1;

--
-- Reconcile source to target counts.
--

--
-- By day.
--

-- Source.

SELECT TRUNC(ss.sale_datetime), count(*)
FROM ext_clean_mystore.store_sale ss
WHERE TRUNC(ss.sale_datetime) = TO_DATE('2021-01-01', 'YYYY-MM-DD')
GROUP BY TRUNC(ss.sale_datetime)
ORDER BY 1;

-- Target.

SELECT TRUNC(ss.sold_date), count(*)
FROM dw_mystore.sale_fact ss
--WHERE TRUNC(ss.sold_date) = TO_DATE('2020-11-05', 'YYYY-MM-DD')
GROUP BY TRUNC(ss.sold_date)
ORDER BY 1;

--
-- By hour
--

-- Source.

SELECT DATE_TRUNC('H', ss.sale_datetime), count(*)
FROM ext_clean_mystore.store_sale ss
--WHERE TRUNC(ss.sale_datetime) = TO_DATE('2020-11-05', 'YYYY-MM-DD')
GROUP BY DATE_TRUNC('H', ss.sale_datetime)
ORDER BY 1;

-- Target.

SELECT DATE_TRUNC('H', ss.sold_date), count(*)
FROM dw_mystore.sale_fact ss
--WHERE TRUNC(ss.sold_date) = TO_DATE('2020-11-05', 'YYYY-MM-DD')
GROUP BY DATE_TRUNC('H', ss.sold_date)
ORDER BY 1;

-- Pass.

--------------------------------------------------------------------------------------

--
-- Test 2: Second load. No new data in source.
--

-- Run load.

CALL stg_mystore.sp_load_sale_fact('INCREMENTAL', NULL, NULL);

-- Assert: No new updates or inserts on target.

SELECT COUNT(*)
FROM dw_mystore.sale_fact;

SELECT MAX(sf.dw_insert_date), MAX(sf.dw_update_date) 
FROM dw_mystore.sale_fact sf;

-- Assert: High-water-marks should not be changed.

SELECT *
FROM stg_mystore.dw_incremental_dates;

-- Pass.

--------------------------------------------------------------------------------------

--
-- Test 3: History load.
--

-- Clear table.

TRUNCATE TABLE dw_mystore.sale_fact;

SELECT TRUNC(ss.sale_datetime), count(*)
FROM ext_clean_mystore.store_sale ss
WHERE ss.sale_date BETWEEN '2021-01-02'AND '2021-01-02'
GROUP BY TRUNC(ss.sale_datetime)
ORDER BY 1;

-- 63,696,001

-- Run load.

CALL stg_mystore.sp_load_sale_fact ('HISTORY', '2021-01-02', '2021-01-02');

-- Assert: One day of data loaded.

SELECT TRUNC(sold_date), COUNT(*)
FROM dw_mystore.sale_fact f
GROUP BY TRUNC(sold_date);







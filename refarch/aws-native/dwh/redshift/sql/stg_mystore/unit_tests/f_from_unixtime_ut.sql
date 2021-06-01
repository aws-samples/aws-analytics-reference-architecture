-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

--
-- Test 1
--

-- Check output vs formula

select c.customer_id
      ,c.customer_datetime
      ,timestamp 'epoch' + (c.customer_datetime / 1000000) * interval '1 second' AS customer_datetime
      ,stg_mystore.f_from_unixtime(c.customer_datetime)
from ext_clean_mystore.store_customer c
order by 1
limit 10;

-- Pass

--
-- Test 2
--

-- Check output vs Athena output

select c.customer_id
      ,stg_mystore.f_from_unixtime(c.customer_datetime)
from ext_clean_mystore.store_customer c
where c.customer_id = 'AAAAAAAAAAAABAAA'
order by 2;

-- Athena query

SELECT c.customer_id
      ,from_unixtime(c.customer_datetime / 1000000) as customer_datetime
FROM "dlra-clean-data-660444162056".store_customer c
WHERE c.customer_id = 'AAAAAAAAAAAABAAA'
order by 2;

-- Pass


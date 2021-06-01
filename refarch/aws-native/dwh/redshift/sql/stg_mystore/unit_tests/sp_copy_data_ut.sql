-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CALL stg_mystore.sp_copy_data('store_customer_address', '2021-01-01', '2021-01-01');

SELECT COUNT(*)
FROM stg_mystore.store_customer_address;





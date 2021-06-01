-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

-- Test 1 - p_start_date > p_end_date

CALL stg_mystore.sp_validate_parameters('HISTORY', '2020-01-10', '2020-01-09');

-- Pass
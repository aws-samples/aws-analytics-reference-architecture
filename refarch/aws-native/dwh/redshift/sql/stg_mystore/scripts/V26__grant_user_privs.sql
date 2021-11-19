-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

GRANT USAGE ON SCHEMA stg_mystore TO etl;

GRANT EXECUTE ON PROCEDURE stg_mystore.sp_run_incremental_load() TO etl;

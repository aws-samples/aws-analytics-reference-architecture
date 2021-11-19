-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

DROP TABLE IF EXISTS stg_mystore.dw_incremental_dates CASCADE;

CREATE TABLE stg_mystore.dw_incremental_dates
(
   source_table_name VARCHAR
  ,start_date        TIMESTAMP
  ,dw_insert_date    TIMESTAMP DEFAULT SYSDATE
  ,dw_update_date    TIMESTAMP
);

COMMENT ON TABLE stg_mystore.dw_incremental_dates IS
   'DW table used in the incremental load ETL process for storing a high-water mark of the source data.';
-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE PROCEDURE stg_mystore.sp_update_high_water_mark (p_source_table_name VARCHAR, p_high_water_mark TIMESTAMP)
AS $$
DECLARE
   l_high_water_mark TIMESTAMP;
BEGIN

   -- Store the high-watermark for the next load.
   
   UPDATE stg_mystore.dw_incremental_dates
   SET start_date = p_high_water_mark
      ,dw_update_date = SYSDATE
   WHERE UPPER(source_table_name) = UPPER(p_source_table_name);

END;
$$ LANGUAGE plpgsql;
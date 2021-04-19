-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE PROCEDURE stg_mystore.sp_return_high_water_mark (p_source_table_name IN VARCHAR, p_start_date INOUT TIMESTAMP)
AS $$
BEGIN

   -- Return high-watermark from last load.
   
   SELECT did.start_date 
   INTO   p_start_date
   FROM   stg_mystore.dw_incremental_dates did
   WHERE  LOWER(did.source_table_name) = LOWER(p_source_table_name);

   IF NOT FOUND THEN
      -- Create record to perform full load.
      INSERT INTO stg_mystore.dw_incremental_dates
         (source_table_name, start_date, dw_insert_date, dw_update_date)
      VALUES(LOWER(p_source_table_name), TO_TIMESTAMP('1900-01-01', 'YYYY-MM-DD'), SYSDATE, NULL);
   
      p_start_date := TO_TIMESTAMP('1900-01-01', 'YYYY-MM-DD');
   END IF;

END;
$$ LANGUAGE plpgsql;
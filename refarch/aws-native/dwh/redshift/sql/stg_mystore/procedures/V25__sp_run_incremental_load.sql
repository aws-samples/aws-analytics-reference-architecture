-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE PROCEDURE stg_mystore.sp_run_incremental_load ()
AS $$
DECLARE
BEGIN

   -- Run load.
   
   CALL stg_mystore.sp_load_customer_dim ();
   
   CALL stg_mystore.sp_load_sale_fact('INCREMENTAL', NULL, NULL);
   
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;
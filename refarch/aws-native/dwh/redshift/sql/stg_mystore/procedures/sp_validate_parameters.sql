-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE PROCEDURE stg_mystore.sp_validate_parameters (p_load_type VARCHAR, p_start_date DATE, p_end_date DATE)
AS $$
DECLARE
   l_load_type VARCHAR;
BEGIN
   
    l_load_type := UPPER(p_load_type);
   
   -- Validate parameters.
   
   IF (l_load_type NOT IN ('HISTORY', 'INCREMENTAL')) THEN 
   
      RAISE EXCEPTION 'Invalid parameter value for l_load_type. Valid values are ''HISTORY'' or ''INCREMENTAL''';
   
   ELSEIF (l_load_type = 'HISTORY') AND ((p_start_date IS NULL) OR (p_end_date IS NULL)) THEN 
   
      RAISE EXCEPTION 'Invalid parameter values. p_start_date and p_end_date must be passed for load type of ''HISTORY''';

   ELSEIF (l_load_type = 'HISTORY') AND (p_start_date > p_end_date) THEN

      RAISE EXCEPTION 'Invalid parameter values. p_start_date must be less than p_end_date for load type of ''HISTORY''';
   
   END IF;

END
$$ LANGUAGE plpgsql;
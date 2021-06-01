-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE PROCEDURE stg_mystore.sp_copy_data(p_table_name varchar, p_start_date DATE, p_end_date DATE)
AS $$
DECLARE
   l_database_name VARCHAR;
   l_table_name VARCHAR;
   l_start_date DATE;
   l_end_date DATE;
   l_dates RECORD;
   l_s3_path VARCHAR;
   l_partition_col VARCHAR;
   l_truncate VARCHAR;
   l_copy VARCHAR;
   l_iam_role VARCHAR;
BEGIN
   l_table_name := LOWER(p_table_name);
   l_start_date := p_start_date;
   l_end_date := p_end_date;

   -- Find the required connection information for the copy command.
   
   SELECT
          es.databasename
         ,REPLACE(REPLACE(es.esoptions, '{"IAM_ROLE":"', ''), '"}', '') AS esoptions
   INTO 
          l_database_name
         ,l_iam_role
   FROM svv_external_schemas es
   WHERE es.schemaname = 'ext_clean_mystore';

   -- Clear the staging table.
   
   l_truncate := 'TRUNCATE TABLE stg_mystore.' || l_table_name;

   EXECUTE l_truncate;

   -- Translate dates to source folder names.
   
   IF (p_table_name = 'store_customer') THEN
      l_partition_col := 'customer_date';
   ELSEIF (p_table_name = 'store_customer_address') THEN
      l_partition_col := 'address_date';
   ELSEIF (p_table_name = 'store_sale') THEN
      l_partition_col := 'sale_date';
   END IF;
   
   FOR l_dates IN 
      (SELECT dd.day_date
       FROM dw_mystore.date_dim dd 
       WHERE dd.day_date BETWEEN l_start_date AND l_end_date) 
   LOOP 
      l_s3_path := 's3://' || l_database_name || '/' || l_table_name || '/' || l_partition_col || '=' || l_dates.day_date || '/';
   
      -- Run copy.
      
      l_copy := 'COPY stg_mystore.' || l_table_name  || CHR(13) ||
                'FROM ''' || l_s3_path || ''' ' || CHR(13) ||
                'IAM_ROLE ''' || l_iam_role || ''' ' || CHR(13) ||
                'FORMAT AS parquet';
            
      RAISE INFO 'l_copy: %', l_copy;
   
      EXECUTE l_copy;
   END LOOP;

END
$$ LANGUAGE plpgsql;

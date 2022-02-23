-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE VIEW stg_mystore.v_store_customer_address
AS
SELECT address_id
      ,city
      ,county
      ,state
      ,zip
      ,country
      ,gmt_offset
      ,location_type
      ,street
      ,stg_mystore.f_from_unixtime(address_datetime) AS address_datetime
      ,stg_mystore.f_from_unixtime(processing_datetime) AS processing_datetime
      ,stg_mystore.f_from_unixtime(etl_processing_datetime) AS etl_processing_datetime
FROM ext_clean_mystore.store_customer_address
WITH NO SCHEMA BINDING;
-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE VIEW stg_mystore.v_store_customer
AS
SELECT customer_id
      ,salutation
      ,first_name
      ,last_name
      ,birth_country
      ,email_address
      ,birth_date
      ,gender
      ,marital_status
      ,education_status
      ,purchase_estimate
      ,credit_rating
      ,buy_potential
      ,vehicle_count
      ,lower_bound
      ,upper_bound
      ,address_id
      ,stg_mystore.f_from_unixtime(customer_datetime) AS customer_datetime
      ,stg_mystore.f_from_unixtime(processing_datetime) AS processing_datetime
      ,stg_mystore.f_from_unixtime(etl_processing_datetime) AS etl_processing_datetime
FROM ext_clean_mystore.store_customer
WITH NO SCHEMA BINDING;
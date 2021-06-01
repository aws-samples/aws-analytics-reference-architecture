-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

INSERT INTO dw_mystore.customer_dim
            (customer_key 
             ,customer_id 
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
             ,income_band_lower_bound 
             ,income_band_upper_bound 
             ,start_date 
             ,address_id 
             ,address_date
             ,street 
             ,city 
             ,county 
             ,state 
             ,zip 
             ,country 
             ,gmt_offset 
             ,location_type 
             ,scd_start_date 
             ,scd_end_date 
             ,scd_current_flag) 
VALUES      (-1 
             ,'Unknown' 
             ,'#' 
             ,'Unknown' 
             ,'Unknown' 
             ,'Unknown' 
             ,'Unknown' 
             ,'1000-01-01' 
             ,'Unknown' 
             ,'Unknown' 
             ,'Unknown' 
             ,-1 
             ,'Unknown' 
             ,'Unknown' 
             ,-1 
             ,-1 
             ,-1 
             ,'1000-01-01' 
             ,'Unknown' 
             ,'1000-01-01' 
             ,'Unknown' 
             ,'Unknown' 
             ,'Unknown' 
             ,'#' 
             ,'Unknown' 
             ,'Unknown' 
             ,-1 
             ,'Unknown' 
             ,'1000-01-01 00:00:00.000' 
             ,'1000-01-01 00:00:00.000' 
             ,'#'); 
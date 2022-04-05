-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

DROP TABLE IF EXISTS stg_mystore.wrk_customer_dim CASCADE;

CREATE TABLE stg_mystore.wrk_customer_dim (
   customer_id             VARCHAR(16) ENCODE zstd
  ,salutation              VARCHAR(10) ENCODE zstd
  ,first_name              VARCHAR(20) ENCODE zstd
  ,last_name               VARCHAR(30) ENCODE zstd
  ,birth_country           VARCHAR(30) ENCODE bytedict
  ,email_address           VARCHAR(50) ENCODE zstd
  ,birth_date              DATE        ENCODE delta32k
  ,gender                  VARCHAR(10) ENCODE zstd
  ,marital_status          VARCHAR(10) ENCODE bytedict
  ,education_status        VARCHAR(30) ENCODE bytedict
  ,purchase_estimate       INT         ENCODE zstd
  ,credit_rating           VARCHAR(10) ENCODE zstd
  ,buy_potential           VARCHAR(10) ENCODE bytedict
  ,vehicle_count           INT         ENCODE az64
  ,income_band_lower_bound INT         ENCODE zstd
  ,income_band_upper_bound INT         ENCODE zstd
  ,customer_datetime       TIMESTAMP   SORTKEY
  ,address_id              VARCHAR(16) ENCODE zstd
  ,street                  VARCHAR(40) ENCODE zstd
  ,city                    VARCHAR(60) ENCODE zstd
  ,county                  VARCHAR(30) ENCODE zstd
  ,state                   VARCHAR(2)  ENCODE bytedict
  ,zip                     VARCHAR(10) ENCODE zstd
  ,country                 VARCHAR(20) ENCODE zstd
  ,gmt_offset              NUMERIC(5,2)ENCODE zstd
  ,location_type           VARCHAR(20) ENCODE zstd
  ,address_datetime        TIMESTAMP   ENCODE az64
)
BACKUP NO
DISTKEY (customer_id);

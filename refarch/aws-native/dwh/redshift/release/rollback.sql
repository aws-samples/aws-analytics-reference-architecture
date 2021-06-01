-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

--
-- Master rollback script for ara data warehouse
--

DROP SCHEMA ext_clean_mystore CASCADE;

DROP SCHEMA stg_mystore CASCADE;

DROP SCHEMA dw_mystore CASCADE;

DROP USER data_engineer;

DROP USER dataviz;

DROP USER etl;
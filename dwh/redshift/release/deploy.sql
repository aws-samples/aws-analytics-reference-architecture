-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

--
-- Master deploy script for ARA data warehouse
-- 
-- Needs to be run in a psql client. The following psql substitution variables must be set before running:
--
-- \set data_engineer_password '''<data_engineer_password>'''
-- \set dataviz_password '''<dataviz_password>'''
-- \set etl_password '''<etl_password>'''
-- \set glue_database '''<glue_database>'''
-- \set redshift_iam_role '''<redshift_iam_role>'''
--


\echo --
\echo -- Users without schemas
\echo --

\ir ../sql/create_users_psql.sql

-------------------------------------------------------------------------------

\echo --
\echo -- Schemas
\echo --

\echo --
\echo -- dw_mystore
\echo --

\ir ../sql/dw_mystore/scripts/create_schema.sql

\ir ../sql/dw_mystore/tables/customer_dim.sql

\ir ../sql/dw_mystore/tables/date_dim.sql

\ir ../sql/dw_mystore/tables/time_dim.sql

\ir ../sql/dw_mystore/tables/sale_fact.sql

\ir ../sql/dw_mystore/scripts/grant_user_privs.sql

\echo --
\echo -- Loading customer_dim unknown record ...
\echo --

\ir ../sql/dw_mystore/scripts/ins_customer_dim_unknown_rec.sql

\echo --
\echo -- Loading date_dim ...
\echo --

\ir ../sql/dw_mystore/scripts/load_date_dim.sql

\echo --
\echo -- Loading time_dim ...
\echo --

\ir ../sql/dw_mystore/scripts/load_time_dim.sql

-------------------------------------------------------------------------------

\echo --
\echo -- ext_mystore
\echo --

\ir ../sql/ext_mystore/scripts/create_schema_psql.sql

-------------------------------------------------------------------------------

\echo --
\echo -- stg_mystore
\echo --

\ir ../sql/stg_mystore/scripts/create_schema.sql

\ir ../sql/stg_mystore/tables/dw_incremental_dates.sql

\ir ../sql/stg_mystore/tables/wrk_customer_dim.sql

\ir ../sql/stg_mystore/tables/wrk_sale_fact.sql

\ir ../sql/stg_mystore/tables/store_sale.sql

\ir ../sql/stg_mystore/functions/f_from_unixtime.sql

\ir ../sql/stg_mystore/views/v_store_customer.sql

\ir ../sql/stg_mystore/views/v_store_customer_address.sql

\ir ../sql/stg_mystore/procedures/sp_copy_data.sql

\ir ../sql/stg_mystore/procedures/sp_validate_parameters.sql

\ir ../sql/stg_mystore/procedures/sp_update_high_water_mark.sql

\ir ../sql/stg_mystore/procedures/sp_return_high_water_mark.sql

\ir ../sql/stg_mystore/procedures/sp_load_customer_dim.sql

\ir ../sql/stg_mystore/procedures/sp_load_sale_fact.sql

\ir ../sql/stg_mystore/procedures/sp_run_incremental_load.sql

\ir ../sql/stg_mystore/scripts/grant_user_privs.sql










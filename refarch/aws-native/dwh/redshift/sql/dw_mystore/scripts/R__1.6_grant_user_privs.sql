-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

GRANT USAGE ON SCHEMA dw_mystore TO data_engineer, dataviz;

GRANT SELECT ON dw_mystore.customer_dim TO data_engineer, dataviz;
GRANT SELECT ON dw_mystore.date_dim TO data_engineer, dataviz;
GRANT SELECT ON dw_mystore.sale_fact TO data_engineer, dataviz;
GRANT SELECT ON dw_mystore.time_dim TO data_engineer, dataviz;
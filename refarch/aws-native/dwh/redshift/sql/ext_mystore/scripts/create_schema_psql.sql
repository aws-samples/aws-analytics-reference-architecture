-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

-- This script is called from deploy.sql and is used when deploying from psql.

CREATE EXTERNAL SCHEMA ext_clean_mystore AUTHORIZATION data_engineer
FROM DATA CATALOG
DATABASE :glue_database
IAM_ROLE :redshift_iam_role;
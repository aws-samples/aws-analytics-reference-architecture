-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

-- This script is called from the main ARA build.

CREATE EXTERNAL SCHEMA ext_clean_mystore AUTHORIZATION data_engineer
FROM DATA CATALOG
DATABASE ${GLUE_DATABASE}
IAM_ROLE '${REDSHIFT_IAM_ROLE}';
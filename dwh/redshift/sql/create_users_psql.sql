-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

-- This script is called from deploy.sql and is used when deploying from psql.

DROP USER IF EXISTS data_engineer;
CREATE USER data_engineer PASSWORD :data_engineer_password;

DROP USER IF EXISTS dataviz;
CREATE USER dataviz PASSWORD :dataviz_password;

DROP USER IF EXISTS etl;
CREATE USER etl PASSWORD :etl_password;



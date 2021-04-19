-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

-- This script is called from the main ARA build.

DROP USER IF EXISTS data_engineer;
CREATE USER data_engineer PASSWORD ${DATAENG_SECRET};

DROP USER IF EXISTS dataviz;
CREATE USER dataviz PASSWORD ${DATAVIZ_SECRET};

DROP USER IF EXISTS etl;
CREATE USER etl PASSWORD ${ETL_SECRET};



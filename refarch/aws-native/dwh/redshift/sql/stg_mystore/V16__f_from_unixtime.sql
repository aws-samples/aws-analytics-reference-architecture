-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

CREATE OR REPLACE FUNCTION stg_mystore.f_from_unixtime(BIGINT)
   RETURNS TIMESTAMP
   STABLE
AS
$$
   SELECT timestamp 'epoch' + ($1 / 1000000) * interval '1 second'
$$
LANGUAGE sql;

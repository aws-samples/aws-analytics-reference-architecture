-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

DROP TABLE IF EXISTS dw_mystore.time_dim CASCADE;

CREATE TABLE dw_mystore.time_dim
(
 time_key        int NOT NULL SORTKEY
 ,hour           int NOT NULL
 ,minute         int NOT NULL
 ,second         int NOT NULL
 ,am_pm          varchar(2) NOT NULL
 ,shift          varchar(20) NOT NULL
 ,sub_shift      varchar(20) NOT NULL
 ,meal_time      varchar(20) NOT NULL
 ,dw_insert_date timestamp NOT NULL DEFAULT SYSDATE
 ,dw_update_date timestamp
 ,CONSTRAINT pk_time_dim PRIMARY KEY ( time_key )
)
DISTSTYLE AUTO;


















-- Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
-- SPDX-License-Identifier: MIT-0

DROP TABLE IF EXISTS dw_mystore.date_dim CASCADE;

CREATE TABLE dw_mystore.date_dim
(
 date_key           date NOT NULL SORTKEY
 ,day_date          date NOT NULL
 ,month_seq         int NOT NULL
 ,week_seq          int NOT NULL
 ,quarter_seq       int NOT NULL
 ,year              int NOT NULL
 ,dow               int NOT NULL
 ,moy               int NOT NULL
 ,dom               int NOT NULL
 ,qoy               int NOT NULL
 ,fy_year           int NOT NULL
 ,fy_quarter_seq    int NOT NULL
 ,fy_week_seq       int NOT NULL
 ,day_name          varchar(9) NOT NULL
 ,quarter_name      varchar(6) NOT NULL
 ,holiday           varchar(1) NOT NULL
 ,weekend           varchar(1) NOT NULL
 ,following_holiday varchar(1) NOT NULL
 ,first_dom         int NOT NULL
 ,last_dom          int NOT NULL
 ,same_day_ly       int NOT NULL
 ,same_day_lq       int NOT NULL
 ,current_day       varchar(1) NOT NULL
 ,current_week      varchar(1) NOT NULL
 ,current_month     varchar(1) NOT NULL
 ,current_quarter   varchar(1) NOT NULL
 ,current_year      varchar(1) NOT NULL
 ,dw_insert_date    timestamp NOT NULL  DEFAULT SYSDATE
 ,dw_update_date    timestamp
 ,CONSTRAINT pk_date_dim PRIMARY KEY ( date_key )
)
DISTSTYLE AUTO;








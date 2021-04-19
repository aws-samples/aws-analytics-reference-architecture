# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

class Config:
    # GENERAL CONFIG
    QS_GROUP_NAME = 'ARA'

    # Permissions required by the CDK stack
    CDK_POLICY_ACTIONS = ['quicksight:CreateDataSource',
                     'quicksight:DeleteDataSource',
                     'quicksight:CreateDataSet',
                     'quicksight:DeleteDataSet',
                     'quicksight:PassDataSource',
                     'quicksight:PassDataSet',
                     'quicksight:CreateAnalysis',
                     'quicksight:DeleteAnalysis',
                     'quicksight:CreateDashboard',
                     'quicksight:DeleteDashboard',
                     'quicksight:DescribeTemplate']

    # Permissions to be given to data sources
    DATASOURCE_ACTIONS = [
                                  'quicksight:UpdateDataSourcePermissions',
                                  'quicksight:DescribeDataSource',
                                  'quicksight:DescribeDataSourcePermissions',
                                  'quicksight:PassDataSource',
                                  'quicksight:UpdateDataSource',
                                  'quicksight:DeleteDataSource'
                              ]

    # Permissions to be given to data sets
    DATASET_ACTIONS = [
                                'quicksight:UpdateDataSetPermissions',
                                'quicksight:DescribeDataSet',
                                'quicksight:DescribeDataSetPermissions',
                                'quicksight:PassDataSet',
                                'quicksight:DescribeIngestion',
                                'quicksight:ListIngestions',
                                'quicksight:UpdateDataSet',
                                'quicksight:DeleteDataSet',
                                'quicksight:CreateIngestion',
                                'quicksight:CancelIngestion'
                            ]

    # Permissions to be given to analyses
    ANALYSIS_ACTIONS = [
                                'quicksight:RestoreAnalysis',
                                'quicksight:UpdateAnalysisPermissions',
                                'quicksight:DeleteAnalysis',
                                'quicksight:DescribeAnalysisPermissions',
                                'quicksight:QueryAnalysis',
                                'quicksight:DescribeAnalysis',
                                'quicksight:UpdateAnalysis'
    ]

    # REDSHIFT CONFIG
    REDSHIFT_DATASOURCE_NAME = 'ARA_Redshift'
    REDSHIFT_DATASET_NAME = 'ARA_Sales_Redshift'
    REDSHIFT_ANALYSIS_NAME = 'ARA_Sales_Redshift_Analysis'
    REDSHIFT_ANALYSIS_TEMPLATE_ALIAS = 'arn:aws:quicksight:eu-west-1:660444162056:template/ara_redshift_dash/alias/ara_redshift_dash_prod'

    REDSHIFT_CUSTOM_SQL = """SELECT sf.sold_date AS sf_sold_date_time
                              ,sf.ticket_id AS sf_ticket_id
                              ,sf.item_id AS sf_item_id
                              ,sf.quantity AS #quantity
                              ,sf.wholesale_cost AS #wholesale_cost
                              ,sf.list_price AS #list_price
                              ,sf.sales_price AS #sales_price
                              ,sf.ext_discount_amt AS #ext_discount_amt
                              ,sf.ext_sales_price AS #ext_sales_price
                              ,sf.ext_wholesale_cost AS #ext_wholesale_cost
                              ,sf.ext_list_price AS #ext_list_price
                              ,sf.ext_tax AS #ext_tax
                              ,sf.coupon_amt AS #coupon_amt
                              ,sf.net_paid AS #net_paid
                              ,sf.net_paid_inc_tax AS #net_paid_inc_tax
                              ,sf.net_profit AS #net_profit
                              ,cd.customer_id AS cd_customer_id
                              ,cd.salutation AS cd_salutation
                              ,cd.first_name AS cd_first_name
                              ,cd.last_name AS cd_last_name
                              ,cd.birth_country AS cd_birth_country
                              ,cd.email_address AS cd_email_address
                              ,cd.birth_date AS cd_birth_date
                              ,cd.gender AS cd_gender
                              ,cd.marital_status AS cd_marital_status
                              ,cd.education_status AS cd_education_status
                              ,cd.purchase_estimate AS cd_purchase_estimate
                              ,cd.credit_rating AS cd_credit_rating
                              ,cd.buy_potential AS cd_buy_potential
                              ,cd.vehicle_count AS cd_vehicle_count
                              ,cd.income_band_lower_bound AS cd_income_band_lower_bound
                              ,cd.income_band_upper_bound AS cd_income_band_upper_bound
                              ,cd.start_date AS cd_start_date
                              ,cd.address_id AS cd_address_id
                              ,cd.address_date AS cd_address_date
                              ,cd.street AS cd_street
                              ,cd.city AS cd_city
                              ,cd.county AS cd_county
                              ,cd.state AS cd_state
                              ,cd.zip AS cd_zip
                              ,cd.country AS cd_country
                              ,cd.gmt_offset AS cd_gmt_offset
                              ,cd.location_type AS cd_location_type
                              ,dd.day_date AS dd_sold_day_date
                              ,dd.month_seq AS dd_month_seq
                              ,dd.week_seq AS dd_week_seq
                              ,dd.quarter_seq AS dd_quarter_seq
                              ,dd."year" AS dd_year
                              ,dd.dow AS dd_day_of_week
                              ,dd.moy AS dd_month_of_year
                              ,dd.dom AS dd_day_of_month
                              ,dd.qoy AS dd_quarter_of_year
                              ,dd.fy_year AS dd_fy_year
                              ,dd.fy_quarter_seq AS dd_fy_quarter_seq
                              ,dd.fy_week_seq AS dd_fy_week_seq
                              ,dd.day_name AS dd_day_name
                              ,dd.quarter_name AS dd_quarter_name
                              ,dd.holiday AS dd_holiday_yn
                              ,dd.weekend AS dd_weekend_yn
                              ,dd.following_holiday AS dd_following_holiday_yn
                              ,dd.first_dom AS dd_first_day_of_month
                              ,dd.last_dom AS dd_last_day_of_month
                              ,dd.same_day_ly AS dd_same_day_last_year
                              ,dd.same_day_lq AS dd_same_day_last_quarter
                              ,dd.current_day AS dd_current_day_yn
                              ,dd.current_week AS dd_current_week_yn
                              ,dd.current_month AS dd_current_month_yn
                              ,dd.current_quarter AS dd_current_quarter_yn
                              ,dd.current_year AS dd_current_year_yn
                              ,td."hour" AS td_hour
                              ,td."minute" AS td_minute
                              ,td."second" AS td_second
                              ,td.am_pm AS td_am_pm
                              ,td.shift AS td_shift
                              ,td.sub_shift AS td_sub_shift
                              ,td.meal_time AS td_meal_time
                        FROM dw_mystore.sale_fact sf
                        INNER JOIN dw_mystore.customer_dim cd
                           ON sf.customer_key = cd.customer_key
                        INNER JOIN dw_mystore.date_dim dd
                           ON sf.sold_date_key = dd.date_key
                        INNER JOIN dw_mystore.time_dim td
                           ON sf.sold_time_key = td.time_key"""

    REDSHIFT_COLUMNS = [
                            {
                                "Name": "sf_sold_date_time",
                                "Type": "DATETIME"
                            },
                            {
                                "Name": "sf_ticket_id",
                                "Type": "STRING"
                            },
                            {
                                "Name": "sf_item_id",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "#quantity",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "#wholesale_cost",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#list_price",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#sales_price",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#ext_discount_amt",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#ext_sales_price",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#ext_wholesale_cost",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#ext_list_price",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#ext_tax",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#coupon_amt",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#net_paid",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#net_paid_inc_tax",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "#net_profit",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "cd_customer_id",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_salutation",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_first_name",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_last_name",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_birth_country",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_email_address",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_birth_date",
                                "Type": "DATETIME"
                            },
                            {
                                "Name": "cd_gender",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_marital_status",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_education_status",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_purchase_estimate",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "cd_credit_rating",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_buy_potential",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_vehicle_count",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "cd_income_band_lower_bound",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "cd_income_band_upper_bound",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "cd_start_date",
                                "Type": "DATETIME"
                            },
                            {
                                "Name": "cd_address_id",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_address_date",
                                "Type": "DATETIME"
                            },
                            {
                                "Name": "cd_street",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_city",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_county",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_state",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_zip",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_country",
                                "Type": "STRING"
                            },
                            {
                                "Name": "cd_gmt_offset",
                                "Type": "DECIMAL"
                            },
                            {
                                "Name": "cd_location_type",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_sold_day_date",
                                "Type": "DATETIME"
                            },
                            {
                                "Name": "dd_month_seq",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_week_seq",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_quarter_seq",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_year",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_day_of_week",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_month_of_year",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_day_of_month",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_quarter_of_year",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_fy_year",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_fy_quarter_seq",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_fy_week_seq",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_day_name",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_quarter_name",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_holiday_yn",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_weekend_yn",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_following_holiday_yn",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_first_day_of_month",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_last_day_of_month",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_same_day_last_year",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_same_day_last_quarter",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "dd_current_day_yn",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_current_week_yn",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_current_month_yn",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_current_quarter_yn",
                                "Type": "STRING"
                            },
                            {
                                "Name": "dd_current_year_yn",
                                "Type": "STRING"
                            },
                            {
                                "Name": "td_hour",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "td_minute",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "td_second",
                                "Type": "INTEGER"
                            },
                            {
                                "Name": "td_am_pm",
                                "Type": "STRING"
                            },
                            {
                                "Name": "td_shift",
                                "Type": "STRING"
                            },
                            {
                                "Name": "td_sub_shift",
                                "Type": "STRING"
                            },
                            {
                                "Name": "td_meal_time",
                                "Type": "STRING"
                            }
                    ]
    REDSHIFT_DATA_TRANSFORMATIONS = [
            {
                "TagColumnOperation": {
                    "ColumnName": "cd_birth_country",
                    "Tags": [
                        {
                            "ColumnGeographicRole": "COUNTRY"
                        }
                    ]
                }
            },
            {
                "TagColumnOperation": {
                    "ColumnName": "cd_city",
                    "Tags": [
                        {
                            "ColumnGeographicRole": "CITY"
                        }
                    ]
                }
            },
            {
                "TagColumnOperation": {
                    "ColumnName": "cd_county",
                    "Tags": [
                        {
                            "ColumnGeographicRole": "COUNTY"
                        }
                    ]
                }
            },
            {
                "TagColumnOperation": {
                    "ColumnName": "cd_state",
                    "Tags": [
                        {
                            "ColumnGeographicRole": "STATE"
                        }
                    ]
                }
            },
            {
                "TagColumnOperation": {
                    "ColumnName": "cd_zip",
                    "Tags": [
                        {
                            "ColumnGeographicRole": "POSTCODE"
                        }
                    ]
                }
            },
            {
                "TagColumnOperation": {
                    "ColumnName": "cd_country",
                    "Tags": [
                        {
                            "ColumnGeographicRole": "COUNTRY"
                        }
                    ]
                }
            }
        ]


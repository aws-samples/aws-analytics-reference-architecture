# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

ARA_BUCKET_NAME = 'aws-analytics-reference-architecture'
ARA_BUCKET = 's3://' + ARA_BUCKET_NAME

BINARIES = '/binaries'
BINARIES_LOCATION = ARA_BUCKET + BINARIES


class AutoEmptyConfig:
    FOUNDATIONS_UUID = '672b22e0-f9ac-11ea-adc1-0242ac120002'
    GENERATOR_UUID = '6d13cb4e-f9ac-11ea-adc1-0242ac120002'


class DataGenConfig:
    JAR_FILE = '/data-generator-assembly-v1.0.jar'
    DSDGEN_INSTALL_SCRIPT = "/dsdgen.sh"
    STREAM_DATA_SIZE = {
        "SMALL": "1",
        "MEDIUM": "10",
        "LARGE": "100",
        "XLARGE": "1000"
    }
    BATCH_DATA_SIZE = {
        "SMALL": "1",
        "MEDIUM": "100",
        "LARGE": "1000",
        "XLARGE": "10000"
    }
    STREAM_CLUSTER_SIZE = {
        "SMALL": 3,
        "MEDIUM": 5,
        "LARGE": 21,
        "XLARGE": 201
    }
    BATCH_CLUSTER_SIZE = {
        "SMALL": 3,
        "MEDIUM": 21,
        "LARGE": 201,
        "XLARGE": 2001
    }


class Raw2CleanConfig:
    PARQUET_GLUE_SCRIPT_LOCATION = 'binaries/batch/raw2clean_parquet.py'
    HUDI_GLUE_SCRIPT_LOCATION = 'binaries/batch/raw2clean_hudi.py'
    HUDI_EXTRA_JAR_PATH='binaries/batch/hudi-spark-bundle_2.11-0.5.3-rc2.jar'
    AVRO_EXTRA_JAR_PATH='binaries/batch/spark-avro_2.11-2.4.4.jar'
    GLUE_DPU_SIZE = {
        "SMALL": 2,
        "MEDIUM": 4,
        "LARGE": 40,
        "XLARGE": 400
    }
    PARALLELISM = {
        "SMALL": 8,
        "MEDIUM": 40,
        "LARGE": 400,
        "XLARGE": 4000
    }


class Glue:
    AUDIT_ROLE_NAME = 'datalake-glue-audit'
    AUDIT_TABLE_COLUMNS = [
        {"name": "eventversion", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "useridentity", "type": {
            "inputString": "struct<type:string,principalid:string,arn:string,accountid:string,invokedby:string,"
                           "accesskeyid:string,userName:string,sessioncontext:struct<"
                           "attributes:struct<mfaauthenticated:string,creationdate:string>,sessionissuer:struct<"
                           "type:string,principalId:string,arn:string,accountId:string,userName:string>>>",
            "isPrimitive": False}
         },
        {"name": "eventtime", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "eventsource", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "eventname", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "awsregion", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "sourceipaddress", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "useragent", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "errorcode", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "errormessage", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "requestparameters", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "responseelements", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "additionaleventdata", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "requestid", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "eventid", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "resources", "type": {
            "inputString": "array<struct<arn:string,accountId:string,type:string>>",
            "isPrimitive": False}
         },
        {"name": "eventtype", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "apiversion", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "readonly", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "recipientaccountid", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "serviceeventdetails", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "sharedeventid", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "vpcendpointid", "type": {"inputString": "string", "isPrimitive": True}}
    ]

    AUDIT_TABLE_PARTITIONS = [
        {"name": "region", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "year", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "month", "type": {"inputString": "string", "isPrimitive": True}},
        {"name": "day", "type": {"inputString": "string", "isPrimitive": True}}
    ]


class RedshiftDeploy:
    REDSHIFT_DB_NAME = 'ara_tpcds_db'

class Redshift:
    DATAVIZ_USER = 'dataviz'
    ETL_USER = 'etl'
    DATA_ENGINEER_USER = 'data_engineer'
    ETL_PROCEDURE = 'sp_run_incremental_load'
    DATABASE = 'ara_tpcds_db'
    SCHEMA = 'stg_mystore'
    BASTION_HOST_KEY_PAIR_NAME = 'bastion-keypair'
    # local IP address/CIDR
    LOCAL_IP = '0.0.0.0/0'


class DataVizConfig:
    # GENERAL CONFIG
    QS_GROUP_NAME = 'ara'

    # Permissions required by the CDK stack
    CDK_POLICY_ACTIONS = ['quicksight:CreateGroup',
                          'quicksight:DeleteGroup',
                          'quicksight:CreateGroupMembership',
                          'quicksight:DeleteGroupMembership',
                          'quicksight:CreateDataSource',
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

    # ATHENA CONFIG
    ATHENA_DATASOURCE_NAME = 'ara_Athena'
    ATHENA_DATASET_NAME = 'ara_Sales_Athena'
    ATHENA_ANALYSIS_NAME = 'ara_Sales_Athena_Analysis'
    ATHENA_ANALYSIS_TEMPLATE_ALIAS = 'arn:aws:quicksight:eu-west-1:660444162056:template/ara_dash/alias/ara_dash_prod'

    ATHENA_CUSTOM_SQL = ('SELECT sf.sale_datetime AS "sf_sold_date_time",'
                         'sf.sale_date AS "sf_sold_date" ,'
                         'sf.ticket_id AS "sf_ticket_id" ,'
                         'sf.item_id AS "sf_item_id" ,'
                         'sf.quantity AS "#quantity" ,'
                         'sf.wholesale_cost AS "#wholesale_cost" ,'
                         'sf.list_price AS "#list_price" ,'
                         'sf.sales_price AS "#sales_price" ,'
                         'sf.ext_discount_amt AS "#ext_discount_amt" ,'
                         'sf.ext_sales_price AS "#ext_sales_price" ,'
                         'sf.ext_wholesale_cost AS "#ext_wholesale_cost" ,'
                         'sf.ext_list_price AS "#ext_list_price" ,'
                         'sf.ext_tax AS "#ext_tax" ,'
                         'sf.coupon_amt AS "#coupon_amt" ,'
                         'sf.net_paid AS "#net_paid" ,'
                         'sf.net_paid_inc_tax AS "#net_paid_inc_tax" ,'
                         'sf.net_profit AS "#net_profit",'
                         'cd.salutation AS cd_salutation ,'
                         'cd.first_name AS cd_first_name ,'
                         'cd.last_name AS cd_last_name ,'
                         'cd.birth_country AS cd_birth_country ,'
                         'cd.email_address AS cd_email_address ,'
                         'cd.birth_date AS cd_birth_date ,'
                         'cd.gender AS cd_gender ,'
                         'cd.marital_status AS cd_marital_status ,'
                         'cd.education_status AS cd_education_status ,'
                         'cd.purchase_estimate AS cd_purchase_estimate ,'
                         'cd.credit_rating AS cd_credit_rating ,'
                         'cd.buy_potential AS cd_buy_potential ,'
                         'cd.vehicle_count AS cd_vehicle_count ,'
                         'cd.lower_bound AS cd_income_band_lower_bound ,'
                         'cd.upper_bound AS cd_income_band_upper_bound,'
                         'id.product_name AS id_product_name ,'
                         'id.item_desc AS id_item_desc ,'
                         'id.brand AS id_brand ,'
                         'id.class AS id_class ,'
                         'id.category AS id_category ,'
                         'id.manufact AS id_manufact ,'
                         'id.size AS id_size ,'
                         'id.color AS id_color ,'
                         'id.units AS id_units ,'
                         'id.container AS id_container,'
                         'sd.store_name AS sd_store_name ,'
                         'sd.number_employees AS sd_number_employees ,'
                         'sd.floor_space AS sd_floor_space ,'
                         'sd.hours AS sd_hours ,'
                         'sd.market_manager AS sd_market_manager ,'
                         'sd.city AS sd_city ,'
                         'sd.county AS sd_county ,'
                         'sd.state AS sd_state ,'
                         'sd.zip AS sd_zip ,'
                         'sd.country AS sd_country ,'
                         'sd.gmt_offset AS sd_gmt_offset ,'
                         'sd.tax_percentage AS sd_tax_percentage ,'
                         'sd.street AS sd_street,'
                         'cda.address_datetime AS cd_address_date ,'
                         'cda.street AS cd_street ,'
                         'cda.city AS cd_city ,'
                         'cda.county AS cd_county ,'
                         'cda.state AS cd_state ,'
                         'cda.zip AS cd_zip ,'
                         'cda.country AS cd_country ,'
                         'cda.gmt_offset AS cd_gmt_offset '
                         'FROM "{0}".store_sale AS sf '
                         'INNER JOIN '
                         '(SELECT customer_id,'
                         'max(customer_datetime) AS max_datetime '
                         'FROM "{0}".store_customer '
                         'GROUP BY  customer_id) AS cdid '
                         'ON sf.customer_id = cdid.customer_id '
                         'INNER JOIN "{0}".store_customer AS cd '
                         'ON cdid.customer_id = cd.customer_id '
                         'AND cdid.max_datetime = cd.customer_datetime '
                         'INNER JOIN '
                         ' (SELECT address_id,'
                         ' max(address_datetime) AS max_datetime'
                         ' FROM "{0}".store_customer_address'
                         ' GROUP BY  address_id) AS cdaid'
                         ' ON cd.address_id = cdaid.address_id'
                         ' INNER JOIN "{0}".store_customer_address AS cda'
                         ' ON cdaid.address_id = cda.address_id'
                         ' AND cdaid.max_datetime = cda.address_datetime'
                         ' INNER JOIN'
                         ' (SELECT item_id,'
                         ' max(item_datetime) AS max_datetime'
                         ' FROM "{0}".item'
                         ' GROUP BY  item_id) AS idid'
                         ' ON sf.item_id = idid.item_id'
                         ' INNER JOIN "{0}".item AS id'
                         ' ON idid.item_id = id.item_id'
                         ' AND idid.max_datetime = id.item_datetime'
                         ' INNER JOIN'
                         ' (SELECT store_id,'
                         ' max(store_datetime) AS max_datetime'
                         ' FROM "{0}".store'
                         ' GROUP BY  store_id) AS sdid'
                         ' ON sf.store_id = sdid.store_id'
                         ' INNER JOIN "{0}".store AS sd'
                         ' ON sdid.store_id = sd.store_id'
                         ' AND sdid.max_datetime = sd.store_datetime')

    ATHENA_COLUMNS = [
        {
            "Name": "sf_sold_date_time",
            "Type": "DATETIME"
        },
        {
            "Name": "sf_sold_date",
            "Type": "STRING"
        },
        {
            "Name": "sf_ticket_id",
            "Type": "INTEGER"
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
            "Type": "STRING"
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
            "Name": "cdid_processing_datetime",
            "Type": "STRING"
        },
        {
            "Name": "cd_processing_datetime",
            "Type": "STRING"
        },
        {
            "Name": "sf_processing_datetime",
            "Type": "STRING"
        },
        {
            "Name": "id_product_name",
            "Type": "STRING"
        },
        {
            "Name": "id_item_desc",
            "Type": "STRING"
        },
        {
            "Name": "id_brand",
            "Type": "STRING"
        },
        {
            "Name": "id_class",
            "Type": "STRING"
        },
        {
            "Name": "id_category",
            "Type": "STRING"
        },
        {
            "Name": "id_manufact",
            "Type": "STRING"
        },
        {
            "Name": "id_size",
            "Type": "STRING"
        },
        {
            "Name": "id_color",
            "Type": "STRING"
        },
        {
            "Name": "id_units",
            "Type": "STRING"
        },
        {
            "Name": "id_container",
            "Type": "STRING"
        },
        {
            "Name": "sd_store_name",
            "Type": "STRING"
        },
        {
            "Name": "sd_number_employees",
            "Type": "INTEGER"
        },
        {
            "Name": "sd_floor_space",
            "Type": "INTEGER"
        },
        {
            "Name": "sd_hours",
            "Type": "STRING"
        },
        {
            "Name": "sd_market_manager",
            "Type": "STRING"
        },
        {
            "Name": "sd_city",
            "Type": "STRING"
        },
        {
            "Name": "sd_county",
            "Type": "STRING"
        },
        {
            "Name": "sd_state",
            "Type": "STRING"
        },
        {
            "Name": "sd_zip",
            "Type": "INTEGER"
        },
        {
            "Name": "sd_country",
            "Type": "STRING"
        },
        {
            "Name": "sd_gmt_offset",
            "Type": "DECIMAL"
        },
        {
            "Name": "sd_tax_percentage",
            "Type": "DECIMAL"
        },
        {
            "Name": "sd_street",
            "Type": "STRING"
        },
        {
            "Name": "cd_address_date",
            "Type": "STRING"
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
            "Name": "cd_country",
            "Type": "STRING"
        },
        {
            "Name": "cd_gmt_offset",
            "Type": "DECIMAL"
        }
    ]

    ATHENA_DATA_TRANSFORMATIONS = [
        {
            "CastColumnTypeOperation": {
                "ColumnName": "sf_sold_date",
                "NewColumnType": "DATETIME",
                "Format": "yyyy-MM-dd"
            }
        },
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
                "ColumnName": "sd_city",
                "Tags": [
                    {
                        "ColumnGeographicRole": "CITY"
                    }
                ]
            }
        },
        {
            "TagColumnOperation": {
                "ColumnName": "sd_county",
                "Tags": [
                    {
                        "ColumnGeographicRole": "COUNTY"
                    }
                ]
            }
        },
        {
            "TagColumnOperation": {
                "ColumnName": "sd_state",
                "Tags": [
                    {
                        "ColumnGeographicRole": "STATE"
                    }
                ]
            }
        },
        {
            "TagColumnOperation": {
                "ColumnName": "sd_country",
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
        }]

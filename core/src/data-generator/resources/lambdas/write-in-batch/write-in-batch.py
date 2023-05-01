# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import os
import sys
import json
import logging
import math
import tempfile
from os import path
from dateutil import parser
from datetime import datetime, timedelta
import numpy as np
import awswrangler as wr
import pandas as pd

logging.basicConfig(level=logging.INFO)
log = logging.getLogger()
log.setLevel(os.getenv('LOG_LEVEL', logging.INFO))


def calculate_time_range(trigger_time_in_iso, offset, frequency):
    """
    Calculate the time range to filter

    :param trigger_time_in_iso: Time when the state machine is triggerred
    :param offset: Difference between the dataset start time and deployment time
    :param frequency: How often should the batch run (this specifies the range of data for each batch)
    :return: (start_time, end_time)
    """
    trigger_time_in_datetime = parser.parse(trigger_time_in_iso)
    start_time_ts = datetime.timestamp(trigger_time_in_datetime) - offset
    end_time_ts = start_time_ts + frequency
    start_time = datetime.utcfromtimestamp(start_time_ts)
    end_time = datetime.utcfromtimestamp(end_time_ts)
    return start_time, end_time


def filter_rows_by_datetime(df, col_name, start_time, end_time):
    """
    Filter dataframe to only the rows within given range

    :param df: Source dataframe
    :param col_name: Datetime column used to filter
    :param start_time: Start time (inclusive)
    :param end_time: End time (exclusive)
    :return: Dataframe with only row ithin given range
    """
    rows_in_range=df[col_name].between(
        pd.to_datetime(start_time).tz_localize('utc'), 
        pd.to_datetime(end_time).tz_localize('utc'), 
        inclusive='left'
    )
    return df[rows_in_range]



def calculate_no_of_files(df, file_max_size):
    """
    Calculate the maximum number of files we can write within the constraint
    that no file will exceed file max_size

    We do not know actual file size until we write into the CSV file. 
    Thus, we write two small dataframe (with only header, with only one row) to 
    get the approximate header size row size.

    :param df: dataframe to calculate 
    :param file_max_size: Maximum file size (in bytes)
    :return: the number of files
    """
    log.info('# calculate_no_of_files()')
    temp_dir = tempfile.gettempdir() 
    log.info(f'## temp_dir = {temp_dir}')

    col_names = [col for col in df.columns]
    df_only_header = pd.DataFrame(columns=col_names)
    only_header_temp_path = path.join(temp_dir, 'df_only_header.csv')
    df_only_header.to_csv(only_header_temp_path)
    header_size = path.getsize(only_header_temp_path)
    log.info(f'## header_size = {header_size}')

    one_row_temp_path = path.join(temp_dir, 'df_one_row.csv')
    df.iloc[[0], :].to_csv(one_row_temp_path)
    row_size = path.getsize(one_row_temp_path) - header_size
    log.info(f'## row_size = {row_size}')

    total_row_max_size = file_max_size - header_size 
    log.info(f'## total_row_max_size = {total_row_max_size}')
    row_per_file = math.floor(total_row_max_size / row_size)
    log.info(f'## row_per_file = {row_per_file}')
    no_of_files = math.ceil(len(df) / row_per_file)
    log.info(f'## no_of_files = {no_of_files}')
    
    return no_of_files


def write_s3(df_list, params):
   """
   Write dataframe to a CSV file in S3.
   Each file is written to "{path_prefix}-{index_in_list}.csv"
   e.g. "s3://path/file_prefix-00000.csv"
   """
   for idx, df in enumerate(df_list):
       output_path = f'{params["path_prefix"]}-{idx:05d}.csv'
       log.info(f"## Writing concatenated data to the {output_path} in S3")
       wr.s3.to_csv(
            df=df,
            path=output_path,
            index=False
       )


def write_ddb(df_list, params):
    """
    Write items from dataframe to DynamoDB.

    :param df_list: List of dataframes to insert
    :param params: Target table name
    """
    log.info(f"## Writing concatenated data to the {params['table_name']} table in DynamoDB")
    for idx, df in enumerate(df_list):
        df = df.astype(str)
        wr.dynamodb.put_df(
            df=df,
            table_name=params['table_name']
        )


def write_redshift(df_list, params):
    """
    Write items from dataframe to Redshift.

    :param df_list: List of dataframes to insert
    :param params: Connection and table info
    """
    log.info(f"## Writing concatenated data to the {params['table_name']} table in Amazon Redshift")
    con = wr.redshift.connect(secret_id=params['connection_name'])
    for idx, df in enumerate(df_list):
        wr.redshift.to_sql(
            df=df,
            table=params['table_name'],
            schema=params['schema'],
            con=con
        )
    con.close()


def insert_mysql(df_list, params):
    """
    Insert dataframes into MySQL database

    :param df_list: List of dataframes to insert
    :param params: Connection and table info
    """
    con = wr.mysql.connect(secret_id=params['connection_name'])
    for idx, df in enumerate(df_list):
        wr.mysql.to_sql(
            df=df,
            table=params['table_name'],
            schema=params['schema'],
            con=con
        )
    con.close()


def insert_postgresql(df_list, params):
    """
    Insert dataframes into PostgreSQL database

    :param df_list: List of dataframes to insert
    :param params: Connection and table info
    """
    con = wr.postgresql.connect(secret_id=params['connection_name'])
    for idx, df in enumerate(df_list):
        wr.postgresql.to_sql(
            df=df,
            table=params['table_name'],
            schema=params['schema'],
            con=con
        )
    con.close()


def resolve_db_type(df_list, params):
    """
    Choose whether to insert to Postgres or MySQL database depending on selection
    """
    if params['type'] == 'mysql':
        insert_mysql(df_list, params)
    elif params['type'] == 'postgresql':
        insert_postgresql(df_list, params)
    else:
        log.info(f"Type {params['type']} is not a valid option.")


def write_aurora(df_list, params):
    resolve_db_type(df_list, params)


def write_rds(df_list, params):
    resolve_db_type(df_list, params)


def write_all(df_list, target_params):
    """
    Write all dataframes to targets.

    :param df_list: a list of dataframe to write
    :param target_params: list of targets to write dataframe to, and the parameters required to do so
    :return: None
    """
    log.info(f'# write_all()')
    for target, params in target_params.items():
        log.info(f"## Writing concatenated data to the {params['table_name']} table in {target}>")
        globals()['write_' + target](df_list, params)


def handler(event, ctx):
    # Params from the last step
    file_path = event.get('filePath', '')
    
    # Params for calculating start/end time
    frequency = int(event.get('frequency'))
    trigger_time_in_iso = event.get('triggerTime') # e.g. 2021-12-15T14:10:00Z
    offset = int(event.get('offset'))

    # Params for file processing
    output_file_index = int(event.get('outputFileIndex', 0))
    datetime_column_to_filter = event.get('dateTimeColumnToFilter', None)
    datetime_columns_to_adjust = event.get('dateTimeColumnsToAdjust', [])

    start_time, end_time = calculate_time_range(trigger_time_in_iso, offset, frequency)

    log.info('Lambda called with these event values')
    log.info(f'trigger_time_in_iso = {trigger_time_in_iso}')
    log.info(f"In ISO format:  [{start_time.isoformat()}] to [{end_time.isoformat()}]")
    log.info(f'file_path = {file_path}')
    log.info(f'offset = {offset}')
    log.info(f'dateTimeColumnToFilter = {datetime_column_to_filter}')
    log.info(f'dateTimeColumnsToAdjust = {datetime_columns_to_adjust}')

    log.info('Concatenating all files together')
    df=wr.s3.read_csv(
        path=file_path,
        s3_additional_kwargs={"RequestPayer": "requester"}
    )

    log.info(f"Filtering records from:  [{start_time.isoformat()}] to [{end_time.isoformat()}]")
    df[datetime_column_to_filter] = pd.to_datetime(df[datetime_column_to_filter])
    log.info(f"Concatenated dataframe (before filtering): {df.shape}")
    df = filter_rows_by_datetime(df, datetime_column_to_filter, start_time, end_time)
    log.info(f"Concatenated dataframe (after filtering): {df.shape}")

    # Adjust datetime columns with offset
    log.info('Add offset to the datetime columns')
    for col in datetime_columns_to_adjust:
        df[col] = pd.to_datetime(df[col])
        df[col] = (df[col] + pd.Timedelta(offset, 's')).dt.strftime('%Y-%m-%dT%H:%M:%SZ')

    target_params = {}

    # S3 params
    sink_path = event.get('sinkPath')
    log.info(f'sinkPath = {sink_path}')
    file_max_size = int(event.get('outputFileMaxSizeInBytes', 100 * 1048576)) # Default to 100 MB
    # Find s3 path prefix
    if sink_path:
        adjusted_start_time = start_time + timedelta(seconds=offset)
        adjusted_end_time = end_time + timedelta(seconds=offset)
        target_params['s3'] = {'path_prefix': f'{sink_path}/ingestion_start={adjusted_start_time.isoformat()}'
                                              f'/ingestion_end={adjusted_end_time.isoformat()}/{output_file_index:03d}',
                               'table_name': ''}

    # DynamoDB params
    log.info(f'ddbTableName = {event.get("ddbTableName")}')
    if event.get('ddbTableName'): target_params['ddb'] = {'table_name': event.get('ddbTableName')}

    # Redshift params
    log.info(f'redshiftTableName = {event.get("redshiftTableName")}')
    log.info(f'redshiftConnection = {event.get("redshiftConnection")}')
    log.info(f'redshiftSchema = {event.get("redshiftSchema")}')
    if event.get('redshiftTableName'):
        target_params['redshift'] = {}
        target_params['redshift']['table_name'] = event.get('redshiftTableName')
        target_params['redshift']['connection_name'] = event.get('redshiftConnection')
        target_params['redshift']['schema'] = event.get('redshiftSchema')

    # Aurora params
    log.info(f'auroraTableName = {event.get("auroraTableName")}')
    log.info(f'auroraConnection = {event.get("auroraConnection")}')
    log.info(f'auroraSchema = {event.get("auroraSchema")}')
    if event.get('auroraTableName'):
        target_params['aurora'] = {}
        target_params['aurora']['table_name'] = event.get('auroraTableName')
        target_params['aurora']['connection_name'] = event.get('auroraConnection')
        target_params['aurora']['schema'] = event.get('auroraSchema')
        target_params['aurora']['type'] = event.get('dbType')

    # RDS params
    log.info(f'rdsTableName = {event.get("rdsTableName")}')
    log.info(f'rdsConnection = {event.get("rdsConnection")}')
    log.info(f'rdsSchema = {event.get("rdsSchema")}')
    if event.get('rdsTableName'):
        target_params['rds'] = {}
        target_params['rds']['table_name'] = event.get('rdsTableName')
        target_params['rds']['connection_name'] = event.get('rdsConnection')
        target_params['rds']['schema'] = event.get('rdsSchema')
        target_params['rds']['type'] = event.get('dbType')

    # Write filtered dataframe to targets
    if len(df) > 0:
        no_files_to_write = calculate_no_of_files(df, file_max_size)
        log.info(f'We will write dataframe into {no_files_to_write} entries per target')
        df_split = np.array_split(df, no_files_to_write)
        write_all(df_split, target_params)

    return {
        'processedRecords': len(df),
        'startTimeinIso': start_time.isoformat(),
        'endTimeinIso': end_time.isoformat(),
    }

# Test from local machine
if __name__ == '__main__':
    event={
        # From find-file-paths Lambda
        "filePath": "s3://aws-analytics-reference-architecture/sample-datasets/prepared-data/web-sales/time_range_start=1609459200/part-00024-a03fd533-51a0-41eb-97ab-65ed7074a2be.c000.csv",

        # From step function directly
        'frequency': '600',
        'triggerTime': '2022-04-15T13:55:00Z', 
        'offset': '40571714',
        'outputFileIndex': '1',
        'dateTimeColumnToFilter': 'sale_datetime',
        'dateTimeColumnsToAdjust': ['sale_datetime'],
        'sinkPath': 's3://gromav-test/sink-ara',
        'outputFileMaxSizeInBytes': '20480',
    }
    result = handler(event, {})

    log.info(f'result = {json.dumps(result, indent=2)}')

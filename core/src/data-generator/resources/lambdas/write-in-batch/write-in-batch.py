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


def write_all(df_list, path_prefix):
    """
    Write all dataframe in the given list to separated files.
    Each file is written to "{path_prefix}-{index_in_list}.csv"
    e.g. "s3://path/file_prefix-00000.csv"

    :param df_array: a list of dataframe to write
    :param path_prefix: path prefix for each file
    :return: None
    """
    output_paths = []
    log.info(f'# write_all()')
    for idx, df in enumerate(df_list):
        output_path = f'{path_prefix}-{idx:05d}.csv'
        output_paths.append(output_path)
        log.info(f"## Writing concatenated data to the {output_path}")
        wr.s3.to_csv(
            df=df,
            path=output_path,
            index=False,
            s3_additional_kwargs={"RequestPayer": "requester"}
        )
    return output_paths


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
    sinkPath = event.get('sinkPath')
    file_max_size = int(event.get('outputFileMaxSizeInBytes', 100 * 1048576)) # Default to 100 MB
    
    start_time, end_time = calculate_time_range(trigger_time_in_iso, offset, frequency)

    log.info('Lambda called with these event values')
    log.info(f'trigger_time_in_iso = {trigger_time_in_iso}')
    log.info(f"In ISO format:  [{start_time.isoformat()}] to [{end_time.isoformat()}]")
    log.info(f'file_path = {file_path}')
    log.info(f'offset = {offset}')
    log.info(f'dateTimeColumnToFilter = {datetime_column_to_filter}')
    log.info(f'dateTimeColumnsToAdjust = {datetime_columns_to_adjust}')
    log.info(f'sinkPath = {sinkPath}')


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

    # Find s3 path prefix
    adjusted_start_time = start_time + timedelta(seconds=offset)
    adjusted_end_time = end_time + timedelta(seconds=offset)
    path_prefix = f'{sinkPath}/ingestion_start={adjusted_start_time.isoformat()}/ingestion_end={adjusted_end_time.isoformat()}/{output_file_index:03d}'

    # Write filtered dataframe to S3
    if len(df) > 0:
        no_files_to_write = calculate_no_of_files(df, file_max_size)
        log.info(f'We will write dataframe into {no_files_to_write} files')
        df_split = np.array_split(df, no_files_to_write)
        output_paths = write_all(df_split, path_prefix)
    else:
        # Write one empty file with header even if there is no data
        log.info(f'We will write dataframe into 1 file')
        output_path = f'{path_prefix}-00000.csv'
        output_paths = [output_path]

    return {
        'processedRecords': len(df),
        'outputPaths': output_paths,
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

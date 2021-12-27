# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
import json
import logging
from dateutil import parser
from datetime import datetime, timedelta

import pandas as pd

logging.basicConfig(level=logging.INFO)
log = logging.getLogger()
log.setLevel(logging.INFO)


def calculate_time_range(trigger_time_in_iso, offset, frequency):
    trigger_time_in_datetime = parser.parse(trigger_time_in_iso)
    start_time_ts = datetime.timestamp(trigger_time_in_datetime) - offset
    end_time_ts = start_time_ts + frequency
    start_time = datetime.fromtimestamp(start_time_ts)
    end_time = datetime.fromtimestamp(end_time_ts)
    return start_time, end_time


def filter_rows_by_datetime(df, col_name, start_time, end_time):
    rows_in_range=df[col_name].between(
        pd.to_datetime(start_time).tz_localize('utc'), 
        pd.to_datetime(end_time).tz_localize('utc'), 
        inclusive='left'
    )
    return df[rows_in_range]


def handler(event, ctx):
    # Params from the last step
    file_path = event.get('filePath', [])
    
    # Params for calculating start/end time
    frequency = int(event.get('frequency'))
    trigger_time_in_iso = event.get('triggerTime') # e.g. 2021-12-15T14:10:00Z
    offset = int(event.get('offset'))

    # Params for file processing
    output_file_index = int(event.get('outputFileIndex', 0))
    datetime_column_to_filter = event.get('dateTimeColumnToFilter', None)
    datetime_columns_to_adjust = event.get('dateTimeColumnsToAdjust', [])
    sinkPath = event.get('sinkPath')
    
    start_time, end_time = calculate_time_range(trigger_time_in_iso, offset, frequency)

    log.info('Lambda called with these event values')
    log.info(f"In ISO format:  [{start_time.isoformat()}] to [{end_time.isoformat()}]")
    log.info(f'file_path = {file_path}')
    log.info(f'offset = {offset}')
    log.info(f'dateTimeColumnToFilter = {datetime_column_to_filter}')
    log.info(f'dateTimeColumnsToAdjust = {datetime_columns_to_adjust}')
    log.info(f'sinkPath = {sinkPath}')


    log.info('Concatenating all files together')
    df=pd.read_csv(file_path)

    log.info('Filtering only rows within given date/time')
    df[datetime_column_to_filter] = pd.to_datetime(df[datetime_column_to_filter])
    print(df)
    log.info(f"Concatenated dataframe (before filtering): {df.shape}")
    df = filter_rows_by_datetime(df, datetime_column_to_filter, start_time, end_time)
    print(df)
    log.info(f"Concatenated dataframe (after filtering): {df.shape}")
    

    # Adjust datetime columns with offset
    log.info('Add offset to the datetime columns')
    for col in datetime_columns_to_adjust:
        df[col] = pd.to_datetime(df[col])
        df[col] = (df[col] + pd.Timedelta(offset, 's')).dt.strftime('%Y-%m-%dT%H:%M:%SZ')

    output_path = f'{sinkPath}/from-{start_time.isoformat()}-to-{end_time.isoformat()}/{output_file_index:03d}.csv'
    log.info(f"Writing concatenated data to the {output_path}")
    df.to_csv(
        output_path,
        index=False,
    )

    return {
        'processedRecords': len(df),
        'outputPath': output_path,
        'startTimeinIso': start_time.isoformat(),
        'endTimeinIso': end_time.isoformat(),
    }

# Test from local machine
if __name__ == '__main__':
    event={
        # From find-file-paths Lambda
        "filePath": "s3://aws-analytics-reference-architecture/sample-datasets/prepared-data/web-sales/time_range_start=1609459800/part-00021-1cfa7b6d-2c3d-4e79-839d-02cfa265d9e4.c000.csv",

        # From step function directly
        'frequency': '600',
        'triggerTime': '2021-12-24T17:56:56.137Z', 
        'offset': '30909689',
        'outputFileIndex': '1',
        'dateTimeColumnToFilter': 'sale_datetime',
        'dateTimeColumnsToAdjust': ['sale_datetime'],
        'sinkPath': 's3://chadvit-test-sink-ara'
    }
    result = handler(event, {})

    log.info(f'result = {json.dumps(result, indent=2)}')

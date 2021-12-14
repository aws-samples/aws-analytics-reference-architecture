# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import logging
from dateutil import parser
from datetime import datetime

import pandas as pd
import boto3

logging.basicConfig(level=logging.INFO)
log = logging.getLogger()
log.setLevel(logging.INFO)

s3 = boto3.client('s3')

START_COL = 'start'
PATH_COL = 'path'


def log_file_paths(series):
    s = series.tolist()
    log.info('\n'.join(s))



def retrieve_df_manifest(manifest_file_bucket, manifest_file_key, start_time, end_time):
    df_manifest=pd.read_csv(f"s3://{manifest_file_bucket}/{manifest_file_key}")
    rows_in_range=df_manifest[START_COL].between(start_time, end_time, inclusive='left')
    df_manifest=df_manifest[rows_in_range]
    df_manifest=df_manifest.sort_values(by=[START_COL])
    return df_manifest


def handler(event, ctx):

    frequency = int(event.get('frequency'))
    manifest_file_bucket = event.get('manifestFileBucket')
    manifest_file_key = event.get('manifestFileKey')
    trigger_time_in_iso = event.get('triggerTime') # e.g. 2021-12-15T14:10:00Z
    trigger_time_in_datetime = parser.parse(trigger_time_in_iso)
    offset = int(event.get('offset'))
    datetime_columns_to_adjust = event.get('dateTimeColumnsToAdjust', [])
    sinkPath = event.get('sinkPath')
    

    log.info('Lambda called with these event values')
    log.info(f'frequency = {frequency}')
    log.info(f'manifest_file_bucket = {manifest_file_bucket}')
    log.info(f'manifest_file_key = {manifest_file_key}')
    log.info(f'trigger_time_in_iso = {trigger_time_in_iso}')
    log.info(f'trigger_time_in_datetime = {trigger_time_in_datetime}')
    log.info(f'offset = {offset}')
    log.info(f'dateTimeColumnsToAdjust = {datetime_columns_to_adjust}')
    log.info(f'sinkPath = {sinkPath}')

    start_time = datetime.timestamp(trigger_time_in_datetime) - offset
    end_time = start_time + frequency
    start_time_iso = datetime.fromtimestamp(start_time).isoformat()
    end_time_iso = datetime.fromtimestamp(end_time).isoformat()

    log.info(f"Looking at manifest to get paths from {start_time} to {end_time}")
    log.info(f"In ISO format:  [{start_time_iso}] to [{end_time_iso}]")
    df_manifest = retrieve_df_manifest(
        manifest_file_bucket, 
        manifest_file_key,
        start_time,
        end_time
    )

    if len(df_manifest) == 0:
        log.info("No data found, do nothing")
        return {
            'processedRecords': 0,
            'start_time_ts': start_time,
            'end_time_ts': end_time,
            'start_time_iso': start_time_iso,
            'end_time_iso': end_time_iso,
        }

    log.info("Downloading files the following paths")
    log_file_paths(df_manifest[PATH_COL])

    log.info('Concatenating all files together')    
    df_combined=pd.concat((pd.read_csv(f) for f in df_manifest[PATH_COL]))
    log.info(f"Concatenated dataframe has this shape: {df_combined.shape}")

    # Adjust sale_datetime with offset
    log.info('Add offset to the datetime columns')
    for col in datetime_columns_to_adjust:
        df_combined[col] = pd.to_datetime(df_combined[col])
        df_combined[col] = (df_combined[col] + pd.Timedelta(offset, 's')).dt.strftime('%Y-%m-%dT%H:%M:%SZ')

    output_path = f'{sinkPath}/from-{start_time}-to-{end_time}.csv'
    log.info(f"Writing concatenated data to the {output_path}")
    df_combined.to_csv(
        output_path,
        index=False,
    )

    return {
        'processedRecords': len(df_combined),
        'start_time_ts': start_time,
        'end_time_ts': end_time,
        'start_time_iso': start_time_iso,
        'end_time_iso': end_time_iso,
    }

# Test from local machine
if __name__ == '__main__':
    event={
        'frequency': '180',
        'manifestFileBucket': 'aws-analytics-reference-architecture',
        'manifestFileKey': 'sample-datasets/prepared-data/web-sales-manifest.csv',
        'triggerTime': '2021-12-16T10:06:00Z',
        'offset': '30186484',
        'dateTimeColumnsToAdjust': ['sale_datetime'],
        'sinkPath': 's3://chadvit-test-ara'
    }
    result = handler(event, {})

    log.info(f'result = {result}')

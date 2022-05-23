# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import json
import logging
from dateutil import parser
from datetime import datetime
import awswrangler as wr

logging.basicConfig(level=logging.INFO)
log = logging.getLogger()
log.setLevel(logging.INFO)

START_COL = 'start'
PATH_COL = 'path'


def log_file_paths(df):
    for _, r in df.iterrows():
        log.info(f'{r[START_COL]}, {r[PATH_COL]}')


def retrieve_df_manifest(manifest_file_bucket, manifest_file_key, start_time, end_time):
    df_manifest=wr.s3.read_csv(f"s3://{manifest_file_bucket}/{manifest_file_key}")
    rows_in_range=df_manifest[START_COL].between(start_time, end_time, inclusive='left')
    df_manifest=df_manifest[rows_in_range]
    df_manifest=df_manifest.sort_values(by=[START_COL])
    return df_manifest


def handler(event, ctx):
    '''
    Find all file paths that we must process. This is inside the given manifest file.
    '''

    # For calculating start/end
    frequency = int(event.get('frequency'))
    trigger_time_in_iso = event.get('triggerTime') # e.g. 2021-12-15T14:10:00Z
    trigger_time_in_datetime = parser.parse(trigger_time_in_iso)
    offset = int(event.get('offset'))

    # For reading manifest file
    manifest_file_bucket = event.get('manifestFileBucket')
    manifest_file_key = event.get('manifestFileKey')
    

    log.info('Lambda called with these event values')
    log.info(f'frequency = {frequency}')
    log.info(f'manifest_file_bucket = {manifest_file_bucket}')
    log.info(f'manifest_file_key = {manifest_file_key}')
    log.info(f'trigger_time_in_iso = {trigger_time_in_iso}')
    log.info(f'trigger_time_in_datetime = {trigger_time_in_datetime}')
    log.info(f'offset = {offset}')

    start_time_ts = datetime.timestamp(trigger_time_in_datetime) - offset
    end_time_ts = start_time_ts + frequency
    start_time = datetime.fromtimestamp(start_time_ts)
    end_time = datetime.fromtimestamp(end_time_ts)

    log.info(f"Looking at manifest to get paths from {start_time_ts} to {end_time_ts}")
    log.info(f"In ISO format:  [{start_time.isoformat()}] to [{end_time.isoformat()}]")
    df_manifest = retrieve_df_manifest(
        manifest_file_bucket, 
        manifest_file_key,
        start_time_ts,
        end_time_ts
    )

    log.info("Going to concatenate files from the following paths:")
    log_file_paths(df_manifest)

    return {
        'filePaths': df_manifest[PATH_COL].tolist(),
        'startTimeinIso': start_time.isoformat(),
        'endTimeinIso': end_time.isoformat(),
    }



# Test from local machine
if __name__ == '__main__':
    event={
        'frequency': '600',
        'manifestFileBucket': 'aws-analytics-reference-architecture',
        'manifestFileKey': 'sample-datasets/prepared-data/web-sales-manifest.csv',
        'triggerTime': '2021-12-24T14:50:00Z', 
        'offset': '30896421', 
    }
    result = handler(event, {})

    log.info(f'result = {json.dumps(result, indent=2)}')

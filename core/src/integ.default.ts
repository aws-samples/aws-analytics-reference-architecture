import { App, Duration, Stack } from 'aws-cdk-lib';
import { AraBucket } from '.';
import { BatchReplayer, PreparedDataset } from './data-generator';
import { CustomDataset, CustomDatasetInputFormat } from './data-generator/custom-dataset';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved


const mockApp = new App();
const stack = new Stack(mockApp, 'IntegStack');

const custom = new CustomDataset(stack, 'CustomDataset', {
  s3Location: {
    bucketName: 'aws-analytics-reference-architecture',
    objectKey: 'datasets/custom',
  },
  inputFormat: CustomDatasetInputFormat.CSV,
  datetimeColumn: 'tpep_pickup_datetime',
  datetimeColumnsToAdjust: ['tpep_pickup_datetime'],
  partitionRange: Duration.minutes(5),
  approximateDataSize: 1,
});

const bucket = AraBucket.getOrCreate(stack, { bucketName: 'test'});

new BatchReplayer(stack, 'Replayer',{
  frequency: Duration.minutes(1),
  dataset: custom.preparedDataset,
  sinkBucket: bucket,
})

new BatchReplayer(stack, 'Replayer2',{
  frequency: Duration.minutes(1),
  dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  sinkBucket: bucket,
})



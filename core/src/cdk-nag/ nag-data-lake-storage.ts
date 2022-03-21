import {App, Aspects, Stack} from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { DataLakeStorage } from '../data-lake-storage';

const mockApp = new App();

const dataLakeStorageStack = new Stack(mockApp, 'data-lake-storage');

// Instantiate DataLakeStorage Construct with custom Props
new DataLakeStorage(dataLakeStorageStack, 'DataLakeStorageTest', {
    rawInfrequentAccessDelay: 1,
    rawArchiveDelay: 2,
    cleanInfrequentAccessDelay: 1,
    cleanArchiveDelay: 2,
    transformInfrequentAccessDelay: 1,
    transformArchiveDelay: 2,
});


Aspects.of(dataLakeStorageStack).add(new AwsSolutionsChecks({ verbose: true }));

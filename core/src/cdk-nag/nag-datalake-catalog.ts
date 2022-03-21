
import {App, Aspects, Stack} from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { DataLakeCatalog } from '../data-lake-catalog';


const mockApp = new App();

const dataLakeCatalogStack = new Stack(mockApp, 'data-lake-catalog');

// Instantiate DataLakeCatalog Construct
new DataLakeCatalog(dataLakeCatalogStack, 'dataLakeCatalog');

Aspects.of(dataLakeCatalogStack).add(new AwsSolutionsChecks({ verbose: true }));

# ROSETTA tests

## Code example

This is a sample code example in the readme

```
import * as cdk from 'aws-cdk-lib';
import { DataLakeStorage } from 'aws-analytics-reference-architecture';

const exampleApp = new cdk.App();
const stack = new cdk.Stack(exampleApp, 'DataLakeStorageStack');

new DataLakeStorage(stack, 'MyDataLakeStorage', {
  rawInfrequentAccessDelay: 90,
  rawArchiveDelay: 180,
  cleanInfrequentAccessDelay: 180,
  cleanArchiveDelay: 360,
  transformInfrequentAccessDelay: 180,
  transformArchiveDelay: 360,
});
```
import { Stack } from '@aws-cdk/core';
import { DataLakeStorage } from '../src/data-lake-storage';
import '@aws-cdk/assert/jest';

test('dataLakeStorage', () => {

  const dataLakeStorageStack = new Stack();

  // Instantiate Example Construct with customer Props
  new DataLakeStorage(dataLakeStorageStack, 'DataLakeStorageTest');

  // Test if the stack has 3 S3 Buckets
  expect(dataLakeStorageStack).toCountResources('AWS::S3::Bucket', 3);
});
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests data lake catalog
 *
 * @group unit/datalake/catalog
 */

import { Stack } from '@aws-cdk/core';
import { DataLakeCatalog } from '../../src/data-lake-catalog';
import '@aws-cdk/assert/jest';

test('DataLakeCatalog', () => {
  const dataLakeCatalogStack = new Stack();

  // Instantiate DataLakeCatalog Construct
  new DataLakeCatalog(dataLakeCatalogStack, 'dataLakeCatalog');

  // Test if the Stack contains 3 AWS Glue Database
  expect(dataLakeCatalogStack).toCountResources('AWS::Glue::Database', 3);

  // Test if the Databases names are expected
  expect(dataLakeCatalogStack).toHaveResource('AWS::Glue::Database', {
    DatabaseInput: {
      Name: 'raw',
    },
  });

  // Test if the Databases names are expected
  expect(dataLakeCatalogStack).toHaveResource('AWS::Glue::Database', {
    DatabaseInput: {
      Name: 'clean',
    },
  });

  // Test if the Databases names are expected
  expect(dataLakeCatalogStack).toHaveResource('AWS::Glue::Database', {
    DatabaseInput: {
      Name: 'transform',
    },
  });
});
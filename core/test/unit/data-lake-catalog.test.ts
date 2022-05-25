// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests data lake catalog
 *
 * @group unit/datalake/catalog
 */

import { Stack } from 'aws-cdk-lib';
import { DataLakeCatalog } from '../../src/data-lake-catalog';
import { Template } from 'aws-cdk-lib/assertions';

test('DataLakeCatalog', () => {
  const dataLakeCatalogStack = new Stack();

  // Instantiate DataLakeCatalog Construct
  new DataLakeCatalog(dataLakeCatalogStack, 'dataLakeCatalog');

  const template = Template.fromStack(dataLakeCatalogStack);
  // Test if the Stack contains 3 AWS Glue Database
  template.resourceCountIs('AWS::Glue::Database', 3);

  // Test if the Databases names are expected
  template.hasResourceProperties('AWS::Glue::Database', {
    DatabaseInput: {
      Name: 'raw',
    },
  });

  // Test if the Databases names are expected
  template.hasResourceProperties('AWS::Glue::Database', {
    DatabaseInput: {
      Name: 'clean',
    },
  });

  // Test if the Databases names are expected
  template.hasResourceProperties('AWS::Glue::Database', {
    DatabaseInput: {
      Name: 'transform',
    },
  });
});
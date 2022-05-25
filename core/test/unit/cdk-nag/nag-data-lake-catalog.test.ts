// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataLakeCatalog
 *
 * @group unit/best-practice/data-lake-catalog
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, Aspects, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { DataLakeCatalog } from '../../../src/data-lake-catalog';


const mockApp = new App();

const dataLakeCatalogStack = new Stack(mockApp, 'data-lake-catalog');

// Instantiate DataLakeCatalog Construct
new DataLakeCatalog(dataLakeCatalogStack, 'dataLakeCatalog');

Aspects.of(dataLakeCatalogStack).add(new AwsSolutionsChecks({ verbose: true }));

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataLakeCatalogStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataLakeCatalogStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

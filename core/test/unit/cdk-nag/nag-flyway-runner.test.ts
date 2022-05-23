// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests FlywayRunner
 *
 * @group unit/best-practice/flyway-runner
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { App, /*Aspects,*/ Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
//import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { FlywayRunner } from '../../../src/db-schema-manager/flyway-runner';
import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as redshift from '@aws-cdk/aws-redshift-alpha';

const mockApp = new App();

const FlywayRunnerStack = new Stack(mockApp, 'FlywayRunnerStack');

const vpc = new ec2.Vpc(FlywayRunnerStack, 'Vpc');

const dbName = 'testdb';
const cluster = new redshift.Cluster(FlywayRunnerStack, 'Redshift', {
  masterUser: {
    masterUsername: 'admin',
  },
  vpc,
  defaultDatabaseName: dbName,
});

new FlywayRunner(FlywayRunnerStack, 'testMigration', {
  migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),
  cluster: cluster,
  vpc: vpc,
  databaseName: dbName,
  replaceDictionary: { TABLE_NAME: 'second_table' },
});

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(FlywayRunnerStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(FlywayRunnerStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});
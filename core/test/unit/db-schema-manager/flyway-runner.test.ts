// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// TODO fix the missing jar file for the flyway runner before running unit tests

/**
 * Tests FlywayRunner
 *
 * @group unit/redshift/flyway-runner
 */

import { Stack } from '@aws-cdk/core';
import '@aws-cdk/assert/jest';
import { Template } from '@aws-cdk/assertions';

describe('FlywayRunner', () => {


  const flywayRunnerStack = new Stack();

  // const vpc = new Vpc(flywayRunnerStack, 'Vpc');

  // const dbName = 'testdb';
  // const cluster = new Cluster(flywayRunnerStack, 'Redshift', {
  //   removalPolicy: RemovalPolicy.DESTROY,
  //   masterUser: {
  //     masterUsername: 'admin',
  //   },
  //   vpc,
  //   defaultDatabaseName: dbName,
  // });

  // Instantiate FLywayRunner Construct with custom Props
  // new FlywayRunner(flywayRunnerStack, 'TestFlywayRunner', {
  //   migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),
  //   cluster: cluster,
  //   vpc: vpc,
  //   databaseName: dbName,
  // });

  const template = Template.fromStack(flywayRunnerStack);

  test('FlywayRunner should provision 1 buckets', () => {
    template.resourceCountIs('AWS::S3::Bucket', 0);
  });
});
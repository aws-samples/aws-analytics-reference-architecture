// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests FlywayRunner
 *
 * @group integ/redshift/flyway-runner
 */

import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as redshift from '@aws-cdk/aws-redshift-alpha';
import * as cdk from 'aws-cdk-lib';
import { TestStack } from './TestStack';

import { FlywayRunner } from '../../src/db-schema-manager';

// GIVEN
const testStack = new TestStack('FlywayRunnerE2eTest');
const { stack } = testStack;

const vpc = new ec2.Vpc(stack, 'Vpc');

const dbName = 'testdb';
const cluster = new redshift.Cluster(stack, 'Redshift', {
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  masterUser: {
    masterUsername: 'admin',
  },
  vpc,
  defaultDatabaseName: dbName,
});

const tokenizedValue = new cdk.CfnOutput(stack, 'tokenizedValue', {
  value: 'second_table',
});

const runner = new FlywayRunner(stack, 'testMigration', {
  migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),
  cluster: cluster,
  vpc: vpc,
  databaseName: dbName,
  replaceDictionary: { TABLE_NAME: tokenizedValue.value },
});

new cdk.CfnOutput(stack, 'schemaVersion', {
  value: runner.runner.getAtt('version').toString(),
  exportName: 'schemaVersion',
});

describe('deploy succeed', () => {
  it('can be deploy succcessfully', async () => {
    // WHEN
    const deployResult = await testStack.deploy();

    // THEN
    expect(deployResult.schemaVersion).toEqual('3');
  }, 9000000);
});

afterAll(async () => {
  await testStack.destroy();
}, 9000000);

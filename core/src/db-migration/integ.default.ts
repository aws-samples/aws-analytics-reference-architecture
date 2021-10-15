// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as redshift from '@aws-cdk/aws-redshift';
import { App, Stack } from '@aws-cdk/core';

import { DBMigration } from './';

const mockApp = new App();
const stack = new Stack(mockApp, 'testDbMigration');

const vpc = new ec2.Vpc(stack, 'Vpc');

const dbName = 'testdb';
const cluster = new redshift.Cluster(stack, 'Redshift', {
  masterUser: {
    masterUsername: 'admin',
  },
  vpc,
  defaultDatabaseName: dbName,
});

new DBMigration(stack, 'testMigration', {
  migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),
  cluster: cluster,
  vpc: vpc,
  databaseName: dbName,
});
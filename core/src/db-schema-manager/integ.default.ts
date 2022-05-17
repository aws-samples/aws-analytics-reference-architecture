// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as redshift from '@aws-cdk/aws-redshift-alpha';
import * as cdk from 'aws-cdk-lib';

import { FlywayRunner } from '.';

const integTestApp = new cdk.App();
const stack = new cdk.Stack(integTestApp, 'fywayRunnerTest');

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

new FlywayRunner(stack, 'testMigration', {
  migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),
  cluster: cluster,
  vpc: vpc,
  databaseName: dbName,
});
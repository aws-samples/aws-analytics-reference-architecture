import * as path from 'path';
import * as assertions from '@aws-cdk/assertions';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as redshift from '@aws-cdk/aws-redshift';
import * as cdk from '@aws-cdk/core';
import * as ara from '../src';


test('default log retention is 1 day for all (2) lambdas created', () => {
  const unitTestApp = new cdk.App();
  const stack = new cdk.Stack(unitTestApp, 'noRet');

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

  // GIVEN
  const expectedLogRetention = 1;

  const props = {
    migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),
    cluster: cluster,
    vpc: vpc,
    databaseName: dbName,
  };

  // WHEN
  new ara.FlywayRunner(stack, 'noRetention', props);

  const template = assertions.Template.fromStack(stack);
  const logRetentionCustomResources = template.findResources('Custom::LogRetention');

  // THEN
  expect(Object.keys(logRetentionCustomResources).length).toBe(2);
  for (const logRetentionCustomResource of Object.values(logRetentionCustomResources)) {
    expect(logRetentionCustomResource.Properties.RetentionInDays).toBe(expectedLogRetention);
  }
});

test('given log retention value is applied to lambdas created', () => {
  const unitTestApp = new cdk.App();
  const stack = new cdk.Stack(unitTestApp, 'ret2days');

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


  // GIVEN
  const expectedLogRetention = 2;
  const props: ara.FlywayRunnerProps = {
    migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),
    cluster: cluster,
    vpc: vpc,
    databaseName: dbName,
    logRetention: expectedLogRetention,
  };

  // WHEN
  new ara.FlywayRunner(stack, 'TwoDaysRetention', props);

  const template = assertions.Template.fromStack(stack);
  const logRetentionCustomResources = template.findResources('Custom::LogRetention');

  // THEN
  expect(Object.keys(logRetentionCustomResources).length).toBe(2);
  for (const logRetentionCustomResource of Object.values(logRetentionCustomResources)) {
    expect(logRetentionCustomResource.Properties.RetentionInDays).toBe(expectedLogRetention);
  }
});

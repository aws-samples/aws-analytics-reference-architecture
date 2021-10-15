// import { spawnSync, SpawnSyncOptions } from 'child_process';
import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as redshift from '@aws-cdk/aws-redshift';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';

export interface DBMigrationProps {
  migrationScriptsFolderAbsolutePath: string;
  cluster: redshift.Cluster;
  vpc: ec2.Vpc;
  databaseName: string;
}

export class DBMigration extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: DBMigrationProps) {
    super(scope, id);

    const migrationFilesBucket = new s3.Bucket(this, 'MigrationFilesBucket');

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(props.migrationScriptsFolderAbsolutePath)],
      destinationBucket: migrationFilesBucket,
    });

    const entry = path.join(__dirname, './resources/flyway-lambda/');
    // Create an AWS Lambda to host flyway
    const flywayLambda = new lambda.Function(this, 'flyway', {
      code: lambda.Code.fromAsset(entry, {
        bundling: {
          image: lambda.Runtime.JAVA_8.bundlingImage,
          command: [
            '/bin/sh',
            '-c',
            './gradlew shadowJar -x test' + '&& cp build/libs/flyway-all.jar /asset-output/',
          ],
        },
      }),
      handler: 'com.geekoosh.flyway.FlywayHandler::handleRequest',
      runtime: lambda.Runtime.JAVA_8,
      logRetention: logs.RetentionDays.ONE_DAY,
      memorySize: 512,
      timeout: cdk.Duration.seconds(900),
      vpc: props.vpc,
      securityGroups: props.cluster.connections.securityGroups,
      environment: {
        S3_BUCKET: migrationFilesBucket.bucketName,
        DB_CONNECTION_STRING: `jdbc:redshift://${props.cluster.clusterEndpoint.socketAddress}/${props.databaseName}`,
        DB_SECRET: props.cluster.secret!.secretFullArn!,
      },
    });

    props.cluster.secret?.grantRead(flywayLambda);
    migrationFilesBucket.grantRead(flywayLambda);

    // TODO: add an awsCustomResource to trigger the lambda with the right parameters : payload '{ "flywayRequest": {"flywayMethod": "migrate" }}'
    // TODO: check that update in migrationScripts hash retrigger the lambda
  }
}

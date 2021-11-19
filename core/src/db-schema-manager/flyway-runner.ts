import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as redshift from '@aws-cdk/aws-redshift';
import * as s3 from '@aws-cdk/aws-s3';
import { Asset } from '@aws-cdk/aws-s3-assets';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import { CustomResource } from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';
import { PreBundledFunction } from '../common/pre-bundled-function';
/**
 * Properties needed to run flyway migration scripts.
 */
export interface FlywayRunnerProps {
  /**
   * The absolute path to the flyway migration scripts.
   * Those scripts needs to follow expected flyway naming convention.
   * @see https://flywaydb.org/documentation/concepts/migrations.html#sql-based-migrations for more details.
   */
  readonly migrationScriptsFolderAbsolutePath: string;

  /**
   * The cluster to run migration scripts against.
   */
  readonly cluster: redshift.Cluster;

  /**
   * The vpc hosting the cluster.
   */
  readonly vpc: ec2.Vpc;

  /**
   * The database name to run migration scripts against.
   */
  readonly databaseName: string;

  /**
   * Period to keep the logs around.
   * @default logs.RetentionDays.ONE_DAY (1 day)
   */
  readonly logRetention?: logs.RetentionDays;
}

/**
 * A CDK construct that runs flyway migration scripts against a redshift cluster.
 *
 * This construct is based on two main resource, an AWS Lambda hosting a flyway runner
 * and one custom resource invoking it when content of migrationScriptsFolderAbsolutePath changes.
 *
 * Usage example:
 *
 * *This example assume that migration SQL files are located in `resources/sql` of the cdk project.*
 * ```typescript
 * import * as path from 'path';
 * import * as ec2 from '@aws-cdk/aws-ec2';
 * import * as redshift from '@aws-cdk/aws-redshift';
 * import * as cdk from '@aws-cdk/core';
 *
 * import { FlywayRunner } from 'aws-analytics-reference-architecture';
 *
 * const integTestApp = new cdk.App();
 * const stack = new cdk.Stack(integTestApp, 'fywayRunnerTest');
 *
 * const vpc = new ec2.Vpc(stack, 'Vpc');

 * const dbName = 'testdb';
 * const cluster = new redshift.Cluster(stack, 'Redshift', {
 *   removalPolicy: cdk.RemovalPolicy.DESTROY,
 *   masterUser: {
 *     masterUsername: 'admin',
 *   },
 *   vpc,
 *   defaultDatabaseName: dbName,
 * });

 * new FlywayRunner(stack, 'testMigration', {
 *   migrationScriptsFolderAbsolutePath: path.join(__dirname, './resources/sql'),
 *   cluster: cluster,
 *   vpc: vpc,
 *   databaseName: dbName,
 * });
 * ```
 */
export class FlywayRunner extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: FlywayRunnerProps) {
    super(scope, id);

    const sqlFilesAsset = s3deploy.Source.asset(props.migrationScriptsFolderAbsolutePath);

    const migrationFilesBucket = new s3.Bucket(this, 'MigrationFilesBucket');
    const migrationFilesDeployment = new s3deploy.BucketDeployment(this, 'DeploySQLMigrationFiles', {
      sources: [sqlFilesAsset],
      destinationBucket: migrationFilesBucket,
    });

    const flywayLambda = new PreBundledFunction(this, 'runner', {
      codePath: path.join(__dirname.split('/').slice(-1)[0], './resources/flyway-lambda/flyway-all.jar'),
      handler: 'com.geekoosh.flyway.FlywayCustomResourceHandler::handleRequest',
      runtime: lambda.Runtime.JAVA_11,
      logRetention: props.logRetention ?? logs.RetentionDays.ONE_DAY,
      memorySize: 2048,
      timeout: cdk.Duration.seconds(900),
      vpc: props.vpc,
      securityGroups: props.cluster.connections.securityGroups,
      environment: {
        S3_BUCKET: migrationFilesBucket.bucketName,
        DB_CONNECTION_STRING: `jdbc:redshift://${props.cluster.clusterEndpoint.socketAddress}/${props.databaseName}`,
        DB_SECRET: props.cluster.secret!.secretFullArn!,
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [
            '*',
          ],
          actions: [
            'cloudformation:DescribeStacks',
            'cloudformation:DescribeStackResource',
          ],
        }),
      ],
    });


    // Allowing connection to the cluster
    props.cluster.connections.allowDefaultPortInternally();

    props.cluster.secret?.grantRead(flywayLambda);
    migrationFilesBucket.grantRead(flywayLambda);

    const flywayCustomResourceProvider = new cr.Provider(this, 'FlywayCustomResourceProvider', {
      onEventHandler: flywayLambda,
      logRetention: props.logRetention ?? logs.RetentionDays.ONE_DAY,
      securityGroups: props.cluster.connections.securityGroups,
      vpc: props.vpc,
    });

    new CustomResource(this, 'trigger', {
      serviceToken: flywayCustomResourceProvider.serviceToken,
      properties: {
        flywayRequest: {
          flywayMethod: 'migrate',
        },
        assetHash: (migrationFilesDeployment.node.findChild('Asset1') as Asset).assetHash,
      },
    });

    flywayCustomResourceProvider.node.addDependency(migrationFilesDeployment);
  }
}

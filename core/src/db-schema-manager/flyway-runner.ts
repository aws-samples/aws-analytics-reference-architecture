import { spawnSync, SpawnSyncOptions } from 'child_process';
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
import * as cr from '@aws-cdk/custom-resources';

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

    const entry = path.join(__dirname, './resources/flyway-lambda');

    // TODO: convert to preBundled lambda
    const flywayLambda = new lambda.Function(this, 'runner', {
      code: lambda.Code.fromAsset(entry, {
        exclude: ['build/**'],
        bundling: {
          image: lambda.Runtime.JAVA_8.bundlingImage,
          command: ['/bin/sh', '-c', './gradlew shadowJar -x test' + '&& cp build/libs/flyway-all.jar /asset-output/'],
          local: {
            tryBundle(outputDir: string) {
              try {
                exec(`./gradlew shadowJar -x test && cp build/libs/flyway-all.jar ${outputDir}`, {
                  stdio: [
                    // show output
                    'inherit', //ignore stdio
                    process.stderr, // redirect stdout to stderr
                    'inherit', // inherit stderr
                  ],
                  cwd: entry,
                });
              } catch (error) {
                return false;
              }

              return true;
            },
          },
        },
      }),
      handler: 'com.geekoosh.flyway.FlywayHandler::handleRequest',
      runtime: lambda.Runtime.JAVA_8,
      logRetention: props.logRetention ?? logs.RetentionDays.ONE_DAY,
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

    // Allowing connection to the cluster
    props.cluster.connections.allowDefaultPortInternally();

    props.cluster.secret?.grantRead(flywayLambda);
    migrationFilesBucket.grantRead(flywayLambda);

    new cr.AwsCustomResource(this, 'trigger', {
      logRetention: props.logRetention ?? logs.RetentionDays.ONE_DAY,
      onUpdate: {
        service: 'Lambda',
        action: 'invoke',
        physicalResourceId: cr.PhysicalResourceId.of('flywayTrigger'),
        parameters: {
          FunctionName: flywayLambda.functionName,
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify({
            flywayRequest: {
              flywayMethod: 'migrate',
            },
            assetHash: (migrationFilesDeployment.node.findChild('Asset1') as Asset).assetHash,
          }),
        },
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({ actions: ['lambda:InvokeFunction'], resources: [flywayLambda.functionArn] }),
      ]),
    });
  }
}

function exec(command: string, options?: SpawnSyncOptions) {
  const proc = spawnSync('bash', ['-c', command], options);

  if (proc.error) {
    throw proc.error;
  }

  if (proc.status != 0) {
    if (proc.stdout || proc.stderr) {
      throw new Error(
        `[Status ${proc.status}] stdout: ${proc.stdout?.toString().trim()}\n\n\nstderr: ${proc.stderr
          ?.toString()
          .trim()}`,
      );
    }
    throw new Error(`exited with status ${proc.status}`);
  }

  return proc;
}

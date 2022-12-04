import {
  App,
  aws_dynamodb,
  aws_ec2,
  aws_iam,
  aws_rds,
  Duration,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib';
import { AraBucket } from '.';
import { BatchReplayer, CustomDataset, CustomDatasetInputFormat, PreparedDataset } from './data-generator';
import { Cluster, ClusterType } from '@aws-cdk/aws-redshift-alpha';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { PreBundledFunction } from './common/pre-bundled-function';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';


const mockApp = new App();
const stack = new Stack(mockApp, 'IntegStack');

const custom = new CustomDataset(stack, 'CustomDataset', {
  s3Location: {
    bucketName: 'aws-analytics-reference-architecture',
    objectKey: 'datasets/custom',
  },
  inputFormat: CustomDatasetInputFormat.CSV,
  datetimeColumn: 'tpep_pickup_datetime',
  datetimeColumnsToAdjust: ['tpep_pickup_datetime'],
  partitionRange: Duration.minutes(5),
  approximateDataSize: 1,
});

/**
 * VPC for database targets
 * VPC contains an S3 gateway endpoint so WriteInBatch Lambda can still access it.
 */
const vpc = new aws_ec2.Vpc(stack, 'BatchReplayerVpc', {
  maxAzs: 2,
  subnetConfiguration: [
    {
      cidrMask: 24,
      name: 'private',
      subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
    },
    {
      cidrMask: 24,
      name: 'public',
      subnetType: aws_ec2.SubnetType.PUBLIC,
    },
  ],
  gatewayEndpoints: {
    S3: {
      service: aws_ec2.GatewayVpcEndpointAwsService.S3,
    },
  },
});
vpc.applyRemovalPolicy(RemovalPolicy.DESTROY);

/**
 * S3 bucket
 */
const bucket = AraBucket.getOrCreate(stack, { bucketName: 'test' });

/**
 * DynamoDB custom dataset
 */
const ddbTableCustomDataset = new aws_dynamodb.Table(stack, 'DynamoDBReplayer', {
  partitionKey: { name: 'tpep_pickup_datetime', type: aws_dynamodb.AttributeType.STRING },
  sortKey: { name: 'tpep_dropoff_datetime', type: aws_dynamodb.AttributeType.STRING },
  removalPolicy: RemovalPolicy.DESTROY,
});

/**
 * DynamoDB prepared dataset
 */
const ddbTablePreparedDataset = new aws_dynamodb.Table(stack, 'DynamoDBReplayer2', {
  partitionKey: { name: 'item_id', type: aws_dynamodb.AttributeType.STRING },
  sortKey: { name: 'order_id', type: aws_dynamodb.AttributeType.STRING },
  removalPolicy: RemovalPolicy.DESTROY,
});

// Security group to allow database target connections
const dbSecurityGroup = new aws_ec2.SecurityGroup(stack, 'DbSecurityGroup', {
  vpc,
});
dbSecurityGroup.connections.allowFrom(dbSecurityGroup, aws_ec2.Port.tcp(5439), 'Redshift');
dbSecurityGroup.connections.allowFrom(dbSecurityGroup, aws_ec2.Port.tcp(3306), 'MySQL');
dbSecurityGroup.connections.allowFrom(dbSecurityGroup, aws_ec2.Port.tcp(5432), 'Postgres');

// Database name for database targets
const dbName = 'batch_replayer_database';

/**
 * Redshift
 */
const redshiftCluster = new Cluster(stack, 'Redshift', {
  masterUser: {
    masterUsername: 'admin',
  },
  vpc,
  vpcSubnets: vpc.selectSubnets({
    subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
  }),
  securityGroups: [dbSecurityGroup],
  clusterType: ClusterType.SINGLE_NODE,
  defaultDatabaseName: dbName,
  removalPolicy: RemovalPolicy.DESTROY,
});
const redshiftSecret = redshiftCluster.secret ? redshiftCluster.secret.secretArn : '';

/**
 * Aurora MySQL
 */
const credsAuroraMySQL = new aws_rds.DatabaseSecret(stack, 'credsAuroraMySQL', {
  secretName: '/batchReplayer/rds/creds/auroraMySQL',
  username: 'admin',
});
const auroraMySQLSecret = credsAuroraMySQL.secretArn;
const auroraMySQL = new aws_rds.DatabaseCluster(stack, 'AuroraMySQL', {
  engine: aws_rds.DatabaseClusterEngine.auroraMysql({ version: aws_rds.AuroraMysqlEngineVersion.VER_2_08_1 }),
  instanceProps: {
    vpc,
    vpcSubnets: vpc.selectSubnets({
      subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
    }),
    securityGroups: [dbSecurityGroup],
    instanceType: aws_ec2.InstanceType.of(
      aws_ec2.InstanceClass.BURSTABLE3,
      aws_ec2.InstanceSize.SMALL,
    ),
  },
  credentials: aws_rds.Credentials.fromSecret(credsAuroraMySQL),
  defaultDatabaseName: dbName,
  removalPolicy: RemovalPolicy.DESTROY,
});

/**
 * Aurora Postgres
 */
const credsAuroraPostgres = new aws_rds.DatabaseSecret(stack, 'credsAuroraPostgres', {
  secretName: '/batchReplayer/rds/creds/auroraPostgres',
  username: 'postgres',
});
const auroraPostgres = new aws_rds.DatabaseCluster(stack, 'AuroraPostgres', {
  engine: aws_rds.DatabaseClusterEngine.auroraPostgres({ version: aws_rds.AuroraPostgresEngineVersion.VER_13_5 }),
  instanceProps: {
    vpc,
    vpcSubnets: vpc.selectSubnets({
      subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
    }),
    securityGroups: [dbSecurityGroup],
    instanceType: aws_ec2.InstanceType.of(
      aws_ec2.InstanceClass.BURSTABLE3,
      aws_ec2.InstanceSize.MEDIUM,
    ),
  },
  credentials: aws_rds.Credentials.fromSecret(credsAuroraPostgres),
  defaultDatabaseName: dbName,
  removalPolicy: RemovalPolicy.DESTROY,
});
const auroraPostgresSecret = credsAuroraPostgres.secretArn;

/**
 * RDS MySQL
 */
const credsMySQL = new aws_rds.DatabaseSecret(stack, 'credsMySQL', {
  secretName: '/batchReplayer/rds/creds/rdsMySQL',
  username: 'admin',
});
const rdsMySQLSecret = credsMySQL.secretArn;
const rdsMySQL = new aws_rds.DatabaseInstance(stack, 'rdsMySQL', {
  engine: aws_rds.DatabaseInstanceEngine.mysql({ version: aws_rds.MysqlEngineVersion.VER_8_0 }),
  instanceType: aws_ec2.InstanceType.of(
    aws_ec2.InstanceClass.BURSTABLE3,
    aws_ec2.InstanceSize.MICRO,
  ),
  vpc: vpc,
  vpcSubnets: vpc.selectSubnets({
    subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
  }),
  credentials: aws_rds.Credentials.fromSecret(credsMySQL),
  securityGroups: [dbSecurityGroup],
  databaseName: dbName,
  removalPolicy: RemovalPolicy.DESTROY,
});

/**
 * RDS Postgres
 */
const credsPostgres = new aws_rds.DatabaseSecret(stack, 'credsPostgres', {
  secretName: '/batchReplayer/rds/creds/rdsPostgres',
  username: 'postgres',
});
const rdsPostgresSecret = credsPostgres.secretArn;
const rdsPostgres = new aws_rds.DatabaseInstance(stack, 'rdsPostgres', {
  engine: aws_rds.DatabaseInstanceEngine.postgres({ version: aws_rds.PostgresEngineVersion.VER_14 }),
  instanceType: aws_ec2.InstanceType.of(
    aws_ec2.InstanceClass.BURSTABLE3,
    aws_ec2.InstanceSize.MICRO,
  ),
  vpc: vpc,
  vpcSubnets: vpc.selectSubnets({
    subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
  }),
  credentials: aws_rds.Credentials.fromSecret(credsPostgres),
  securityGroups: [dbSecurityGroup],
  databaseName: dbName,
  removalPolicy: RemovalPolicy.DESTROY,
});

// Permissions required to run DatabaseTargetsSetup Lambda
let dbTargetsSetupPolicies = [];
dbTargetsSetupPolicies.push(new PolicyStatement({
  actions: [
    'secretsmanager:GetSecretValue',
  ],
  resources: [
    redshiftSecret,
    auroraPostgresSecret,
    rdsPostgresSecret,
  ],
}));
dbTargetsSetupPolicies.push(new PolicyStatement({
  actions: [
    'ec2:CreateNetworkInterface',
    'ec2:DescribeNetworkInterfaces',
    'ec2:DeleteNetworkInterface',
  ],
  resources: [
    '*',
  ],
}));

// Schema name is the same as database name for MySQL, but defined separate for Postgres and Redshift databases.
const schemaName = 'batch_replayer_schema';

// Lambda to create database schemas for Postgres based db instances.
// Schemas need to exist before any data can be inserted by the BatchReplayer
const databaseConfig = new PreBundledFunction(stack, 'DatabaseTargetsSetup', {
  memorySize: 3008,
  codePath: 'data-generator/resources/lambdas/db-targets-setup',
  runtime: Runtime.PYTHON_3_9,
  handler: 'db-targets-setup.handler',
  logRetention: RetentionDays.ONE_WEEK,
  timeout: Duration.minutes(15),
  vpc: vpc,
  securityGroups: [dbSecurityGroup],
  lambdaPolicyStatements: dbTargetsSetupPolicies
});
databaseConfig.node.addDependency(redshiftCluster);
databaseConfig.node.addDependency(auroraMySQL);
databaseConfig.node.addDependency(auroraPostgres);
databaseConfig.node.addDependency(rdsMySQL);
databaseConfig.node.addDependency(rdsPostgres);

const DatabaseTargetsSetupTrigger = new AwsCustomResource(stack, 'DatabaseTargetsSetupTrigger', {
  policy: AwsCustomResourcePolicy.fromStatements([new PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    effect: aws_iam.Effect.ALLOW,
    resources: [databaseConfig.functionArn],
  })]),
  onCreate: {
    service: 'Lambda',
    action: 'invoke',
    parameters: {
      FunctionName: databaseConfig.functionName,
      Payload: JSON.stringify({
        targets: {
          redshift: {
            'secret_arn': redshiftSecret,
            'schema_name': schemaName,
          },
          aurora_postgres: {
            'secret_arn': auroraPostgresSecret,
            'schema_name': schemaName,
          },
          rds_postgres: {
            'secret_arn': rdsPostgresSecret,
            'schema_name': schemaName,
          },
        }
      }),
    },
    physicalResourceId: PhysicalResourceId.of('DatabaseTargetsSetupTrigger'),
  },
});

// Table for Replayer BatchReplayer with custom dataset
const tableNameCustomDataset = 'batch_replayer_table';
// Table for Replayer2 BatchReplayer with prepared dataset
const tableNamePreparedDataset = 'batch_replayer_table2';

const BatchReplayerCustomDataset = new BatchReplayer(stack, 'Replayer', {
  frequency: Duration.minutes(1),
  dataset: custom.preparedDataset,
  sinkBucket: bucket,
  ddbTable: ddbTableCustomDataset,
  redshiftTableName: tableNameCustomDataset,
  redshiftConnection: redshiftSecret,
  redshiftSchema: schemaName,
  auroraMysqlTableName: tableNameCustomDataset,
  auroraMysqlConnection: auroraMySQLSecret,
  auroraMysqlSchema: dbName,
  auroraPostgresTableName: tableNameCustomDataset,
  auroraPostgresConnection: auroraPostgresSecret,
  auroraPostgresSchema: schemaName,
  mysqlTableName: tableNameCustomDataset,
  mysqlConnection: rdsMySQLSecret,
  mysqlSchema: dbName,
  postgresTableName: tableNameCustomDataset,
  postgresConnection: rdsPostgresSecret,
  postgresSchema: schemaName,
  databaseVpc: vpc,
  databaseVpcSG: dbSecurityGroup,
});
BatchReplayerCustomDataset.node.addDependency(DatabaseTargetsSetupTrigger);

const BatchReplayerPreparedDataset = new BatchReplayer(stack, 'Replayer2', {
  frequency: Duration.minutes(1),
  dataset: PreparedDataset.RETAIL_1_GB_WEB_SALE,
  sinkBucket: bucket,
  ddbTable: ddbTablePreparedDataset,
  redshiftTableName: tableNamePreparedDataset,
  redshiftConnection: redshiftSecret,
  redshiftSchema: schemaName,
  auroraMysqlTableName: tableNamePreparedDataset,
  auroraMysqlConnection: auroraMySQLSecret,
  auroraMysqlSchema: dbName,
  auroraPostgresTableName: tableNamePreparedDataset,
  auroraPostgresConnection: auroraPostgresSecret,
  auroraPostgresSchema: schemaName,
  mysqlTableName: tableNamePreparedDataset,
  mysqlConnection: rdsMySQLSecret,
  mysqlSchema: dbName,
  postgresTableName: tableNamePreparedDataset,
  postgresConnection: rdsPostgresSecret,
  postgresSchema: schemaName,
  databaseVpc: vpc,
  databaseVpcSG: dbSecurityGroup,
});
BatchReplayerPreparedDataset.node.addDependency(DatabaseTargetsSetupTrigger);

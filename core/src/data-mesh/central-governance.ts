// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// import { Aws, RemovalPolicy, BOOTSTRAP_QUALIFIER_CONTEXT, DefaultStackSynthesizer } from 'aws-cdk-lib';;
import { Aws, DefaultStackSynthesizer, RemovalPolicy, Fn } from 'aws-cdk-lib';;
import { Construct } from 'constructs';
import { IRole, Policy, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { CallAwsService, EventBridgePutEvents } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { StateMachine, JsonPath, TaskInput, Map, LogLevel } from "aws-cdk-lib/aws-stepfunctions";
import { CfnEventBusPolicy, EventBus, IEventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lakeformation from 'aws-cdk-lib/aws-lakeformation';

import { DataMeshWorkflowRole } from './data-mesh-workflow-role';
import { LakeFormationS3Location } from '../lake-formation';
import { LakeFormationAdmin } from '../lake-formation';
import { Database } from '@aws-cdk/aws-glue-alpha';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { DataDomain } from './data-domain';

/**
 * This CDK Construct creates a Data Product registration workflow and resources for the Central Governance account.
 * It uses AWS Step Functions state machine to orchestrate the workflow:
 * * creates tables in AWS Glue Data Catalog
 * * shares tables to Data Product owner account (Producer)
 * 
 * This construct also creates an Amazon EventBridge Event Bus to enable communication with Data Domain accounts (Producer/Consumer).
 * 
 * This construct requires to use the default [CDK qualifier](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) generated with the standard CDK bootstrap stack.
 * It ensures the right CDK execution role is used and granted Lake Formation administrator permissions so CDK can create Glue databases when registring a DataDomain.
 * 
 * To register a DataDomain, the following information are required:
 * * The account Id of the DataDomain
 * * The secret ARN for the domain configuration available as a CloudFormation output when creating a {@link DataDomain}
 * 
 * Usage example:
 * ```typescript
 * import { App, Stack } from 'aws-cdk-lib';
 * import { Role } from 'aws-cdk-lib/aws-iam';
 * import { CentralGovernance } from 'aws-analytics-reference-architecture';
 * 
 * const exampleApp = new App();
 * const stack = new Stack(exampleApp, 'DataProductStack');
 * 
 * const governance = new CentralGovernance(stack, 'myCentralGov');
 * 
 * governance.registerDataDomain('Domain1', <DOMAIN_ACCOUNT_ID>, <DOMAIN_CONFIG_SECRET_ARN>);
 * ```
 */
export class CentralGovernance extends Construct {

  public static readonly DOMAIN_DATABASE_PREFIX: string = 'data-domain-';
  public readonly workflowRole: IRole;
  public readonly eventBus: IEventBus;

  /**
   * Construct a new instance of CentralGovernance.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @access public
   */

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Constructs the CDK execution role ARN
    const cdkExecutionRoleArn = Fn.sub(
      DefaultStackSynthesizer.DEFAULT_CLOUDFORMATION_ROLE_ARN,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Qualifier: DefaultStackSynthesizer.DEFAULT_QUALIFIER,
      },
    );
    // Makes the CDK execution role LF admin so it can create databases
    const cdkRole = Role.fromRoleArn(this, 'cdkRole', cdkExecutionRoleArn);
    new LakeFormationAdmin(this, 'CdkLakeFormationAdmin', {
      principal: cdkRole,
    });

    // Event Bridge event bus for the Central Governance account
    this.eventBus = new EventBus(this, 'centralEventBus');
    this.eventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // Workflow role used by the state machine
    this.workflowRole = new DataMeshWorkflowRole(this, 'WorkflowRole').role;

    this.workflowRole.attachInlinePolicy(new Policy(this, 'sendEvents', {
      statements: [
        new PolicyStatement({
          actions: ['events:Put*'],
          resources: [this.eventBus.eventBusArn],
        }),
      ],
    }));

    // Task to create a table
    const createTable = new CallAwsService(this, 'createTable', {
      service: 'glue',
      action: 'createTable',
      iamResources: ['*'],
      parameters: {
        'DatabaseName.$': `States.Format('${CentralGovernance.DOMAIN_DATABASE_PREFIX}{}', $.producer_acc_id)`,
        'TableInput': {
          'Name.$': '$.tables.name',
          'Owner.$': '$.producer_acc_id',
          'StorageDescriptor': {
            'Location.$': '$.tables.location'
          }
        },
      },
      resultPath: JsonPath.DISCARD,
    });

    // Grant SUPER permissions (and grantable) on product database and tables to Data Domain account
    const grantTablePermissions = new CallAwsService(this, 'grantTablePermissionsToProducer', {
      service: 'lakeformation',
      action: 'grantPermissions',
      iamResources: ['*'],
      parameters: {
        'Permissions': [
          "ALL"
        ],
        'PermissionsWithGrantOption': [
          'ALL'
        ],
        'Principal': {
          'DataLakePrincipalIdentifier.$': '$.producer_acc_id'
        },
        'Resource': {
          'Table': {
            'DatabaseName.$': `States.Format('${CentralGovernance.DOMAIN_DATABASE_PREFIX}{}', $.producer_acc_id)`,
            'Name.$': '$.tables.name',
          },
        },
      },
      outputPath: '$.tables.name',
      resultPath: JsonPath.DISCARD
    });

    // Trigger workflow in Data Domain account via Event Bridge
    const triggerProducer = new EventBridgePutEvents(this, 'triggerCreateResourceLinks', {
      entries: [{
        detail: TaskInput.fromObject({
          'central_database_name': JsonPath.format(
            "{}{}",
            CentralGovernance.DOMAIN_DATABASE_PREFIX,
            JsonPath.stringAt("$.producer_acc_id")
          ),
          'producer_acc_id': JsonPath.stringAt("$.producer_acc_id"),
          'database_name': "data-products",
          'table_names': JsonPath.stringAt("$.map_result.flatten"),
        }),
        detailType: JsonPath.format(
          "{}_createResourceLinks",
          JsonPath.stringAt("$.producer_acc_id")
        ),
        eventBus: this.eventBus,
        source: 'com.central.stepfunction'
      }]
    });

    // iterate over multiple tables in parallel
    const tablesMapTask = new Map(this, 'forEachTable', {
      itemsPath: '$.tables',
      parameters: {
        'producer_acc_id.$': '$.producer_acc_id',
        'tables.$': '$$.Map.Item.Value',
      },
      resultSelector: {
        'flatten.$': '$[*]'
      },
      resultPath: '$.map_result',
    });

    tablesMapTask.iterator(
      createTable.addCatch(grantTablePermissions, {
        errors: ['Glue.AlreadyExistsException'],
        resultPath: '$.CreateTableException',
      }).next(grantTablePermissions)
    ).next(triggerProducer);

    // Create Log group for this state machine
    const logGroup = new LogGroup(this, 'centralGov-stateMachine', {
      retention: RetentionDays.ONE_WEEK,
    });
    logGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // State machine to register data product from Data Domain
    new StateMachine(this, 'RegisterDataProduct', {
      definition: tablesMapTask,
      role: this.workflowRole,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL,
      },
    });
  }

  /**
   * Registers a new Data Domain account in Central Governance account.
   * Each Data Domain account {@link DataDomain} has to be registered in Central Gov. account before it can participate in a mesh.
   * 
   * It creates:
   * * A cross-account policy for Amazon EventBridge Event Bus to enable Data Domain to send events to Central Gov. account
   * * A Lake Formation data access role scoped down to the data domain products bucket
   * * A Glue Catalog Database to hold Data Products for this Data Domain
   * * A Rule to forward events to target Data Domain account.
   * 
   * Object references are passed from the DataDomain account to the CentralGovernance account via a AWS Secret Manager secret and cross account access.
   * It includes the following JSON object:
   * ```json
   * {
   *   BucketName: 'clean-<ACCOUNT_ID>-<REGION>',
   *   Prefix: 'data-products',
   *   KmsKeyId: '<KMS_ID>,
   * }
   * ```
   * 
   * @param {string} id the ID of the CDK Construct
   * @param {string} domainId the account ID of the DataDomain to register
   * @param {string} domainSecretArn the full ARN of the secret used by producers to share references with the central governance
   * @access public
   */
  public registerDataDomain(id: string, domainId: string, domainSecretArn: string) {

    // Import the data domain secret from it's full ARN
    const domainSecret = Secret.fromSecretCompleteArn(this, 'DomainSecret', domainSecretArn);
    // Extract data domain references
    const domainBucket = domainSecret.secretValueFromJson('BucketName').unsafeUnwrap();
    const domainPrefix = domainSecret.secretValueFromJson('Prefix').unsafeUnwrap();
    const domainKey = domainSecret.secretValueFromJson('KmsKeyId').unsafeUnwrap();
    // Construct domain event bus ARN
    const dataDomainBusArn = `arn:aws:events:${Aws.REGION}:${domainId}:event-bus/${DataDomain.DOMAIN_BUS_NAME}`;

    // register the S3 location in Lake Formation and create data access role
    new LakeFormationS3Location(this, `${id}LFLocation`, {
      s3Location: {
        bucketName: domainBucket,
        objectKey: domainPrefix,
      },
      kmsKeyId: domainKey,
    });

    // Create the database in Glue with datadomain prefix+bucket
    new Database(this, `${id}DataDomainDatabase`, {
      databaseName: CentralGovernance.DOMAIN_DATABASE_PREFIX + domainId,
      locationUri: `s3://${domainBucket}/${domainPrefix}`,
    }).node.addDependency(this.node.findChild('CdkLakeFormationAdmin'));

    // Grant workflow role permissions to domain database
    new lakeformation.CfnPrincipalPermissions(this, `${id}WorkflowRoleDbAccess`, {
      permissions: ['ALL'],
      permissionsWithGrantOption: [],
      principal: {
        dataLakePrincipalIdentifier: this.workflowRole.roleArn,
      },
      resource: {
        database: {
          catalogId: Aws.ACCOUNT_ID,
          name: CentralGovernance.DOMAIN_DATABASE_PREFIX + domainId,
        }
      },
    }).node.addDependency(this.node.findChild(`${id}DataDomainDatabase`));

    // Cross-account policy to allow Data Domain account to send events to Central Gov. account event bus
    new CfnEventBusPolicy(this, `${id}Policy`, {
      eventBusName: this.eventBus.eventBusName,
      statementId: `AllowDataDomainAccToPutEvents_${domainId}`,
      action: 'events:PutEvents',
      principal: domainId,
    });

    // Event Bridge Rule to trigger createResourceLinks workflow in target Data Domain account
    const rule = new Rule(this, `${id}Rule`, {
      eventPattern: {
        source: ['com.central.stepfunction'],
        detailType: [`${domainId}_createResourceLinks`],
      },
      eventBus: this.eventBus,
    });

    rule.addTarget(new targets.EventBus(
      EventBus.fromEventBusArn(
        this,
        '${id}DomainEventBus',
        dataDomainBusArn
      )),
    );
    rule.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }
}
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DefaultStackSynthesizer, RemovalPolicy, Fn } from 'aws-cdk-lib';;
import { Construct } from 'constructs';
import { IRole, Policy, PolicyStatement, CompositePrincipal, ServicePrincipal, Role } from 'aws-cdk-lib/aws-iam';
import { CallAwsService, EventBridgePutEvents } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { StateMachine, JsonPath, TaskInput, Map, LogLevel } from "aws-cdk-lib/aws-stepfunctions";
import { CfnEventBusPolicy, EventBus, IEventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import * as targets from 'aws-cdk-lib/aws-events-targets';

import { DataMeshWorkflowRole } from './data-mesh-workflow-role';
import { DataDomain } from './data-domain';
import { LakeformationS3Location } from '../lf-s3-location';
// import { LakeFormationAdmin } from '../lake-formation';
import { CfnDataLakeSettings } from 'aws-cdk-lib/aws-lakeformation';
import { Database } from '@aws-cdk/aws-glue-alpha';

/**
 * This CDK Construct creates a Data Product registration workflow and resources for the Central Governance account.
 * It uses AWS Step Functions state machine to orchestrate the workflow:
 * * creates tables in AWS Glue Data Catalog
 * * grants permissions to LF Admin role
 * * shares tables to Data Product owner account (Producer)
 * 
 * This construct also creates an Amazon EventBridge Event Bus to enable communication with Data Domain accounts (Producer/Consumer).
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
 * 
 * const governance = new CentralGovernance(stack, 'myCentralGov');
 * 
 * const domain = new DataDomain(...);
 * 
 * governance.registerDataDomain('Domain1', domain);
 * ```
 */
export class CentralGovernance extends Construct {

  public readonly workflowRole: IRole;
  public readonly eventBus: IEventBus;

  /**
   * Construct a new instance of CentralGovernance.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {CentralGovernanceProps} props the CentralGovernanceProps properties
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
    // Makes the CDK execution role LF admin so we can create databases
    const cdkRole = Role.fromRoleArn(this, 'cdkRole', cdkExecutionRoleArn);
    new CfnDataLakeSettings(this, 'AddLfAdmin', {
      admins: [{ dataLakePrincipalIdentifier: cdkRole.roleArn }],
    });
    // TODO test LakeFormationAdmin construct
    // new LakeFormationAdmin(this, 'CdkLakeFormationAdmin', {
    //   principal: cdkRole,
    // });

    // Event Bridge event bus for the Central Governance account
    this.eventBus = new EventBus(this, 'centralEventBus');
    this.eventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // Workflow role that is LF admin, used by the state machine
    this.workflowRole = new DataMeshWorkflowRole(this, 'WorkflowRole', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('states.amazonaws.com'),
      ),
    });

    this.workflowRole.attachInlinePolicy(new Policy(this, 'sendEvents', {
      statements: [
        new PolicyStatement({
          actions: ['events:Put*'],
          resources: [this.eventBus.eventBusArn],
        }),
      ],
    }));

    // Grant Data Location access to Workflow role
    // const grantLfAdminAccess = new CallAwsService(this, 'grantLfAdminAccess', {
    //   service: 'lakeformation',
    //   action: 'grantPermissions',
    //   iamResources: ['*'],
    //   parameters: {
    //     'Permissions': [
    //       'DATA_LOCATION_ACCESS'
    //     ],
    //     'Principal': {
    //       'DataLakePrincipalIdentifier': this.workflowRole.roleArn
    //     },
    //     'Resource': {
    //       'DataLocation': {
    //         'ResourceArn.$': "States.Format('arn:aws:s3:::{}', $.data_product_s3)"
    //       }
    //     }
    //   },
    //   resultPath: JsonPath.DISCARD
    // });

    // Grant Data Location access to Data Domain account
    // const grantProducerAccess = new CallAwsService(this, 'grantProducerAccess', {
    //   service: 'lakeformation',
    //   action: 'grantPermissions',
    //   iamResources: ['*'],
    //   parameters: {
    //     'Permissions': [
    //       'DATA_LOCATION_ACCESS'
    //     ],
    //     'Principal': {
    //       'DataLakePrincipalIdentifier.$': '$.producer_acc_id'
    //     },
    //     'Resource': {
    //       'DataLocation': {
    //         'ResourceArn.$': "States.Format('arn:aws:s3:::{}', $.data_product_s3)"
    //       }
    //     }
    //   },
    //   resultPath: JsonPath.DISCARD
    // });

    // Task to create a database
    // const createDatabase = new CallAwsService(this, 'createDatabase', {
    //   service: 'glue',
    //   action: 'createDatabase',
    //   iamResources: ['*'],
    //   parameters: {
    //     'DatabaseInput': {
    //       'Name.$': "States.Format('{}_{}', $.producer_acc_id, $.database_name)",
    //       'Description': "States.Format('Data product for {} in Producer account {}', $.data_product_s3, $.producer_acc_id)",
    //     },
    //   },
    //   resultPath: JsonPath.DISCARD,
    // });

    // Task to create a table
    const createTable = new CallAwsService(this, 'createTable', {
      service: 'glue',
      action: 'createTable',
      iamResources: ['*'],
      parameters: {
        'DatabaseName.$': "States.Format('{}_{}', $.producer_acc_id, $.database_name)",
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

    // Grant SUPER permissions on product database and tables to Data Domain account
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
            'DatabaseName.$': "States.Format('{}_{}', $.producer_acc_id, $.database_name)",
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
            "{}_{}",
            JsonPath.stringAt("$.producer_acc_id"),
            JsonPath.stringAt("$.database_name")
          ),
          'producer_acc_id': JsonPath.stringAt("$.producer_acc_id"),
          'database_name': JsonPath.stringAt("$.database_name"),
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

    const tablesMapTask = new Map(this, 'forEachTable', {
      itemsPath: '$.tables',
      parameters: {
        'data_product_s3.$': '$.data_product_s3',
        'producer_acc_id.$': '$.producer_acc_id',
        'database_name.$': '$.database_name',
        'tables.$': '$$.Map.Item.Value',
      },
      resultSelector: {
        'flatten.$': '$[*]'
      },
      resultPath: '$.map_result',
    });

    // const updateDatabaseOwnerMetadata = new CallAwsService(this, 'updateDatabaseOwnerMetadata', {
    //   service: 'glue',
    //   action: 'updateDatabase',
    //   iamResources: ['*'],
    //   parameters: {
    //     'Name.$': "States.Format('{}_{}', $.producer_acc_id, $.database_name)",
    //     'DatabaseInput': {
    //       'Name.$': "States.Format('{}_{}', $.producer_acc_id, $.database_name)",
    //       'Parameters': {
    //         'data_owner.$': '$.producer_acc_id',
    //         'data_owner_name.$': "$.product_owner_name",
    //         'pii_flag.$': '$.product_pii_flag'
    //       }
    //     }
    //   },
    //   resultPath: JsonPath.DISCARD
    // });

    tablesMapTask.iterator(
      createTable.addCatch(grantTablePermissions, {
        errors: ['Glue.AlreadyExistsException'],
        resultPath: '$.CreateTableException',
      }).next(grantTablePermissions)
    ).next(triggerProducer);

    // createDatabase.addCatch(updateDatabaseOwnerMetadata, {
    //   errors: ['Glue.AlreadyExistsException'], resultPath: '$.Exception'
    // }).next(updateDatabaseOwnerMetadata).next(tablesMapTask);

    // registerS3Location.addCatch(grantLfAdminAccess, {
    //   errors: [
    //     'LakeFormation.AlreadyExistsException'
    //   ],
    //   resultPath: '$.Exception'
    // }).next(grantLfAdminAccess).next(grantProducerAccess).next(createDatabase);

    // Create Log group for this state machine
    const logGroup = new LogGroup(this, 'centralGov-stateMachine');
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
   * It includes creating a cross-account policy for Amazon EventBridge Event Bus to enable Data Domain to send events to Central Gov. account. 
   * It also creates a Rule to forward events to target Data Domain account. 
   * Each Data Domain account {@link DataDomain} has to be registered in Central Gov. account before it can participate in a mesh.
   * @param {string} id the ID of the CDK Construct
   * @param {DataDomain} domain the Data Domain to register
   * @access public
   */
  public registerDataDomain(id: string, domain: DataDomain) {

    // register the S3 location in Lake Formation and create data access role
    new LakeformationS3Location(this, 'LFLocation' + domain.node.id, {
      s3Bucket: domain.dataProductsBucket,
      s3ObjectKey: domain.dataProductsPrefix,
      kmsKey: domain.dataProductsKmsKey,
    })

    // Create the database in Glue with datadomain prefix+bucket
    new Database(this, 'DataDomainDB' + domain.accountId, {
      databaseName: 'data-domain-' + domain.accountId,
      locationUri: domain.dataProductsBucket.s3UrlForObject(domain.dataProductsPrefix),
    });

    const dataDomainBusArn = domain.eventBus.eventBusArn;

    // Cross-account policy to allow Data Domain account to send events to Central Gov. account event bus
    new CfnEventBusPolicy(this, `${id}Policy`, {
      eventBusName: this.eventBus.eventBusName,
      statementId: `AllowDataDomainAccToPutEvents_${domain.accountId}`,
      action: 'events:PutEvents',
      principal: domain.accountId,
    });

    // Event Bridge Rule to trigger createResourceLinks workflow in target Data Domain account
    const rule = new Rule(this, `${id}Rule`, {
      eventPattern: {
        source: ['com.central.stepfunction'],
        detailType: [`${domain.accountId}_createResourceLinks`],
      },
      eventBus: this.eventBus,
    });

    rule.addTarget(new targets.EventBus(
      (domain.eventBus) ? domain.eventBus : EventBus.fromEventBusArn(
        this,
        `${id}DomainEventBus`,
        dataDomainBusArn,
      )),
    );
    rule.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }
}

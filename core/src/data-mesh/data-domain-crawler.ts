// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Rule, EventBus } from 'aws-cdk-lib/aws-events';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Choice, Condition, JsonPath, Map, StateMachine, Wait, WaitTime, LogLevel } from 'aws-cdk-lib/aws-stepfunctions';
import { CallAwsService } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

/**
 * Properties for the DataDomainCrawler Construct
 */
export interface DataDomainCrawlerProps {
  /**
  * ARN of DataDomainWorkflow State Machine
  */
  readonly dataDomainWorkflowArn: string;

  /**
  * Event Bus in Data Domain account
  */
  readonly eventBus: EventBus;

  /**
  * LF Admin Role
  */
  readonly lfAdminRole: IRole;
}

/**
 * This CDK Construct creates a AWS Glue Crawler workflow in Data Domain account.
 * It uses AWS Step Functions state machine to orchestrate the workflow:
 * * creates and destroys the crawler upon execution
 * 
 * It is triggered via Amazon EventBridge Rule upon successful execution of DataDomainWorkflow state machine {@link DataDomainWorkflow}.
 * This construct is initiatied in {@link DataDomain} but can be used as a standalone construct.
 * 
 * Usage example:
 * ```typescript
 * import { App, Stack } from 'aws-cdk-lib';
 * import { DataDomainCrawler } from 'aws-analytics-reference-architecture';
 * 
 * const exampleApp = cdk.App();
 * const stack = new Stack(exampleApp, 'DataProductStack');
 * 
 * # See {@link DataDomain}
 * 
 * new DataDomainCrawler(this, 'DataDomainCrawler', {
 *  eventBus: eventBus,
 *  lfAdminRole: lfAdminRole,
 *  dataDomainWorkflowArn: dataDomainWorkflow.stateMachine.stateMachineArn,
 * });
 * ```
 * 
 */
export class DataDomainCrawler extends Construct {
  /**
   * Construct a new instance of DataDomainCrawler.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataDomainCrawlerProps} props the DataDomainCrawlerProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataDomainCrawlerProps) {
    super(scope, id);

    const traverseTableArray = new Map(this, 'TraverseTableArray', {
      itemsPath: '$.detail.table_names',
      maxConcurrency: 2,
      parameters: {
        'tableName.$': "States.Format('rl-{}', $$.Map.Item.Value)",
        'databaseName.$': '$.detail.database_name'
      },
      resultPath: JsonPath.DISCARD
    });

    const grantPermissions = new CallAwsService(this, 'GrantPermissions', {
      service: 'lakeformation',
      action: 'grantPermissions',
      iamResources: ['*'],
      parameters: {
        'Permissions': [
          'ALL'
        ],
        'Principal': {
          'DataLakePrincipalIdentifier': props.lfAdminRole.roleArn
        },
        "Resource": {
          'Table': {
            'DatabaseName.$': '$.databaseName',
            'Name.$': '$.tableName'
          }
        }
      },
      resultPath: JsonPath.DISCARD
    });

    const createCrawlerForTable = new CallAwsService(this, 'CreateCrawlerForTable', {
      service: 'glue',
      action: 'createCrawler',
      iamResources: ['*'],
      parameters: {
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.tableName)",
        'Role': props.lfAdminRole.roleArn,
        'Targets': {
          'CatalogTargets': [
            {
              'DatabaseName.$': '$.databaseName',
              'Tables.$': 'States.Array($.tableName)'
            }
          ]
        },
        'SchemaChangePolicy': {
          'DeleteBehavior': 'LOG',
          'UpdateBehavior': 'UPDATE_IN_DATABASE'
        }
      },
      resultPath: JsonPath.DISCARD
    });

    const startCrawler = new CallAwsService(this, 'StartCrawler', {
      service: 'glue',
      action: 'startCrawler',
      iamResources: ['*'],
      parameters: {
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.tableName)"
      },
      resultPath: JsonPath.DISCARD
    });

    const waitForCrawler = new Wait(this, 'WaitForCrawler', {
      time: WaitTime.duration(Duration.seconds(15))
    });

    const getCrawler = new CallAwsService(this, 'GetCrawler', {
      service: 'glue',
      action: 'getCrawler',
      iamResources: ['*'],
      parameters: {
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.tableName)"
      },
      resultPath: '$.crawlerInfo'
    });

    const checkCrawlerStatusChoice = new Choice(this, 'CheckCrawlerStatusChoice');

    const deleteCrawler = new CallAwsService(this, 'DeleteCrawler', {
      service: 'glue',
      action: 'deleteCrawler',
      iamResources: ['*'],
      parameters: {
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.tableName)"
      },
      resultPath: JsonPath.DISCARD
    });
    deleteCrawler.endStates;

    checkCrawlerStatusChoice
      .when(Condition.stringEquals("$.crawlerInfo.Crawler.State", "READY"), deleteCrawler)
      .otherwise(waitForCrawler);

    getCrawler.next(checkCrawlerStatusChoice);
    waitForCrawler.next(getCrawler);
    startCrawler.next(waitForCrawler);
    createCrawlerForTable.next(startCrawler);
    grantPermissions.next(createCrawlerForTable);

    traverseTableArray.iterator(grantPermissions).endStates;

    const initState = new Wait(this, 'WaitForMetadata', {
      time: WaitTime.duration(Duration.seconds(15))
    })

    initState.next(traverseTableArray);

    // Create Log group for this state machine
    const logGroup = new LogGroup(this, 'centralGov-stateMachine');
    logGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const updateTableSchemasStateMachine = new StateMachine(this, 'UpdateTableSchemas', {
      definition: initState,
      role: props.lfAdminRole,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL,
      },
    });

    new Rule(this, 'TriggerUpdateTableSchemasRule', {
      eventBus: props.eventBus,
      targets: [
        new SfnStateMachine(updateTableSchemasStateMachine)
      ],
      eventPattern: {
        source: ['com.central.stepfunction'],
        detailType: ['triggerCrawler'],
      }
    });
  }
}

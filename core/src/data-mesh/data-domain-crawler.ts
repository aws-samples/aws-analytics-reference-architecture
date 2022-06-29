// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';
import { Effect, IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Choice, Condition, JsonPath, Map, StateMachine, Wait, WaitTime, LogLevel } from 'aws-cdk-lib/aws-stepfunctions';
import { CallAwsService } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

/**
 * Properties for the DataDomainCrawler Construct
 */
 export interface DataDomainCrawlerProps {
  /**
   * LF Admin Role
   */
  readonly workflowRole: IRole;
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
 *  workflowRole: workflowRole,
 * });
 * ```
 * 
 */
export class DataDomainCrawler extends Construct {

  public readonly stateMachine: SfnStateMachine;
  public readonly crawlerRole: IRole;

  /**
   * Construct a new instance of DataDomainCrawler.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataDomainCrawlerProps} props the DataDomainCrawlerProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataDomainCrawlerProps) {
    super(scope, id);

    this.crawlerRole = new Role (this, 'CrawlerRole', {
      assumedBy: new ServicePrincipal('glue.amazonaws.com'),
    })

    // permissions of the data access role are scoped down to resources with the tag 'data-mesh-managed':'true'
    new ManagedPolicy(this, 'S3AccessPolicy', {
      statements: [
        new PolicyStatement({
          actions: [
            'kms:Decrypt*',
            'kms:Describe*',
          ],
          resources: ['*'],
          effect: Effect.ALLOW,
          conditions: {
            StringEquals: {
              'data-mesh-managed':'true',
            },
          },
        }),
        new PolicyStatement({
          actions: [
            "s3:GetObject*",
            "s3:GetBucket*",
            "s3:List*",
          ],
          resources: ['*'],
          effect: Effect.ALLOW,
          conditions: {
            StringEquals: {
              'data-mesh-managed':'true',
            },
          },
        }),
      ],
      roles: [this.crawlerRole],
    })

    const traverseTableArray = new Map(this, 'TraverseTableArray', {
      itemsPath: '$.detail.table_names',
      maxConcurrency: 2,
      parameters: {
        'tableName.$': "States.Format('rl-{}', $$.Map.Item.Value)",
        'databaseName.$': '$.detail.database_name'
      },
      resultPath: JsonPath.DISCARD
    });

    const createCrawlerForTable = new CallAwsService(this, 'CreateCrawlerForTable', {
      service: 'glue',
      action: 'createCrawler',
      iamResources: ['*'],
      parameters: {
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.tableName)",
        'Role': this.crawlerRole.roleArn,
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

    createCrawlerForTable.next(startCrawler).next(waitForCrawler).next(getCrawler).next(checkCrawlerStatusChoice);
    traverseTableArray.iterator(createCrawlerForTable).endStates;

    const initState = new Wait(this, 'WaitForMetadata', {
      time: WaitTime.duration(Duration.seconds(15))
    })

    initState.next(traverseTableArray);

    // Create Log group for this state machine
    const logGroup = new LogGroup(this, 'CrawlerWorkflowStateMachine');
    logGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const updateTableSchemasStateMachine = new StateMachine(this, 'UpdateTableSchemas', {
      definition: initState,
      role: props.workflowRole,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL,
      },
    });

    this.stateMachine = new SfnStateMachine(updateTableSchemasStateMachine);
  }
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Aws, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CallAwsService, EventBridgePutEvents } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { StateMachine, JsonPath, Choice, Condition, Pass, TaskInput, LogLevel } from 'aws-cdk-lib/aws-stepfunctions';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

import { DataDomainWorkflow } from './data-domain-workflow'


/**
 * This CDK Construct creates a TBAC workflow for Producer/Consumer account.
 * It is based on an AWS Step Functions state machine. It has the following steps:
 * * grants permissions to data domain LF tag to workflow role
 * * creates tables in database that is shared via LF tag
 * * creates Resource-Link(s) for database
 * 
 * This Step Functions state machine is invoked from the Central Gov. account via EventBridge Event Bus.
 * It is initiatated in {@link DataDomain}, but can be used as a standalone construct.
 * 
 * Usage example:
 * ```typescript
 * import { App, Stack } from 'aws-cdk-lib';
 * import { Role } from 'aws-cdk-lib/aws-iam';
 * import { DataDomain } from 'aws-analytics-reference-architecture';
 * 
 * const exampleApp = new App();
 * const stack = new Stack(exampleApp, 'DataProductStack');
 * 
 * const workflowRole = new Role(stack, 'myWorkflowRole', {
 *  assumedBy: ...
 * });
 * 
 * new DataDomainTbacWorkflow(this, 'DataDomainWorkflow', {
 *  domainName: 'departmentName',
 *  eventBus: eventBus,
 *  workflowRole: workflowRole,
 *  centralAccountId: '1234567891011',
 *  domainName: 'domainName'
 * });
 * ```
 * 
 */
export class DataDomainTbacWorkflow extends Construct {

  public readonly stateMachine: StateMachine;

  /**
   * Construct a new instance of DataDomainTbacWorkflow.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataDomainWorkflowProps} props the DataDomainWorkflowProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataDomainWorkflow) {
    super(scope, id);

    // Task to create a resource-link for shared table from central gov accunt
    const createDbResourceLink = new CallAwsService(this, 'createDbResourceLink', {
      service: 'glue',
      action: 'createDatabase',
      iamResources: ['*'],
      parameters: {
        'DatabaseInput': {
          'Name.$': "States.Format('rl-{}', $.detail.central_database_name)",
          'TargetDatabase': {
            'CatalogId': props.centralAccountId,
            'DatabaseName.$': '$.detail.central_database_name',
          },
        },
      },
      resultPath: JsonPath.DISCARD,
    });

    // Trigger crawler workflow
    const triggerCrawler = new EventBridgePutEvents(this, 'triggerCrawler', {
      entries: [{
        detail: TaskInput.fromObject({
          'database_name': JsonPath.stringAt("$.detail.database_name"),
          'central_database_name': JsonPath.stringAt("$.detail.central_database_name"),
          'table_names': JsonPath.stringAt("$.detail.table_names"),
          'central_account_id': JsonPath.stringAt("$.detail.central_account_id"),
          'lf_access_mode': JsonPath.stringAt("$.detail.lf_access_mode"),
        }),
        detailType: 'triggerCrawler',
        eventBus: props.eventBus,
        source: 'com.central.stepfunction',
      }]
    });

    // Trigger crawler workflow
    const grantCrawlerPermission = new EventBridgePutEvents(this, 'grantCrawlerPermission', {
      entries: [{
        detail: TaskInput.fromObject({
          'central_database_name': JsonPath.stringAt("$.detail.central_database_name"),
        }),
        detailType: 'grantCrawlerPermission',
        eventBus: props.eventBus,
        source: 'com.central.stepfunction',
      }],
      resultPath: JsonPath.DISCARD,
    });

    // Task to check if this account is data product owner (producer)
    const thisAccountIsProducer = new Choice(this, 'thisAccountIsProducer')
      .when(Condition.stringEquals('$.detail.producer_acc_id', Aws.ACCOUNT_ID), triggerCrawler)
      .otherwise(new Pass(this, 'finishWorkflow'));

    grantCrawlerPermission.next(thisAccountIsProducer);

    // Skip if Database resource link already exist
    createDbResourceLink.addCatch(thisAccountIsProducer, {
      errors: ['Glue.AlreadyExistsException'],
      resultPath: '$.Exception',
    }).next(grantCrawlerPermission);

    // Create Log group for this state machine
    const logGroup = new LogGroup(this, 'Workflow', {
      retention: RetentionDays.ONE_WEEK,
      logGroupName: '/aws/vendedlogs/data-mesh/tbac-workflow',
    });
    logGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // State Machine workflow to create a resource link for TBAC database
    this.stateMachine = new StateMachine(this, 'tbacStateMachine', {
      definition: createDbResourceLink,
      role: props.workflowRole,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL,
      },
    });
  }
}

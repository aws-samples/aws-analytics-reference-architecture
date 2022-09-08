// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Aws, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CallAwsService, EventBridgePutEvents } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
  StateMachine,
  JsonPath,
  Map,
  Choice,
  Condition,
  Pass,
  Result,
  Wait,
  WaitTime,
  TaskInput,
  LogLevel,
} from 'aws-cdk-lib/aws-stepfunctions';

import { DataDomainWorkflow } from './data-domain-workflow'

/**
 * This CDK Construct creates a NRAC workflow for Producer/Consumer account.
 * It is based on an AWS Step Functions state machine. It has the following steps:
 * * checks for AWS RAM invitations
 * * accepts RAM invitations if the source is Central Gov. account
 * * creates AWS Glue Data Catalog Database and tables
 * * creates Resource-Link(s) for created tables
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
 * new DataDomainNracWorkflow(this, 'DataDomainWorkflow', {
 *  eventBus: eventBus,
 *  workflowRole: workflowRole,
 *  centralAccountId: '1234567891011',
 *  domainName: 'domainName'
 * });
 * ```
 * 
 */
export class DataDomainNracWorkflow extends Construct {

  public readonly stateMachine: StateMachine;

  /**
   * Construct a new instance of DataDomainNracWorkflow.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataDomainWorkflow} props the DataDomainWorkflowProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataDomainWorkflow) {
    super(scope, id);

    // Task to check for existing RAM invitations
    const getRamInvitations = new CallAwsService(this, 'GetResourceShareInvitations', {
      service: 'ram',
      action: 'getResourceShareInvitations',
      iamResources: ['*'],
      parameters: {},
      resultPath: '$.taskresult',
    });

    // Task to accept RAM share invitation
    const acceptRamShare = new CallAwsService(this, 'AcceptResourceShareInvitation', {
      service: 'ram',
      action: 'acceptResourceShareInvitation',
      iamResources: ['*'],
      parameters: {
        'ResourceShareInvitationArn.$': '$.ram_share.ResourceShareInvitationArn',
      },
      resultPath: '$.Response',
      resultSelector: {
        'Status.$': '$.ResourceShareInvitation.Status',
      },
    });

    const createLocalDatabase = new CallAwsService(this, 'createLocalDatabase', {
      service: 'glue',
      action: 'createDatabase',
      iamResources: ['*'],
      parameters: {
        'DatabaseInput': {
          'Name.$': '$.detail.database_name'
        },
      },
      resultPath: JsonPath.DISCARD,
    });

    const grantCreateTable = new CallAwsService(this, 'grantCreateTable', {
      service: 'lakeformation',
      action: 'grantPermissions',
      iamResources: ['*'],
      parameters: {
        'Permissions': [
          'ALL'
        ],
        'Principal': {
          'DataLakePrincipalIdentifier': props.workflowRole.roleArn
        },
        'Resource': {
          'Database': {
            'Name.$': '$.detail.database_name'
          },
        }
      },
      resultPath: JsonPath.DISCARD
    });

    // Task to create a resource-link for shared table from central gov accunt
    const createResourceLink = new CallAwsService(this, 'createResourceLink', {
      service: 'glue',
      action: 'createTable',
      iamResources: ['*'],
      parameters: {
        'DatabaseName.$': '$.database_name',
        'TableInput': {
          'Name.$': "States.Format('rl-{}', $.table_name)",
          'TargetTable': {
            'CatalogId': props.centralAccountId,
            'DatabaseName.$': '$.central_database_name',
            'Name.$': '$.table_name',
          },
        },
      },
      resultPath: JsonPath.DISCARD,
    });

    // Trigger crawler workflow
    const triggerCrawler = new EventBridgePutEvents(this, 'triggerCrawler', {
      entries: [{
        detail: TaskInput.fromObject({
          'database_name': JsonPath.stringAt("$.database_name"),
          'table_names': JsonPath.stringAt("$.table_names"),
          'central_account_id': JsonPath.stringAt("$.central_account_id"),
          'central_database_name': JsonPath.stringAt("$.central_database_name"),
          'lf_access_mode': JsonPath.stringAt("$.lf_access_mode"),
        }),
        detailType: 'triggerCrawler',
        eventBus: props.eventBus,
        source: 'com.central.stepfunction',
      }]
    });

    // Pass task to finish the workflow
    const finishWorkflow = new Pass(this, 'finishWorkflow');

    const rlMapTask = new Map(this, 'forEachTable', {
      itemsPath: '$.table_names',
      parameters: {
        'central_database_name.$': '$.central_database_name',
        'database_name.$': '$.database_name',
        'table_name.$': '$$.Map.Item.Value'
      },
      resultPath: JsonPath.DISCARD,
    });
    rlMapTask.iterator(createResourceLink);
    rlMapTask.next(new Choice(this, 'thisAccountIsProducer')
      .when(Condition.stringEquals('$.producer_acc_id', Aws.ACCOUNT_ID), triggerCrawler)
      .otherwise(finishWorkflow)
    );

    // Task to iterate over RAM shares and check if there are PENDING invites from the central account
    const ramMapTask = new Map(this, 'forEachRamInvitation', {
      itemsPath: '$.taskresult.ResourceShareInvitations',
      parameters: {
        'ram_share.$': '$$.Map.Item.Value',
        'central_account_id.$': '$.account',
        'central_database_name.$': '$.detail.central_database_name',
        'database_name.$': '$.detail.database_name',
        'table_names.$': '$.detail.table_names',
        'producer_acc_id.$': '$.detail.producer_acc_id',
        'lf_access_mode.$': '$.detail.lf_access_mode',
      },
      resultPath: '$.map_result',
      outputPath: '$.map_result.[?(@.central_account_id)]',
    });

    ramMapTask.iterator(new Choice(this, 'isInvitationPending')
      .when(Condition.and(
        Condition.stringEqualsJsonPath(
          '$.ram_share.SenderAccountId',
          '$.central_account_id'
        ),
        Condition.stringEquals('$.ram_share.Status', 'PENDING')
      ), acceptRamShare)
      .otherwise(
        new Pass(this, 'notPendingPass', {
          result: Result.fromObject({})
        }),
      ));

    ramMapTask.next(new Choice(this, 'shareAccepted', { outputPath: '$[0]' })
      .when(Condition.and(Condition.isPresent('$[0]'),
        Condition.stringEquals('$[0].Response.Status', 'ACCEPTED')),
        rlMapTask
      ).otherwise(finishWorkflow))

    // Avoid possible delays in between RAM share time and EventBridge event time 
    const initWait = new Wait(this, 'InitWait', {
      time: WaitTime.duration(Duration.seconds(5))
    })

    createLocalDatabase.addCatch(grantCreateTable, {
      errors: ['Glue.AlreadyExistsException'],
      resultPath: '$.Exception',
    }).next(grantCreateTable).next(ramMapTask);

    // Create Log group for this state machine
    const logGroup = new LogGroup(this, 'Workflow', {
      retention: RetentionDays.ONE_WEEK,
      logGroupName: '/aws/vendedlogs/data-mesh/nrac-workflow',
    });
    logGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // State Machine workflow to accept RAM share and create resource-link for a shared table
    this.stateMachine = new StateMachine(this, 'nracStateMachine', {
      definition: initWait.next(getRamInvitations).next(new Choice(this, 'resourceShareInvitationsEmpty')
        .when(Condition.isPresent('$.taskresult.ResourceShareInvitations[0]'), createLocalDatabase)
        .otherwise(finishWorkflow)
      ),
      role: props.workflowRole,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL,
      },
    });
  }
}

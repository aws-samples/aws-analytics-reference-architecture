// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';
import { Effect, IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Choice, Condition, JsonPath, Map, StateMachine, Wait, WaitTime, LogLevel } from 'aws-cdk-lib/aws-stepfunctions';
import { CallAwsService } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { IBucket } from 'aws-cdk-lib/aws-s3';

/**
 * Properties for the DataDomainCrawler Construct
 */
export interface DataDomainCrawlerProps {
  /**
   * LF Admin Role
   */
  readonly workflowRole: IRole;

  /**
   * Data Products S3 bucket
   */
  readonly dataProductsBucket: IBucket;

  /**
   * Data Products S3 bucket prefix
   */
  readonly dataProductsPrefix: string;
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
 *  dataProductsBucket: dataProductsBucket
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

    this.crawlerRole = new Role(this, 'CrawlerRole', {
      assumedBy: new ServicePrincipal('glue.amazonaws.com'),
    })

    // Grant Workflow role to pass crawlerRole
    this.crawlerRole.grantPassRole(props.workflowRole);

    new ManagedPolicy(this, 'S3AccessPolicy', {
      statements: [
        new PolicyStatement({
          actions: [
            'kms:Decrypt*',
            'kms:Describe*',
          ],
          resources: [props.dataProductsBucket.encryptionKey!.keyArn],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          actions: [
            "s3:GetObject*",
            "s3:GetBucket*",
            "s3:List*",
          ],
          resources: [
            props.dataProductsBucket.bucketArn,
            `${props.dataProductsBucket.bucketArn}/${props.dataProductsPrefix}/*`
          ],
          effect: Effect.ALLOW,
        }),
      ],
      roles: [this.crawlerRole],
    });

    const grantOnResourceLink = new CallAwsService(this, 'grantOnResourceLink', {
      service: 'lakeformation',
      action: 'grantPermissions',
      iamResources: ['*'],
      parameters: {
        'Permissions': [
          'ALL'
        ],
        'Principal': {
          'DataLakePrincipalIdentifier': this.crawlerRole.roleArn
        },
        'Resource': {
          'Table': {
            'DatabaseName.$': '$.databaseName',
            'Name.$': '$.rlName'
          },
        }
      },
      resultPath: JsonPath.DISCARD
    });

    const grantOnTarget = new CallAwsService(this, 'grantOnTarget', {
      service: 'lakeformation',
      action: 'BatchGrantPermissions',
      iamResources: ['*'],
      parameters: {
        'Entries': [
          {
            'Permissions': ['SELECT', 'INSERT', 'DROP', 'ALTER'],
            'Principal': {
              'DataLakePrincipalIdentifier': this.crawlerRole.roleArn
            },
            'Resource': {
              'Table': {
                'DatabaseName': "States.Format('{}_{}', $.centralAccountId, $.databaseName)",
                'Name': '$.tableName',
                'CatalogId': '$.centralAccountId'
              }
            }
          }
        ],
      },
      resultPath: JsonPath.DISCARD
    });

    const traverseTableArray = new Map(this, 'TraverseTableArray', {
      itemsPath: '$.detail.table_names',
      maxConcurrency: 2,
      parameters: {
        'tableName.$': "$$.Map.Item.Value",
        'rlName.$': "States.Format('rl-{}', $$.Map.Item.Value)",
        'databaseName.$': '$.detail.database_name',
        'centralAccountId.$': '$.account'
      },
      resultPath: JsonPath.DISCARD
    });

    const createCrawlerForTable = new CallAwsService(this, 'CreateCrawlerForTable', {
      service: 'glue',
      action: 'createCrawler',
      iamResources: ['*'],
      parameters: {
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.rlName)",
        'Role': this.crawlerRole.roleArn,
        'Targets': {
          'CatalogTargets': [
            {
              'DatabaseName.$': '$.databaseName',
              'Tables.$': 'States.Array($.rlName)'
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
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.rlName)"
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
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.rlName)"
      },
      resultPath: '$.crawlerInfo'
    });

    const checkCrawlerStatusChoice = new Choice(this, 'CheckCrawlerStatusChoice');

    const deleteCrawler = new CallAwsService(this, 'DeleteCrawler', {
      service: 'glue',
      action: 'deleteCrawler',
      iamResources: ['*'],
      parameters: {
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.rlName)"
      },
      resultPath: JsonPath.DISCARD
    });
    deleteCrawler.endStates;

    checkCrawlerStatusChoice
      .when(Condition.stringEquals("$.crawlerInfo.Crawler.State", "READY"), deleteCrawler)
      .otherwise(waitForCrawler);

    createCrawlerForTable.next(startCrawler).next(waitForCrawler).next(getCrawler).next(checkCrawlerStatusChoice);
    grantOnTarget.next(createCrawlerForTable)
    grantOnResourceLink.next(grantOnTarget)
    traverseTableArray.iterator(grantOnResourceLink).endStates;

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

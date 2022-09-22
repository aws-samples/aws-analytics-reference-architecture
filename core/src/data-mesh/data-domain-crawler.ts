// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';
import { Effect, IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Choice, Condition, JsonPath, Map, StateMachine, TaskInput, Wait, WaitTime, LogLevel, Pass, Result } from 'aws-cdk-lib/aws-stepfunctions';
import { CallAwsService, EventBridgePutEvents } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { IEventBus } from 'aws-cdk-lib/aws-events';

import { LfAccessControlMode as mode } from './central-governance';

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

  /**
  * Data domain name
  */
  readonly domainName: string;

  /**
  * Event Bus in Data Domain
  */
  readonly eventBus: IEventBus;
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
 *  dataProductsBucket: dataProductsBucket,
 *  domainName: 'domainName'
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

    const baseStatements = [
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
      new PolicyStatement({
        actions: ["glue:*"],
        resources: ["*"],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        resources: ["arn:aws:logs:*:*:/aws-glue/*"],
        effect: Effect.ALLOW,
      }),
    ];

    var statements: PolicyStatement[];
    if (props.dataProductsBucket.encryptionKey) {
      statements = baseStatements.concat([

        new PolicyStatement({
          actions: [
            'kms:Decrypt*',
            'kms:Describe*',
          ],
          resources: [props.dataProductsBucket.encryptionKey!.keyArn],
          effect: Effect.ALLOW,
        })
      ]);
    } else { statements = baseStatements; }

    new ManagedPolicy(this, 'S3AccessPolicy', {
      statements: statements,
      roles: [this.crawlerRole],
    });

    // Task to grant on Db resource link to crawler role
    const grantOnDbResourceLink = new CallAwsService(this, 'grantOnDbResourceLink', {
      service: 'lakeformation',
      action: 'grantPermissions',
      iamResources: ['*'],
      parameters: {
        'Permissions': [
          'DESCRIBE'
        ],
        'Principal': {
          'DataLakePrincipalIdentifier': this.crawlerRole.roleArn
        },
        'Resource': {
          'Database': {
            'CatalogId.$': '$.account',
            'Name.$': "States.Format('rl-{}', $.detail.central_database_name)"
          },
        }
      },
      resultPath: JsonPath.DISCARD
    });

    const transformInput = new Pass(this, 'transformInput', {
      parameters: {
        'crawlerTables.$': '$.detail.table_names',
        'centralTables.$': '$.detail.table_names',
        'databaseName.$': "States.Format('rl-{}', $.detail.central_database_name)",
        'centralDatabaseName.$': '$.detail.central_database_name',
      }
    })

    grantOnDbResourceLink.next(transformInput);

    const grantOnTarget = new CallAwsService(this, 'grantOnTarget', {
      service: 'lakeformation',
      action: 'batchGrantPermissions',
      iamResources: ['*'],
      parameters: {
        'Entries': [
          {
            'Permissions': ['SELECT', 'INSERT', 'ALTER'],
            'Principal': {
              'DataLakePrincipalIdentifier': this.crawlerRole.roleArn
            },
            'Resource': {
              'Table': {
                'DatabaseName.$': '$.centralDatabaseName',
                'Name.$': '$.targetTableName',
                'CatalogId.$': '$.centralAccountId'
              }
            }
          }
        ],
      },
      resultPath: JsonPath.DISCARD
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

    const nracGrantsForEachTable = new Map(this, 'nracGrantsForEachTable', {
      itemsPath: '$.detail.table_names',
      maxConcurrency: 2,
      parameters: {
        'targetTableName.$': "$$.Map.Item.Value",
        'rlName.$': "States.Format('rl-{}', $$.Map.Item.Value)",
        'databaseName.$': '$.detail.database_name',
        'centralDatabaseName.$': '$.detail.central_database_name',
        'centralAccountId.$': '$.detail.central_account_id',
      },
      resultSelector: {
        'crawlerTables.$': '$[*].rlName',
        'databaseName.$': '$[0].databaseName',
        'centralTables.$': '$[*].targetTableName',
        'centralDatabaseName.$': '$[0].centralDatabaseName'
      }
    });

    // Task to check LF Access mode (TBAC or NRAC)
    const checkLfAccessMode = new Choice(this, 'checkLfAccessMode')
      .when(Condition.stringEquals('$.detail.lf_access_mode', mode.TBAC), grantOnDbResourceLink)
      .otherwise(nracGrantsForEachTable);

    const createCrawlersForEachTable = new Map(this, 'createCrawlersForEachTable', {
      itemsPath: '$.crawlerTables',
      maxConcurrency: 2,
      parameters: {
        'tableName.$': '$$.Map.Item.Value',
        'centralTableName.$': "States.ArrayGetItem($.centralTables, $$.Map.Item.Index)",
        'databaseName.$': '$.databaseName',
        'centralDatabaseName.$': '$.centralDatabaseName',
      },
      resultPath: JsonPath.DISCARD
    });

    grantOnResourceLink.next(new Wait(this, 'waitRlGrant', {
      time: WaitTime.duration(Duration.seconds(15))
    })).next(grantOnTarget);

    const createCrawler = new CallAwsService(this, 'createCrawler', {
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
      resultPath: '$.crawlerErrorMessage',
      resultSelector: {
        'error': ''
      }
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

    const deleteCrawler = new CallAwsService(this, 'DeleteCrawler', {
      service: 'glue',
      action: 'deleteCrawler',
      iamResources: ['*'],
      parameters: {
        'Name.$': "States.Format('{}_{}_{}', $$.Execution.Id, $.databaseName, $.tableName)"
      },
      resultPath: JsonPath.DISCARD
    });

    // Forward crawler state to Central account
    const crawlerFinishedEvent = new EventBridgePutEvents(this, 'crawlerFinishedEvent', {
      entries: [{
        detail: TaskInput.fromObject({
          'dbName': JsonPath.stringAt("$.centralDatabaseName"),
          'tableName': JsonPath.stringAt("$.centralTableName"),
          'state': JsonPath.stringAt("$.crawlerInfo.Crawler.State"),
          'error': JsonPath.stringAt("$.crawlerErrorMessage.error"),
          'lastCrawlStatus.$': '$.crawlerInfo.Crawler.LastCrawl.Status',
        }),
        detailType: 'data-domain-crawler-update',
        eventBus: props.eventBus,
        source: 'data-domain-state-change',
      }],
      resultPath: JsonPath.DISCARD,
    });

    const addCrawlerErrorMessage = new Pass(this, 'addCrawlerErrorMessage', {
      resultPath: '$.crawlerErrorMessage',
      result: Result.fromObject({ error: '$.crawlerInfo.Crawler.LastCrawl.ErrorMessage' }),
    });

    deleteCrawler.endStates;
    crawlerFinishedEvent.next(deleteCrawler);
    addCrawlerErrorMessage.next(crawlerFinishedEvent);

    const checkCrawlerStatusChoice = new Choice(this, 'CheckCrawlerStatusChoice');
    checkCrawlerStatusChoice
      .when(Condition.and(
        Condition.stringEquals("$.crawlerInfo.Crawler.State", "READY"),
        Condition.stringEquals("$.crawlerInfo.Crawler.LastCrawl.Status", "FAILED")),
        addCrawlerErrorMessage
      )
      .when(Condition.and(
        Condition.stringEquals("$.crawlerInfo.Crawler.State", "READY"),
        Condition.stringEquals("$.crawlerInfo.Crawler.LastCrawl.Status", "SUCCEEDED")),
        crawlerFinishedEvent
      )
      .otherwise(waitForCrawler);

    createCrawler
      .next(startCrawler)
      .next(waitForCrawler)
      .next(getCrawler)
      .next(checkCrawlerStatusChoice);

    const initState = new Wait(this, 'WaitForMetadata', {
      time: WaitTime.duration(Duration.seconds(15))
    })

    createCrawlersForEachTable.iterator(new Wait(this, 'waitForGrants', {
      time: WaitTime.duration(Duration.seconds(15))
    }).next(createCrawler)).endStates;

    nracGrantsForEachTable.iterator(grantOnResourceLink).next(createCrawlersForEachTable);
    transformInput.next(createCrawlersForEachTable);

    initState.next(checkLfAccessMode);

    // Create Log group for this state machine
    const logGroup = new LogGroup(this, 'Crawler', {
      retention: RetentionDays.ONE_WEEK,
      logGroupName: '/aws/vendedlogs/data-mesh/crawler',
    });
    logGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const stateMachine = new StateMachine(this, 'UpdateTableSchemas', {
      definition: initState,
      role: props.workflowRole,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL,
      },
    });

    this.stateMachine = new SfnStateMachine(stateMachine);
  }
}

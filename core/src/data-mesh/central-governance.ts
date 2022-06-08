// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Aws, RemovalPolicy } from 'aws-cdk-lib';;
import { Construct } from 'constructs';
import { IRole, Policy, PolicyStatement, PolicyDocument, Effect } from 'aws-cdk-lib/aws-iam';
import { CallAwsService, EventBridgePutEvents } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { StateMachine, JsonPath, TaskInput, Map, LogLevel } from "aws-cdk-lib/aws-stepfunctions";
import { EventBus } from 'aws-cdk-lib/aws-events';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

import { Utils } from '../utils';

/**
 * Properties for the CentralGovernance Construct
 */
export interface CentralGovernanceProps {
  /**
  * Lake Formation admin role
  */
  readonly lfAdminRole: IRole;
}

/**
 * This CDK Construct creates a Data Product registration workflow and resources for the Central Governance account.
 * It uses AWS Step Functions state machine to orchestrate the workflow:
 * * registers an S3 location for a new Data Product (location in Data Domain account)
 * * creates a database and tables in AWS Glue Data Catalog
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
 * const lfAdminRole = new Role(stack, 'myLFAdminRole', {
 *  assumedBy: ...
 * });
 * 
 * new CentralGovernance(stack, 'myCentralGov', {
 *  lfAdminRole: lfAdminRole
 * });
 * ```
 * 
 */
export class CentralGovernance extends Construct {
  /**
   * Construct a new instance of CentralGovernance.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {CentralGovernanceProps} props the CentralGovernanceProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: CentralGovernanceProps) {
    super(scope, id);

    // Event Bridge event bus for the Central Governance account
    const eventBus = new EventBus(this, 'centralEventBus', {
      eventBusName: `${Aws.ACCOUNT_ID}_centralEventBus`,
    });
    eventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

    props.lfAdminRole.attachInlinePolicy(new Policy(this, 'sendEvents', {
      statements: [
        new PolicyStatement({
          actions: ['events:Put*'],
          resources: [eventBus.eventBusArn],
        }),
      ],
    }));

    const kmsPolicyDocument = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: ['kms:Decrypt', 'kms:DescribeKey'],
          resources: ['arn:aws:kms:*:<interpolated_value>:*'],
          effect: Effect.ALLOW,
        }),
      ]
    });
    const kmsPolicy = Utils.intrinsicReplacer(JSON.stringify(kmsPolicyDocument.toJSON()));

    // This task adds a policy for KMS key of a Producer account
    const addKmsPolicy = new CallAwsService(this, 'addKmsPolicy', {
      service: 'iam',
      action: 'putRolePolicy',
      iamResources: ['*'],
      parameters: {
        'PolicyDocument.$': `States.Format('${kmsPolicy}', $.data_product_s3)`,
        'RoleName': props.lfAdminRole.roleName,
        'PolicyName.$': "States.Format('kms-{}', $.producer_acc_id)",
      },
      resultPath: JsonPath.DISCARD
    });

    const bucketPolicyDocument = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: ['s3:GetObject', 's3:ListBucket'],
          resources: ['arn:aws:s3:::<interpolated_value>', 'arn:aws:s3:::<interpolated_value>*'],
          effect: Effect.ALLOW,
        }),
      ]
    });
    const bucketPolicy = Utils.intrinsicReplacer(JSON.stringify(bucketPolicyDocument.toJSON()));

    // This task adds a policy for S3 of a Data Product being registered
    const addBucketPolicy = new CallAwsService(this, 'addBucketPolicy', {
      service: 'iam',
      action: 'putRolePolicy',
      iamResources: ['*'],
      parameters: {
        'PolicyDocument.$': `States.Format('${bucketPolicy}', $.data_product_s3, $.tables.location_key)`,
        'PolicyName.$': "States.Format('dataProductPolicy-{}', $.tables.name)",
        'RoleName': props.lfAdminRole.roleName,
      },
      resultPath: JsonPath.DISCARD
    });

    // This task registers new s3 location in Lake Formation
    const registerS3Location = new CallAwsService(this, 'registerS3Location', {
      service: 'lakeformation',
      action: 'registerResource',
      iamResources: ['*'],
      parameters: {
        'ResourceArn.$': "States.Format('arn:aws:s3:::{}', $.data_product_s3)",
        'RoleArn': props.lfAdminRole.roleArn,
      },
      resultPath: JsonPath.DISCARD
    });

    // Grant Data Location access to Lake Formation Admin role
    const grantLfAdminAccess = new CallAwsService(this, 'grantLfAdminAccess', {
      service: 'lakeformation',
      action: 'grantPermissions',
      iamResources: ['*'],
      parameters: {
        'Permissions': [
          'DATA_LOCATION_ACCESS'
        ],
        'Principal': {
          'DataLakePrincipalIdentifier': props.lfAdminRole.roleArn
        },
        'Resource': {
          'DataLocation': {
            'ResourceArn.$': "States.Format('arn:aws:s3:::{}', $.data_product_s3)"
          }
        }
      },
      resultPath: JsonPath.DISCARD
    });

    // Grant Data Location access to Data Domain account
    const grantProducerAccess = new CallAwsService(this, 'grantProducerAccess', {
      service: 'lakeformation',
      action: 'grantPermissions',
      iamResources: ['*'],
      parameters: {
        'Permissions': [
          'DATA_LOCATION_ACCESS'
        ],
        'Principal': {
          'DataLakePrincipalIdentifier.$': '$.producer_acc_id'
        },
        'Resource': {
          'DataLocation': {
            'ResourceArn.$': "States.Format('arn:aws:s3:::{}', $.data_product_s3)"
          }
        }
      },
      resultPath: JsonPath.DISCARD
    });

    // Task to create a database
    const createDatabase = new CallAwsService(this, 'createDatabase', {
      service: 'glue',
      action: 'createDatabase',
      iamResources: ['*'],
      parameters: {
        'DatabaseInput': {
          'Name.$': "States.Format('{}_{}', $.producer_acc_id, $.database_name)",
          'Description': "States.Format('Data product for {} in Producer account {}', $.data_product_s3, $.producer_acc_id)",
        },
      },
      resultPath: JsonPath.DISCARD,
    });

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
        eventBus: eventBus,
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

    const updateDatabaseOwnerMetadata = new CallAwsService(this, 'updateDatabaseOwnerMetadata', {
      service: 'glue',
      action: 'updateDatabase',
      iamResources: ['*'],
      parameters: {
        'Name.$': "States.Format('{}_{}', $.producer_acc_id, $.database_name)",
        'DatabaseInput': {
          'Name.$': "States.Format('{}_{}', $.producer_acc_id, $.database_name)",
          'Parameters': {
            'data_owner.$': '$.producer_acc_id',
            'data_owner_name.$': "$.product_owner_name",
            'pii_flag.$': '$.product_pii_flag'
          }
        }
      },
      resultPath: JsonPath.DISCARD
    });

    tablesMapTask.iterator(
      addBucketPolicy.next(
        createTable.addCatch(grantTablePermissions, {
          errors: ['Glue.AlreadyExistsException'],
          resultPath: '$.CreateTableException',
        })
      ).next(grantTablePermissions)
    );

    // State machine dependencies
    tablesMapTask.next(triggerProducer);

    createDatabase.addCatch(updateDatabaseOwnerMetadata, {
      errors: ['Glue.AlreadyExistsException'], resultPath: '$.Exception'
    }).next(updateDatabaseOwnerMetadata).next(tablesMapTask);

    grantProducerAccess.next(createDatabase);
    grantLfAdminAccess.next(grantProducerAccess);

    registerS3Location.addCatch(grantLfAdminAccess, {
      errors: [
        'LakeFormation.AlreadyExistsException'
      ],
      resultPath: '$.Exception'
    }).next(grantLfAdminAccess);

    addKmsPolicy.next(registerS3Location);

    // Create Log group for this state machine
    const logGroup = new LogGroup(this, 'centralGov-stateMachine');
    logGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // State machine to register data product from Data Domain
    new StateMachine(this, 'RegisterDataProduct', {
      definition: addKmsPolicy,
      role: props.lfAdminRole,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL,
      },
    });
  }
}

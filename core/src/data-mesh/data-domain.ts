// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import { Aws, RemovalPolicy, PhysicalName } from 'aws-cdk-lib';
import { Policy, PolicyStatement, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { DataLakeStorage } from '../data-lake-storage';
import { DataDomainWorkflow } from './data-domain-workflow';
import { DataDomainCrawler } from './data-domain-crawler';
import { CfnEventBusPolicy, Rule, EventBus } from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

import { DataMeshWorkflowRole } from './data-mesh-workflow-role';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { S3CrossAccount } from '../s3-cross-account';
import { IKey } from 'aws-cdk-lib/aws-kms';

/**
 * Properties for the DataDomain Construct
 */
export interface DataDomainPros {
  /**
  * Central Governance account Id
  */
  readonly centralAccountId: string;

  /**
  * Flag to create a Crawler workflow in Data Domain account
  */
  readonly crawlerWorkflow?: boolean;
}

/**
 * This CDK Construct creates all required resources for data mesh in Data Domain account.
 * 
 * It creates the following:
 * * data lake storage layers (Raw, Cleaned, Transformed) using {@link DataLakeStorage} construct
 * * an inline policy for provided LF Admin role to enable access to Raw bucket
 * * an inline policy to enable decryption of bucket's KMS key
 * * Amazon EventBridge Event Bus and Rules to enable Central Gov. account to send events to Data Domain account
 * * Data Domain Workflow {@link DataDomainWorkflow}
 * * optional Crawler workflow {@link DataDomainCrawler}
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
 * // Optional role
 * const lfAdminRole = new Role(stack, 'myLFAdminRole', {
 *  assumedBy: ...
 * });
 * 
 * new DataDomain(stack, 'myDataDomain', {
 *  lfAdminRole: lfAdminRole,
 *  centralAccountId: '1234567891011',
 *  crawlerWorkflow: false,
 * });
 * ```
 * 
 */
export class DataDomain extends Construct {

  public static readonly DATA_PRODUCTS_KEY: string = 'data-products';
  public readonly dataLake: DataLakeStorage;
  // TODO what are the resources required to be accessible from outside the object?
  // public readonly dataDomainWorkflow: DataDomainWorkflow;
  public readonly eventBus: EventBus;
  // public readonly workflowRole: IRole;
  public readonly accountId: string;
  public readonly dataProductsBucket: IBucket;
  public readonly dataProductsPrefix: string;
  public readonly dataProductsKmsKey?: IKey;

  /**
   * Construct a new instance of DataDomain.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataDomainPros} props the DataDomainPros properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataDomainPros) {
    super(scope, id);

    this.accountId = Aws.ACCOUNT_ID;
    this.dataLake = new DataLakeStorage(this, 'dataLakeStorage');
    this.dataProductsBucket = this.dataLake.cleanBucket;
    this.dataProductsPrefix = DataDomain.DATA_PRODUCTS_KEY;
    this.dataProductsKmsKey = this.dataLake.cleanBucket.encryptionKey;

    // Using the Bucket object and not the IBucket because CDK needs to change the bucket policy
    // KMS key is automatically discovered from the Bucket object and key policy is updated
    new S3CrossAccount(this, 'DataProductsPathCrossAccount', {
      accountId: props.centralAccountId,
      s3Bucket: this.dataLake.cleanBucket,
      s3ObjectKey: DataDomain.DATA_PRODUCTS_KEY,
    })

    // Workflow role that is LF admin, used by the state machine
    const workflowRole = new DataMeshWorkflowRole(this, 'WorkflowRole', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('states.amazonaws.com'),
      ),
    });

    // Event Bridge event bus for data domain account
    this.eventBus = new EventBus(this, 'dataDomainEventBus', {
      eventBusName: PhysicalName.GENERATE_IF_NEEDED,
    });
    this.eventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // Cross-account policy to allow the central account to send events to data domain's bus
    const crossAccountBusPolicy = new CfnEventBusPolicy(this, 'crossAccountBusPolicy', {
      eventBusName: this.eventBus.eventBusName,
      statementId: 'AllowCentralAccountToPutEvents',
      action: 'events:PutEvents',
      principal: props.centralAccountId,
    });
    crossAccountBusPolicy.node.addDependency(this.eventBus);

    const dataDomainWorkflow = new DataDomainWorkflow(this, 'DataDomainWorkflow', {
      workflowRole: workflowRole,
      centralAccountId: props.centralAccountId,
      eventBus: this.eventBus,
    });

    // Event Bridge Rule to trigger this worklfow upon event from the central account
    const rule = new Rule(this, 'DataDomainRule', {
      eventPattern: {
        source: ['com.central.stepfunction'],
        account: [props.centralAccountId],
        detailType: [`${Aws.ACCOUNT_ID}_createResourceLinks`],
      },
      eventBus: this.eventBus,
    });

    rule.applyRemovalPolicy(RemovalPolicy.DESTROY);
    rule.addTarget(new targets.SfnStateMachine(dataDomainWorkflow.stateMachine));
    rule.node.addDependency(this.eventBus);

    // Allow LF admin role to send events to data domain event bus
    workflowRole.attachInlinePolicy(new Policy(this, 'SendEvents', {
      statements: [
        new PolicyStatement({
          actions: ['events:Put*'],
          resources: [this.eventBus.eventBusArn],
        }),
      ],
    }));

    if (props.crawlerWorkflow) {
      const workflow = new DataDomainCrawler(this, 'DataDomainCrawler', {
        workflowRole: workflowRole,
        dataProductsBucket: this.dataProductsBucket,
        dataProductsPrefix: this.dataProductsPrefix
      });

      new Rule(this, 'TriggerUpdateTableSchemasRule', {
        eventBus: this.eventBus,
        targets: [
          workflow.stateMachine,
        ],
        eventPattern: {
          source: ['com.central.stepfunction'],
          detailType: ['triggerCrawler'],
        }
      });
    }
  }
}

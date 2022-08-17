// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import { Aws, CfnOutput, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import { Policy, PolicyStatement, AccountPrincipal } from 'aws-cdk-lib/aws-iam';
import { DataLakeStorage } from '../data-lake-storage';
import { DataDomainWorkflow } from './data-domain-workflow';
import { DataDomainCrawler } from './data-domain-crawler';
import { CfnEventBusPolicy, Rule, EventBus } from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

import { DataMeshWorkflowRole } from './data-mesh-workflow-role';
import { S3CrossAccount } from '../s3-cross-account';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

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
 * * A data lake with multiple layers (Raw, Cleaned, Transformed) using {@link DataLakeStorage} construct
 * * An mazon EventBridge Event Bus and Rules to enable Central Governance account to send events to Data Domain account
 * * An AWS Secret Manager secret encrypted via AWS KMS and used to share references with the central governance account
 * * A Data Domain Workflow {@link DataDomainWorkflow} responsible for creating resources in the data domain via a Step Functions state machine
 * * An optional Crawler workflow {@link DataDomainCrawler} responsible for updating the data product schema after registration via a Step Functions state machine
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
 * new DataDomain(stack, 'myDataDomain', {
 *  centralAccountId: '1234567891011',
 *  crawlerWorkflow: true,
 * });
 * ```
 */
export class DataDomain extends Construct {

  public static readonly DATA_PRODUCTS_PREFIX: string = 'data-products';
  public static readonly DOMAIN_CONFIG_SECRET: string = 'domain-config';

  public readonly dataLake: DataLakeStorage;


  /**
   * Construct a new instance of DataDomain.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataDomainProps} props the DataDomainProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataDomainPros) {
    super(scope, id);

    // The data lake used by the Data Domain
    this.dataLake = new DataLakeStorage(this, 'dataLakeStorage');

    // Using the Bucket object and not the IBucket because CDK needs to change the bucket policy
    // KMS key is automatically discovered from the Bucket object and key policy is updated
    new S3CrossAccount(this, 'DataProductsPathCrossAccount', {
      accountId: props.centralAccountId,
      s3Bucket: this.dataLake.cleanBucket,
      s3ObjectKey: DataDomain.DATA_PRODUCTS_PREFIX,
    })

    // Workflow role used by the state machine
    const workflowRole = new DataMeshWorkflowRole(this, 'WorkflowRole');

    // Event Bridge event bus for data domain account
    const eventBus = new EventBus(this, 'dataDomainEventBus', {
      eventBusName: 'data-mesh-bus',
    });
    eventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // Cross-account policy to allow the central account to send events to data domain's bus
    const crossAccountBusPolicy = new CfnEventBusPolicy(this, 'crossAccountBusPolicy', {
      eventBusName: eventBus.eventBusName,
      statementId: 'AllowCentralAccountToPutEvents',
      action: 'events:PutEvents',
      principal: props.centralAccountId,
    });
    crossAccountBusPolicy.node.addDependency(eventBus);

    const dataDomainWorkflow = new DataDomainWorkflow(this, 'DataDomainWorkflow', {
      workflowRole: workflowRole.role,
      centralAccountId: props.centralAccountId,
      eventBus: eventBus,
    });

    // Event Bridge Rule to trigger this worklfow upon event from the central account
    const rule = new Rule(this, 'DataDomainRule', {
      eventPattern: {
        source: ['com.central.stepfunction'],
        account: [props.centralAccountId],
        detailType: [`${Aws.ACCOUNT_ID}_createResourceLinks`],
      },
      eventBus: eventBus,
    });

    rule.applyRemovalPolicy(RemovalPolicy.DESTROY);
    rule.addTarget(new targets.SfnStateMachine(dataDomainWorkflow.stateMachine));
    rule.node.addDependency(eventBus);

    // Allow the workflow role to send events to data domain event bus
    workflowRole.role.attachInlinePolicy(new Policy(this, 'SendEvents', {
      statements: [
        new PolicyStatement({
          actions: ['events:Put*'],
          resources: [eventBus.eventBusArn],
        }),
      ],
    }));

    // create a workflow to update data products schemas on registration
    if (props.crawlerWorkflow) {
      const workflow = new DataDomainCrawler(this, 'DataDomainCrawler', {
        workflowRole: workflowRole.role,
        dataProductsBucket: this.dataLake.cleanBucket,
        dataProductsPrefix: DataDomain.DATA_PRODUCTS_PREFIX
      });

      // add a rule to trigger the workflow from the event bus
      const crawlerRule = new Rule(this, 'TriggerUpdateTableSchemasRule', {
        eventBus: eventBus,
        targets: [
          workflow.stateMachine,
        ],
        eventPattern: {
          source: ['com.central.stepfunction'],
          detailType: ['triggerCrawler'],
        }
      });
      crawlerRule.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }

    // create the data domain configuration object (in JSON) to be passed to the central governance account 
    var secretObject = {
      BucketName: SecretValue.unsafePlainText(this.dataLake.cleanBucket.bucketName),
      Prefix: SecretValue.unsafePlainText(DataDomain.DATA_PRODUCTS_PREFIX),
      EventBusName: SecretValue.unsafePlainText(eventBus.eventBusName),
    }

    // if the data product bucket is encrypted, add the key ID
    if (this.dataLake.cleanBucket.encryptionKey) {
      secretObject =  { 
        ...secretObject,
        ...{ KmsKeyId: SecretValue.unsafePlainText(this.dataLake.cleanBucket.encryptionKey.keyId) }
      };
    }

    const centralGovAccount = new AccountPrincipal(props.centralAccountId);
    // create a KMS key for encrypting the secret. It's required for cross account secret access
    const secretKey = new Key(this, 'SecretKey', {
      removalPolicy: RemovalPolicy.DESTROY,
    });
    secretKey.grantDecrypt(centralGovAccount);
    
    // create the secret containing the data domain configuration object
    const domainConfigSecret = new Secret(this, 'DomainBucketSecret',{
      secretObjectValue: secretObject,
      secretName: DataDomain.DOMAIN_CONFIG_SECRET,
      encryptionKey: secretKey,
    })
    domainConfigSecret.grantRead(centralGovAccount);

    // output the full ARN of the secret to be passed when registring the data domain
    new CfnOutput(this, 'DomainSecretArnOutput', {
      value: domainConfigSecret.secretArn,
    })
  }
}

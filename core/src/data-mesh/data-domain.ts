// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import { Aws, Duration, CfnOutput, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import { Policy, PolicyStatement, AccountPrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { CfnEventBusPolicy, Rule, EventBus } from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { PreBundledFunction } from '../common/pre-bundled-function';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

import { CentralGovernance, LfAccessControlMode, LfAccessControlMode as mode } from './central-governance';
import { DataLakeStorage } from '../data-lake-storage';
import { DataDomainNracWorkflow } from './data-domain-nrac-workflow';
import { DataDomainTbacWorkflow } from './data-domain-tbac-workflow';
import { DataDomainCrawler } from './data-domain-crawler';
import { DataMeshWorkflowRole } from './data-mesh-workflow-role';
import { LakeFormationAdmin } from '../lake-formation';
import { S3CrossAccount } from '../s3-cross-account';


/**
 * Properties for the DataDomain Construct
 */
export interface DataDomainProps {
  /**
  * Data domain name
  */
  readonly domainName: string;

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
 *  domainName: 'domainName'
 * });
 * ```
 */
export class DataDomain extends Construct {

  public static readonly DATA_PRODUCTS_PREFIX: string = 'data-products';
  public static readonly DOMAIN_CONFIG_SECRET: string = 'domain-config';
  public static readonly DOMAIN_BUS_NAME: string = 'data-mesh-bus';
  public readonly centralAccountId: string;
  public readonly eventBus: EventBus;
  public readonly dataLake: DataLakeStorage;


  /**
   * Construct a new instance of DataDomain.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataDomainProps} props the DataDomainProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataDomainProps) {
    super(scope, id);

    // The data lake used by the Data Domain
    this.dataLake = new DataLakeStorage(this, 'dataLakeStorage');
    this.centralAccountId = props.centralAccountId;

    // Add CDK execution role to LF admins
    LakeFormationAdmin.addCdkExecRole(scope, 'CdkLfAdmin');

    // Using the Bucket object and not the IBucket because CDK needs to change the bucket policy
    // KMS key is automatically discovered from the Bucket object and key policy is updated
    new S3CrossAccount(this, 'DataProductsPathCrossAccount', {
      accountId: this.centralAccountId,
      s3Bucket: this.dataLake.cleanBucket,
      s3ObjectKey: DataDomain.DATA_PRODUCTS_PREFIX,
    })

    // Workflow role used by state machine workflows
    const workflowRole = new DataMeshWorkflowRole(this, 'WorkflowRole');

    // Event Bridge event bus for data domain account
    this.eventBus = new EventBus(this, 'dataDomainEventBus', {
      eventBusName: DataDomain.DOMAIN_BUS_NAME,
    });
    this.eventBus.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // Cross-account policy to allow the central account to send events to data domain's bus
    const crossAccountBusPolicy = new CfnEventBusPolicy(this, 'crossAccountBusPolicy', {
      eventBusName: this.eventBus.eventBusName,
      statementId: 'AllowCentralAccountToPutEvents',
      action: 'events:PutEvents',
      principal: this.centralAccountId,
    });
    crossAccountBusPolicy.node.addDependency(this.eventBus);

    // Create NRAC workflow
    const nracWorkflow = new DataDomainNracWorkflow(this, 'nracWorkflow', {
      workflowRole: workflowRole.role,
      centralAccountId: this.centralAccountId,
      eventBus: this.eventBus,
    });

    // Event Bridge Rule to trigger NRAC worklfow upon event from the central account
    this.addBusRule('NRAC', mode.NRAC, nracWorkflow.stateMachine);

    // Create TBAC workflow
    const tbacWorkflow = new DataDomainTbacWorkflow(this, 'tbacWorkflow', {
      domainName: props.domainName,
      workflowRole: workflowRole.role,
      centralAccountId: this.centralAccountId,
      eventBus: this.eventBus,
    });

    // Event Bridge Rule to trigger NRAC worklfow upon event from the central account
    this.addBusRule('TBAC', mode.TBAC, tbacWorkflow.stateMachine);

    // Allow the workflow role to send events to data domain event bus
    workflowRole.role.attachInlinePolicy(new Policy(this, 'SendEvents', {
      statements: [
        new PolicyStatement({
          actions: ['events:Put*'],
          resources: [this.eventBus.eventBusArn],
        }),
      ],
    }));

    // create a workflow to update data products schemas on registration
    if (props.crawlerWorkflow) {
      const crawlerWorkflow = new DataDomainCrawler(this, 'DataDomainCrawler', {
        domainName: props.domainName,
        workflowRole: workflowRole.role,
        dataProductsBucket: this.dataLake.cleanBucket,
        dataProductsPrefix: DataDomain.DATA_PRODUCTS_PREFIX,
      });

      // AWS Lambda function responsible to grant permissions on AWS Lake Formation tag to crawler role
      const tagPermissionsFn = new PreBundledFunction(this, 'TagPermissionsFn', {
        runtime: Runtime.PYTHON_3_9,
        codePath: 'data-mesh/resources/lambdas/crawler-tag-permission',
        handler: 'lambda.handler',
        logRetention: RetentionDays.ONE_DAY,
        timeout: Duration.seconds(20),
        role: workflowRole.role,
        environment: {
          'CRAWLER_ROLE_ARN': crawlerWorkflow.crawlerRole.roleArn,
          'CENTRAL_CATALOG_ID': props.centralAccountId,
          'TAG_KEY': CentralGovernance.DOMAIN_TAG_KEY,
          'DOMAIN_TAG_VALUE': props.domainName,
        }
      });

      // add a rule to trigger the workflow from the event bus
      const triggerCrawlerRule = new Rule(this, 'TriggerCrawler', {
        eventBus: this.eventBus,
        targets: [
          crawlerWorkflow.stateMachine,
        ],
        eventPattern: {
          source: ['com.central.stepfunction'],
          detailType: ['triggerCrawler'],
        }
      });
      triggerCrawlerRule.applyRemovalPolicy(RemovalPolicy.DESTROY);

      // add a rule to trigger the workflow from the event bus
      const grantCrawlerPermissionRule = new Rule(this, 'grantCrawlerPermission', {
        eventBus: this.eventBus,
        targets: [
          new targets.LambdaFunction(tagPermissionsFn),
        ],
        eventPattern: {
          source: ['com.central.stepfunction'],
          detailType: ['grantCrawlerPermission'],
        }
      });
      grantCrawlerPermissionRule.applyRemovalPolicy(RemovalPolicy.DESTROY);
      // allow grantCrawlerPermissionRule to invoke Lambda fn
      targets.addLambdaPermission(grantCrawlerPermissionRule, tagPermissionsFn);
    }

    // create the data domain configuration object (in JSON) to be passed to the central governance account 
    var secretObject = {
      DomainName: SecretValue.unsafePlainText(props.domainName),
      BucketName: SecretValue.unsafePlainText(this.dataLake.cleanBucket.bucketName),
      Prefix: SecretValue.unsafePlainText(DataDomain.DATA_PRODUCTS_PREFIX),
    }

    // if the data product bucket is encrypted, add the key ID
    if (this.dataLake.cleanBucket.encryptionKey) {
      secretObject = {
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
    const domainConfigSecret = new Secret(this, 'DomainBucketSecret', {
      secretObjectValue: secretObject,
      secretName: DataDomain.DOMAIN_CONFIG_SECRET,
      encryptionKey: secretKey,
    })
    domainConfigSecret.grantRead(centralGovAccount);

    // output the full ARN of the secret to be passed when registring the data domain
    new CfnOutput(this, 'DomainSecretArnOutput', {
      value: domainConfigSecret.secretArn,
      exportName: `${Aws.ACCOUNT_ID}SecretArn`,
    })
  }

  public addBusRule(id: string, mode: LfAccessControlMode, workflow: StateMachine) {
    // Create a Rule in Data Domain Event Bus
    const rule = new Rule(this, `${id}Rule`, {
      eventPattern: {
        source: ['com.central.stepfunction'],
        account: [this.centralAccountId],
        detailType: [`${Aws.ACCOUNT_ID}_createResourceLinks`],
        detail: {
          'lf_access_mode': [mode],
        },
      },
      eventBus: this.eventBus,
    });
    rule.node.addDependency(this.eventBus);
    rule.applyRemovalPolicy(RemovalPolicy.DESTROY);
    // Add target for this Rule
    rule.addTarget(new targets.SfnStateMachine(workflow));
  }
}

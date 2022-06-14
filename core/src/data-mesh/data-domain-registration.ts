// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Aws, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnEventBusPolicy, Rule, EventBus } from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

/**
 * Properties for the DataDomainRegistration Construct
 */
export interface DataDomainRegistrationProps {
  /**
  * Data Domain Account Id
  */
  readonly dataDomainAccountId: string;
}

/**
 * This CDK Construct registers a new Data Domain account in Central Governance account.
 * It does that by creating a cross-account policy for Amazon EventBridge Event Bus to 
 * enable Data Domain to send events to Central Gov. account. It also creates a Rule to forward events to target Data Domain account.
 * Each Data Domain account {@link DataDomain} has to be registered in Central Gov. account before it can participate in a mesh.
 * 
 * Usage example:
 * ```typescript
 * import { App, Stack } from 'aws-cdk-lib';
 * import { Role } from 'aws-cdk-lib/aws-iam';
 * import { DataDomainRegistration } from 'aws-analytics-reference-architecture';
 * 
 * const exampleApp = new App();
 * const stack = new Stack(exampleApp, 'DataProductStack');
 * 
 * new DataDomainRegistration(stack, 'registerDataDomain', {
 *  dataDomainAccountId: "1234567891011",
 * });
 * ```
 * 
 */
export class DataDomainRegistration extends Construct {
  /**
   * Construct a new instance of DataDomainRegistration.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {DataDomainRegistrationProps} props the DataDomainRegistrationProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: DataDomainRegistrationProps) {
    super(scope, id);

    const eventBusName = `${Aws.ACCOUNT_ID}_centralEventBus`;
    const eventBus = EventBus.fromEventBusName(this, 'dataDomainEventBus', eventBusName);
    const dataDomainBusArn = `arn:aws:events:${Aws.REGION}:${props.dataDomainAccountId}`
      + `:event-bus/${props.dataDomainAccountId}_dataDomainEventBus`;

    // Cross-account policy to allow Data Domain account to send events to Central Gov. account event bus
    new CfnEventBusPolicy(this, 'Policy', {
      eventBusName: eventBusName,
      statementId: `AllowDataDomainAccToPutEvents_${props.dataDomainAccountId}`,
      action: 'events:PutEvents',
      principal: props.dataDomainAccountId,
    });

    // Event Bridge Rule to trigger createResourceLinks workflow in target Data Domain account
    const rule = new Rule(this, 'Rule', {
      eventPattern: {
        source: ['com.central.stepfunction'],
        detailType: [`${props.dataDomainAccountId}_createResourceLinks`],
      },
      eventBus,
    });

    rule.addTarget(new targets.EventBus(
      EventBus.fromEventBusArn(
        this,
        'DomainEventBus',
        dataDomainBusArn
      )),
    );
    rule.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }
}

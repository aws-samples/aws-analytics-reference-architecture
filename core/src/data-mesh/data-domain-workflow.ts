import { IRole } from 'aws-cdk-lib/aws-iam';
import { IEventBus } from 'aws-cdk-lib/aws-events';

/**
 * Properties for the Data Domain workflows constructs
 */
export interface DataDomainWorkflow {
  /**
  * Central Governance account Id
  */
  readonly centralAccountId: string;

  /**
  * Data domain name
  */
  readonly domainName?: string;

  /**
  * Event Bus in Data Domain
  */
  readonly eventBus: IEventBus;

  /**
  * Lake Formation admin role
  */
  readonly workflowRole: IRole;
}
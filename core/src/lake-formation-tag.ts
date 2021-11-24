import * as cdk from '@aws-cdk/core';
import { Aws, Tag } from '@aws-cdk/core';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from '@aws-cdk/custom-resources';
import * as logs from '@aws-cdk/aws-logs';
import { Column, Database } from '@aws-cdk/aws-glue';
import { Table } from 'aws-sdk/clients/glue';

export interface LakeFormationTagProps {
    /**
     * The key value of the AWS Lake Formation tag
     */
    readonly key: string;
    /**
     * The list of values of the AWS Lake Formation tag
     */
    readonly values: string[];
    /**
     * The catalog ID to create the tag in
     */
    readonly catalogId: string;

}

export class LakeFormationTag extends cdk.Construct {

  private catalogId: string;
  
  constructor(scope: cdk.Construct, id: string, props: LakeFormationTagProps) {
    super(scope, id);

    this.catalogId = props.catalogId;
    
    // TODO least privilege for CR

    const currentLfTagCr = new AwsCustomResource(this, 'getCurrentLfTag', {
      logRetention: logs.RetentionDays.ONE_DAY,
      onUpdate: {
        action: 'getLFTag',
        service: 'LakeFormation',
        parameters: {
          TagKey: props.key,
          CatalogId: props.catalogId,
        }
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({resources: AwsCustomResourcePolicy.ANY_RESOURCE}),
    });
    const currentValues = currentLfTagCr.getResponseField('TagValues');

    new AwsCustomResource(this, 'createLfTag', {
      logRetention: logs.RetentionDays.ONE_DAY,
      onCreate: {
        action: 'createLFTag',
        service: 'LakeFormation',
        parameters: {
          TagKey: props.key,
          CatalogId: props.catalogId,
          TagsValues: props.values,
        },
        physicalResourceId: PhysicalResourceId.of(props.catalogId + props.key),        
      },
      onUpdate: {
        action: 'updateLFTag',
        service: 'LakeFormation',
        parameters: {
          TagKey: props.key,
          CatalogId: props.catalogId,
          TagValuesToDelete: currentValues,
          TagsValuesToAdd: props.values,
        },
        physicalResourceId: PhysicalResourceId.of(props.catalogId + props.key),
      },
      onDelete: {
        action: 'deleteLFTag',
        service: 'LakeFormation',
        parameters: {
          TagKey: props.key,
          CatalogId: props.catalogId,        }
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({resources: AwsCustomResourcePolicy.ANY_RESOURCE}),
    });
  }

  /**
   * tagResource
   */
  public tagResource(resource: Database | Table | Column ) {
    new AwsCustomResource(this, 'lfTagResource', {
      logRetention: logs.RetentionDays.ONE_DAY,
      onCreate: {
        action: 'addLFTagToResource',
        service: 'LakeFormation',
        parameters: {
          TagKey: props.key,
          CatalogId: props.catalogId,
          TagsValues: props.values,
        },
        physicalResourceId: PhysicalResourceId.of(),        
      },
      onUpdate: {
        action: 'updateLFTag',
        service: 'LakeFormation',
        parameters: {
          TagKey: props.key,
          CatalogId: props.catalogId,
          TagValuesToDelete: currentValues,
          TagsValuesToAdd: props.values,
        },
        physicalResourceId: PhysicalResourceId.of(),
      },
      onDelete: {
        action: 'deleteLFTag',
        service: 'LakeFormation',
        parameters: {
          TagKey: props.key,
          CatalogId: props.catalogId,        }
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({resources: AwsCustomResourcePolicy.ANY_RESOURCE}),
    });
  }
}
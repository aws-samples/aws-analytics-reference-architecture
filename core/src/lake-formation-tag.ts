import { Column, Database, Table } from '@aws-cdk/aws-glue';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from '@aws-cdk/custom-resources';

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

  public catalogId: string;
  public key: string;
  public values: string[];

  constructor(scope: cdk.Construct, id: string, props: LakeFormationTagProps) {
    super(scope, id);

    this.catalogId = props.catalogId;
    this.key = props.key;
    this.values = props.values;

    // TODO least privilege for CR

    const currentLfTagCr = new AwsCustomResource(this, `${id}getCurrentLfTag`, {
      logRetention: logs.RetentionDays.ONE_DAY,
      onUpdate: {
        action: 'getLFTag',
        service: 'LakeFormation',
        parameters: {
          TagKey: props.key,
          CatalogId: props.catalogId,
        },
        physicalResourceId: PhysicalResourceId.of(props.catalogId + props.key + 'Current'),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
    });
    const currentValues = currentLfTagCr.getResponseField('TagValues');

    new AwsCustomResource(this, `${id}createLfTag`, {
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
          CatalogId: props.catalogId,
        },
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
    });
  }

  /**
    * Add AWS Lake Formation tags to the provided resource
    * @param {Database} database The AWS Glue Database object of the resource
    * @param {String[]} values The list of tag values to apply to tag
    * @param {Table} table The AWS Glue Table object of the resource to tag
    * @param {Column} column The AWS Glue Column definition of the resource to tag
    * @access public
    */
  public tagResource(database: Database, values: string[], table?: Table, column?: Column) {
    // TODO check if values are part of the tag

    // Build the resource unique name depending on which kind of resource needs to be tagged
    const resource = database.node.id + (table ? table.node.id : '') + (column ? column.name: '');
    // Build the resource object based on provided parameters (database or table or column)
    var resourceObject: {
      TableWithColumns?: {
        CatalogId: string;
        DatabaseName: string;
        Name: string;
        ColumnNames: string[];
      };
      Table?: {
        CatalogId: string;
        DatabaseName: string;
        Name: string;
      };
      Database?: {
        CatalogId: string;
        Name: string;
      };
    };

    if (column && table ) {
      // Resource is a column
      resourceObject = {
        TableWithColumns: {
          CatalogId: this.catalogId,
          DatabaseName: database.databaseName,
          Name: table.tableName,
          ColumnNames: [
            column.name,
          ],
        },
      };
    } else if (table && !column) {
      // Resource is a table
      resourceObject = {
        Table: {
          CatalogId: this.catalogId,
          DatabaseName: database.databaseName,
          Name: table.tableName,
        },
      };
    } else if (!table && !column) {
      // Resource is a database
      resourceObject = {
        Database: {
          CatalogId: this.catalogId,
          Name: database.databaseName,
        },
      };
    }

    // Iterate over tag values and create one custom resource per value
    values.forEach( value => {
      // Build a unique AWS CDK resource ID to trigger create or delete event in AWS CloudFormation
      const id = resource + this.key + value;

      new AwsCustomResource(this, `${id}TagResource`, {
        logRetention: logs.RetentionDays.ONE_DAY,
        onCreate: {
          action: 'addLFTagsToResource',
          service: 'LakeFormation',
          parameters: {
            LFTags: [
              {
                CatalogId: this.catalogId,
                TagKey: this.key,
                TagsValues: value,
              },
            ],
            Resource: resourceObject,
          },
          physicalResourceId: PhysicalResourceId.of(id),
        },
        onDelete: {
          action: 'removeLFTagsFromResource',
          service: 'LakeFormation',
          parameters: {
            LFTags: [
              {
                CatalogId: this.catalogId,
                TagKey: this.key,
                TagsValues: value,
              },
            ],
            Resource: resourceObject,
          },
        },
        policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
      });
    });
  }

  /**
    * Share tag resources
    */
  public shareTag(values: string[], accountId: string) {
    values.forEach( value => {
      // Build a unique AWS CDK resource ID to trigger create or delete event in AWS CloudFormation
      const id = accountId + this.key + value;
      new AwsCustomResource(this, `${id}ShareTag`, {
        logRetention: logs.RetentionDays.ONE_DAY,
        onCreate: {
          action: 'grantPermissions',
          service: 'LakeFormation',
          parameters: {
            Permissions: ['DESCRIBE_TAG', 'ASSOCIATE_TAG'],
            PermissionsWithGrantOption: ['DESCRIBE_TAG', 'ASSOCIATE_TAG'],
            Principal: {
              DataLakePrincipalIdentifier: accountId,
            },
            Resource: {
              LFTag: {
                CatalogId: this.catalogId,
                TagKey: this.key,
                TagValues: [value],
              },
            },
          },
          physicalResourceId: PhysicalResourceId.of(id),
        },
        onDelete: {
          action: 'revokePermissions',
          service: 'LakeFormation',
          parameters: {
            Permissions: ['DESCRIBE_TAG', 'ASSOCIATE_TAG'],
            PermissionsWithGrantOption: ['DESCRIBE_TAG', 'ASSOCIATE_TAG'],
            Principal: {
              DataLakePrincipalIdentifier: accountId,
            },
            Resource: {
              LFTag: {
                CatalogId: this.catalogId,
                TagKey: this.key,
                TagValues: [value],
              },
            },
          },
          physicalResourceId: PhysicalResourceId.of(id),
        },
        policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
      });
    });
  }
}
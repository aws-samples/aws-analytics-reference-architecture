// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Column, Database, Table } from '@aws-cdk/aws-glue';
import { Role, User } from '@aws-cdk/aws-iam';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from '@aws-cdk/custom-resources';
import { LakeFormationTag } from './lake-formation-tag';
import { Catalog } from './lake-formation-types';

export interface LakeFormationPermissionProps {
  /**
   * The resource to grant permissions. It can be an AWS Lake Formation Catalog, an AWS Glue Database, AWS Glue Table, AWS Glue Column, an AWS Lake Formation tag
   */
  readonly resource: Catalog | Database | Table | Column | LakeFormationTag;
  /**
   * The list of permissions to provide.
   * Possible values are ALL, SELECT, ALTER, DROP, DELETE, INSERT, DESCRIBE, CREATE_DATABASE, CREATE_TABLE, DATA_LOCATION_ACCESS,
   * CREATE_TAG, ALTER_TAG, DELETE_TAG, DESCRIBE_TAG, ASSOCIATE_TAG
   */
  readonly permissions: string[];
  /**
   * The list of grantable permissions to provide.
   * Possible values are ALL, SELECT, ALTER, DROP, DELETE, INSERT, DESCRIBE, CREATE_DATABASE, CREATE_TABLE, DATA_LOCATION_ACCESS,
   * CREATE_TAG, ALTER_TAG, DELETE_TAG, DESCRIBE_TAG, ASSOCIATE_TAG
   */
  readonly grantablePermissions: string[];
  /**
   * The principal to grant permissions. An Amazon IAM User or Role
   */
  readonly principal: Role | User;
}

export class LakeFormationPermission extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: LakeFormationPermissionProps) {
    super(scope, id);

    // Check if the principal is an Amazon IAM Role or User and extract the arn
    const principalArn = (props.principal as Role).roleArn ? (props.principal as Role).roleArn : (props.principal as User).userArn;

    new AwsCustomResource(this, 'Grant', {
      logRetention: logs.RetentionDays.ONE_DAY,
      onCreate: {
        action: 'grantPermissions',
        service: 'LakeFormation',
        parameters: {
          Permissions: props.permissions,
          PermissionsWithGrantOption: props.grantablePermissions,
          Principal: {
            DataLakePrincipalIdentifier: principalArn,
          },
          Resource: props.resource,
        },
        physicalResourceId: PhysicalResourceId.of(id),
      },
      onDelete: {
        action: 'revokePermissions',
        service: 'LakeFormation',
        parameters: {
          Permissions: props.permissions,
          PermissionsWithGrantOption: props.grantablePermissions ? props.grantablePermissions : undefined,
          Principal: {
            DataLakePrincipalIdentifier: principalArn,
          },
          Resource: props.resource,
        },
        physicalResourceId: PhysicalResourceId.of(id),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
    });
  }
}
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as assertCDK from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import { Database, DataFormat, Table } from '@aws-cdk/aws-glue';
import { Aws, Stack } from '@aws-cdk/core';
import { LakeFormationTag } from '../src/lake-formation-tag';

test('LakeFormationTag creation', () => {
const lfTagStack = new Stack();
const tag = new LakeFormationTag(lfTagStack, 'lfTagTest', {
  catalogId: Aws.ACCOUNT_ID,
  key: 'testKey',
  values: ['testValue1', 'testValue2'],
});

const database = new Database(lfTagStack, 'testDb', {
  databaseName: 'test_db',
});

const table = new Table(lfTagStack, 'testTable', {
  tableName: 'test_table',
  database: database,
  dataFormat: DataFormat.CSV,
  columns: [
    {
      name: 'test',
      type: {
        isPrimitive: true,
        inputString: 'string',
      },
    },
  ],
});

tag.tagResource(database, ['A', 'B'], table, { name: 'test', type: { isPrimitive: true, inputString: 'string' } });

  // THEN
  // expect(lfTagStack).toCountResources('Custom::AWSCDK-EKS-Cluster', 1);

  assertCDK.expect(lfTagStack).to(
    assertCDK.haveResource('Custom::AWSCDK-EKS-Cluster', {
      Config: assertCDK.objectLike({
        version: '1.20',
        name: 'emr-eks-cluster',
      }),
    }),
  );
});


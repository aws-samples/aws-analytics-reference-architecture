// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// import { Role } from '@aws-cdk/aws-iam';
// import { Database, Table, DataFormat } from '@aws-cdk/aws-glue';
import { Role } from '@aws-cdk/aws-iam';
import { App, Stack } from '@aws-cdk/core';
import { LakeFormationAdmin } from '.';

const mockApp = new App();
const lfStack = new Stack(mockApp, 'stack');

new LakeFormationAdmin(lfStack, 'testAdmin', {
  principal: Role.fromRoleArn(lfStack, 'myRole', 'arn:aws:iam::xxxxxxxxxx:role/yyyyyyyyyy'),
});
// const tag = new LakeFormationTag(lfTagStack, 'lfTagTest', {
//   catalogId: Aws.ACCOUNT_ID,
//   key: 'testKey',
//   values: ['testValue1', 'testValue2'],
// });

// const database = new Database(lfTagStack, 'testDb', {
//   databaseName: 'test_db',
// });

// const column = {
//   name: 'test',
//   type: {
//     isPrimitive: true,
//     inputString: 'string',
//   },
// };

// const table = new Table(lfTagStack, 'testTable', {
//   tableName: 'test_table',
//   database: database,
//   dataFormat: DataFormat.CSV,
//   columns: [
//     column,
//   ],
// });

// tag.tagResource(database, ['testValue1', 'testValue2'], table, column );

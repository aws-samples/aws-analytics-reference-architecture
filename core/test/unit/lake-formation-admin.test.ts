// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests singleton glue default role
 *
 * @group unit/lake-formation-admin
 */

 import { Template } from 'aws-cdk-lib/assertions';
import { User } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';
import { LakeFormationAdmin } from '../../src/lake-formation/lake-formation-admin';

describe ('LakeFormationAdmin', () => {
  const lfAdminStack = new Stack();
  const adminUser = new User(lfAdminStack, 'principalUser');
  new LakeFormationAdmin(lfAdminStack, 'lfTagTest', {
    principal: adminUser,
  });

  const template = Template.fromStack(lfAdminStack);

  test('LakeFormationTag contains the right number of AWS CDK resources', () => {

    // THEN
    template.resourceCountIs('AWS::IAM::Policy', 3);
  });

  // test('LakeFormationTag should contains an Amazon IAM policy for getting tags', () => {
  //   template.hasResourceProperties( 'AWS::IAM::Policy',
  //     Match.objectLike({
  //       PolicyDocument: {
  //         Statement: [
  //           {
  //             Action: [
  //               'lakeformation:getDataLakeSettings',
  //               'lakeformation:putDataLakeSettings',
  //             ],
  //             Effect: 'Allow',
  //             Resource: '*',
  //           },
  //         ],
  //       },
  //     }));
  // });
});
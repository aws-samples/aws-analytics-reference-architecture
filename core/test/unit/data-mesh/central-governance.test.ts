// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


/**
 * Tests DataDomain construct
 *
 * @group unit/central-governance
 */

import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CentralGovernance } from '../../../src';

describe('CentralGovTests', () => {

  const centralGovernanceStack = new Stack();

  new CentralGovernance(centralGovernanceStack, 'CentralGovernance');

  const template = Template.fromStack(centralGovernanceStack);
  // console.log(JSON.stringify(template.toJSON(), null, 2));

  test('should provision the proper event bus', () => {
    template.hasResource('AWS::Events::EventBus',
      Match.objectLike({
        "Properties": {
          "Name": Match.anyValue()
        },
        "UpdateReplacePolicy": "Delete",
        "DeletionPolicy": "Delete"
      })
    );
  });

  test('should provision 1 state machine', () => {
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1)
  });

  test('should provision the proper send events policy', () => {
    template.hasResourceProperties('AWS::IAM::Policy',
      Match.objectLike({
        "PolicyDocument": {
          "Statement": [
            {
              "Action": "events:Put*",
              "Effect": "Allow",
              "Resource": {
                "Fn::GetAtt": [
                  Match.anyValue(),
                  "Arn"
                ]
              }
            }
          ],
        },
      })
    );
  });

  test('should provision the proper state machine log group', () => {
    template.hasResource('AWS::Logs::LogGroup',
      Match.objectLike({
        "Properties": {
          "RetentionInDays": 7
        },
        "UpdateReplacePolicy": "Delete",
        "DeletionPolicy": "Delete"
      })
    );
  });
});
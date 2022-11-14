// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


/**
 * Tests DataDomainNracWorkflow construct
 *
 * @group unit/data-domain-nrac-workflow
 */

import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { CompositePrincipal, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { DataDomainNracWorkflow } from '../../../src/data-mesh/data-domain-nrac-workflow';

describe('DataDomainNracWorkflowTests', () => {

  const dataDomainNracWorkflowStack = new Stack();

  const workflowRole = new Role(dataDomainNracWorkflowStack, 'WorkflowRole', {
    assumedBy: new CompositePrincipal(
      new ServicePrincipal('states.amazonaws.com'),
    ),
  });

  const eventBus = new EventBus(dataDomainNracWorkflowStack, 'dataDomainEventBus', {
    eventBusName: 'data-mesh-bus',
  });

  new DataDomainNracWorkflow(dataDomainNracWorkflowStack, 'DataDomainNracWorflow', {
    workflowRole: workflowRole,
    centralAccountId: '11111111111111',
    domainName: 'Data1Domain',
    eventBus,
  });

  const template = Template.fromStack(dataDomainNracWorkflowStack);
  // console.log(JSON.stringify(template.toJSON(),null, 2));

  test('should provision the proper workflow log group', () => {
    template.hasResource('AWS::Logs::LogGroup',
      Match.objectLike({
        Properties: {
          RetentionInDays: 7
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete"
      })
    )
  });

  test('should provision 1 state machine', () => {
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1)
  });

  test('should provision the proper workflow role default policy', () => {
    template.hasResourceProperties('AWS::IAM::Policy',
      Match.objectLike({
        PolicyDocument: {
          Statement: [
            {
              Action: [
                "logs:CreateLogDelivery",
                "logs:GetLogDelivery",
                "logs:UpdateLogDelivery",
                "logs:DeleteLogDelivery",
                "logs:ListLogDeliveries",
                "logs:PutResourcePolicy",
                "logs:DescribeResourcePolicies",
                "logs:DescribeLogGroups"
              ],
              Effect: "Allow",
              Resource: "*"
            },
            {
              Action: "ram:getResourceShareInvitations",
              Effect: "Allow",
              Resource: "*"
            },
            {
              Action: "glue:createDatabase",
              Effect: "Allow",
              Resource: "*"
            },
            {
              Action: "lakeformation:grantPermissions",
              Effect: "Allow",
              Resource: "*"
            },
            {
              Action: "events:PutEvents",
              Effect: "Allow",
              Resource: Match.anyValue()
            },
            {
              Action: "glue:createTable",
              Effect: "Allow",
              Resource: "*"
            },
            {
              Action: "ram:acceptResourceShareInvitation",
              Effect: "Allow",
              Resource: "*"
            }
          ]
        }
      })
    );
  });
});
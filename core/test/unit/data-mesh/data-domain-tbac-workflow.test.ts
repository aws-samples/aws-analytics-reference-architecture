// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


/**
 * Tests DataDomainTbacWorkflow construct
 *
 * @group unit/data-domain-tbac-workflow
 */

import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { CompositePrincipal, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { DataDomainTbacWorkflow } from '../../../src/data-mesh/data-domain-tbac-workflow';

describe('DataDomainTbacWorkflow', () => {

  const dataDomainTbacWorkflow = new Stack();

  const workflowRole = new Role(dataDomainTbacWorkflow, 'WorkflowRole', {
    assumedBy: new CompositePrincipal(
      new ServicePrincipal('states.amazonaws.com'),
    ),
  });

  const eventBus = new EventBus(dataDomainTbacWorkflow, 'dataDomainEventBus', {
    eventBusName: 'data-mesh-bus',
  });

  new DataDomainTbacWorkflow(dataDomainTbacWorkflow, 'DataDomainWorflow', {
    workflowRole: workflowRole,
    centralAccountId: '11111111111111',
    domainName: 'Data1Domain',
    eventBus: eventBus,
  });

  const template = Template.fromStack(dataDomainTbacWorkflow);
  // console.log(JSON.stringify(template.toJSON(), null, 2));

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
              Action: "glue:createDatabase",
              Effect: "Allow",
              Resource: "*"
            },
            {
              Action: "events:PutEvents",
              Effect: "Allow",
              Resource: Match.anyValue()
            },
          ]
        }
      })
    );
  });
});
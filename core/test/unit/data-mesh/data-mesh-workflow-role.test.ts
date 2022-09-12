// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


/**
 * Tests DataMeshWorkflowRole construct
 *
 * @group unit/data-mesh-workflow-role
 */

import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { DataMeshWorkflowRole } from '../../../src/data-mesh/data-mesh-workflow-role';

describe('DataMeshWorkflowRoleTests', () => {

  const dataMeshWorkflowRoleStack = new Stack();

  new DataMeshWorkflowRole(dataMeshWorkflowRoleStack, 'DataMeshWorkflowRole',);

  const template = Template.fromStack(dataMeshWorkflowRoleStack);
  // console.log(JSON.stringify(template.toJSON(),null, 2));

  test('should provision the proper workflow role', () => {
    template.hasResourceProperties('AWS::IAM::Role',
      Match.objectLike({
        AssumeRolePolicyDocument: {
          Statement: [
            {
              "Action": "sts:AssumeRole",
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              }
            }
          ],
        }
      })
    )
  });

  test('should provision the proper workflow role policy', () => {
    template.hasResourceProperties('AWS::IAM::ManagedPolicy',
      Match.objectLike({
        PolicyDocument: {
          Statement: [
            {
              Action: [
                "lakeformation:*",
                "glue:GetDatabase",
                "glue:GetDatabases",
                "glue:GetTable",
                "glue:GetTables",
                "glue:CreateTable",
                "glue:UpdateTable",
                "iam:GetRole"
              ],
              Effect: "Allow",
              Resource: "*"
            },
            {
              Action: "ram:CreateResourceShare",
              Condition: {
                StringLikeIfExists: {
                  "ram:RequestedResourceType": [
                    "glue:Table",
                    "glue:Database",
                    "glue:Catalog"
                  ]
                }
              },
              Effect: "Allow",
              Resource: "*"
            },
            {
              Action: [
                "ram:UpdateResourceShare",
                "ram:AssociateResourceShare",
                "ram:GetResourceShares"
              ],
              Condition: {
                StringLike: {
                  "ram:ResourceShareName": [
                    "LakeFormation*"
                  ]
                }
              },
              Effect: "Allow",
              Resource: "*"
            },
            {
              Action: [
                "glue:PutResourcePolicy",
                "ram:Get*",
                "ram:List*"
              ],
              Effect: "Allow",
              Resource: "*"
            }]
        }
      })
    );
  });

});
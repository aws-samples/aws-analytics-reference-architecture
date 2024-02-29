// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


/**
 * Tests DataDomain construct
 *
 * @group unit/data-domain-crawler
 */

import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Role, CompositePrincipal, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { DataDomainCrawler } from '../../../src/data-mesh/data-domain-crawler';

describe('DataDomainCrawlerTests', () => {

  const dataDomainCrawlerStack = new Stack();

  const workflowRole = new Role(dataDomainCrawlerStack, 'WorkflowRole', {
    assumedBy: new CompositePrincipal(
      new ServicePrincipal('states.amazonaws.com'),
    ),
  });

  const key = new Key(dataDomainCrawlerStack, 'Key');

  const bucket = new Bucket(dataDomainCrawlerStack, 'Bucket', {
    encryptionKey: key,
  });

  const eventBus = new EventBus(dataDomainCrawlerStack, 'dataDomainEventBus', {
    eventBusName: 'data-mesh-bus',
  });

  new DataDomainCrawler(dataDomainCrawlerStack, 'DataDomainCrawlerStack', {
    workflowRole: workflowRole,
    dataProductsBucket: bucket,
    dataProductsPrefix: 'test',
    domainName: 'Domain1Name',
    eventBus,
  });

  const template = Template.fromStack(dataDomainCrawlerStack);
  // console.log(JSON.stringify(template.toJSON(), null, 2));

  test('should provision the proper workflow default policy', () => {
    template.hasResourceProperties('AWS::IAM::Policy',
      Match.objectLike({
        "PolicyDocument": {
          "Statement": [
            {
              "Action": "iam:PassRole",
              "Effect": "Allow",
              "Resource": {
                "Fn::GetAtt": [
                  Match.anyValue(),
                  "Arn"
                ]
              }
            },
            {
              "Action": "lakeformation:grantPermissions",
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": "glue:createCrawler",
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": "glue:startCrawler",
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": "glue:getCrawler",
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": "events:PutEvents",
              "Effect": "Allow",
              "Resource": Match.anyValue()
            },
            {
              "Action": "glue:deleteCrawler",
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": "lakeformation:batchGrantPermissions",
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": [
                "logs:CreateLogDelivery",
                "logs:GetLogDelivery",
                "logs:UpdateLogDelivery",
                "logs:DeleteLogDelivery",
                "logs:ListLogDeliveries",
                "logs:PutResourcePolicy",
                "logs:DescribeResourcePolicies",
                "logs:DescribeLogGroups"
              ],
              "Effect": "Allow",
              "Resource": "*"
            },
          ],
        },
      })
    )
  });

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

  test('should provision the proper workflow role', () => {
    template.hasResourceProperties('AWS::IAM::Role',
      Match.objectLike({
        "AssumeRolePolicyDocument": {
          "Statement": [
            {
              "Action": "sts:AssumeRole",
              "Effect": "Allow",
              "Principal": {
                "Service": "glue.amazonaws.com"
              }
            }
          ],
        }
      })
    )
  });

  test('should provision the proper update table schema events role', () => {
    template.hasResourceProperties('AWS::IAM::Role',
      Match.objectLike({
        "AssumeRolePolicyDocument": {
          "Statement": [
            {
              "Action": "sts:AssumeRole",
              "Effect": "Allow",
              "Principal": {
                "Service": "events.amazonaws.com"
              }
            }
          ],
        }
      })
    )
  });

  test('should provision the proper update table schema events role policy', () => {
    template.hasResourceProperties('AWS::IAM::Policy',
      Match.objectLike({
        "PolicyDocument": {
          "Statement": [
            {
              "Action": "states:StartExecution",
              "Effect": "Allow",
              "Resource": {
                "Ref": "DataDomainCrawlerStackUpdateTableSchemas09AB286D"
              }
            }
          ],
        },
      })
    )
  });

  test('should provision 1 state machine', () => {
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1)
  });

  test('should provision the proper crawler S3 access policy', () => {
    template.hasResourceProperties('AWS::IAM::ManagedPolicy',
      Match.objectLike({
        "PolicyDocument": {
          "Statement": [
            {
              "Action": [
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*"
              ],
              "Effect": "Allow",
              "Resource": [
                {
                  "Fn::GetAtt": [
                    Match.anyValue(),
                    "Arn"
                  ]
                },
                {
                  "Fn::Join": [
                    "",
                    [
                      {
                        "Fn::GetAtt": [
                          Match.anyValue(),
                          "Arn"
                        ]
                      },
                      "/test/*"
                    ]
                  ]
                }
              ]
            },
            {
              "Action": "glue:*",
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
              ],
              "Effect": "Allow",
              "Resource": "arn:aws:logs:*:*:/aws-glue/*"
            },
            {
              "Action": [
                "kms:Decrypt*",
                "kms:Describe*"
              ],
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
    )
  });
}); 
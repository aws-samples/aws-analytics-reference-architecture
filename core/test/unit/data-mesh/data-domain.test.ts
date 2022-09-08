// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


/**
 * Tests DataDomain construct
 *
 * @group unit/data-domain
 */

import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { DataDomain } from '../../../src';

describe('DataDomainTests', () => {

  const dataDomainStack = new Stack();

  new DataDomain(dataDomainStack, 'DataDomain', {
    domainName: 'Domain1Name',
    centralAccountId: '1234567891011',
    crawlerWorkflow: true,
  });

  const template = Template.fromStack(dataDomainStack);
  // console.log(JSON.stringify(template.toJSON(),null, 2));

  test('should provision the proper event bus', () => {
    template.hasResource('AWS::Events::EventBus',
      Match.objectLike({
        Properties: {
          Name: 'data-mesh-bus',
        },
        UpdateReplacePolicy: 'Delete',
        DeletionPolicy: 'Delete'
      }),
    );
  });

  test('should provision the proper config secret', () => {
    template.hasResource('AWS::SecretsManager::Secret',
      Match.objectLike({
        Properties: {
          Name: 'domain-config',
        },
        UpdateReplacePolicy: 'Delete',
        DeletionPolicy: 'Delete'
      }),
    );
  });

  test('should provision the proper config secret resource policy', () => {
    template.hasResourceProperties('AWS::SecretsManager::ResourcePolicy',
      Match.objectLike({
        ResourcePolicy: {
          "Statement": [
            {
              "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret"
              ],
              "Effect": "Allow",
              "Principal": {
                "AWS": {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        "Ref": "AWS::Partition"
                      },
                      ":iam::1234567891011:root"
                    ]
                  ]
                }
              },
              "Resource": {
                "Ref": Match.anyValue()
              }
            }
          ],
        }
      }),
    );
  });

  test('should provision the proper KMS key for config secret', () => {
    template.hasResource('AWS::KMS::Key',
      Match.objectLike({
        Properties: {
          KeyPolicy: {
            Statement: Match.arrayWith([
              {
                "Action": "kms:Decrypt",
                "Effect": "Allow",
                "Principal": {
                  "AWS": {
                    "Fn::Join": [
                      "",
                      [
                        "arn:",
                        {
                          "Ref": "AWS::Partition"
                        },
                        ":iam::1234567891011:root"
                      ]
                    ]
                  }
                },
                "Resource": "*"
              },
              {
                "Action": "kms:Decrypt",
                "Condition": {
                  "StringEquals": {
                    "kms:ViaService": {
                      "Fn::Join": [
                        "",
                        [
                          "secretsmanager.",
                          {
                            "Ref": "AWS::Region"
                          },
                          ".amazonaws.com"
                        ]
                      ]
                    }
                  }
                },
                "Effect": "Allow",
                "Principal": {
                  "AWS": {
                    "Fn::Join": [
                      "",
                      [
                        "arn:",
                        {
                          "Ref": "AWS::Partition"
                        },
                        ":iam::1234567891011:root"
                      ]
                    ]
                  }
                },
                "Resource": "*"
              }
            ]),
          }
        },
        "UpdateReplacePolicy": "Delete",
        "DeletionPolicy": "Delete"
      }),
    );
  });

  test('should provision the proper event rule', () => {
    template.hasResource('AWS::Events::Rule',
      Match.objectLike({
        Properties: {
          "EventPattern": {
            "source": [
              "com.central.stepfunction"
            ],
            "account": [
              "1234567891011"
            ],
            "detail-type": [
              {
                "Fn::Join": [
                  "",
                  [
                    {
                      "Ref": "AWS::AccountId"
                    },
                    "_createResourceLinks"
                  ]
                ]
              }
            ]
          },
          "State": "ENABLED",
        },
        "UpdateReplacePolicy": "Delete",
        "DeletionPolicy": "Delete"
      }),
    );
  });

  test('should provision the proper event rule for crawler', () => {
    template.hasResource('AWS::Events::Rule',
      Match.objectLike({
        Properties: {
          "EventBusName": {
            "Ref": Match.anyValue()
          },
          "EventPattern": {
            "source": [
              "com.central.stepfunction"
            ],
            "detail-type": [
              "triggerCrawler"
            ]
          },
          "State": "ENABLED",
          "Targets": [
            {
              "Arn": {
                "Ref": Match.anyValue()
              },
              "Id": "Target0",
              "RoleArn": {
                "Fn::GetAtt": [
                  Match.anyValue(),
                  "Arn"
                ]
              }
            }
          ]
        },
        "UpdateReplacePolicy": "Delete",
        "DeletionPolicy": "Delete"
      }),
    );
  });

  test('should provision the proper send event policy', () => {
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
        "Roles": [
          {
            "Ref": Match.anyValue()
          }
        ]
      })
    );
  });

  test('should provision the proper event bus policy', () => {
    template.hasResourceProperties('AWS::Events::EventBusPolicy',
      Match.objectLike({
        StatementId: "AllowCentralAccountToPutEvents",
        Action: "events:PutEvents",
        EventBusName: Match.anyValue(),
        Principal: "1234567891011"
      })
    );
  });

  test('should provision the proper workflow role default policy', () => {
    template.hasResourceProperties('AWS::IAM::ManagedPolicy',
      Match.objectLike({
        PolicyDocument: {
          Statement: [
            {
              "Action": [
                "lakeformation:*",
                "glue:GetDatabase",
                "glue:GetDatabases",
                "glue:GetTable",
                "glue:GetTables",
                "glue:CreateTable",
                "glue:UpdateTable",
                "iam:GetRole"
              ],
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": "ram:CreateResourceShare",
              "Condition": {
                "StringLikeIfExists": {
                  "ram:RequestedResourceType": [
                    "glue:Table",
                    "glue:Database",
                    "glue:Catalog"
                  ]
                }
              },
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": [
                "ram:UpdateResourceShare",
                "ram:AssociateResourceShare",
                "ram:GetResourceShares"
              ],
              "Condition": {
                "StringLike": {
                  "ram:ResourceShareName": [
                    "LakeFormation*"
                  ]
                }
              },
              "Effect": "Allow",
              "Resource": "*"
            },
            {
              "Action": [
                "glue:PutResourcePolicy",
                "ram:Get*",
                "ram:List*"
              ],
              "Effect": "Allow",
              "Resource": "*"
            }
          ]
        }
      })
    );
  });
});
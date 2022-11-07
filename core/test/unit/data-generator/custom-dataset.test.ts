// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CustomDataset 
 *
 * @group unit/data-generator/custom-dataset
 */

import { Duration, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CustomDataset, CustomDatasetInputFormat } from '../../../src/data-generator/custom-dataset';


describe('CustomDataset test', () => {
  
  const customDatasetStack = new Stack();
  
  new CustomDataset(customDatasetStack, 'CustomDataset', {
    s3Location: {
      bucketName: 'aws-analytics-reference-architecture',
      objectKey: 'datasets/custom',
    },
    inputFormat: CustomDatasetInputFormat.CSV,
    datetimeColumn: 'tpep_pickup_datetime',
    datetimeColumnsToAdjust: ['tpep_pickup_datetime'],
    partitionRange: Duration.minutes(5),
    approximateDataSize: 1,
  });
  
  const template = Template.fromStack(customDatasetStack);
  // console.log(JSON.stringify(template.toJSON(),null, 2));
  
  test('CustomDataset should create the right number of resources', () => {
    
    template.resourceCountIs('AWS::IAM::Role', 11);
    template.resourceCountIs('AWS::Lambda::Function', 8);
    template.resourceCountIs('AWS::CloudFormation::CustomResource', 1);
    template.resourceCountIs('AWS::Glue::Job', 1);
    template.resourceCountIs('AWS::SSM::Parameter', 1);
    template.resourceCountIs('AWS::KMS::Key', 1);
  });
  
  test('CustomDataset should create the proper Glue Job with tags', () => {
    
    template.hasResourceProperties('AWS::Glue::Job', 
      Match.objectLike({
        Tags: Match.objectLike(
          { 'for-use-with': 'synchronous-glue-job' },
        ),
        Command: {
          Name: "glueetl",
          PythonVersion: "3",
        },
        DefaultArguments: Match.objectLike({
          "--job-language": "python",
          "--enable-continuous-cloudwatch-log": "true",
          "--enable-continuous-log-filter": "true",
          "--s3_input_path": "s3://aws-analytics-reference-architecture/datasets/custom",
          "--input_format": "csv",
          "--datetime_column": "tpep_pickup_datetime",
          "--partition_range": "5",
          "--enable-auto-scaling": "true"
        }),
        GlueVersion: "3.0",
        NumberOfWorkers: 9,
        WorkerType: "G.1X"
      })
    );
  });

  test('CustomDataset should create the proper Role for the Glue Job', () => {
    
    template.hasResourceProperties('AWS::IAM::Role', 
      Match.objectLike({
        AssumeRolePolicyDocument: {
          Statement: [
            {
              "Action": "sts:AssumeRole",
              "Effect": "Allow",
              "Principal": {
                "Service": "glue.amazonaws.com"
              }
            }
          ],
        },
        ManagedPolicyArns: [
          {
            "Fn::Join": [
              "",
              [
                "arn:",
                {
                  "Ref": "AWS::Partition"
                },
                ":iam::aws:policy/service-role/AWSGlueServiceRole"
              ]
            ]
          }
        ]
      })
    );
  });

  test('CustomDataset should create the proper Policy for getting SSM parameter', () => {
    
    template.hasResourceProperties('AWS::IAM::Policy', 
      Match.objectLike({
        PolicyDocument: {
          Statement: [
            {
              Action: "ssm:GetParameter",
              Effect: "Allow",
              Resource: {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":ssm:",
                    {
                      "Ref": "AWS::Region"
                    },
                    ":",
                    {
                      "Ref": "AWS::AccountId"
                    },
                    ":parameter/",
                    {
                      "Ref": "CustomDatasetJobOutputParameterB7002409"
                    }
                  ]
                ]
              }
            },
          ],
        }
      })
    );
  });

  test('CustomDataset should create the proper Glue job security configuration', () => {
    
    template.hasResourceProperties('AWS::Glue::SecurityConfiguration', 
      Match.objectLike({
        EncryptionConfiguration: {
          CloudWatchEncryption:  Match.objectLike({
            CloudWatchEncryptionMode: "SSE-KMS",
          }),
          JobBookmarksEncryption:  Match.objectLike({
            JobBookmarksEncryptionMode: "CSE-KMS",
          }),
        },
      })
    );
  });

  test('CustomDataset should create the proper KMS key for glue security configuration', () => {
    
    template.hasResource('AWS::KMS::Key', 
      Match.objectLike({
        "Properties": {
          "KeyPolicy": {
            "Statement": [
              {
                "Action": "kms:*",
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
                        ":iam::",
                        {
                          "Ref": "AWS::AccountId"
                        },
                        ":root"
                      ]
                    ]
                  }
                },
                "Resource": "*"
              },
              {
                "Action": [
                  "kms:Encrypt*",
                  "kms:Decrypt*",
                  "kms:ReEncrypt*",
                  "kms:GenerateDataKey*",
                  "kms:Describe*"
                ],
                "Condition": {
                  "ArnLike": {
                    "kms:EncryptionContext:aws:logs:arn": {
                      "Fn::Join": [
                        "",
                        [
                          "arn:aws:logs:",
                          {
                            "Ref": "AWS::Region"
                          },
                          ":",
                          {
                            "Ref": "AWS::AccountId"
                          },
                          ":*"
                        ]
                      ]
                    }
                  }
                },
                "Effect": "Allow",
                "Principal": {
                  "Service": {
                    "Fn::Join": [
                      "",
                      [
                        "logs.",
                        {
                          "Ref": "AWS::Region"
                        },
                        ".amazonaws.com"
                      ]
                    ]
                  }
                },
                "Resource": "*"
              }
            ],
          }
        },
        "UpdateReplacePolicy": "Delete",
        "DeletionPolicy": "Delete"
      })
    );
  });
  
  test('CustomDataset should create the proper Policy for the Glue Jobs', () => {
    
    template.hasResourceProperties('AWS::IAM::Policy', 
      Match.objectLike({
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: [
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*"
              ],
              Effect: "Allow",
              Resource: [
                {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        "Ref": "AWS::Partition"
                      },
                      ":s3:::aws-analytics-reference-architecture"
                    ]
                  ]
                },
                {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        "Ref": "AWS::Partition"
                      },
                      ":s3:::aws-analytics-reference-architecture/datasets/custom*"
                    ]
                  ]
                }
              ]
            }),
            Match.objectLike({
              Action: [
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*",
                "s3:DeleteObject*",
                "s3:PutObject",
                "s3:PutObjectLegalHold",
                "s3:PutObjectRetention",
                "s3:PutObjectTagging",
                "s3:PutObjectVersionTagging",
                "s3:Abort*"
              ],
              Effect: "Allow",
              Resource: [
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
                      "/datasets/custom*"
                    ]
                  ]
                }
              ]
            }),
            Match.objectLike({
              Action: "ssm:PutParameter",
              Effect: "Allow",
              Resource: {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":ssm:",
                    {
                      "Ref": "AWS::Region"
                    },
                    ":",
                    {
                      "Ref": "AWS::AccountId"
                    },
                    ":parameter/",
                    {
                      "Ref": Match.anyValue()
                    }
                  ]
                ]
              }
            }),
          ]),
        }
      })
    )
  });
});

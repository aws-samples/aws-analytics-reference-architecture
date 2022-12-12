// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests CDK deployer
 *
 * @group unit/cdk-deployer
 */

 import { App } from 'aws-cdk-lib';
 import { CdkDeployer } from '../../src/common/cdk-deployer';
 
 import { Match, Template } from 'aws-cdk-lib/assertions';
 
 
 describe ('CdkDeployer test', () => {
 
  const app = new App();
  const CdkDeployerStack = new CdkDeployer(app, 'CdkDeployStack', {
    githubRepository: 'aws-samples/aws-analytics-reference-architecture',
    cdkAppLocation: 'refarch/aws-native',
    cdkParameters: {
      Foo: {
        default: 'no-value',
        type: 'String',
      },
      Bar: {
        default: 'some-value',
        type: 'String',
      },
    },
  });
 
  const template = Template.fromStack(CdkDeployerStack);

  // console.log(JSON.stringify(template.toJSON(), null, 2))

  test('CdkDeployer creates the proper Cfn parameters', () => {

    template.hasParameter('Foo',{
      Default: 'no-value',
      Type: 'String',
    });

    template.hasParameter('Bar',{
      Default: 'some-value',
      Type: 'String',
    });
  });

  test('CdkDeployer creates the proper IAM Policy for the codebuild project', () => {
    template.hasResourceProperties('AWS::IAM::Policy',
      Match.objectLike({
        "PolicyDocument": Match.objectLike({
          "Statement": Match.arrayWith([
            {
              "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
              ],
              "Effect": "Allow",
              "Resource": [
                {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        "Ref": "AWS::Partition"
                      },
                      ":logs:",
                      {
                        "Ref": "AWS::Region"
                      },
                      ":",
                      {
                        "Ref": "AWS::AccountId"
                      },
                      ":log-group:/aws/codebuild/",
                      {
                        "Ref": Match.anyValue(),
                      }
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
                      ":logs:",
                      {
                        "Ref": "AWS::Region"
                      },
                      ":",
                      {
                        "Ref": "AWS::AccountId"
                      },
                      ":log-group:/aws/codebuild/",
                      {
                        "Ref": Match.anyValue(),
                      },
                      ":*"
                    ]
                  ]
                }
              ]
            },
            {
              "Action": [
                "codebuild:CreateReportGroup",
                "codebuild:CreateReport",
                "codebuild:UpdateReport",
                "codebuild:BatchPutTestCases",
                "codebuild:BatchPutCodeCoverages"
              ],
              "Effect": "Allow",
              "Resource": {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":codebuild:",
                    {
                      "Ref": "AWS::Region"
                    },
                    ":",
                    {
                      "Ref": "AWS::AccountId"
                    },
                    ":report-group/",
                    {
                      "Ref": Match.anyValue(),
                    },
                    "-*"
                  ]
                ]
              }
            }
          ]),
        }),
      }),
    );
  });

  test('CdkDeployer creates the proper codebuild project', () => {
    template.hasResourceProperties('AWS::CodeBuild::Project',
      Match.objectLike({
        "Artifacts": {
          "Type": "NO_ARTIFACTS"
        },
        "Environment": {
          "ComputeType": "BUILD_GENERAL1_SMALL",
          "EnvironmentVariables": [
            {
              "Name": "PARAMETERS",
              "Type": "PLAINTEXT",
              "Value": {
                "Fn::Join": [
                  "",
                  [
                    " -c Foo=",
                    {
                      "Ref": "Foo"
                    },
                    " -c Bar=",
                    {
                      "Ref": "Bar"
                    }
                  ]
                ]
              }
            },
            {
              "Name": "STACKNAME",
              "Type": "PLAINTEXT",
              "Value": ""
            }
          ],
          "Image": "aws/codebuild/standard:5.0",
          "ImagePullCredentialsType": "CODEBUILD",
          "Type": "LINUX_CONTAINER"
        },
        "ServiceRole": {
          "Fn::GetAtt": [
            Match.anyValue(),
            "Arn"
          ]
        },
        "Source": {
          "BuildSpec": "{\n  \"version\": \"0.2\",\n  \"phases\": {\n    \"install\": {\n      \"runtime-versions\": {\n        \"nodejs\": 14\n      },\n      \"commands\": [\n        \"cd refarch/aws-native\",\n        \"npm install\"\n      ]\n    },\n    \"pre_build\": {\n      \"commands\": [\n        \"npm install -g aws-cdk && sudo apt-get install python3 && python -m ensurepip --upgrade && python -m pip install --upgrade pip && python -m pip install -r requirements.txt\",\n        \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\",\n        \"echo \\\"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\\\"\",\n        \"cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION\"\n      ]\n    },\n    \"build\": {\n      \"commands\": [\n        \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\",\n        \"echo \\\"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\\\"\",\n        \"cdk deploy $STACKNAME $PARAMETERS --require-approval=never\"\n      ]\n    }\n  }\n}",          "Location": "https://github.com/aws-samples/aws-analytics-reference-architecture.git",
          "ReportBuildStatus": true,
          "Type": "GITHUB"
        },
      }),
    );
  });

  test('CdkDeployer creates the proper IAM Managed Policy for CodeBuild', () => {
    template.hasResourceProperties('AWS::IAM::ManagedPolicy',
      Match.objectLike({
        "PolicyDocument": {
          "Statement": [
            {
              "Action": [
                "cloudformation:DescribeStacks",
                "cloudformation:GetTemplate"
              ],
              "Effect": "Allow",
              "Resource": {
                "Fn::Join": [
                  "",
                  [
                    "arn:aws:cloudformation:",
                    {
                      "Ref": "AWS::Region"
                    },
                    ":",
                    {
                      "Ref": "AWS::AccountId"
                    },
                    ":stack/CDKToolkit*"
                  ]
                ]
              }
            },
            {
              "Action": "sts:AssumeRole",
              "Effect": "Allow",
              "Resource": [
                {
                  "Fn::Sub": [
                    "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-${Qualifier}-deploy-role-${AWS::AccountId}-${AWS::Region}",
                    {
                      "Qualifier": "hnb659fds"
                    }
                  ]
                },
                {
                  "Fn::Sub": [
                    "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-${Qualifier}-file-publishing-role-${AWS::AccountId}-${AWS::Region}",
                    {
                      "Qualifier": "hnb659fds"
                    }
                  ]
                }
              ]
            }
          ],
        }
      }),
    );
  });

  test('CdkDeployer creates the proper IAM role for the StartBuild role', () => {
    template.hasResourceProperties('AWS::IAM::Role',
      Match.objectLike({
        "AssumeRolePolicyDocument": {
          "Statement": [
            {
              "Action": "sts:AssumeRole",
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              }
            }
          ],
        },
        "ManagedPolicyArns": [
          {
            "Fn::Join": [
              "",
              [
                "arn:",
                {
                  "Ref": "AWS::Partition"
                },
                ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
              ]
            ]
          }
        ],
        "Policies": [
          {
            "PolicyDocument": {
              "Statement": [
                {
                  "Action": "codebuild:StartBuild",
                  "Effect": "Allow",
                  "Resource": Match.anyValue(),
                }
              ],
            },
          }
        ]
      }),
    );
  });

  test('CdkDeployer creates the proper IAM role for the ReportBuild role', () => {
    template.hasResourceProperties('AWS::IAM::Role',
      Match.objectLike({
        "AssumeRolePolicyDocument": {
          "Statement": [
            {
              "Action": "sts:AssumeRole",
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              }
            }
          ],
        },
        "ManagedPolicyArns": [
          {
            "Fn::Join": [
              "",
              [
                "arn:",
                {
                  "Ref": "AWS::Partition"
                },
                ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
              ]
            ]
          }
        ],
        "Policies": [
          {
            "PolicyDocument": {
              "Statement": [
                {
                  "Action": [
                    "codebuild:BatchGetBuilds",
                    "codebuild:ListBuildsForProject"
                  ],
                  "Effect": "Allow",
                  "Resource": Match.anyValue(),
                }
              ],
            },
          }
        ]
      }),
    );
  });

  test('CdkDeployer creates the proper StartBuild function', () => {
    template.hasResourceProperties('AWS::Lambda::Function',
      Match.objectLike({
        "Code": {
          "ZipFile": Match.anyValue(),
        },
        "Role": Match.anyValue(),
        "Handler": "index.handler",
        "Runtime": "nodejs16.x",
        "Timeout": 60
      }),
    );
  });

  test('CdkDeployer creates the proper ReportBuild function', () => {
    template.hasResourceProperties('AWS::Lambda::Function',
      Match.objectLike({
        "Code": {
          "ZipFile": Match.anyValue(),
        },
        "Role": Match.anyValue(),
        "Handler": "index.handler",
        "Runtime": "nodejs16.x",
        "Timeout": 60,
      }),
    );
  });

  test('CdkDeployer creates the proper Custom Resource', () => {
    template.hasResourceProperties('AWS::CloudFormation::CustomResource',
      Match.objectLike({
        "ProjectName": Match.anyValue(),
        "BuildRoleArn": Match.anyValue(),
        "ServiceToken": Match.anyValue(),
      }),
    );
  });
});
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Aws, CfnParameter, CustomResource, DefaultStackSynthesizer, Duration } from 'aws-cdk-lib';
import { ComputeType, LinuxBuildImage, Project, Source, CfnProject } from 'aws-cdk-lib/aws-codebuild';
import { SingletonKey } from '../singleton-kms-key';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Utils } from '../utils';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { startBuild, reportBuild } from './cdk-deployer-build';


export enum DeploymentType {
  WORKSHOP_STUDIO,
  CLICK_TO_DEPLOY
}
/**
 * The properties for the CdkDeployer construct.
 */
export interface CdkDeployerProps extends cdk.StackProps {
  // TODO : add github token for private repo

  /**
   * The CDK stack name to deploy
   * @default - The default stack is deployed
   */
  readonly cdkStack?: string;

  /**
   * The CFN parameters to pass to the CDK application
   * @default - No parameter is used
   */
  readonly cdkParameters?: { [name: string]: cdk.CfnParameterProps };

  /**
   * The github repository containing the CDK application
   */
  readonly githubRepository?: string;
  /**
   * The location of the CDK application in the Github repository.
   * It is used to `cd` into the folder before deploying the CDK application
   * @default - The root of the repository
   */
  readonly cdkAppLocation?: string;
  /**
   * The branch to use on the Github repository. 
   * @default - The main branch of the repository
   */
  readonly gitBranch?: string;

  /**
   * The deployment type
   * WORKSHOP_STUDIO: the CDK application is deployed through a workshop studio deployment process
   * CLICK_TO_DEPLOY: the CDK application is deployed through a click on a github README button
   */
  readonly deploymentType: DeploymentType;
}

/**
 * A custom CDK Stack that can be synthetized as a CloudFormation Stack to deploy a CDK application hosted on GitHub.
 * This stack is self contained and can be one-click deployed to any AWS account.
 * It can be used for AWS workshop or AWS blog examples deployment when CDK is not supported/desired.
 * The stack supports passing the CDK application stack name to deploy (in case there are multiple stacks in the CDK app) and CDK parameters.
 *
 * It contains the necessary resources to synchronously deploy a CDK application from a GitHub repository:
 *  * A CodeBuild project to effectively deploy the CDK application
 *  * A StartBuild custom resource to synchronously trigger the build using a callback pattern based on Event Bridge
 *  * The necessary roles
 *
 * The StartBuild CFN custom resource is using the callback pattern to wait for the build completion:
 *  1. a Lambda function starts the build but doesn't return any value to the CFN callback URL. Instead, the callback URL is passed to the build project.
 *  2. the completion of the build trigger an Event and a second Lambda function which checks the result of the build and send information to the CFN callback URL
 *
 *  * Usage example:
 * ```typescript
 * new CdkDeployer(AwsNativeRefArchApp, 'AwsNativeRefArchDeployer', {
 *  githubRepository: 'aws-samples/aws-analytics-reference-architecture',
 *  cdkAppLocation: 'refarch/aws-native',
 *  cdkParameters: {
 *    QuickSightUsername: {
 *      default: 'myuser',
 *      type: 'String',
 *    },
 *    QuickSightIdentityRegion: {
 *      default: 'us-east-1',
 *      type: 'String',
 *    },
 *  },
 * });
 * ```
 */
export class CdkDeployer extends cdk.Stack {
  /**
   * The result of the deloyment
   */
  public readonly deployResult: string;

  /**
   * Constructs a new instance of the TrackedConstruct
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {CdkDeployerProps} props the CdkDeployer [properties]{@link CdkDeployerProps}
   */
  constructor(scope: Construct, props: CdkDeployerProps) {

    if((props.deploymentType == DeploymentType.CLICK_TO_DEPLOY) && !props.githubRepository) {
      throw new Error('githubRepository is required for CLICK_TO_DEPLOY');
    }
        
    super(scope, 'CDKDeployer', {
      // Change the Stack Synthetizer to remove the CFN parameters for the CDK version
      synthesizer: new DefaultStackSynthesizer({
        generateBootstrapVersionRule: false,
      }),
    });

    // Add parameters to the stack so it can be transfered to the CDK application
    var parameters: string = '';
    for (let name in props.cdkParameters) {
      let param = props.cdkParameters[name];
      let cfnParam = new cdk.CfnParameter(this, name, param);
      parameters = parameters.concat(` -c ${name}=${cfnParam.value}`);
    }

    // Name of the stack to deploy in codebuild
    const stackName = props.stackName ? props.stackName : '';

    // Role used by the CodeBuild project
    const buildRole = new Role(this, 'CodeBuildRole', {
      assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
    });

    // We need the CDK execution role so the CodeBuild role can assume it for CDK deployment
    const cdkDeployRole = Utils.getCdkDeployRole(this, 'CdkDeployRole');
    const cdkPublishRole = Utils.getCdkFilePublishRole(this, 'CdkPublishRole');

    buildRole.addManagedPolicy(new ManagedPolicy(this, 'CdkBuildPolicy', {
      statements: [
        new PolicyStatement({
          resources: ['*'],
          actions: [
            'kms:CreateKey',
            'kms:DisableKey',
            'kms:EnableKeyRotation',
            'kms:TagResource',
            'kms:DescribeKey',
            'kms:ScheduleKeyDeletion',
            'kms:CreateAlias',
            'kms:DeleteAlias',
            'kms:CreateGrant',
            'kms:DescribeKey',
            'kms:RetireGrant'
          ],
        }),
        new PolicyStatement({
          resources: ['*'],
          actions: [
            's3:CreateBucket',
            's3:PutBucketAcl',
            's3:PutEncryptionConfiguration',
            's3:PutBucketPublicAccessBlock',
            's3:PutBucketVersioning',
            's3:DeleteBucket',
            's3:PutBucketPolicy',

          ],
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:cloudformation:${Aws.REGION}:${Aws.ACCOUNT_ID}:stack/CDKToolkit*`
          ],
          actions: [
            'cloudformation:DescribeStacks',
            'cloudformation:DeleteStack',
            'cloudformation:DeleteChangeSet',
            'cloudformation:CreateChangeSet',
            'cloudformation:DescribeChangeSet',
            'cloudformation:ExecuteChangeSet',
            'cloudformation:DescribeStackEvents',
            'cloudformation:GetTemplate',
          ],
        }),
        new PolicyStatement({
          resources: [
            cdkDeployRole.roleArn,
            cdkPublishRole.roleArn,
          ],
          actions: [
            'sts:AssumeRole',
          ],
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/cdk-bootstrap/*/*`,
          ],
          actions: [
            'ssm:PutParameter',
            'ssm:GetParameters',
          ],
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:ecr:${Aws.REGION}:${Aws.ACCOUNT_ID}:repository/cdk*`,
          ],
          actions: [
            'ecr:SetRepositoryPolicy',
            'ecr:GetLifecyclePolicy',
            'ecr:PutImageTagMutability',
            'ecr:DescribeRepositories',
            'ecr:ListTagsForResource',
            'ecr:PutImageScanningConfiguration',
            'ecr:CreateRepository',
            'ecr:PutLifecyclePolicy',
            'ecr:SetRepositoryPolicy',
            'ecr:DeleteRepository',
            'ecr:TagResource',
          ],
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:iam::${Aws.ACCOUNT_ID}:role/cdk*`,
          ],
          actions: [
            'iam:GetRole',
            'iam:CreateRole',
            'iam:TagRole',
            'iam:DeleteRole',
            'iam:AttachRolePolicy',
            'iam:DetachRolePolicy',
            'iam:GetRolePolicy',
            'iam:PutRolePolicy',
            'iam:DeleteRolePolicy',
          ],
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/codebuild/*`,
        ],
          actions: [
            'logs:PutLogEvents',
          ],
        }),
      ]
    }))


    let source: Source;

    if(props.deploymentType === DeploymentType.WORKSHOP_STUDIO) {
      const cdkAppSourceCodeBucketName = new CfnParameter(this, 'CDKAppSourceCodeBucketName', {
        type: 'String',
      });
  
      const cdkAppSourceCodeBucketPrefix = new CfnParameter(this, 'CDKAppSourceCodeBucketPrefix', {
        type: 'String',
      });

      source = Source.s3({
        bucket: Bucket.fromBucketName(
          this,
          'CdkAppBucket',
          cdkAppSourceCodeBucketName.valueAsString
        ),
        path: `${cdkAppSourceCodeBucketPrefix.valueAsString}cdk_app.zip`,
      });
    } else {
      source = Source.gitHub({
        owner: props.githubRepository!.split('/')[0],
        repo: props.githubRepository!.split('/')[1],
        branchOrRef: props.gitBranch ? props.gitBranch : undefined,
        reportBuildStatus: true,
      });
    }


    const codeBuildProject = new Project(this, 'CodeBuildProject', {
      source,
      encryptionKey: SingletonKey.getOrCreate(this, 'DefaultKmsKey'),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        computeType: ComputeType.SMALL,
        environmentVariables: {
          PARAMETERS: {
            value: parameters,
          },
          STACKNAME: {
            value: stackName,
          },
          CDK_APP_LOCATION: {
            value: props.cdkAppLocation ? props.cdkAppLocation : '',
          },
        },
      },
      role: buildRole,
    });
    if(props.deploymentType === DeploymentType.WORKSHOP_STUDIO) {
      (codeBuildProject.node.defaultChild as CfnProject).addPropertyOverride('EncryptionKey', 'alias/aws/s3');
    }

    const startBuildRole = new Role(this, 'StartBuildRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
      inlinePolicies: {
        StartBuild: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: [codeBuildProject.projectArn],
              actions: ['codebuild:StartBuild'],
            }),
          ],
        }),
      },
    });

    const startBuildFunction = new Function(this, 'StartBuildFunction', {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromInline(startBuild),
      handler: 'index.handler',
      timeout: Duration.seconds(60),
      role: startBuildRole,
    });

    const reportBuildRole = new Role(this, 'ReportBuildRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
      inlinePolicies: {
        ReportBuild: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: [codeBuildProject.projectArn],
              actions: ['codebuild:BatchGetBuilds', 'codebuild:ListBuildsForProject'],
            }),
          ],
        }),
      },
    });

    const reportBuildFunction = new Function(this, 'ReportBuildFunction', {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromInline(reportBuild),
      handler: 'index.handler',
      timeout: Duration.seconds(60),
      role: reportBuildRole,
    });

    const buildCompleteRule = new Rule(this, 'BuildCompleteEvent', {
      eventPattern: {
        source: ['aws.codebuild'],
        detailType: ['CodeBuild Build State Change'],
        detail: {
          'build-status': ['SUCCEEDED', 'FAILED', 'STOPPED'],
          'project-name': [codeBuildProject.projectName],
        },
      },
      targets: [new LambdaFunction(reportBuildFunction)],
    });

    const buildTrigger = new CustomResource(this, 'CodeBuildTriggerCustomResource', {
      serviceToken: startBuildFunction.functionArn,
      properties: {
        ProjectName: codeBuildProject.projectName,
        BuildRoleArn: buildRole.roleArn,
        Parameters: parameters,
        StackName: stackName,
      },
    });

    buildTrigger.node.addDependency(buildCompleteRule);
    buildTrigger.node.addDependency(buildRole);

    this.deployResult = buildTrigger.getAttString('BuildStatus');
  }
}

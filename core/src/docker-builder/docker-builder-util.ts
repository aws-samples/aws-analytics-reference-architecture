import { Duration } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { PreBundledFunction } from "../common/pre-bundled-function";
import { PreBundledLayer } from "../common/pre-bundled-layer";

export function CustomResourceProviderSetup (scope: Construct, codeBuildProjectArn: string, ecrRepositoryArn: string) : string {
    //The policy allowing the creatio of the job template
    const lambdaPolicy = [

        new PolicyStatement({
          resources: [codeBuildProjectArn],
          actions: ['codebuild:BatchGetBuilds', 'codebuild:StartBuild'],
        }),
        new PolicyStatement ({
          resources: [ecrRepositoryArn],
          actions: [
            'ecr:DeleteRepository',
          ]
        })
      ];
  
      // AWS Lambda function supporting the create, update, delete operations on Amazon EMR on EKS managed endpoints
      const onEvent = new PreBundledFunction(scope, 'OnEvent', {
        codePath: 'docker-builder/resources/lambdas',
        runtime: Runtime.PYTHON_3_9,
        handler: 'lambda.on_event',
        layers: [PreBundledLayer.getOrCreate(scope, 'common/resources/lambdas/pre-bundled-layer')],
        lambdaPolicyStatements: lambdaPolicy,
        logRetention: RetentionDays.ONE_WEEK,
        timeout: Duration.seconds(120),
      });
  
      // AWS Lambda supporting the status check on asynchronous create, update and delete operations
      const isComplete = new PreBundledFunction(scope, 'IsComplete', {
          codePath: 'docker-builder/resources/lambdas',
          handler: 'lambda.is_complete',
          layers: [PreBundledLayer.getOrCreate(scope, 'common/resources/lambdas/pre-bundled-layer')],
          lambdaPolicyStatements: lambdaPolicy,
          runtime: Runtime.PYTHON_3_9,
          logRetention: RetentionDays.ONE_WEEK,
          timeout: Duration.seconds(120),
        });
  
      const provider = new Provider(scope, 'CustomResourceProvider', {
        onEventHandler: onEvent,
        isCompleteHandler: isComplete,
        totalTimeout: Duration.minutes(15),
        queryInterval: Duration.seconds(20),
        providerFunctionName: 'dockerBuildPublishFn',
      });

      return provider.serviceToken;
}

export const emrOnEksImageMap = new Map([
  ['ap-northeast-1', "059004520145"],  
  ['ap-northeast-2', "996579266876"],
  ['ap-south-1', "235914868574"],
  ['ap-southeast-1', "671219180197"],
  ['ap-southeast-2', "038297999601"],
  ['ca-central-1', "351826393999"],
  ['eu-central-1', "107292555468"],
  ['eu-north-1', "830386416364"],
  ['eu-west-1', "483788554619"],
  ['eu-west-2', "118780647275"],
  ['eu-west-3', "307523725174"],
  ['sa-east-1', "052806832358"],
  ['us-east-1', "755674844232"],
  ['us-east-2', "711395599931"],
  ['us-west-1', "608033475327"],
  ['us-west-2', "895885662937"],
]);
import { Duration } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { PreBundledFunction } from "../common/pre-bundled-function";
import { PreBundledLayer } from "../common/pre-bundled-layer";

export function CustomResourceProviderSetup (scope: Construct, codeBuildProjectArn: string) : string {
    //The policy allowing the creatio of the job template
    const lambdaPolicy = [

        new PolicyStatement({
          resources: [codeBuildProjectArn],
          actions: ['codebuild:BatchGetBuilds', 'codebuild:StartBuild'],
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
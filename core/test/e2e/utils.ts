import { App, Stack } from 'aws-cdk-lib';
import * as cxapi from '@aws-cdk/cx-api';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import { DeployStackResult } from 'aws-cdk/lib/api/deploy-stack';

export const deployStack = async (app: App, stack: Stack, quiet?: boolean): Promise<DeployStackResult> => {
  const stackArtifact = getStackArtifact(app, stack);

  const cloudFormation = await createCloudFormationDeployments();

  return cloudFormation.deployStack({
    stack: stackArtifact,
    quiet: quiet ? quiet : true,
  });
};

export const destroyStack = async (app: App, stack: Stack, quiet?: boolean, retryCount?: number): Promise<void> => {
  const stackArtifact = getStackArtifact(app, stack);

  const cloudFormation = await createCloudFormationDeployments();

  retryCount = retryCount || 1;
  while (retryCount >= 0) {
    try {
      await cloudFormation.destroyStack({
        stack: stackArtifact,
        quiet: quiet ? quiet : true,
      });
    } catch (e) {
      console.error(`Fail to delete stack retrying`);
      if(retryCount == 0) {
        throw e;
      }
    }
    retryCount--;
  }

};

const getStackArtifact = (app: App, stack: Stack): cxapi.CloudFormationStackArtifact => {
  const synthesized = app.synth();

  // Reload the synthesized artifact for stack using the cxapi from dependencies
  const assembly = new cxapi.CloudAssembly(synthesized.directory);

  return cxapi.CloudFormationStackArtifact.fromManifest(
    assembly,
    stack.artifactId,
    synthesized.getStackArtifact(stack.artifactId).manifest
  ) as cxapi.CloudFormationStackArtifact;
};

const createCloudFormationDeployments = async (): Promise<CloudFormationDeployments> => {
  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    profile: process.env.AWS_PROFILE,
  });
  const cloudFormation = new CloudFormationDeployments({ sdkProvider });

  return cloudFormation;
};